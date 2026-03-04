import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

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

        // Custos Fixos (facilities, aluguel, amortizacao, rateio)
        const custosFixos = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            tipo: { in: ['facilities', 'aluguel', 'amortizacao', 'rateio'] },
          },
          _sum: { valor: true },
        });
        const custoFixo = Number(custosFixos._sum.valor || 0);

        // Custos Variáveis (fornecedor, endomarketing, provisao, outros)
        const custosVariaveis = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano,
            tipo: { in: ['fornecedor', 'endomarketing', 'provisao', 'outros'] },
          },
          _sum: { valor: true },
        });
        const custoVariavel = Number(custosVariaveis._sum.valor || 0);

        const imposto = receita * 0.05;
        const custoTotal = custoFixo + custoVariavel;
        const margemBruta = receita > 0 ? (receita - custoTotal) / receita : 0;
        const margemLiquida = receita > 0 ? (receita - custoTotal - imposto) / receita : 0;

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

        const custosTotaisAnterior = await this.prisma.despesa.aggregate({
          where: {
            projectId: { in: projectIds },
            mes,
            ano: anoAnterior,
          },
          _sum: { valor: true },
        });
        const custoTotalAnt = Number(custosTotaisAnterior._sum.valor || 0);

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
      const custoTotalAnual = totalCustoFixo + totalCustoVariavel;
      const margemBrutaAnual = totalReceita > 0 ? (totalReceita - custoTotalAnual) / totalReceita : 0;
      const margemLiquidaAnual = totalReceita > 0 ? (totalReceita - custoTotalAnual - totalImposto) / totalReceita : 0;

      // Variação vs ano anterior
      const variacaoReceita = totalReceitaAnterior > 0 ? ((totalReceita - totalReceitaAnterior) / totalReceitaAnterior) : 0;
      const custoTotalAnterior = totalCustoTotalAnterior;
      const variacaoCusto = custoTotalAnterior > 0 ? ((custoTotalAnual - custoTotalAnterior) / custoTotalAnterior) : 0;

      // Objetos Contratuais com valores agregados
      const objetosComValores: any[] = [];
      // Pré-calcular custo total do contrato (rateado igualmente entre objetos)
      const despesaTotalContrato = await this.prisma.despesa.aggregate({
        where: {
          projectId: { in: projectIds },
          ano,
        },
        _sum: { valor: true },
      });
      const custoTotalContrato = Number(despesaTotalContrato._sum.valor || 0);
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

        objetosComValores.push({
          id: objeto.id,
          nome: objeto.nome,
          descricao: objeto.descricao,
          receita: receitaObjeto,
          custo: custoObjeto,
          lucro: receitaObjeto - custoObjeto,
          margem: receitaObjeto > 0 ? ((receitaObjeto - custoObjeto) / receitaObjeto) : 0,
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
          lucro: totalReceita - custoTotalAnual - totalImposto,
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
