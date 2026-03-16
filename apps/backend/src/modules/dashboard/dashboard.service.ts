import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStatusReportDto, UpdateStatusReportDto, CreateGoLiveDto, UpdateGoLiveDto } from './dto/cockpit.dto';

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

  // =============================================================
  // COCKPIT DO SÓCIO — Agregação C-Level
  // =============================================================

  async getCockpitData(ano: number) {
    const projetos = await this.prisma.project.findMany({
      where: { ativo: true },
      include: {
        receitas: { where: { ano, ativo: true } },
        custos: { where: { ano } },
        despesas: { where: { ano } },
        impostos: { where: { ano } },
        statusReports: { where: { vigente: true }, take: 1 },
      },
    });

    // ── Big Numbers ──
    let totalReceitaRealizada = 0;
    let totalReceitaPrevista = 0;
    let totalCustos = 0;
    let receitaEmRisco = 0;
    let projetosEmRisco = 0;

    const portfolioItems = projetos.map((p) => {
      const recPrev = p.receitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
      const recReal = p.receitas.reduce((s, r) => s + Number(r.valorRealizado), 0);
      const custoPessoal = p.custos.reduce((s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel), 0);
      const despesas = p.despesas.reduce((s, d) => s + Number(d.valor), 0);
      const impostos = p.impostos.reduce((s, i) => s + Number(i.valor), 0);
      const custoTotal = custoPessoal + despesas + impostos;
      const margem = recReal > 0 ? ((recReal - custoTotal) / recReal) * 100 : 0;

      totalReceitaRealizada += recReal;
      totalReceitaPrevista += recPrev;
      totalCustos += custoTotal;

      const sr = p.statusReports[0];
      const statusHealth = sr?.status || (margem >= 30 ? 'green' : margem >= 15 ? 'yellow' : 'red');

      if (statusHealth === 'red' || statusHealth === 'yellow') {
        receitaEmRisco += recPrev;
        projetosEmRisco++;
      }

      return {
        id: p.id,
        nome: `${p.cliente} — ${p.nome}`,
        status: statusHealth,
        margem: Number(margem.toFixed(1)),
        gargalo: sr?.gargalo || (statusHealth === 'green' ? '—' : 'Sem report cadastrado'),
        acaoCLevel: sr?.acaoCLevel || (statusHealth === 'green' ? 'Nenhuma ação necessária' : 'Cadastrar Status Report'),
        detalheGargalo: sr?.detalheGargalo || '',
      };
    });

    // Sort: red → yellow → green
    const statusOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 };
    portfolioItems.sort((a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2));

    const margemGlobal = totalReceitaRealizada > 0
      ? ((totalReceitaRealizada - totalCustos) / totalReceitaRealizada) * 100
      : 0;

    // ── Economia OPEX (despesas mês atual vs mês anterior) ──
    const mesAtual = new Date().getMonth() + 1;
    const despesasMesAtual = projetos.reduce((s, p) =>
      s + p.despesas.filter((d) => d.mes === mesAtual).reduce((ss, d) => ss + Number(d.valor), 0), 0);
    const despesasMesAnterior = projetos.reduce((s, p) =>
      s + p.despesas.filter((d) => d.mes === mesAtual - 1).reduce((ss, d) => ss + Number(d.valor), 0), 0);
    const economiaOpex = despesasMesAnterior - despesasMesAtual;

    // ── Big Numbers formatados ──
    const bigNumbers = [
      {
        id: 'faturamento',
        label: 'Faturamento',
        value: totalReceitaRealizada,
        formattedValue: this.formatCurrency(totalReceitaRealizada),
        meta: `Meta: ${this.formatCurrency(totalReceitaPrevista)}`,
        type: 'currency',
        variant: 'default',
        icon: '💰',
      },
      {
        id: 'margem',
        label: 'Margem Líquida',
        value: Number(margemGlobal.toFixed(1)),
        formattedValue: `${margemGlobal.toFixed(1)}%`,
        meta: 'Meta: ≥ 30%',
        type: 'percent',
        variant: margemGlobal >= 30 ? 'success' : 'danger',
        icon: '📈',
      },
      {
        id: 'receita-risco',
        label: 'Receita em Risco',
        value: receitaEmRisco,
        formattedValue: this.formatCurrency(receitaEmRisco),
        meta: `${projetosEmRisco} projeto(s) impactado(s)`,
        type: 'currency',
        variant: receitaEmRisco > 0 ? 'danger' : 'success',
        icon: '⚠️',
      },
      {
        id: 'economia-opex',
        label: 'Economia OPEX',
        value: economiaOpex,
        formattedValue: this.formatCurrency(Math.abs(economiaOpex)),
        meta: economiaOpex >= 0 ? 'vs. mês anterior' : 'aumento vs. mês anterior',
        type: 'currency',
        variant: economiaOpex >= 0 ? 'success' : 'warning',
        icon: '💎',
      },
    ];

    // ── Status Updates (últimos 3 reports por projeto) ──
    const portfolioWithUpdates = await Promise.all(
      portfolioItems.map(async (item) => {
        const updates = await this.prisma.projectStatusReport.findMany({
          where: { projectId: item.id },
          orderBy: { dataReport: 'desc' },
          take: 3,
          select: { dataReport: true, gargalo: true, status: true },
        });
        return {
          ...item,
          statusUpdates: updates.map((u) => ({
            date: u.dataReport.toISOString().split('T')[0],
            text: u.gargalo || `Status: ${u.status}`,
          })),
        };
      }),
    );

    // ── Burn Rate (receita vs custos por mês, últimos 4 + projeção 2) ──
    const burnRate = await this.calcBurnRate(ano, projetos);

    // ── Go-Live Pipeline ──
    const goLiveData = await this.getGoLivePipeline();

    return {
      bigNumbers,
      portfolio: portfolioWithUpdates,
      burnRate,
      goLive: goLiveData,
    };
  }

  private async calcBurnRate(ano: number, projetos: any[]) {
    const mesAtual = new Date().getMonth() + 1;

    const pontos: { mes: string; receita: number; custos: number; projetado: boolean }[] = [];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Últimos 4 meses realizados
    for (let offset = 3; offset >= 0; offset--) {
      let m = mesAtual - offset;
      let a = ano;
      if (m <= 0) { m += 12; a--; }

      const receita = projetos.reduce(
        (s, p) => s + p.receitas.filter((r: any) => r.mes === m && r.ano === a).reduce((ss: number, r: any) => ss + Number(r.valorRealizado), 0), 0,
      );
      const custos = projetos.reduce(
        (s, p) => {
          const cp = p.custos.filter((c: any) => c.mes === m && c.ano === a).reduce((ss: number, c: any) => ss + Number(c.custoFixo) + Number(c.custoVariavel), 0);
          const dp = p.despesas.filter((d: any) => d.mes === m && d.ano === a).reduce((ss: number, d: any) => ss + Number(d.valor), 0);
          const ip = p.impostos.filter((i: any) => i.mes === m && i.ano === a).reduce((ss: number, i: any) => ss + Number(i.valor), 0);
          return s + cp + dp + ip;
        }, 0,
      );

      pontos.push({ mes: `${meses[m - 1]}/${String(a).slice(2)}`, receita, custos, projetado: false });
    }

    // Projeção 2 meses (média simples dos últimos 3)
    const lastN = pontos.slice(-3);
    const avgReceita = lastN.reduce((s, p) => s + p.receita, 0) / (lastN.length || 1);
    const avgCustos = lastN.reduce((s, p) => s + p.custos, 0) / (lastN.length || 1);
    for (let offset = 1; offset <= 2; offset++) {
      let m = mesAtual + offset;
      let a = ano;
      if (m > 12) { m -= 12; a++; }
      pontos.push({
        mes: `${meses[m - 1]}/${String(a).slice(2)}`,
        receita: Math.round(avgReceita * (1 + 0.03 * offset)),
        custos: Math.round(avgCustos * (1 + 0.01 * offset)),
        projetado: true,
      });
    }

    return pontos;
  }

  private async getGoLivePipeline() {
    const hoje = new Date();
    const em30 = new Date();
    em30.setDate(em30.getDate() + 30);
    const em60 = new Date();
    em60.setDate(em60.getDate() + 60);

    const goLives = await this.prisma.projectGoLive.findMany({
      where: { concluido: false },
      include: { project: { select: { nome: true, cliente: true } } },
      orderBy: { dataGoLive: 'asc' },
    });

    const proximos30 = goLives
      .filter((g) => g.dataGoLive <= em30)
      .map((g) => ({
        id: g.id,
        cliente: `${g.project.cliente} — ${g.descricao || g.project.nome}`,
        dataGoLive: g.dataGoLive.toISOString().split('T')[0],
        atrasado: g.dataGoLive < hoje,
      }));

    const proximos60 = goLives
      .filter((g) => g.dataGoLive > em30 && g.dataGoLive <= em60)
      .map((g) => ({
        id: g.id,
        cliente: `${g.project.cliente} — ${g.descricao || g.project.nome}`,
        dataGoLive: g.dataGoLive.toISOString().split('T')[0],
        atrasado: g.dataGoLive < hoje,
      }));

    return { proximos30, proximos60 };
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(value);
  }

  // =============================================================
  // CRUD — Status Reports
  // =============================================================

  async findStatusReports(projectId?: string) {
    return this.prisma.projectStatusReport.findMany({
      where: projectId ? { projectId } : {},
      include: { project: { select: { id: true, nome: true, cliente: true, codigo: true } } },
      orderBy: { dataReport: 'desc' },
    });
  }

  async createStatusReport(dto: CreateStatusReportDto) {
    // Desativar report vigente anterior do mesmo projeto
    await this.prisma.projectStatusReport.updateMany({
      where: { projectId: dto.projectId, vigente: true },
      data: { vigente: false },
    });

    return this.prisma.projectStatusReport.create({
      data: {
        projectId: dto.projectId,
        status: dto.status,
        gargalo: dto.gargalo,
        detalheGargalo: dto.detalheGargalo,
        acaoCLevel: dto.acaoCLevel,
        responsavel: dto.responsavel,
        vigente: true,
      },
      include: { project: { select: { id: true, nome: true, cliente: true } } },
    });
  }

  async updateStatusReport(id: string, dto: UpdateStatusReportDto) {
    return this.prisma.projectStatusReport.update({
      where: { id },
      data: dto,
      include: { project: { select: { id: true, nome: true, cliente: true } } },
    });
  }

  async deleteStatusReport(id: string) {
    return this.prisma.projectStatusReport.delete({ where: { id } });
  }

  // =============================================================
  // CRUD — Go-Live Pipeline
  // =============================================================

  async findGoLives(projectId?: string) {
    return this.prisma.projectGoLive.findMany({
      where: projectId ? { projectId } : {},
      include: { project: { select: { id: true, nome: true, cliente: true, codigo: true } } },
      orderBy: { dataGoLive: 'asc' },
    });
  }

  async createGoLive(dto: CreateGoLiveDto) {
    return this.prisma.projectGoLive.create({
      data: {
        projectId: dto.projectId,
        dataGoLive: new Date(dto.dataGoLive),
        descricao: dto.descricao,
      },
      include: { project: { select: { id: true, nome: true, cliente: true } } },
    });
  }

  async updateGoLive(id: string, dto: UpdateGoLiveDto) {
    return this.prisma.projectGoLive.update({
      where: { id },
      data: {
        ...dto,
        dataGoLive: dto.dataGoLive ? new Date(dto.dataGoLive) : undefined,
      },
      include: { project: { select: { id: true, nome: true, cliente: true } } },
    });
  }

  async deleteGoLive(id: string) {
    return this.prisma.projectGoLive.delete({ where: { id } });
  }
}
