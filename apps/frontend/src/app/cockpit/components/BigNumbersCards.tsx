'use client';

import React from 'react';
import type { BigNumber } from '@/services/cockpitApi';

const VARIANT_STYLES: Record<BigNumber['variant'], { bg: string; border: string; iconBg: string }> = {
  default: {
    bg: 'bg-white',
    border: 'border-gray-100',
    iconBg: 'bg-gradient-to-br from-[#1E16A0] to-[#2D23C0]',
  },
  success: {
    bg: 'bg-white',
    border: 'border-emerald-100',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
  },
  danger: {
    bg: 'bg-red-50/60',
    border: 'border-red-200',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
  },
  warning: {
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
  },
};

interface Props {
  data: BigNumber[];
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-7 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function BigNumbersCards({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {data.map((item) => {
        const style = VARIANT_STYLES[item.variant];
        const isMargemGreen = item.id === 'margem' && item.value >= 30;
        const isMargemRed = item.id === 'margem' && item.value < 30;

        return (
          <div
            key={item.id}
            className={`${style.bg} rounded-2xl border ${style.border} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0 shadow-sm ${style.iconBg}`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p
                  className={`text-2xl font-heading font-bold mt-1 truncate ${
                    isMargemGreen
                      ? 'text-emerald-600'
                      : isMargemRed
                        ? 'text-red-600'
                        : item.variant === 'danger'
                          ? 'text-red-700'
                          : 'text-[#0C1B3A]'
                  }`}
                >
                  {item.formattedValue}
                </p>
                {item.meta && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{item.meta}</p>
                )}
              </div>
            </div>

            {/* Progress bar for faturamento vs meta */}
            {item.id === 'faturamento' && (
              <div className="mt-4">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E16A0] to-[#00D4FF] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((item.value / 2000000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  {((item.value / 2000000) * 100).toFixed(1)}% da meta
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
