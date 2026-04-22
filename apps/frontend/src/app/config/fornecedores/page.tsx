'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import RowActionsMenu from '@/app/components/RowActionsMenu';

interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
}

const formatCnpj = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0,2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
};

const onlyDigits = (v: string) => v.replace(/\D/g, '');

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [form, setForm] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    endereco: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
  });

  const load = () => {
    setLoading(true);
    api
      .get('/financial/fornecedores')
      .then((r) => setFornecedores(Array.isArray(r.data) ? r.data : r.data?.data ?? []))
      .catch(() => setError('Não foi possível carregar fornecedores.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  const resetForm = () => setForm({ cnpj: '', razaoSocial: '', nomeFantasia: '', endereco: '', cidade: '', uf: '', cep: '', telefone: '', email: '' });

  const closeModal = () => { setShowModal(false); setEditingId(null); resetForm(); };

  const openCreateModal = () => { setEditingId(null); resetForm(); setShowModal(true); };

  const openEditModal = (f: Fornecedor) => {
    setEditingId(f.id);
    setForm({
      cnpj: f.cnpj,
      razaoSocial: f.razaoSocial,
      nomeFantasia: f.nomeFantasia || '',
      endereco: f.endereco || '',
      cidade: f.cidade || '',
      uf: f.uf || '',
      cep: f.cep || '',
      telefone: f.telefone || '',
      email: f.email || '',
    });
    setShowModal(true);
  };

  const buscarCnpj = async () => {
    const digits = onlyDigits(form.cnpj);
    if (digits.length !== 14) { setError('CNPJ deve ter 14 dígitos.'); return; }
    setBuscandoCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        razaoSocial: data.razao_social || prev.razaoSocial,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia,
        endereco: [data.logradouro, data.numero, data.complemento].filter(Boolean).join(', ') || prev.endereco,
        cidade: data.municipio || prev.cidade,
        uf: data.uf || prev.uf,
        cep: data.cep ? String(data.cep).replace(/\D/g, '') : prev.cep,
        telefone: data.ddd_telefone_1 || prev.telefone,
        email: data.email || prev.email,
      }));
      setSuccessMsg('Dados do CNPJ preenchidos automaticamente!');
    } catch {
      setError('Não foi possível consultar o CNPJ na Receita Federal.');
    } finally { setBuscandoCnpj(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      cnpj: onlyDigits(form.cnpj),
      razaoSocial: form.razaoSocial.trim(),
      nomeFantasia: form.nomeFantasia.trim() || undefined,
      endereco: form.endereco.trim() || undefined,
      cidade: form.cidade.trim() || undefined,
      uf: form.uf.trim().toUpperCase() || undefined,
      cep: form.cep.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      email: form.email.trim() || undefined,
    };
    try {
      if (editingId) {
        const { cnpj: _, ...updatePayload } = payload;
        await api.put(`/financial/fornecedores/${editingId}`, updatePayload);
        setSuccessMsg('Fornecedor atualizado!');
      } else {
        await api.post('/financial/fornecedores', payload);
        setSuccessMsg('Fornecedor criado!');
      }
      closeModal();
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erro ao salvar fornecedor.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (f: Fornecedor) => {
    if (!confirm(`Excluir fornecedor "${f.razaoSocial}"?`)) return;
    try {
      await api.delete(`/financial/fornecedores/${f.id}`);
      setSuccessMsg('Fornecedor excluído!');
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erro ao excluir.');
    }
  };

  const filtered = fornecedores.filter(
    (f) =>
      f.cnpj.includes(onlyDigits(search)) ||
      f.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
      (f.nomeFantasia || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cadastro de fornecedores com consulta CNPJ</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por CNPJ ou nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-72"
          />
          <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
            + Novo Fornecedor
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
            {search ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
              >
                <th className="px-6 py-4">CNPJ</th>
                <th className="px-6 py-4">Razão Social</th>
                <th className="px-6 py-4">Nome Fantasia</th>
                <th className="px-6 py-4">Cidade/UF</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{formatCnpj(f.cnpj)}</td>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{f.razaoSocial}</td>
                  <td className="px-6 py-4 text-gray-500">{f.nomeFantasia || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{[f.cidade, f.uf].filter(Boolean).join('/') || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <RowActionsMenu
                      items={[
                        { label: 'Editar', icon: '✏️', onClick: () => openEditModal(f) },
                        { label: 'Excluir', icon: '🗑️', tone: 'danger', onClick: () => handleDelete(f) },
                      ]}
                    />
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl leading-none" aria-label="Fechar">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* CNPJ + Busca */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    value={formatCnpj(form.cnpj)}
                    onChange={(e) => setForm({ ...form, cnpj: onlyDigits(e.target.value).slice(0, 14) })}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                    disabled={!!editingId}
                  />
                </div>
                {!editingId && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={buscarCnpj}
                      disabled={buscandoCnpj || onlyDigits(form.cnpj).length !== 14}
                      className="hw1-btn-secondary text-sm whitespace-nowrap disabled:opacity-50"
                    >
                      {buscandoCnpj ? 'Buscando...' : '🔍 Consultar CNPJ'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    value={form.razaoSocial}
                    onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={form.nomeFantasia}
                    onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">UF</label>
                  <input
                    type="text"
                    value={form.uf}
                    onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CEP</label>
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: onlyDigits(e.target.value).slice(0, 8) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
