'use client';

import React from 'react';
import type { PortfolioProject, StatusColor } from '@/services/cockpitApi';

const STATUS_COLOR: Record<StatusColor, string> = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
};

const STATUS_LABEL: Record<StatusColor, string> = {
  red: 'Crítico',
  yellow: 'Atenção',
  green: 'Saudável',
};

interface Props {
  project: PortfolioProject | null;
  open: boolean;
  onClose: () => void;
}

export default function DrillDownModal({ project, open, onClose }: Props) {
  if (!open || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLOR[project.status]}`} />
            <div className="min-w-0">
              <h2 className="text-lg font-heading font-semibold text-[#0C1B3A] truncate">
                {project.nome}
              </h2>
              <span className="text-xs text-gray-400">
                Status: {STATUS_LABEL[project.status]} · Margem: {project.margem.toFixed(1)}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Gargalo detail */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Detalhamento do Gargalo
            </h3>
            <div className={`p-4 rounded-xl border ${
              project.status === 'red'
                ? 'bg-red-50/50 border-red-100'
                : 'bg-amber-50/50 border-amber-100'
            }`}>
              <p className="text-sm font-medium text-gray-800 mb-2">{project.gargalo}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{project.detalheGargalo}</p>
            </div>
          </div>

          {/* Ação recomendada */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ação Recomendada
            </h3>
            <div className="p-4 rounded-xl bg-[#1E16A0]/5 border border-[#1E16A0]/10">
              <p className="text-sm font-semibold text-[#1E16A0]">{project.acaoCLevel}</p>
            </div>
          </div>

          {/* Status updates timeline */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Últimas Atualizações
            </h3>
            <div className="space-y-0">
              {project.statusUpdates.map((update, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      idx === 0 ? STATUS_COLOR[project.status] : 'bg-gray-300'
                    }`} />
                    {idx < project.statusUpdates.length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4">
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(update.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-700 mt-0.5">{update.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
