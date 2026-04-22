import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Carga tributária total por regime (soma das alíquotas) - usado como fallback
const CARGA_POR_REGIME: Record<string, number> = {
  LUCRO_REAL: 0.3825,       // PIS 1.65% + COFINS 7.6% + IRPJ 15% + CSLL 9% + ISS 5%
  LUCRO_PRESUMIDO: 0.1633,  // PIS 0.65% + COFINS 3% + IRPJ 4.8% + CSLL 2.88% + ISS 5%
  SIMPLES_NACIONAL: 0.155,  // Simples 15.5%
  CPRB: 0.1315,             // CPRB 4.5% + ISS 5% + COFINS 3% + PIS 0.65%
};

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  /** Calcula carga tributária estimada para um conjunto de projetos */
  private async estimarImposto(projectIds: string[], receita: number): Promise<number> {
    if (receita <= 0) return 0;
    // Tenta ler alíquotas configuradas do BD combinadas com o regime do projeto
    const projetos = await this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { regimeTributario: true },
    });
    // Usa o regime do primeiro projeto (tipicamente um contrato tem projetos no mesmo regime)
    const regime = projetos[0]?.regimeTributario || 'LUCRO_PRESUMIDO';

    // Tenta usar alíquotas configuráveis do BD
    const aliquotasBD = await this.prisma.aliquotaRegime.findMany({
      where: { regime, ativo: true },
    });
    if (aliquotasBD.length > 0) {
      const carga = aliquotasBD.reduce((s, a) => s + Number(a.aliquota), 0);
      return Math.round(receita * carga * 100) / 100;
    }
    // Fallback hardcoded por regime
    const carga = CARGA_POR_REGIME[regime] || CARGA_POR_REGIME['LUCRO_PRESUMIDO'];
    return Math.round(receita * carga * 100) / 100;
  }

  async getDashboardContratos(ano: number) {
    const anoAnterior = ano - 1;
    const contratos = await this.prisma.contrato.findMany({
      where: { ativo: true },
      include: {
        projetos: {
          where: { ativo: true },
          select: { id: true, nome: true },
        },
        objetos: {
          where: { ativo: true },
          select: { id: true, nome: true, descricao: true },
        },
      },
    });

    const resultados: any[] = [];

    for (const contrato of contratos) {
      const projectIds = contrato.projetos.map((p: any) => p.id);
      
      if (projectIds.length === 0) continue;

      const metricas: any[] = [];
      let totalReceita = 0;
      let totalCustoFixo = 0;
      let totalCustoVariavel = 0;
      let totalImposto = 0;

      // Dados do ano anterior para comparação
      const metricasAnterior: any[] = [];
      let totalReceitaAnterior = 0;
      let totalCustoTotalAnterior = 0;

      // Para cada mês do ano
      for (let mes = 1; mes <= 12; mes++) {
        // ═══════ ANO ATUAL ═══════
        // Receitas (previsto + realizado)
        const receitas = await this.prisma.receitaMensal.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            ativo: true,
          },
          _sum: { valorPrevisto: true, valorRealizado: true },
        });
        const receitaPrevista = Number(receitas._sum.valorPrevisto || 0);
        const receitaRealizada = Number(receitas._sum.valorRealizado || 0);
        // Usa realizada se houver, senão usa prevista
        const receita = receitaRealizada > 0 ? receitaRealizada : receitaPrevista;

        // Custos Fixos operacionais (despesas marcadas como FIXO em naturezaCusto)
        const despesasFixas = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            naturezaCusto: 'FIXO',
          },
          _sum: { valor: true },
        });
        const custoFixoOperacional = Number(despesasFixas._sum.valor || 0);

        // Custos Variáveis operacionais (despesas marcadas como VARIAVEL em naturezaCusto)
        const despesasVariaveis = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            naturezaCusto: 'VARIAVEL',
          },
          _sum: { valor: true },
        });
        const custoVariavelOperacional = Number(despesasVariaveis._sum.valor || 0);

        // Impostos da tabela imposto
        const impostosDB = await this.prisma.imposto.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
          },
          _sum: { valor: true },
        });
        let imposto = Number(impostosDB._sum.valor || 0);

        // Se não há registros de imposto, estima com base no regime do projeto
        if (imposto === 0 && receita > 0) {
          imposto = await this.estimarImposto(projectIds, receita);
        }

        // Custos de Pessoal (tabela custoMensal)
        const custosPessoal = await this.prisma.custoMensal.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
          },
          _sum: { custoFixo: true, custoVariavel: true },
        });
        const custoPessoalFixo = Number(custosPessoal._sum.custoFixo || 0);
        const custoPessoalVariavel = Number(custosPessoal._sum.custoVariavel || 0);

        const custoFixo = custoFixoOperacional + custoPessoalFixo;
        const custoVariavel = custoVariavelOperacional + custoPessoalVariavel;
        const custoOperacional = custoFixo + custoVariavel;
        const custoTotal = custoOperacional + imposto;
        const margemBruta = receita > 0 ? (receita - custoOperacional) / receita : 0;
        const margemLiquida = receita > 0 ? (receita - custoTotal) / receita : 0;

        // Detalhamento mensal por objeto e linha contratual (drill-down)
        const receitasDetalhadas = await this.prisma.receitaMensal.findMany({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            ativo: true,
            objetoContratualId: { not: null },
          },
          select: {
            objetoContratualId: true,
            linhaContratualId: true,
            valorPrevisto: true,
            valorRealizado: true,
            objetoContratual: { select: { id: true, nome: true, descricao: true } },
            linhaContratual: { select: { id: true, descricaoItem: true, unidade: true } },
          },
        });

        const detalhamentoPorObjeto: Record<string, any> = {};
        for (const item of receitasDetalhadas) {
          const objId = item.objetoContratualId || 'sem-objeto';
          if (!detalhamentoPorObjeto[objId]) {
            detalhamentoPorObjeto[objId] = {
              id: item.objetoContratual?.id || objId,
              nome: item.objetoContratual?.nome || 'Objeto não identificado',
              descricao: item.objetoContratual?.descricao || '',
              receita: 0,
              linhas: {} as Record<string, any>,
            };
          }

          const valorPrev = Number(item.valorPrevisto || 0);
          const valorReal = Number(item.valorRealizado || 0);
          const receitaItem = valorReal > 0 ? valorReal : valorPrev;
          detalhamentoPorObjeto[objId].receita += receitaItem;

          const linhaId = item.linhaContratualId || 'sem-linha';
          if (!detalhamentoPorObjeto[objId].linhas[linhaId]) {
            detalhamentoPorObjeto[objId].linhas[linhaId] = {
              id: item.linhaContratual?.id || linhaId,
              descricaoItem: item.linhaContratual?.descricaoItem || 'Linha não identificada',
              unidade: item.linhaContratual?.unidade || '-',
              receita: 0,
            };
          }
          detalhamentoPorObjeto[objId].linhas[linhaId].receita += receitaItem;
        }

        const detalhamentoMensal = Object.values(detalhamentoPorObjeto).map((obj: any) => ({
          ...obj,
          receita: Math.round(obj.receita * 100) / 100,
          linhas: Object.values(obj.linhas).map((linha: any) => ({
            ...linha,
            receita: Math.round(linha.receita * 100) / 100,
          })),
        }));

        metricas.push({
          mes,
          receita,
          receitaPrevista,
          receitaRealizada,
          custoFixo,
          custoVariavel,
          imposto,
          custoTotal,
          margemBruta,
          margemLiquida,
          detalhamento: detalhamentoMensal,
        });

        totalReceita += receita;
        totalCustoFixo += custoFixo;
        totalCustoVariavel += custoVariavel;
        totalImposto += imposto;

        // ═══════ ANO ANTERIOR (para comparação) ═══════
        const receitasAnterior = await this.prisma.receitaMensal.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano: anoAnterior,
            ativo: true,
          },
          _sum: { valorPrevisto: true, valorRealizado: true },
        });
        const recPrevAnt = Number(receitasAnterior._sum.valorPrevisto || 0);
        const recRealAnt = Number(receitasAnterior._sum.valorRealizado || 0);
        const receitaAnt = recRealAnt > 0 ? recRealAnt : recPrevAnt;

        // Custo total anterior (despesas + impostos + pessoal)
        const despesasAnterior = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano: anoAnterior,
          },
          _sum: { valor: true },
        });
        const impostosAnterior = await this.prisma.imposto.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano: anoAnterior,
          },
          _sum: { valor: true },
        });
        const custosPessoalAnterior = await this.prisma.custoMensal.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano: anoAnterior,
          },
          _sum: { custoFixo: true, custoVariavel: true },
        });
        const custoTotalAnt = 
          Number(despesasAnterior._sum.valor || 0) + 
          Number(impostosAnterior._sum.valor || 0) +
          Number(custosPessoalAnterior._sum.custoFixo || 0) +
          Number(custosPessoalAnterior._sum.custoVariavel || 0);

        metricasAnterior.push({
          mes,
          receita: receitaAnt,
          custoTotal: custoTotalAnt,
          lucro: receitaAnt - custoTotalAnt,
        });

        totalReceitaAnterior += receitaAnt;
        totalCustoTotalAnterior += custoTotalAnt;
      }

      // Totais do ano
      const custoOperacionalAnual = totalCustoFixo + totalCustoVariavel;
      const custoTotalAnual = custoOperacionalAnual + totalImposto;
      const margemBrutaAnual = totalReceita > 0 ? (totalReceita - custoOperacionalAnual) / totalReceita : 0;
      const margemLiquidaAnual = totalReceita > 0 ? (totalReceita - custoTotalAnual) / totalReceita : 0;

      // Variação vs ano anterior
      const variacaoReceita = totalReceitaAnterior > 0 ? ((totalReceita - totalReceitaAnterior) / totalReceitaAnterior) : 0;
      const custoTotalAnterior = totalCustoTotalAnterior;
      const variacaoCusto = custoTotalAnterior > 0 ? ((custoTotalAnual - custoTotalAnterior) / custoTotalAnterior) : 0;

      // Objetos Contratuais com valores agregados
      const objetosComValores: any[] = [];
      // Pré-calcular custo total do contrato (despesas + impostos + pessoal)
      const despesaTotalContrato = await this.prisma.despesa.aggregate({
        where: {
          projectId: { in: projectIds },
          ano,
        },
        _sum: { valor: true },
      });
      const impostosTotalContrato = await this.prisma.imposto.aggregate({
        where: {
          projectId: { in: projectIds },
          ano,
        },
        _sum: { valor: true },
      });
      const custosPessoalTotalContrato = await this.prisma.custoMensal.aggregate({
        where: {
          projectId: { in: projectIds },
          ano,
        },
        _sum: { custoFixo: true, custoVariavel: true },
      });
      const custoTotalContrato = 
        Number(despesaTotalContrato._sum.valor || 0) +
        Number(impostosTotalContrato._sum.valor || 0) +
        Number(custosPessoalTotalContrato._sum.custoFixo || 0) +
        Number(custosPessoalTotalContrato._sum.custoVariavel || 0);
      const qtdObjetos = contrato.objetos.length || 1;

      for (const objeto of contrato.objetos) {
        const receitas = await this.prisma.receitaMensal.aggregate({
          where: {
            objetoContratualId: objeto.id,
            projectId: { in: projectIds },
            ano,
            ativo: true,
          },
          _sum: { valorPrevisto: true, valorRealizado: true },
        });
        const recPrev = Number(receitas._sum.valorPrevisto || 0);
        const recReal = Number(receitas._sum.valorRealizado || 0);
        const receitaObjeto = recReal > 0 ? recReal : recPrev;

        // Ratear custo proporcionalmente entre objetos
        const custoObjeto = Math.round((custoTotalContrato / qtdObjetos) * 100) / 100;

        const linhas = await this.prisma.linhaContratual.findMany({
          where: {
            objetoContratualId: objeto.id,
            ativo: true,
          },
          select: {
            id: true,
            descricaoItem: true,
            unidade: true,
            valorTotalAnual: true,
            saldoValor: true,
          },
          orderBy: { descricaoItem: 'asc' },
        });

        const receitasPorLinha = await this.prisma.receitaMensal.findMany({
          where: {
            objetoContratualId: objeto.id,
            projectId: { in: projectIds },
            ano,
            ativo: true,
            linhaContratualId: { not: null },
          },
          select: {
            linhaContratualId: true,
            valorPrevisto: true,
            valorRealizado: true,
          },
        });

        const receitaLinhaMap: Record<string, { previsto: number; realizado: number }> = {};
        for (const r of receitasPorLinha) {
          if (!r.linhaContratualId) continue;
          if (!receitaLinhaMap[r.linhaContratualId]) {
            receitaLinhaMap[r.linhaContratualId] = { previsto: 0, realizado: 0 };
          }
          receitaLinhaMap[r.linhaContratualId].previsto += Number(r.valorPrevisto || 0);
          receitaLinhaMap[r.linhaContratualId].realizado += Number(r.valorRealizado || 0);
        }

        const linhasDetalhadas = linhas.map((linha) => {
          const recLinha = receitaLinhaMap[linha.id] || { previsto: 0, realizado: 0 };
          const receitaLinha = recLinha.realizado > 0 ? recLinha.realizado : recLinha.previsto;
          const custoLinha = linhas.length > 0 ? custoObjeto / linhas.length : 0;
          const lucroLinha = receitaLinha - custoLinha;
          return {
            id: linha.id,
            descricaoItem: linha.descricaoItem,
            unidade: linha.unidade,
            valorTotalAnual: Number(linha.valorTotalAnual || 0),
            saldoValor: Number(linha.saldoValor || 0),
            receita: Math.round(receitaLinha * 100) / 100,
            custo: Math.round(custoLinha * 100) / 100,
            lucro: Math.round(lucroLinha * 100) / 100,
            margem: receitaLinha > 0 ? lucroLinha / receitaLinha : 0,
          };
        });

        objetosComValores.push({
          id: objeto.id,
          nome: objeto.nome,
          descricao: objeto.descricao,
          receita: receitaObjeto,
          custo: custoObjeto,
          lucro: receitaObjeto - custoObjeto,
          margem: receitaObjeto > 0 ? ((receitaObjeto - custoObjeto) / receitaObjeto) : 0,
          linhas: linhasDetalhadas,
        });
      }

      resultados.push({
        contratoId: contrato.id,
        contratoNome: contrato.nomeContrato,
        metricas,
        metricasAnterior,
        totais: {
          receita: totalReceita,
          custoFixo: totalCustoFixo,
          custoVariavel: totalCustoVariavel,
          custoTotal: custoTotalAnual,
          imposto: totalImposto,
          lucro: totalReceita - custoTotalAnual,
          margemBruta: margemBrutaAnual,
          margemLiquida: margemLiquidaAnual,
        },
        comparacao: {
          receitaAnterior: totalReceitaAnterior,
          custoAnterior: custoTotalAnterior,
          variacaoReceita,
          variacaoCusto,
        },
        objetos: objetosComValores,
      });
    }

    return resultados.sort((a, b) => a.contratoNome.localeCompare(b.contratoNome));
  }
}
