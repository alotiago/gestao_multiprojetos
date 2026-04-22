'use client';

import React from 'react';
import type { PortfolioProject, StatusColor } from '@/services/cockpitApi';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

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
              <span className="text-xs text-gray-500">
                Status: {STATUS_LABEL[project.status]} · Margem: {project.margem.toFixed(1)}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Contrato</p>
              <p className="mt-2 text-sm font-semibold text-[#0C1B3A]">{project.contratoNome}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">FTE no mês</p>
              <p className="mt-2 text-2xl font-semibold text-[#0C1B3A]">{project.fteAtual.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Saldo contratual</p>
              <p className="mt-2 text-lg font-semibold text-[#0C1B3A]">{formatBRL(project.saldoContratual)}</p>
              <p className="mt-1 text-xs text-gray-500">Saldo por linhas: {formatBRL(project.saldoLinhas)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              FTE Mensal
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {project.fteMensal.map((item) => (
                <div key={item.mes} className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[#0C1B3A]">{item.fte.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

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

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Saldos Contratuais por Objeto e Linha
            </h3>
            <div className="space-y-3">
              {project.objetos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Nenhum objeto contratual encontrado para este projeto.
                </div>
              ) : (
                project.objetos.map((objeto) => (
                  <details key={objeto.id} className="rounded-2xl border border-gray-100 bg-white open:shadow-sm">
                    <summary className="cursor-pointer list-none px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-[#0C1B3A]">{objeto.nome}</p>
                        {objeto.descricao && <p className="text-sm text-gray-500 mt-1">{objeto.descricao}</p>}
                      </div>
                      <div className="text-sm font-semibold text-[#1E16A0]">
                        Saldo: {formatBRL(objeto.saldoValor)}
                      </div>
                    </summary>

                    <div className="px-4 pb-4">
                      <div className="space-y-2">
                        {objeto.linhas.map((linha) => (
                          <div key={linha.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#0C1B3A]">{linha.descricaoItem}</p>
                                <p className="text-xs text-gray-500 mt-1">Unidade: {linha.unidade} · Valor anual: {formatBRL(linha.valorTotalAnual)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-[#0C1B3A]">{formatBRL(linha.saldoValor)}</p>
                                <p className="text-xs text-gray-500 mt-1">Saldo qtd: {linha.saldoQuantidade.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))
              )}
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
                    <p className="text-xs text-gray-500 font-medium">
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
