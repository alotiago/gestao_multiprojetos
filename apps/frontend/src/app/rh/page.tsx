'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface Colaborador {
  id: string;
  matricula: string;
  nome: string;
  cargo: string;
  cidade: string;
  estado: string;
  tipoContratacao?: string;
  taxaHora: number;
  cargaHoraria: number;
  status: string;
  dataAdmissao: string;
  email?: string;
  classe?: string;
  sindicatoId?: string;
  ativo: boolean;
}

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const TiposContratacao = {
  PJ: 'PJ (Pessoa Jurídica)',
  CL: 'CLT (Consolidação das Leis do Trabalho)',
  TERCEIRIZADO: 'Terceirizado',
};

const statusColors: Record<string, string> = {
  ATIVO:      'hw1-badge-green',
  INATIVO:    'hw1-badge-yellow',
  DESLIGADO:  'hw1-badge-red',
};

export default function RhPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'todos' | 'ativos'>('ativos');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState({
    matricula: '',
    nome: '',
    email: '',
    cargo: '',
    classe: '',
    tipoContratacao: 'CL',
    taxaHora: '',
    cargaHoraria: '176',
    cidade: '',
    estado: 'PR',
    sindicatoId: '',
    status: 'ATIVO',
    dataAdmissao: new Date().toISOString().slice(0, 10),
  });

  const loadColaboradores = () => {
    setLoading(true);
    api
      .get(`/hr/colaboradores?page=${page}&limit=${pageSize}`)
      .then((r) => setColaboradores(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar os colaboradores.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadColaboradores();
  }, [page, pageSize]);

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
    setForm({
      matricula: '',
      nome: '',
      email: '',
      cargo: '',
      classe: '',
      tipoContratacao: 'CL',
      taxaHora: '',
      cargaHoraria: '176',
      cidade: '',
      estado: 'PR',
      sindicatoId: '',
      status: 'ATIVO',
      dataAdmissao: new Date().toISOString().slice(0, 10),
    });
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

  const openEditModal = (colaborador: Colaborador) => {
    setEditingId(colaborador.id);
    setForm({
      matricula: colaborador.matricula,
      nome: colaborador.nome,
      email: colaborador.email || '',
      cargo: colaborador.cargo,
      classe: colaborador.classe || '',
      tipoContratacao: colaborador.tipoContratacao || 'CL',
      taxaHora: String(colaborador.taxaHora ?? ''),
      cargaHoraria: String(colaborador.cargaHoraria ?? ''),
      cidade: colaborador.cidade,
      estado: colaborador.estado,
      sindicatoId: colaborador.sindicatoId || '',
      status: colaborador.status,
      dataAdmissao: colaborador.dataAdmissao ? colaborador.dataAdmissao.slice(0, 10) : new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      matricula: form.matricula.trim(),
      nome: form.nome.trim(),
      email: form.email.trim() || undefined,
      cargo: form.cargo.trim(),
      classe: form.classe.trim() || undefined,
      taxaHora: Number(form.taxaHora),
      cargaHoraria: Number(form.cargaHoraria),
      cidade: form.cidade.trim(),
      estado: form.estado.trim().toUpperCase(),
      sindicatoId: form.sindicatoId.trim() || undefined,
      status: form.status,
      dataAdmissao: form.dataAdmissao,
    };

    try {
      if (editingId) {
        const { matricula, dataAdmissao, ...updatePayload } = payload;
        await api.put(`/hr/colaboradores/${editingId}`, updatePayload);
        setSuccessMsg('Colaborador atualizado com sucesso!');
      } else {
        await api.post('/hr/colaboradores', payload);
        setSuccessMsg('Colaborador criado com sucesso!');
      }

      closeModal();
      loadColaboradores();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || `Não foi possível ${editingId ? 'atualizar' : 'criar'} o colaborador.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (colaborador: Colaborador) => {
    if (!confirm(`Deseja excluir o colaborador ${colaborador.nome}?`)) return;

    try {
      await api.delete(`/hr/colaboradores/${colaborador.id}`);
      setSuccessMsg('Colaborador excluído com sucesso!');
      loadColaboradores();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || 'Não foi possível excluir o colaborador.');
      }
    }
  };

  const filtered = colaboradores.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.matricula.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'todos' || c.ativo;
    return matchSearch && matchTab;
  });

  const kpis = {
    total: colaboradores.length,
    ativos: colaboradores.filter((c) => c.ativo).length,
    estados: new Set(colaboradores.map((c) => c.estado)).size,
    custoMedio: colaboradores.length
      ? (colaboradores.reduce((s, c) => s + Number(c.taxaHora) * Number(c.cargaHoraria), 0) / colaboradores.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Recursos Humanos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de colaboradores e jornadas</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar colaborador…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
          />
          <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
            + Novo Colaborador
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total', value: kpis.total, color: '#1E16A0', icon: '📋' },
          { title: 'Ativos', value: kpis.ativos, color: '#00B3AD', icon: '✅' },
          { title: 'Estados', value: kpis.estados, color: '#35277D', icon: '🗺️' },
          {
            title: 'Custo Médio / Mês',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.custoMedio),
            color: '#E52287',
            icon: '💰',
          },
        ].map((k) => (
          <div key={k.title} className="hw1-card flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
              style={{ background: k.color }}
            >
              {k.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{k.title}</p>
              <p className="text-xl font-heading font-semibold text-hw1-navy">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab filter */}
      <div className="flex gap-2">
        {(['ativos', 'todos'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t
                ? 'text-white shadow-hw1'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-hw1-blue'
            }`}
            style={tab === t ? { background: 'linear-gradient(135deg, #1E16A0, #35277D)' } : {}}
          >
            {t === 'ativos' ? 'Ativos' : 'Todos'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nenhum colaborador encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
              >
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Local</th>
                <th className="px-6 py-4">Taxa/Hora</th>
                <th className="px-6 py-4">Admissão</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.matricula}</td>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{c.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{c.cargo}</td>
                  <td className="px-6 py-4 text-gray-500">{c.cidade}/{c.estado}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.taxaHora)}/h
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(c.dataAdmissao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusColors[c.status] ?? 'hw1-badge-blue'}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
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

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Página {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={colaboradores.length < pageSize}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima →
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Matrícula *</label>
                  <input
                    type="text"
                    value={form.matricula}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cargo *</label>
                  <input
                    type="text"
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Classe</label>
                  <input
                    type="text"
                    value={form.classe}
                    onChange={(e) => setForm({ ...form, classe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Contratação *</label>
                  <select
                    value={form.tipoContratacao}
                    onChange={(e) => setForm({ ...form, tipoContratacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    <option value="CL">{TiposContratacao.CL}</option>
                    <option value="PJ">{TiposContratacao.PJ}</option>
                    <option value="TERCEIRIZADO">{TiposContratacao.TERCEIRIZADO}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Taxa/Hora (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.taxaHora}
                    onChange={(e) => setForm({ ...form, taxaHora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Carga Horária *</label>
                  <input
                    type="number"
                    value={form.cargaHoraria}
                    onChange={(e) => setForm({ ...form, cargaHoraria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">UF *</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    <option value="">Selecione um estado</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sindicato ID</label>
                  <input
                    type="text"
                    value={form.sindicatoId}
                    onChange={(e) => setForm({ ...form, sindicatoId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  >
                    <option value="ATIVO">ATIVO</option>
                    <option value="INATIVO">INATIVO</option>
                    <option value="DESLIGADO">DESLIGADO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Admissão *</label>
                  <input
                    type="date"
                    value={form.dataAdmissao}
                    onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                    disabled={!!editingId}
                  />
                </div>
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
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
