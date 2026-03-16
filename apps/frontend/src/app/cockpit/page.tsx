'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchBigNumbers,
  fetchPortfolio,
  fetchBurnRate,
  fetchGoLive,
  type BigNumber,
  type PortfolioProject,
  type BurnRatePoint,
  type GoLiveData,
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
      setBigNumbers(bn);
      setPortfolio(pf);
      setBurnRate(br);
      setGoLive(gl);
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
          <p className="text-sm text-gray-400 mt-1 capitalize">{dateStr}</p>
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
