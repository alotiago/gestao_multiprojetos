'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import RowActionsMenu from '@/app/components/RowActionsMenu';

interface Project {
  id: string;
  codigo: string;
  nome: string;
  cliente: string;
  status: 'ATIVO' | 'SUSPENSO' | 'ENCERRADO';
  tipo: string;
  regimeTributario?: string;
  unitId?: string;
  contratoId?: string;
  dataInicio: string;
  dataFim?: string;
  descricao?: string;
  unit?: {
    id: string;
    name: string;
    code?: string;
  };
  contrato?: {
    id: string;
    nomeContrato: string;
    numeroContrato: string;
  };
}

interface Unit {
  id: string;
  code: string;
  name: string;
}

interface Contrato {
  id: string;
  nomeContrato: string;
  numeroContrato: string;
  cliente: string;
  status: string;
}

const statusColors: Record<string, string> = {
  ATIVO:     'hw1-badge-green',
  SUSPENSO:  'hw1-badge-yellow',
  ENCERRADO: 'hw1-badge-red',
};

const statusLabels: Record<string, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  ENCERRADO: 'Encerrado',
};

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [units, setUnits] = useState<Unit[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    cliente: '',
    tipo: 'servico',
    unitId: '',
    contratoId: '',
    status: 'ATIVO',
    regimeTributario: 'SIMPLES_NACIONAL',
    dataInicio: new Date().toISOString().slice(0, 10),
    dataFim: '',
    descricao: '',
  });

  const loadUnits = () => {
    api
      .get('/units')
      .then((r) => setUnits(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  };

  const loadContratos = () => {
    api
      .get('/contracts?page=1&limit=100')
      .then((r) => setContratos(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  };

  const load = () => {
    setLoading(true);
    api
      .get(`/projects?page=${page}&limit=${pageSize}`)
      .then((r) => setProjects(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar os projetos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);
  useEffect(() => { loadUnits(); loadContratos(); }, []);

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

  // unitOptions agora vêm da API de unidades

  const resetForm = () => {
    setForm({
      codigo: '',
      nome: '',
      cliente: '',
      tipo: 'servico',
      unitId: '',
      contratoId: '',
      status: 'ATIVO',
      regimeTributario: 'SIMPLES_NACIONAL',
      dataInicio: new Date().toISOString().slice(0, 10),
      dataFim: '',
      descricao: '',
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProjectId(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingProjectId(null);
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProjectId(project.id);
    setForm({
      codigo: project.codigo,
      nome: project.nome,
      cliente: project.cliente,
      tipo: project.tipo,
      unitId: project.unitId || project.unit?.id || '',
      contratoId: project.contratoId || project.contrato?.id || '',
      status: project.status,
      regimeTributario: project.regimeTributario || 'SIMPLES_NACIONAL',
      dataInicio: project.dataInicio ? project.dataInicio.slice(0, 10) : '',
      dataFim: project.dataFim ? project.dataFim.slice(0, 10) : '',
      descricao: project.descricao || '',
    });
    setShowCreateModal(true);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const basePayload = {
      nome: form.nome.trim(),
      cliente: form.cliente.trim(),
      tipo: form.tipo.trim(),
      unitId: form.unitId.trim(),
      status: form.status,
      regimeTributario: form.regimeTributario || undefined,
      dataInicio: form.dataInicio,
      dataFim: form.dataFim || undefined,
      descricao: form.descricao.trim() || undefined,
    };

    try {
      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, basePayload);
        setSuccessMsg('Projeto atualizado com sucesso!');
      } else {
        const createPayload = {
          ...basePayload,
          codigo: form.codigo.trim().toUpperCase(),
          contratoId: form.contratoId.trim() || undefined,
        };
        await api.post('/projects', createPayload);
        setSuccessMsg('Projeto criado com sucesso!');
      }

      closeModal();
      load();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || `Não foi possível ${editingProjectId ? 'atualizar' : 'criar'} o projeto.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Deseja excluir o projeto ${project.codigo}?`)) return;

    try {
      await api.delete(`/projects/${project.id}`);
      setSuccessMsg('Projeto excluído com sucesso!');
      load();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || 'Não foi possível excluir o projeto.');
      }
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Projetos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão do portfólio de projetos</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar projeto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
          />
          <button
            onClick={openCreateModal}
            className="hw1-btn-primary text-sm"
          >
            + Novo Projeto
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            {search ? 'Nenhum projeto encontrado para a busca.' : 'Nenhum projeto cadastrado.'}
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
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contrato</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Início</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.codigo}</td>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{p.nome}</td>
                  <td className="px-6 py-4 text-gray-600">{p.cliente}</td>
                  <td className="px-6 py-4 text-xs">
                    {p.contrato ? (
                      <span className="font-mono text-hw1-blue">{p.contrato.numeroContrato}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {p.unit ? `${p.unit.code ?? ''} — ${p.unit.name}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">{p.tipo}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(p.dataInicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusColors[p.status] ?? 'hw1-badge-blue'}>
                      {statusLabels[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RowActionsMenu
                      items={[
                        { label: 'Editar', icon: '✏️', onClick: () => openEditModal(p) },
                        { label: 'Excluir', icon: '🗑️', tone: 'danger', onClick: () => handleDeleteProject(p) },
                      ]}
                    />
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
            disabled={projects.length < pageSize}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima →
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">Novo Projeto</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Código *</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                    placeholder="PROJ-2026-001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                    disabled={!!editingProjectId}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome do projeto"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cliente *</label>
                  <input
                    type="text"
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="SEEC/PR"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipo *</label>
                  <input
                    type="text"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    placeholder="servico"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Contrato Vinculado *</label>
                  <select
                    value={form.contratoId}
                    onChange={(e) => setForm({ ...form, contratoId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required={!editingProjectId}
                    disabled={!!editingProjectId}
                  >
                    <option value="">Selecione um contrato...</option>
                    {contratos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.numeroContrato} — {c.nomeContrato} ({c.cliente})
                      </option>
                    ))}
                  </select>
                  {contratos.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Nenhum contrato cadastrado.{' '}
                      <a href="/contratos" className="underline hover:text-amber-800">Cadastrar contratos</a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unidade *</label>
                  <select
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    <option value="">Selecione uma unidade...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} — {unit.name}
                      </option>
                    ))}
                  </select>
                  {units.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Nenhuma unidade cadastrada.{' '}
                      <a href="/unidades" className="underline hover:text-amber-800">Cadastrar unidades</a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="SUSPENSO">Suspenso</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Regime Tributário</label>
                  <select
                    value={form.regimeTributario}
                    onChange={(e) => setForm({ ...form, regimeTributario: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  >
                    <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                    <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                    <option value="LUCRO_REAL">Lucro Real</option>
                    <option value="CPRB">CPRB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Início *</label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  placeholder="Descrição opcional do projeto"
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
                  {saving ? 'Salvando...' : editingProjectId ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
