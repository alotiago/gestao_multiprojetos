'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  buildDashboardFinanceiroCsvFilename,
  buildDashboardFinanceiroCsvUrl,
  downloadTextFile,
} from '@/services/dashboardExport';
import { isLocalDevBypassSession } from '@/services/localDev';

const currentYear = new Date().getFullYear();

const createEmptyDashboardData = (ano: number): ExecutivoData => ({
  ano,
  kpis: {
    projetosTotal: 0,
    projetosAtivos: 0,
    colaboradoresAtivos: 0,
    fteTotal: 0,
    fteMesAtual: 0,
    carteiraAcumulada: 0,
    saldoContratualTotal: 0,
  },
  financeiro: {
    receitaPrevista: 0,
    receitaRealizada: 0,
    totalCustos: 0,
    margemPrevista: 0,
    margemRealizada: 0,
  },
  analitico: {
    fteMensal: [],
    saldoLinhasTotal: 0,
    contratos: [],
  },
});

interface ProjetoSelect {
  id: string;
  codigo: string;
  nome: string;
}

interface ExecutivoData {
  ano: number;
  kpis: {
    projetosTotal: number;
    projetosAtivos: number;
    colaboradoresAtivos: number;
    fteTotal: number;
    fteMesAtual: number;
    carteiraAcumulada: number;
    saldoContratualTotal: number;
  };
  financeiro: {
    receitaPrevista: number;
    receitaRealizada: number;
    totalCustos: number;
    margemPrevista: number;
    margemRealizada: number;
  };
  analitico: {
    fteMensal: Array<{
      mes: number;
      label: string;
      fte: number;
    }>;
    saldoLinhasTotal: number;
    contratos: Array<{
      id: string;
      nomeContrato: string;
      cliente: string;
      saldoContratual: number;
      saldoLinhas: number;
      objetos: Array<{
        id: string;
        nome: string;
        descricao: string;
        saldoValor: number;
        linhas: Array<{
          id: string;
          descricaoItem: string;
          unidade: string;
          valorTotalAnual: number;
          saldoQuantidade: number;
          saldoValor: number;
        }>;
      }>;
    }>;
  };
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

// Cores para cada contrato no gráfico de evolução
const CHART_COLORS = ['#1E16A0', '#0A8F92', '#B45309', '#7C3AED', '#DC2626', '#059669', '#D97706', '#4F46E5'];

interface EvolucaoSaldoData {
  ano: number;
  contratos: Array<{
    contratoId: string;
    nomeContrato: string;
    cliente: string;
    valorTotal: number;
    saldoAtual: number;
    meses: Array<{
      mes: number;
      label: string;
      consumoMes: number;
      consumoAcumulado: number;
      saldoRestante: number;
    }>;
  }>;
}

interface ConsumoLinha {
  contrato: string;
  cliente: string;
  objeto: string;
  descricaoItem: string;
  unidade: string;
  qtdEstimada: number;
  valorUnitario: number;
  valorTotal: number;
  qtdRealizada: number;
  valorRealizado: number;
  saldoQtd: number;
  saldoValor: number;
  pctConsumido: number;
  velocidadeMediaMensal: number;
  mesesParaEsgotar: number | null;
}

interface RelatorioConsumoData {
  ano: number;
  linhas: ConsumoLinha[];
}

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  color: string;
  icon: string;
}

function KpiCard({ title, value, sub, color, icon }: KpiCardProps) {
  return (
    <div className="hw1-card flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-heading font-semibold text-hw1-navy mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function formatCompactBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [data, setData] = useState<ExecutivoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [ano, setAno] = useState(currentYear);
  const [projetos, setProjetos] = useState<ProjetoSelect[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [evolucaoSaldo, setEvolucaoSaldo] = useState<EvolucaoSaldoData | null>(null);
  const [relatorioConsumo, setRelatorioConsumo] = useState<RelatorioConsumoData | null>(null);
  const [exportandoConsumo, setExportandoConsumo] = useState(false);

  const exportarCsvFinanceiro = async () => {
    setExportando(true);
    try {
      const response = await api.get(buildDashboardFinanceiroCsvUrl(ano), {
        responseType: 'text',
        headers: {
          Accept: 'text/csv',
        },
      });

      const fileName = buildDashboardFinanceiroCsvFilename(ano);
      downloadTextFile(response.data as string, fileName);
    } catch {
      setError('Não foi possível exportar o CSV financeiro.');
    } finally {
      setExportando(false);
    }
  };

  const loadProjetos = () => {
    api
      .get('/projects?limit=100&page=1')
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        const projects = list.map((p: any) => ({
          id: p.id,
          codigo: p.codigo,
          nome: p.nome,
        }));
        setProjetos(projects);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError('');
    setIsAuthError(false);
    let url = `/dashboard/executivo?ano=${ano}`;
    if (selectedProjectId) url += `&projectId=${selectedProjectId}`;
    api
      .get(url, { signal })
      .then((r) => setData(r.data))
      .catch((err: unknown) => {
        if (axios.isCancel(err)) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setIsAuthError(true);
          setError('Sessão expirada ou não autenticada. Faça login novamente.');
          return;
        }

        if (isLocalDevBypassSession()) {
          setData(createEmptyDashboardData(ano));
          setEvolucaoSaldo({ ano, contratos: [] });
          setRelatorioConsumo({ ano, linhas: [] });
          setError('');
          return;
        }

        setError('Não foi possível carregar o dashboard. Tente novamente em instantes.');
      })
      .finally(() => setLoading(false));

    // Fetch evolução de saldo e relatório de consumo em paralelo
    api.get(`/dashboard/evolucao-saldo?ano=${ano}`, { signal }).then((r) => setEvolucaoSaldo(r.data)).catch(() => {});
    api.get(`/dashboard/relatorio-consumo?ano=${ano}`, { signal }).then((r) => setRelatorioConsumo(r.data)).catch(() => {});

    return () => controller.abort();
  }, [ano, selectedProjectId]);

  const exportarCsvConsumo = async () => {
    setExportandoConsumo(true);
    try {
      const response = await api.get(`/dashboard/relatorio-consumo/export/csv?ano=${ano}`, {
        responseType: 'text',
        headers: { Accept: 'text/csv' },
      });
      const blob = new Blob([response.data as string], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_consumo_${ano}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Não foi possível exportar o relatório de consumo.');
    } finally {
      setExportandoConsumo(false);
    }
  };

  return (
    <div className="space-y-6 print-content print-aggressive">
      {/* Header row */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão consolidada do portfólio</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            🖨️ Imprimir PDF
          </button>
          <button
            type="button"
            onClick={exportarCsvFinanceiro}
            disabled={exportando}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
            style={{
              background: exportando
                ? '#9ca3af'
                : 'linear-gradient(135deg, #1E16A0, #35277D)',
            }}
          >
            {exportando ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue min-w-[220px]"
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Receita Prevista"
          value={data ? formatBRL(data.financeiro.receitaPrevista) : '—'}
          sub={`Realizada: ${data ? formatBRL(data.financeiro.receitaRealizada) : '—'}`}
          color="linear-gradient(135deg, #1E16A0, #35277D)"
          icon="📈"
        />
        <KpiCard
          title="Custo Total"
          value={data ? formatBRL(data.financeiro.totalCustos) : '—'}
          color="linear-gradient(135deg, #E52287, #F70085)"
          icon="💸"
        />
        <KpiCard
          title="Margem Realizada"
          value={data ? `${data.financeiro.margemRealizada.toFixed(1)} %` : '—'}
          sub={`Prevista: ${data ? data.financeiro.margemPrevista.toFixed(1) + ' %' : '—'}`}
          color="linear-gradient(135deg, #00B3AD, #00DDD5)"
          icon="📊"
        />
        <KpiCard
          title="Projetos Ativos"
          value={data ? String(data.kpis.projetosAtivos) : '—'}
          sub={`Total: ${data ? data.kpis.projetosTotal : '—'}`}
          color="linear-gradient(135deg, #009792, #00DDD5)"
          icon="📁"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Colaboradores Ativos"
          value={data ? String(data.kpis.colaboradoresAtivos) : '—'}
          color="#35277D"
          icon="👥"
        />
        <KpiCard
          title="FTE Total"
          value={data ? String(data.kpis.fteTotal) : '—'}
          sub={data ? `FTE no mês: ${data.kpis.fteMesAtual.toFixed(2)}` : 'Full-Time Equivalent'}
          color="#1E16A0"
          icon="⏱️"
        />
        <KpiCard
          title="Carteira Acumulada"
          value={data ? formatBRL(data.kpis.carteiraAcumulada) : '—'}
          color="linear-gradient(135deg, #050439, #1E16A0)"
          icon="💼"
        />
        <KpiCard
          title="Saldo Contratual"
          value={data ? formatBRL(data.kpis.saldoContratualTotal) : '—'}
          sub={data ? `Saldo em linhas: ${formatCompactBRL(data.analitico.saldoLinhasTotal)}` : '—'}
          color="linear-gradient(135deg, #B45309, #F59E0B)"
          icon="📑"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,1fr] gap-4">
        <section className="hw1-card">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-hw1-navy">FTE Mensal</h2>
              <p className="text-sm text-gray-500 mt-0.5">Capacidade consolidada por mês para decisões de alocação</p>
            </div>
            <div className="text-xs text-gray-500">
              Ano {ano} · total {data ? data.analitico.fteMensal.reduce((acc, item) => acc + item.fte, 0).toFixed(2) : '—'}
            </div>
          </div>

          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.analitico.fteMensal ?? []} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E16A0" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(value: number) => [value.toFixed(2), 'FTE']}
                />
                <Area
                  type="monotone"
                  dataKey="fte"
                  stroke="#1E16A0"
                  strokeWidth={2.5}
                  fill="url(#fteGrad)"
                  dot={{ r: 4, fill: '#1E16A0', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#00D4FF', stroke: '#1E16A0', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="hw1-card">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-hw1-navy">Radar Contratual</h2>
              <p className="text-sm text-gray-500 mt-0.5">Quebra por contrato, objeto e linha para localizar onde ainda existe saldo</p>
            </div>
            <div className="text-xs text-gray-500">
              {data ? `${data.analitico.contratos.length} contrato(s)` : '—'}
            </div>
          </div>

          <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {(data?.analitico.contratos ?? []).map((contrato) => {
              const totalLinhas = contrato.objetos.reduce((a, o) => a + o.linhas.reduce((b, l) => b + l.valorTotalAnual, 0), 0);
              const pctRestante = totalLinhas > 0 ? (contrato.saldoLinhas / totalLinhas) * 100 : 100;
              const saldoCor = pctRestante <= 10 ? 'border-red-300 bg-red-50' : pctRestante <= 30 ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-gray-50';
              const badgeCor = pctRestante <= 10 ? 'bg-red-100 text-red-700' : pctRestante <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
              return (
              <details key={contrato.id} className={`rounded-2xl border ${saldoCor} open:bg-white open:shadow-sm`}>
                <summary className="cursor-pointer list-none px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-hw1-navy">{contrato.nomeContrato}</p>
                      <p className="text-xs text-gray-500 mt-1">{contrato.cliente}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeCor}`}>
                      {pctRestante.toFixed(0)}% restante
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-hw1-navy">{formatCompactBRL(contrato.saldoContratual)}</p>
                    <p className="text-xs text-gray-500 mt-1">Linhas: {formatCompactBRL(contrato.saldoLinhas)}</p>
                  </div>
                </summary>

                <div className="px-4 pb-4 space-y-3">
                  {contrato.objetos.map((objeto) => (
                    <details key={objeto.id} className="rounded-xl border border-gray-100 bg-white">
                      <summary className="cursor-pointer list-none px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-hw1-navy">{objeto.nome}</p>
                          {objeto.descricao && <p className="text-xs text-gray-500 mt-1">{objeto.descricao}</p>}
                        </div>
                        <p className="text-sm font-semibold text-[#1E16A0]">{formatCompactBRL(objeto.saldoValor)}</p>
                      </summary>

                      <div className="px-3 pb-3 space-y-2">
                        {objeto.linhas.map((linha) => {
                          const lPct = linha.valorTotalAnual > 0 ? (linha.saldoValor / linha.valorTotalAnual) * 100 : 100;
                          const lCor = lPct <= 10 ? 'border-red-200 bg-red-50' : lPct <= 30 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50';
                          const lBadge = lPct <= 10 ? 'text-red-600' : lPct <= 30 ? 'text-amber-600' : 'text-emerald-600';
                          return (
                          <div key={linha.id} className={`rounded-xl border ${lCor} p-3`}>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-hw1-navy">{linha.descricaoItem}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Unidade: {linha.unidade} · Valor anual: {formatCompactBRL(linha.valorTotalAnual)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-hw1-navy">{formatCompactBRL(linha.saldoValor)}</p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                  <p className="text-xs text-gray-500">Qtd: {linha.saldoQuantidade.toFixed(2)}</p>
                                  <span className={`text-[10px] font-semibold ${lBadge}`}>{lPct.toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(Math.max(lPct, 0), 100)}%`,
                                  background: lPct <= 10 ? '#ef4444' : lPct <= 30 ? '#f59e0b' : '#10b981',
                                }}
                              />
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
              );
            })}
          </div>
        </section>
      </div>

      {/* B: Evolução de Saldo Contratual */}
      {evolucaoSaldo && evolucaoSaldo.contratos.length > 0 && (
        <section className="hw1-card">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-hw1-navy">Evolução de Saldo Contratual</h2>
              <p className="text-sm text-gray-500 mt-0.5">Saldo restante de cada contrato mês a mês — {ano}</p>
            </div>
          </div>

          <div className="mt-5 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={evolucaoSaldo.contratos[0]?.meses.map((m, i) => {
                  const point: Record<string, string | number> = { label: m.label };
                  for (const c of evolucaoSaldo.contratos) {
                    point[c.contratoId] = c.meses[i]?.saldoRestante ?? 0;
                  }
                  return point;
                })}
                margin={{ top: 8, right: 12, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(value: number, name: string) => {
                    const c = evolucaoSaldo.contratos.find((c) => c.contratoId === name);
                    return [formatBRL(value), c?.nomeContrato ?? name];
                  }}
                />
                {evolucaoSaldo.contratos.map((c, i) => (
                  <Area
                    key={c.contratoId}
                    type="monotone"
                    dataKey={c.contratoId}
                    name={c.contratoId}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.08}
                    dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda */}
          <div className="mt-3 flex flex-wrap gap-4">
            {evolucaoSaldo.contratos.map((c, i) => (
              <div key={c.contratoId} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-xs text-gray-600">{c.nomeContrato}</span>
                <span className="text-xs text-gray-500">({formatCompactBRL(c.saldoAtual)})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* D: Relatório de Consumo Contratual */}
      {relatorioConsumo && relatorioConsumo.linhas.length > 0 && (
        <section className="hw1-card">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-hw1-navy">Relatório de Consumo</h2>
              <p className="text-sm text-gray-500 mt-0.5">Consumo, saldo e projeção de esgotamento por linha contratual — {ano}</p>
            </div>
            <button
              type="button"
              onClick={exportarCsvConsumo}
              disabled={exportandoConsumo}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: exportandoConsumo ? '#9ca3af' : 'linear-gradient(135deg, #1E16A0, #35277D)' }}
            >
              {exportandoConsumo ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Contrato</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Objeto</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Item</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-right">Vlr Total</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-right">Realizado</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-right">Saldo</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-center">% Consumido</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-right">Vel. Média/Mês</th>
                  <th className="py-2 px-2 text-xs font-semibold text-gray-500 uppercase text-center">Projeção</th>
                </tr>
              </thead>
              <tbody>
                {relatorioConsumo.linhas.map((l, i) => {
                  const pctCor = l.pctConsumido >= 90 ? 'text-red-600 bg-red-50' : l.pctConsumido >= 70 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
                  const projCor = l.mesesParaEsgotar !== null && l.mesesParaEsgotar <= 2 ? 'text-red-600 font-semibold' : l.mesesParaEsgotar !== null && l.mesesParaEsgotar <= 4 ? 'text-amber-600' : 'text-gray-600';
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 text-gray-700 truncate max-w-[140px]" title={l.contrato}>{l.contrato}</td>
                      <td className="py-2 px-2 text-gray-600 truncate max-w-[120px]" title={l.objeto}>{l.objeto}</td>
                      <td className="py-2 px-2 text-gray-700 truncate max-w-[160px]" title={l.descricaoItem}>{l.descricaoItem}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatCompactBRL(l.valorTotal)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatCompactBRL(l.valorRealizado)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-hw1-navy">{formatCompactBRL(l.saldoValor)}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pctCor}`}>
                          {l.pctConsumido.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right text-gray-600">{formatCompactBRL(l.velocidadeMediaMensal)}</td>
                      <td className={`py-2 px-2 text-center text-xs ${projCor}`}>
                        {l.mesesParaEsgotar !== null ? `${l.mesesParaEsgotar.toFixed(1)} meses` : '∞'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Status panel */}
      <div className="hw1-card">
        <h2 className="text-base font-heading font-semibold text-hw1-navy mb-4">
          Status do Sistema
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Auth + RBAC', status: 'online' },
            { label: 'Módulo Projetos', status: 'online' },
            { label: 'Módulo RH', status: 'online' },
            { label: 'Módulo Financeiro', status: 'online' },
            { label: 'Calendários', status: 'online' },
            { label: 'Sindicatos', status: 'online' },
            { label: 'Dashboard API', status: loading ? 'carregando' : error ? 'offline' : 'online' },
            { label: 'PostgreSQL', status: 'online' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  item.status === 'online'
                    ? 'bg-emerald-400'
                    : item.status === 'carregando'
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
              />
              <span className="text-xs text-gray-600 truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

