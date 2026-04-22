'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchBigNumbers,
  fetchPortfolio,
  fetchBurnRate,
  fetchGoLive,
  fetchCockpitInsights,
  type BigNumber,
  type PortfolioProject,
  type BurnRatePoint,
  type GoLiveData,
  type CockpitInsights,
} from '@/services/cockpitApi';

import BigNumbersCards from './components/BigNumbersCards';
import PortfolioTable from './components/PortfolioTable';
import DrillDownModal from './components/DrillDownModal';
import BurnRateChart from './components/BurnRateChart';
import GoLivePipeline from './components/GoLivePipeline';

export default function CockpitPage() {
  const [bigNumbers, setBigNumbers] = useState<BigNumber[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [burnRate, setBurnRate] = useState<BurnRatePoint[]>([]);
  const [goLive, setGoLive] = useState<GoLiveData | null>(null);
  const [insights, setInsights] = useState<CockpitInsights | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [bn, pf, br, gl] = await Promise.all([
        fetchBigNumbers(),
        fetchPortfolio(),
        fetchBurnRate(),
        fetchGoLive(),
      ]);
      const insightData = await fetchCockpitInsights();
      setBigNumbers(bn);
      setPortfolio(pf);
      setBurnRate(br);
      setGoLive(gl);
      setInsights(insightData);
      setLoading(false);
    }
    loadAll();
  }, []);

  const handleProjectClick = (project: PortfolioProject) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0C1B3A]">
            Cockpit do Sócio
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Dados atualizados
          </span>
        </div>
      </div>

      {/* História 1 — Big Numbers */}
      <BigNumbersCards data={bigNumbers} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr,1fr] gap-6">
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">Pulso de Capacidade</h2>
              <p className="text-xs text-gray-500 mt-1">FTE mensal consolidado para leitura rápida de ocupação</p>
            </div>
            <div className="text-xs text-gray-500">
              Total do ano: {insights ? insights.fteMensal.reduce((acc, item) => acc + item.fte, 0).toFixed(2) : '—'}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {(insights?.fteMensal ?? []).map((item) => (
              <div key={item.mes} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-[#0C1B3A]">{item.fte.toFixed(2)}</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1E16A0] to-[#00D4FF]"
                    style={{ width: `${Math.min(item.fte * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">Saldo Contratual</h2>
              <p className="text-xs text-gray-500 mt-1">Visão total do saldo publicado nos contratos e nas linhas</p>
            </div>
            <div className="rounded-2xl bg-white/80 border border-amber-100 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Linhas</p>
              <p className="mt-1 text-lg font-semibold text-[#0C1B3A]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(insights?.saldoLinhasTotal ?? 0)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {(insights?.contratos ?? []).map((contrato) => (
              <details key={contrato.id} className="rounded-2xl border border-white bg-white/90 p-4 open:shadow-sm">
                <summary className="cursor-pointer list-none flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#0C1B3A]">{contrato.nomeContrato}</p>
                    <p className="text-xs text-gray-500 mt-1">{contrato.cliente}</p>
                  </div>
                  <div className="text-sm font-semibold text-[#1E16A0]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(contrato.saldoContratual)}
                  </div>
                </summary>

                <div className="mt-3 space-y-2">
                  {contrato.objetos.map((objeto) => (
                    <div key={objeto.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0C1B3A]">{objeto.nome}</p>
                          {objeto.descricao && <p className="text-xs text-gray-500 mt-1">{objeto.descricao}</p>}
                        </div>
                        <p className="text-sm font-semibold text-[#0C1B3A]">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(objeto.saldoValor)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* Grid: Chart + Go-Live Pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* História 4 — Burn Rate Chart (takes 2/3) */}
        <div className="xl:col-span-2">
          <BurnRateChart data={burnRate} loading={loading} />
        </div>

        {/* História 5 — Go-Live Pipeline (takes 1/3) */}
        <div className="xl:col-span-1">
          <GoLivePipeline data={goLive} loading={loading} />
        </div>
      </div>

      {/* História 2 — Portfolio Table */}
      <PortfolioTable
        data={portfolio}
        loading={loading}
        onProjectClick={handleProjectClick}
      />

      {/* História 3 — Drill-Down Modal */}
      <DrillDownModal
        project={selectedProject}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
