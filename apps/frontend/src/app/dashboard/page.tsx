'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import {
  buildDashboardFinanceiroCsvFilename,
  buildDashboardFinanceiroCsvUrl,
  downloadTextFile,
} from '@/services/dashboardExport';

const currentYear = new Date().getFullYear();

interface ExecutivoData {
  ano: number;
  kpis: {
    projetosTotal: number;
    projetosAtivos: number;
    colaboradoresAtivos: number;
    fteTotal: number;
    carteiraAcumulada: number;
  };
  financeiro: {
    receitaPrevista: number;
    receitaRealizada: number;
    totalCustos: number;
    margemPrevista: number;
    margemRealizada: number;
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

export default function DashboardPage() {
  const [data, setData] = useState<ExecutivoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState('');
  const [ano, setAno] = useState(currentYear);

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

  useEffect(() => {
    setLoading(true);
    api
      .get(`/dashboard/executivo?ano=${ano}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Não foi possível carregar o dashboard.'))
      .finally(() => setLoading(false));
  }, [ano]);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão consolidada do portfólio</p>
        </div>
        <div className="flex items-center gap-2">
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
          {error} <span className="text-red-400">(Backend pode estar offline)</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Colaboradores Ativos"
          value={data ? String(data.kpis.colaboradoresAtivos) : '—'}
          color="#35277D"
          icon="👥"
        />
        <KpiCard
          title="FTE Total"
          value={data ? String(data.kpis.fteTotal) : '—'}
          sub="Full-Time Equivalent"
          color="#1E16A0"
          icon="⏱️"
        />
        <KpiCard
          title="Carteira Acumulada"
          value={data ? formatBRL(data.kpis.carteiraAcumulada) : '—'}
          color="linear-gradient(135deg, #050439, #1E16A0)"
          icon="💼"
        />
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

