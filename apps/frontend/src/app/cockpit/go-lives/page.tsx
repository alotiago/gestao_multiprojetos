'use client';

import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { invalidateCockpitCache } from '@/services/cockpitApi';

interface Project {
  id: string;
  codigo: string;
  nome: string;
  cliente: string;
}

interface GoLive {
  id: string;
  projectId: string;
  project: { id: string; nome: string; cliente: string; codigo: string };
  dataGoLive: string;
  descricao: string;
  concluido: boolean;
}

export default function GoLivesPage() {
  const [goLives, setGoLives] = useState<GoLive[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    projectId: '',
    dataGoLive: '',
    descricao: '',
    concluido: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [glRes, projRes] = await Promise.all([
        api.get('/dashboard/go-lives'),
        api.get('/projects?limit=100&page=1'),
      ]);
      setGoLives(glRes.data);
      const list = projRes.data?.data ?? projRes.data ?? [];
      setProjects(list.map((p: any) => ({ id: p.id, codigo: p.codigo, nome: p.nome, cliente: p.cliente })));
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      setFeedback({ type: 'error', message: 'Falha ao carregar dados de Go-Live.' });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ projectId: '', dataGoLive: '', descricao: '', concluido: false });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || !form.dataGoLive) return;
    setSaving(true);
    try {
      const dataGoLiveIso = new Date(`${form.dataGoLive}T12:00:00`).toISOString();
      const descricao = form.descricao.trim();

      if (editId) {
        const updateData = {
          dataGoLive: dataGoLiveIso,
          descricao,
          concluido: form.concluido,
        };
        await api.put(`/dashboard/go-lives/${editId}`, updateData);
      } else {
        // No create, enviar apenas os campos permitidos pelo DTO backend.
        await api.post('/dashboard/go-lives', {
          projectId: form.projectId,
          dataGoLive: dataGoLiveIso,
          descricao,
        });
      }
      invalidateCockpitCache();
      setFeedback({ type: 'success', message: 'Go-Live salvo com sucesso.' });
      resetForm();
      await loadData();
    } catch (e) {
      console.error('Erro ao salvar:', e);
      const rawMessage = (e as any)?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' | ') : rawMessage;
      setFeedback({
        type: 'error',
        message: message || 'Nao foi possivel salvar o Go-Live. Verifique os campos e tente novamente.',
      });
    }
    setSaving(false);
  };

  const handleEdit = (gl: GoLive) => {
    setForm({
      projectId: gl.projectId,
      dataGoLive: gl.dataGoLive.substring(0, 10),
      descricao: gl.descricao,
      concluido: gl.concluido,
    });
    setEditId(gl.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este Go-Live?')) return;
    try {
      await api.delete(`/dashboard/go-lives/${id}`);
      invalidateCockpitCache();
      setFeedback({ type: 'success', message: 'Go-Live removido com sucesso.' });
      await loadData();
    } catch (e) {
      const rawMessage = (e as any)?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' | ') : rawMessage;
      setFeedback({ type: 'error', message: message || 'Falha ao remover Go-Live.' });
    }
  };

  const handleToggleConcluido = async (gl: GoLive) => {
    try {
      await api.put(`/dashboard/go-lives/${gl.id}`, { concluido: !gl.concluido });
      invalidateCockpitCache();
      setFeedback({ type: 'success', message: 'Status do Go-Live atualizado.' });
      await loadData();
    } catch (e) {
      const rawMessage = (e as any)?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' | ') : rawMessage;
      setFeedback({ type: 'error', message: message || 'Falha ao atualizar status do Go-Live.' });
    }
  };

  const pendentes = goLives.filter((gl) => !gl.concluido).sort(
    (a, b) => new Date(a.dataGoLive).getTime() - new Date(b.dataGoLive).getTime()
  );
  const concluidos = goLives.filter((gl) => gl.concluido);

  const getDaysUntil = (dateStr: string) => {
    const d = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return d;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0C1B3A]">Pipeline de Go-Live</h1>
          <p className="text-sm text-gray-400 mt-1">
            Marcos de entrega dos projetos — alimenta o Pipeline do Cockpit
          </p>
        </div>
        <button
          onClick={() => { setFeedback(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors"
          style={{ background: 'linear-gradient(135deg, #1E16A0, #2D23C0)' }}
        >
          + Novo Go-Live
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
            {editId ? 'Editar Go-Live' : 'Novo Go-Live'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Data Go-Live */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Data Go-Live *
                </label>
                <input
                  type="date"
                  value={form.dataGoLive}
                  onChange={(e) => setForm({ ...form, dataGoLive: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Descrição do Marco
                </label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Módulo Financeiro em produção"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1E16A0]/20 focus:border-[#1E16A0]"
                />
              </div>
            </div>

            {editId && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.concluido}
                  onChange={(e) => setForm({ ...form, concluido: e.target.checked })}
                  className="rounded border-gray-300 text-[#1E16A0] focus:ring-[#1E16A0]"
                />
                Marcar como concluído
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !form.projectId || !form.dataGoLive}
                className="px-5 py-2 text-sm font-medium text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                style={{ background: 'linear-gradient(135deg, #1E16A0, #2D23C0)' }}
              >
                {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Salvar Go-Live'}
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

      {/* Pendentes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">
            Go-Lives Pendentes
            {pendentes.length > 0 && (
              <span className="ml-2 text-xs font-normal text-gray-400">({pendentes.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
        ) : pendentes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Nenhum go-live pendente.</p>
            <p className="text-gray-300 text-xs mt-1">
              Use o botão &quot;+ Novo Go-Live&quot; para cadastrar marcos de entrega.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Projeto</th>
                  <th className="px-5 py-3 text-left font-semibold">Descrição</th>
                  <th className="px-5 py-3 text-center font-semibold">Data Go-Live</th>
                  <th className="px-5 py-3 text-center font-semibold">Prazo</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendentes.map((gl) => {
                  const days = getDaysUntil(gl.dataGoLive);
                  const isOverdue = days < 0;
                  const isUrgent = days >= 0 && days <= 7;
                  return (
                    <tr key={gl.id} className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-medium text-[#0C1B3A]">
                        {gl.project.codigo} — {gl.project.cliente}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{gl.descricao || '—'}</td>
                      <td className="px-5 py-3 text-center text-gray-600">
                        {new Date(gl.dataGoLive).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {isOverdue ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            🔴 {Math.abs(days)}d atrasado
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            🟡 {days}d restantes
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            {days}d restantes
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleConcluido(gl)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Marcar concluído"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <button
                            onClick={() => handleEdit(gl)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1E16A0] hover:bg-[#1E16A0]/5 transition-colors"
                            title="Editar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(gl.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remover"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Concluídos */}
      {concluidos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-heading font-semibold text-[#0C1B3A]">
              Go-Lives Concluídos
              <span className="ml-2 text-xs font-normal text-gray-400">({concluidos.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Projeto</th>
                  <th className="px-5 py-3 text-left font-semibold">Descrição</th>
                  <th className="px-5 py-3 text-center font-semibold">Data Go-Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {concluidos.map((gl) => (
                  <tr key={gl.id} className="opacity-60">
                    <td className="px-5 py-3 text-[#0C1B3A]">{gl.project.codigo} — {gl.project.cliente}</td>
                    <td className="px-5 py-3 text-gray-500">{gl.descricao || '—'}</td>
                    <td className="px-5 py-3 text-center text-gray-400">
                      {new Date(gl.dataGoLive).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
