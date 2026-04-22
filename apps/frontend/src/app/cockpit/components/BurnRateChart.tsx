'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import type { BurnRatePoint } from '@/services/cockpitApi';

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);

interface Props {
  data: BurnRatePoint[];
  loading?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const receita = payload.find((p: any) => p.dataKey === 'receita')?.value ?? 0;
  const custos = payload.find((p: any) => p.dataKey === 'custos')?.value ?? 0;
  const lucro = receita - custos;
  const isProjetado = payload[0]?.payload?.projetado;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-gray-800 mb-2">
        {label} {isProjetado && <span className="text-gray-500 font-normal">(Projetado)</span>}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E16A0]" />
            Receita
          </span>
          <span className="font-semibold text-[#0C1B3A] tabular-nums">{formatBRL(receita)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
            Custos
          </span>
          <span className="font-semibold text-gray-600 tabular-nums">{formatBRL(custos)}</span>
        </div>
        <div className="border-t border-gray-100 pt-1 mt-1">
          <div className="flex items-center justify-between gap-6 text-sm">
            <span className="font-medium text-gray-600">Lucro</span>
            <span className={`font-bold tabular-nums ${lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatBRL(lucro)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BurnRateChart({ data, loading }: Props) {
  // Find the index where projection starts
  const projectionStart = data.findIndex((d) => d.projetado);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">
            Sustentabilidade Financeira
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Burn Rate vs. Receita — últimos 4 meses + projeção</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1E16A0] rounded" /> Receita
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gray-400 rounded" /> Custos / OPEX
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gray-400 rounded border-dashed" style={{ borderTop: '2px dashed #9CA3AF', height: 0 }} /> Projetado
          </span>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-500 text-sm">Carregando gráfico...</div>
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E16A0" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#1E16A0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Projected zone marker */}
              {projectionStart > 0 && (
                <ReferenceLine
                  x={data[projectionStart]?.mes}
                  stroke="#D1D5DB"
                  strokeDasharray="6 4"
                  label={{
                    value: 'Projeção →',
                    position: 'top',
                    fill: '#9CA3AF',
                    fontSize: 10,
                  }}
                />
              )}

              {/* Area fill under receita */}
              <Area
                type="monotone"
                dataKey="receita"
                fill="url(#receitaGradient)"
                stroke="none"
              />

              {/* Receita line */}
              <Line
                type="monotone"
                dataKey="receita"
                stroke="#1E16A0"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1E16A0', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#1E16A0', strokeWidth: 2, stroke: '#fff' }}
              />

              {/* Custos line */}
              <Line
                type="monotone"
                dataKey="custos"
                stroke="#6B7280"
                strokeWidth={2}
                strokeDasharray={undefined}
                dot={{ r: 3, fill: '#6B7280', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, fill: '#6B7280', strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
