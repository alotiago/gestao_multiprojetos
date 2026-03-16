'use client';

import React from 'react';
import type { PortfolioProject, StatusColor } from '@/services/cockpitApi';

const STATUS_CONFIG: Record<StatusColor, { emoji: string; label: string; badgeBg: string; badgeText: string }> = {
  red: { emoji: '🔴', label: 'Crítico', badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
  yellow: { emoji: '🟡', label: 'Atenção', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700' },
  green: { emoji: '🟢', label: 'Saudável', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700' },
};

const ROW_HIGHLIGHT: Record<StatusColor, string> = {
  red: 'bg-red-50/40 hover:bg-red-50/70',
  yellow: 'bg-amber-50/30 hover:bg-amber-50/60',
  green: 'hover:bg-gray-50/80',
};

interface Props {
  data: PortfolioProject[];
  loading?: boolean;
  onProjectClick: (project: PortfolioProject) => void;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
      <td className="px-5 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
      <td className="px-5 py-4"><div className="h-4 w-14 bg-gray-200 rounded" /></td>
      <td className="px-5 py-4"><div className="h-4 w-52 bg-gray-200 rounded" /></td>
      <td className="px-5 py-4"><div className="h-4 w-36 bg-gray-200 rounded" /></td>
    </tr>
  );
}

export default function PortfolioTable({ data, loading, onProjectClick }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">
            Semáforo de Portfólio
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Clique em um projeto para ver detalhes do gargalo
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">🔴 Crítico</span>
          <span className="flex items-center gap-1">🟡 Atenção</span>
          <span className="flex items-center gap-1">🟢 Saudável</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-semibold">Projeto</th>
              <th className="px-5 py-3 text-center font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Margem %</th>
              <th className="px-5 py-3 text-left font-semibold">Gargalo / Risco Atual</th>
              <th className="px-5 py-3 text-left font-semibold">Ação C-Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
            ) : (
              data.map((project) => {
                const cfg = STATUS_CONFIG[project.status];
                const clickable = project.status !== 'green';
                return (
                  <tr
                    key={project.id}
                    className={`transition-colors duration-150 ${ROW_HIGHLIGHT[project.status]} ${
                      clickable ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => clickable && onProjectClick(project)}
                  >
                    {/* Projeto */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#0C1B3A]">{project.nome}</span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}
                      >
                        {cfg.emoji} {cfg.label}
                      </span>
                    </td>

                    {/* Margem */}
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-bold tabular-nums ${
                          project.margem >= 30 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {project.margem.toFixed(1)}%
                      </span>
                    </td>

                    {/* Gargalo */}
                    <td className="px-5 py-4">
                      <span className="text-gray-600 line-clamp-1">{project.gargalo}</span>
                    </td>

                    {/* Ação */}
                    <td className="px-5 py-4">
                      <span className="text-gray-600 line-clamp-1">{project.acaoCLevel}</span>
                      {clickable && (
                        <span className="ml-2 text-gray-300 text-xs">→</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
