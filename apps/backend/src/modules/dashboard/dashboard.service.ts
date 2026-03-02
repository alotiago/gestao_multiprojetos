import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // =============================================================
  // DASHBOARD EXECUTIVO
  // =============================================================

  /**
   * Consolidação executiva: receita, custos, margens, carteira, KPIs gerais
   */
  async getDashboardExecutivo(ano: number, projectId?: string) {
    const projectFilter = projectId ? { id: projectId, ativo: true } : { ativo: true };
    const dataFilter = { ano };
    const projectDataFilter = projectId ? { ...dataFilter, projectId } : dataFilter;

    // Se especificou um projectId, valida que existe
    if (projectId) {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!projectExists) {
        return {
          ano,
          kpis: {
            projetosTotal: 0,
            projetosAtivos: 0,
            colaboradoresAtivos: 0,
            fteTotal: 0,
            carteiraAcumulada: 0,
          },
          financeiro: {
            receitaPrevista: 0,
            receitaRealizada: 0,
            totalCustoPessoal: 0,
            totalDespesas: 0,
            totalImpostos: 0,
            totalCustos: 0,
            margemPrevista: 0,
            margemRealizada: 0,
          },
          projetos: {
            distribuicaoStatus: {},
          },
        };
      }
    }

    const [projetos, receitas, custosMensais, despesas, impostos, colaboradores, jornadas] =
      await Promise.all([
        this.prisma.project.findMany({ where: projectFilter }),
        this.prisma.receitaMensal.findMany({ where: { ...projectDataFilter, ativo: true } }),
        this.prisma.custoMensal.findMany({ where: projectDataFilter }),
        this.prisma.despesa.findMany({ where: projectDataFilter }),
        this.prisma.imposto.findMany({ where: projectDataFilter }),
        projectId
          ? this.prisma.colaborador.findMany({})
          : this.prisma.colaborador.findMany({ where: { ativo: true } }),
        this.prisma.jornada.findMany({ where: { ...dataFilter, projectId: projectId || { not: null } } }),
      ]);

    const totalReceitaPrevista = receitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
    const totalReceitaRealizada = receitas.reduce((s, r) => s + Number(r.valorRealizado), 0);

    const totalCustoPessoal = custosMensais.reduce(
      (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
      0,
    );
    const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);
    const totalImpostos = impostos.reduce((s, i) => s + Number(i.valor), 0);
    const totalCustos = totalCustoPessoal + totalDespesas + totalImpostos;

    const margemPrevista = totalReceitaPrevista > 0
      ? ((totalReceitaPrevista - totalCustos) / totalReceitaPrevista) * 100
      : 0;
    const margemRealizada = totalReceitaRealizada > 0
      ? ((totalReceitaRealizada - totalCustos) / totalReceitaRealizada) * 100
      : 0;

    const projetosAtivos = projetos.filter((p) => p.status === 'ATIVO').length;
    const fteTotal = jornadas.reduce((s, j) => s + Number(j.fte), 0);

    // Carteira acumulada (receita prevista de todos os projetos ativos no ano)
    const carteiraAcumulada = totalReceitaPrevista;

    // Projetos por status
    const statusDistribuicao = projetos.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    return {
      ano,
      kpis: {
        projetosTotal: projetos.length,
        projetosAtivos,
        colaboradoresAtivos: colaboradores.length,
        fteTotal: Number(fteTotal.toFixed(2)),
        carteiraAcumulada: Number(carteiraAcumulada.toFixed(2)),
      },
      financeiro: {
        receitaPrevista: Number(totalReceitaPrevista.toFixed(2)),
        receitaRealizada: Number(totalReceitaRealizada.toFixed(2)),
        totalCustoPessoal: Number(totalCustoPessoal.toFixed(2)),
        totalDespesas: Number(totalDespesas.toFixed(2)),
        totalImpostos: Number(totalImpostos.toFixed(2)),
        totalCustos: Number(totalCustos.toFixed(2)),
        margemPrevista: Number(margemPrevista.toFixed(2)),
        margemRealizada: Number(margemRealizada.toFixed(2)),
      },
      projetos: {
        distribuicaoStatus: statusDistribuicao,
      },
    };
  }

  // =============================================================
  // DASHBOARD FINANCEIRO
  // =============================================================

  /**
   * Painel financeiro por projeto: receita, custos, margem
   */
  async getDashboardFinanceiro(ano: number, mes?: number, projectId?: string) {
    const whereDate = mes ? { ano, mes } : { ano };
    const projectFilter = projectId ? { ...whereDate, projectId } : whereDate;

    // Se especificou um projectId, valida que existe
    if (projectId) {
      const projectExists = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!projectExists) {
        return {
          ano,
          mes: mes ?? null,
          projetos: [],
          totais: { receitaPrevista: 0, receitaRealizada: 0, totalCustos: 0, margemGlobal: 0 },
        };
      }
    }

    const [projetos, receitas, custosMensais, despesas, impostos] = await Promise.all([
      projectId
        ? this.prisma.project.findMany({ where: { id: projectId, ativo: true } })
        : this.prisma.project.findMany({ where: { ativo: true } }),
      this.prisma.receitaMensal.findMany({ where: { ...projectFilter, ativo: true } }),
      this.prisma.custoMensal.findMany({ where: projectFilter }),
      this.prisma.despesa.findMany({ where: projectFilter }),
      this.prisma.imposto.findMany({ where: projectFilter }),
    ]);

    const projetoMap = projetos.reduce<Record<string, { id: string; nome: string; cliente: string; status: string }>>(
      (acc, p) => {
        acc[p.id] = { id: p.id, nome: p.nome, cliente: p.cliente, status: p.status };
        return acc;
      },
      {},
    );

    // Agrupa por projeto
    const porProjeto: Record<string, any> = {};

    const getOrCreate = (projectId: string) => {
      if (!porProjeto[projectId]) {
        const info = projetoMap[projectId];
        porProjeto[projectId] = {
          projectId,
          nome: info?.nome ?? 'Desconhecido',
          cliente: info?.cliente ?? '',
          status: info?.status ?? '',
          receitaPrevista: 0,
          receitaRealizada: 0,
          custoPessoal: 0,
          despesas: 0,
          impostos: 0,
          totalCustos: 0,
          margem: 0,
        };
      }
      return porProjeto[projectId];
    };

    for (const r of receitas) {
      const entry = getOrCreate(r.projectId);
      entry.receitaPrevista += Number(r.valorPrevisto);
      entry.receitaRealizada += Number(r.valorRealizado);
    }

    for (const c of custosMensais) {
      const entry = getOrCreate(c.projectId);
      entry.custoPessoal += Number(c.custoFixo) + Number(c.custoVariavel);
    }

    for (const d of despesas) {
      const entry = getOrCreate(d.projectId);
      entry.despesas += Number(d.valor);
    }

    for (const i of impostos) {
      const entry = getOrCreate(i.projectId);
      entry.impostos += Number(i.valor);
    }

    const resultado = Object.values(porProjeto).map((p: any) => {
      p.totalCustos = Number((p.custoPessoal + p.despesas + p.impostos).toFixed(2));
      p.margem = p.receitaRealizada > 0
        ? Number(((p.receitaRealizada - p.totalCustos) / p.receitaRealizada * 100).toFixed(2))
        : 0;
      p.receitaPrevista = Number(p.receitaPrevista.toFixed(2));
      p.receitaRealizada = Number(p.receitaRealizada.toFixed(2));
      p.custoPessoal = Number(p.custoPessoal.toFixed(2));
      p.despesas = Number(p.despesas.toFixed(2));
      p.impostos = Number(p.impostos.toFixed(2));
      return p;
    });

    const totais = resultado.reduce(
      (acc, p) => {
        acc.receitaPrevista += p.receitaPrevista;
        acc.receitaRealizada += p.receitaRealizada;
        acc.totalCustos += p.totalCustos;
        return acc;
      },
      { receitaPrevista: 0, receitaRealizada: 0, totalCustos: 0 },
    );

    return {
      ano,
      mes: mes ?? null,
      projetos: resultado,
      totais: {
        receitaPrevista: Number(totais.receitaPrevista.toFixed(2)),
        receitaRealizada: Number(totais.receitaRealizada.toFixed(2)),
        totalCustos: Number(totais.totalCustos.toFixed(2)),
        margemGlobal: totais.receitaRealizada > 0
          ? Number(((totais.receitaRealizada - totais.totalCustos) / totais.receitaRealizada * 100).toFixed(2))
          : 0,
      },
    };
  }

  /**
   * Exporta painel financeiro em CSV
   */
  async exportDashboardFinanceiroCsv(ano: number, mes?: number, projectId?: string) {
    const data = await this.getDashboardFinanceiro(ano, mes, projectId);

    const header = [
      'projectId',
      'nome',
      'cliente',
      'status',
      'receitaPrevista',
      'receitaRealizada',
      'custoPessoal',
      'despesas',
      'impostos',
      'totalCustos',
      'margem',
    ];

    const escapeCsv = (value: unknown) => {
      const normalized = String(value ?? '').replace(/"/g, '""');
      return `"${normalized}"`;
    };

    const lines = [header.join(',')];

    for (const projeto of data.projetos) {
      lines.push(
        [
          projeto.projectId,
          projeto.nome,
          projeto.cliente,
          projeto.status,
          projeto.receitaPrevista,
          projeto.receitaRealizada,
          projeto.custoPessoal,
          projeto.despesas,
          projeto.impostos,
          projeto.totalCustos,
          projeto.margem,
        ]
          .map(escapeCsv)
          .join(','),
      );
    }

    lines.push(
      [
        'TOTAL',
        '-',
        '-',
        '-',
        data.totais.receitaPrevista,
        data.totais.receitaRealizada,
        '-',
        '-',
        '-',
        data.totais.totalCustos,
        data.totais.margemGlobal,
      ]
        .map(escapeCsv)
        .join(','),
    );

    return lines.join('\n');
  }

  // =============================================================
  // DASHBOARD RECURSOS HUMANOS
  // =============================================================

  async getDashboardRecursos(ano: number, mes?: number) {
    const jornadas = await this.prisma.jornada.findMany({
      where: mes ? { ano, mes } : { ano },
      include: {
        colaborador: {
          select: { id: true, nome: true, cargo: true, estado: true, ativo: true },
        },
      },
    });

    const colaboradoresAtivos = await this.prisma.colaborador.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, cargo: true, estado: true, taxaHora: true, cargaHoraria: true },
    });

    // FTE por estado
    const ftePorEstado: Record<string, number> = {};
    for (const j of jornadas) {
      const estado = j.colaborador.estado;
      ftePorEstado[estado] = (ftePorEstado[estado] || 0) + Number(j.fte);
    }

    // FTE por cargo
    const ftePorCargo: Record<string, number> = {};
    for (const j of jornadas) {
      const cargo = j.colaborador.cargo;
      ftePorCargo[cargo] = (ftePorCargo[cargo] || 0) + Number(j.fte);
    }

    const fteTotal = jornadas.reduce((s, j) => s + Number(j.fte), 0);
    const horasRealizadasTotal = jornadas.reduce((s, j) => s + Number(j.horasRealizadas), 0);
    const horasPrevistasTotal = jornadas.reduce((s, j) => s + Number(j.horasPrevistas), 0);
    const utilizacaoMedia = horasPrevistasTotal > 0
      ? (horasRealizadasTotal / horasPrevistasTotal) * 100
      : 0;

    return {
      ano,
      mes: mes ?? null,
      kpis: {
        totalColaboradoresAtivos: colaboradoresAtivos.length,
        fteTotal: Number(fteTotal.toFixed(2)),
        horasRealizadas: Number(horasRealizadasTotal.toFixed(0)),
        horasPrevistas: Number(horasPrevistasTotal.toFixed(0)),
        utilizacaoMedia: Number(utilizacaoMedia.toFixed(1)),
      },
      ftePorEstado: Object.entries(ftePorEstado).map(([estado, fte]) => ({
        estado,
        fte: Number(fte.toFixed(2)),
      })),
      ftePorCargo: Object.entries(ftePorCargo).map(([cargo, fte]) => ({
        cargo,
        fte: Number(fte.toFixed(2)),
      })),
    };
  }

  // =============================================================
  // VISÃO ANO-A-ANO (2020 - 2030)
  // =============================================================

  async getVisaoAnoAno(anoInicio: number, anoFim: number) {
    const anos = Array.from({ length: anoFim - anoInicio + 1 }, (_, i) => anoInicio + i);

    const [todasReceitas, todosCustos, todasDespesas, todosImpostos] = await Promise.all([
      this.prisma.receitaMensal.findMany({
        where: { ano: { gte: anoInicio, lte: anoFim }, ativo: true },
      }),
      this.prisma.custoMensal.findMany({ where: { ano: { gte: anoInicio, lte: anoFim } } }),
      this.prisma.despesa.findMany({ where: { ano: { gte: anoInicio, lte: anoFim } } }),
      this.prisma.imposto.findMany({ where: { ano: { gte: anoInicio, lte: anoFim } } }),
    ]);

    return anos.map((ano) => {
      const recReceitas = todasReceitas.filter((r) => r.ano === ano);
      const recCustos = todosCustos.filter((c) => c.ano === ano);
      const recDespesas = todasDespesas.filter((d) => d.ano === ano);
      const recImpostos = todosImpostos.filter((i) => i.ano === ano);

      const receitaPrevista = recReceitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
      const receitaRealizada = recReceitas.reduce((s, r) => s + Number(r.valorRealizado), 0);
      const custoPessoal = recCustos.reduce(
        (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
        0,
      );
      const despesas = recDespesas.reduce((s, d) => s + Number(d.valor), 0);
      const impostos = recImpostos.reduce((s, i) => s + Number(i.valor), 0);
      const totalCustos = custoPessoal + despesas + impostos;
      const margem = receitaRealizada > 0
        ? ((receitaRealizada - totalCustos) / receitaRealizada) * 100
        : 0;

      return {
        ano,
        receitaPrevista: Number(receitaPrevista.toFixed(2)),
        receitaRealizada: Number(receitaRealizada.toFixed(2)),
        totalCustos: Number(totalCustos.toFixed(2)),
        margem: Number(margem.toFixed(2)),
      };
    });
  }

  // =============================================================
  // DASHBOARD DE PROJETOS
  // =============================================================

  async getDashboardProjetos(ano: number) {
    const projetos = await this.prisma.project.findMany({
      where: { ativo: true },
      include: {
        receitas: { where: { ano, ativo: true } },
        custos: { where: { ano } },
        despesas: { where: { ano } },
        impostos: { where: { ano } },
      },
    });

    return projetos.map((p) => {
      const receitaPrevista = p.receitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
      const receitaRealizada = p.receitas.reduce((s, r) => s + Number(r.valorRealizado), 0);
      const custoPessoal = p.custos.reduce(
        (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
        0,
      );
      const despesas = p.despesas.reduce((s, d) => s + Number(d.valor), 0);
      const impostos = p.impostos.reduce((s, i) => s + Number(i.valor), 0);
      const totalCustos = custoPessoal + despesas + impostos;
      const margem = receitaRealizada > 0
        ? ((receitaRealizada - totalCustos) / receitaRealizada) * 100
        : 0;

      return {
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        cliente: p.cliente,
        status: p.status,
        ano,
        receitaPrevista: Number(receitaPrevista.toFixed(2)),
        receitaRealizada: Number(receitaRealizada.toFixed(2)),
        totalCustos: Number(totalCustos.toFixed(2)),
        margem: Number(margem.toFixed(2)),
      };
    });
  }
}
