'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
  ativo: boolean;
}

export default function UnidadesPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
  });

  const load = () => {
    setLoading(true);
    api
      .get('/units')
      .then((r) => setUnits(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar as unidades.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const resetForm = () => {
    setForm({ code: '', name: '', description: '' });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingId(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingId(unit.id);
    setForm({
      code: unit.code,
      name: unit.name,
      description: unit.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/units/${editingId}`, payload);
        setSuccessMsg('Unidade atualizada com sucesso!');
      } else {
        await api.post('/units', payload);
        setSuccessMsg('Unidade criada com sucesso!');
      }
      closeModal();
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || `Não foi possível ${editingId ? 'atualizar' : 'criar'} a unidade.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Deseja excluir a unidade "${unit.code} - ${unit.name}"?`)) return;
    try {
      await api.delete(`/units/${unit.id}`);
      setSuccessMsg('Unidade excluída com sucesso!');
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Não foi possível excluir a unidade.');
    }
  };

  const filtered = units.filter(
    (u) =>
      u.code.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Unidades</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de unidades organizacionais</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar unidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
          />
          <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
            + Nova Unidade
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>
      )}

      {/* Tabela */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {search ? 'Nenhuma unidade encontrada.' : 'Nenhuma unidade cadastrada.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
              >
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.code}</td>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{u.description || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Unidade' : 'Nova Unidade'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Código *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: DITIC, SEEC, SEAD"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Diretoria de Tecnologia"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="hw1-btn-primary text-sm" disabled={saving}>
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
