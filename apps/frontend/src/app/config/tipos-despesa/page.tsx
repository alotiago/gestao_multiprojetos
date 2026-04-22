'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import RowActionsMenu from '@/app/components/RowActionsMenu';

interface TipoDespesa {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export default function TiposDespesaPage() {
  const [tipos, setTipos] = useState<TipoDespesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: '', descricao: '' });

  const load = () => {
    setLoading(true);
    api
      .get('/financial/tipos-despesa')
      .then((r) => setTipos(Array.isArray(r.data) ? r.data : r.data?.data ?? []))
      .catch(() => setError('Não foi possível carregar os tipos de despesa.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);

  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm({ nome: '', descricao: '' }); };

  const openCreateModal = () => { setEditingId(null); setForm({ nome: '', descricao: '' }); setShowModal(true); };

  const openEditModal = (t: TipoDespesa) => {
    setEditingId(t.id);
    setForm({ nome: t.nome, descricao: t.descricao || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { nome: form.nome.trim(), descricao: form.descricao.trim() || undefined };
    try {
      if (editingId) {
        await api.put(`/financial/tipos-despesa/${editingId}`, payload);
        setSuccessMsg('Tipo de despesa atualizado!');
      } else {
        await api.post('/financial/tipos-despesa', payload);
        setSuccessMsg('Tipo de despesa criado!');
      }
      closeModal();
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erro ao salvar tipo de despesa.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (t: TipoDespesa) => {
    if (!confirm(`Excluir tipo "${t.nome}"?`)) return;
    try {
      await api.delete(`/financial/tipos-despesa/${t.id}`);
      setSuccessMsg('Tipo de despesa excluído!');
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erro ao excluir.');
    }
  };

  const toggleAtivo = async (t: TipoDespesa) => {
    try {
      await api.put(`/financial/tipos-despesa/${t.id}`, { ativo: !t.ativo });
      load();
    } catch { setError('Erro ao alterar status.'); }
  };

  const filtered = tipos.filter(
    (t) =>
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      (t.descricao || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Tipos de Despesa</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cadastro de categorias de despesa</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar tipo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
          />
          <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
            + Novo Tipo
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {search ? 'Nenhum tipo encontrado.' : 'Nenhum tipo cadastrado.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
              >
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-6 py-4 font-medium text-hw1-navy">{t.nome}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{t.descricao || '—'}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAtivo(t)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        t.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {t.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RowActionsMenu
                      items={[
                        { label: 'Editar', icon: '✏️', onClick: () => openEditModal(t) },
                        { label: 'Excluir', icon: '🗑️', tone: 'danger', onClick: () => handleDelete(t) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl leading-none" aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Facilities, Software, Tributárias"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50" disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="hw1-btn-primary text-sm" disabled={saving}>
                  {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
