'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { invalidateCockpitCache } from '@/services/cockpitApi';
import RowActionsMenu from '@/app/components/RowActionsMenu';

interface Project {
  id: string;
  codigo: string;
  nome: string;
  cliente: string;
}

interface StatusReport {
  id: string;
  projectId: string;
  project: { id: string; nome: string; cliente: string; codigo: string };
  status: string;
  gargalo: string | null;
  detalheGargalo: string | null;
  acaoCLevel: string | null;
  responsavel: string | null;
  vigente: boolean;
  dataReport: string;
}

const STATUS_OPTIONS = [
  { value: 'green', label: '🟢 Saudável', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'yellow', label: '🟡 Atenção', color: 'bg-amber-100 text-amber-700' },
  { value: 'red', label: '🔴 Crítico', color: 'bg-red-100 text-red-700' },
];

export default function StatusReportsPage() {
  const [reports, setReports] = useState<StatusReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    projectId: '',
    status: 'green',
    gargalo: '',
    detalheGargalo: '',
    acaoCLevel: '',
    responsavel: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, projectsRes] = await Promise.all([
        api.get('/dashboard/status-reports'),
        api.get('/projects?limit=100&page=1'),
      ]);
      setReports(reportsRes.data);
      const list = projectsRes.data?.data ?? projectsRes.data ?? [];
      setProjects(list.map((p: any) => ({ id: p.id, codigo: p.codigo, nome: p.nome, cliente: p.cliente })));
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      setFeedback({ type: 'error', message: 'Falha ao carregar dados de Status Reports.' });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ projectId: '', status: 'green', gargalo: '', detalheGargalo: '', acaoCLevel: '', responsavel: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId) return;
    setSaving(true);
    try {
      if (editId) {
        const { projectId, ...updateData } = form;
        await api.put(`/dashboard/status-reports/${editId}`, updateData);
      } else {
        await api.post('/dashboard/status-reports', form);
      }
      invalidateCockpitCache();
      setFeedback({ type: 'success', message: 'Status Report salvo com sucesso.' });
      resetForm();
      await loadData();
    } catch (e) {
      console.error('Erro ao salvar:', e);
      const rawMessage = (e as any)?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' | ') : rawMessage;
      setFeedback({
        type: 'error',
        message: message || 'Não foi possível salvar o Status Report. Verifique os campos e tente novamente.',
      });
    }
    setSaving(false);
  };

  const handleEdit = (report: StatusReport) => {
    setForm({
      projectId: report.projectId,
      status: report.status,
      gargalo: report.gargalo || '',
      detalheGargalo: report.detalheGargalo || '',
      acaoCLevel: report.acaoCLevel || '',
      responsavel: report.responsavel || '',
    });
    setEditId(report.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este status report?')) return;
    try {
      await api.delete(`/dashboard/status-reports/${id}`);
      invalidateCockpitCache();
      setFeedback({ type: 'success', message: 'Status Report removido com sucesso.' });
      await loadData();
    } catch (e) {
      const rawMessage = (e as any)?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' | ') : rawMessage;
      setFeedback({ type: 'error', message: message || 'Falha ao remover Status Report.' });
    }
  };

  const vigentes = reports.filter((r) => r.vigente);
  const historico = reports.filter((r) => !r.vigente);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0C1B3A]">Status Report de Projetos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Alimenta o Semáforo de Portfólio do Cockpit do Sócio
          </p>
        </div>
        <button
          onClick={() => { setFeedback(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors"
          style={{ background: 'linear-gradient(135deg, #1E16A0, #2D23C0)' }}
        >
          + Novo Status Report
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-heading font-semibold text-[#0C1B3A] mb-4">
            {editId ? 'Editar Status Report' : 'Novo Status Report'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projeto */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Projeto *
                </label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
                  required
                  disabled={!!editId}
                >
                  <option value="">Selecione o projeto...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} — {p.cliente} — {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Status *
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: opt.value })}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.status === opt.value
                          ? `${opt.color} border-current ring-2 ring-offset-1`
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gargalo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Gargalo / Risco Atual
                </label>
                <input
                  type="text"
                  value={form.gargalo}
                  onChange={(e) => setForm({ ...form, gargalo: e.target.value })}
                  placeholder="Ex: SLA Suspenso por falha de API do Cliente"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
                />
              </div>

              {/* Ação C-Level */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Ação C-Level Recomendada
                </label>
                <input
                  type="text"
                  value={form.acaoCLevel}
                  onChange={(e) => setForm({ ...form, acaoCLevel: e.target.value })}
                  placeholder="Ex: Escalar ao Secretário de Fazenda"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
                />
              </div>
            </div>

            {/* Detalhe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Detalhamento Técnico do Gargalo
              </label>
              <textarea
                value={form.detalheGargalo}
                onChange={(e) => setForm({ ...form, detalheGargalo: e.target.value })}
                rows={3}
                placeholder="Descrição técnica detalhada do problema, impactos e timeline..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0] resize-none"
              />
            </div>

            {/* Responsável */}
            <div className="max-w-sm">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Responsável pelo Report
              </label>
              <input
                type="text"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !form.projectId}
                className="px-5 py-2 text-sm font-medium text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg, #1E16A0, #2D23C0)' }}
              >
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Salvar Report'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports vigentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">Reports Vigentes</h2>
          <p className="text-xs text-gray-500 mt-0.5">Status atual de cada projeto — exibidos no Cockpit</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
        ) : vigentes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">Nenhum status report cadastrado.</p>
            <p className="text-gray-300 text-xs mt-1">
              Use o botão &quot;+ Novo Status Report&quot; para criar o primeiro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Projeto</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Gargalo</th>
                  <th className="px-5 py-3 text-left font-semibold">Ação C-Level</th>
                  <th className="px-5 py-3 text-left font-semibold">Responsável</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vigentes.map((r) => {
                  const cfg = STATUS_OPTIONS.find((o) => o.value === r.status);
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-[#0C1B3A]">
                        {r.project.codigo} — {r.project.cliente}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg?.color}`}>
                          {cfg?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{r.gargalo || '—'}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{r.acaoCLevel || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{r.responsavel || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(r.dataReport).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <RowActionsMenu
                          items={[
                            { label: 'Editar', icon: '✏️', onClick: () => handleEdit(r) },
                            { label: 'Remover', icon: '🗑️', tone: 'danger', onClick: () => handleDelete(r.id) },
                          ]}
                          align="left"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">Histórico de Reports</h2>
            <p className="text-xs text-gray-500 mt-0.5">Reports anteriores (substituídos por versões mais recentes)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Projeto</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Gargalo</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historico.slice(0, 10).map((r) => {
                  const cfg = STATUS_OPTIONS.find((o) => o.value === r.status);
                  return (
                    <tr key={r.id} className="opacity-60">
                      <td className="px-5 py-3 text-[#0C1B3A]">{r.project.codigo} — {r.project.cliente}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg?.color}`}>
                          {cfg?.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{r.gargalo || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(r.dataReport).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
