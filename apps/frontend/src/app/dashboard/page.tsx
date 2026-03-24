'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '@/services/api';
import {
  buildDashboardFinanceiroCsvFilename,
  buildDashboardFinanceiroCsvUrl,
  downloadTextFile,
} from '@/services/dashboardExport';

const currentYear = new Date().getFullYear();

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
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
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
    setLoading(true);
    setError('');
    setIsAuthError(false);
    let url = `/dashboard/executivo?ano=${ano}`;
    if (selectedProjectId) url += `&projectId=${selectedProjectId}`;
    api
      .get(url)
      .then((r) => setData(r.data))
      .catch((err: unknown) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setIsAuthError(true);
          setError('Sessão expirada ou não autenticada. Faça login novamente.');
          return;
        }

        setError('Não foi possível carregar o dashboard. Tente novamente em instantes.');
      })
      .finally(() => setLoading(false));
  }, [ano, selectedProjectId]);

  return (
    <div className="space-y-6">
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
            <div className="text-xs text-gray-400">
              Ano {ano} · total {data ? data.analitico.fteMensal.reduce((acc, item) => acc + item.fte, 0).toFixed(2) : '—'}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {(data?.analitico.fteMensal ?? []).map((item) => (
              <div key={item.mes} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-hw1-navy">{item.fte.toFixed(2)}</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(item.fte * 10, 100)}%`,
                      background: 'linear-gradient(90deg, #1E16A0, #00D4FF)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hw1-card">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-hw1-navy">Radar Contratual</h2>
              <p className="text-sm text-gray-500 mt-0.5">Quebra por contrato, objeto e linha para localizar onde ainda existe saldo</p>
            </div>
            <div className="text-xs text-gray-400">
              {data ? `${data.analitico.contratos.length} contrato(s)` : '—'}
            </div>
          </div>

          <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {(data?.analitico.contratos ?? []).map((contrato) => (
              <details key={contrato.id} className="rounded-2xl border border-gray-100 bg-gray-50 open:bg-white open:shadow-sm">
                <summary className="cursor-pointer list-none px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-hw1-navy">{contrato.nomeContrato}</p>
                    <p className="text-xs text-gray-400 mt-1">{contrato.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-hw1-navy">{formatCompactBRL(contrato.saldoContratual)}</p>
                    <p className="text-xs text-gray-400 mt-1">Linhas: {formatCompactBRL(contrato.saldoLinhas)}</p>
                  </div>
                </summary>

                <div className="px-4 pb-4 space-y-3">
                  {contrato.objetos.map((objeto) => (
                    <details key={objeto.id} className="rounded-xl border border-gray-100 bg-white">
                      <summary className="cursor-pointer list-none px-3 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-hw1-navy">{objeto.nome}</p>
                          {objeto.descricao && <p className="text-xs text-gray-400 mt-1">{objeto.descricao}</p>}
                        </div>
                        <p className="text-sm font-semibold text-[#1E16A0]">{formatCompactBRL(objeto.saldoValor)}</p>
                      </summary>

                      <div className="px-3 pb-3 space-y-2">
                        {objeto.linhas.map((linha) => (
                          <div key={linha.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-hw1-navy">{linha.descricaoItem}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Unidade: {linha.unidade} · Valor anual: {formatCompactBRL(linha.valorTotalAnual)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-hw1-navy">{formatCompactBRL(linha.saldoValor)}</p>
                                <p className="text-xs text-gray-400 mt-1">Qtd: {linha.saldoQuantidade.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

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

