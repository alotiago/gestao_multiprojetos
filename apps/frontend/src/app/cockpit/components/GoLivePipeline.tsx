'use client';

import React from 'react';
import type { GoLiveData, GoLiveProject } from '@/services/cockpitApi';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function GoLiveItem({ item }: { item: GoLiveProject }) {
  const days = daysUntil(item.dataGoLive);
  const isOverdue = item.atrasado || days < 0;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        isOverdue
          ? 'border-red-300 bg-red-50/50'
          : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${isOverdue ? 'text-red-800' : 'text-[#0C1B3A]'}`}>
          {item.cliente}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.dataGoLive)}</p>
      </div>
      <div className="flex-shrink-0 ml-3">
        {isOverdue ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            ⚠️ Atrasado
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            {days}d restantes
          </span>
        )}
      </div>
    </div>
  );
}

interface Props {
  data: GoLiveData | null;
  loading?: boolean;
}

function SkeletonItem() {
  return (
    <div className="animate-pulse flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
      <div className="space-y-1.5">
        <div className="h-4 w-36 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>
  );
}

export default function GoLivePipeline({ data, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">
          Pipeline de Go-Live
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Projetos entrando em produção</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Próximos 30 dias */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1E16A0]" />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Próximos 30 dias
            </h3>
            {data && (
              <span className="text-xs text-gray-400">({data.proximos30.length})</span>
            )}
          </div>
          <div className="space-y-2">
            {loading ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) : data && data.proximos30.length > 0 ? (
              data.proximos30.map((item) => <GoLiveItem key={item.id} item={item} />)
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum go-live nos próximos 30 dias</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Próximos 60 dias */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Próximos 60 dias
            </h3>
            {data && (
              <span className="text-xs text-gray-400">({data.proximos60.length})</span>
            )}
          </div>
          <div className="space-y-2">
            {loading ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) : data && data.proximos60.length > 0 ? (
              data.proximos60.map((item) => <GoLiveItem key={item.id} item={item} />)
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum go-live nos próximos 60 dias</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
