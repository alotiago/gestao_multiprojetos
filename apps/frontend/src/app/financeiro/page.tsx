'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface ProjetoSelect {
  id: string;
  codigo: string;
  nome: string;
}

interface Despesa {
  id: string;
  projectId: string;
  tipo: string;
  descricao: string;
  valor: number;
  mes: number;
  ano: number;
  createdAt?: string;
}

interface Receita {
  id: string;
  projectId: string;
  tipoReceita: string;
  descricao?: string;
  valorPrevisto: number;
  valorRealizado: number;
  mes: number;
  ano: number;
  objetoContratualId?: string;
  linhaContratualId?: string;
  quantidade?: number;
  valorUnitario?: number;
  unidade?: string;
  project?: {
    id: string;
    codigo: string;
    nome: string;
  };
  objetoContratual?: {
    id: string;
    numero: string;
    descricao: string;
  };
  linhaContratual?: {
    id: string;
    descricaoItem: string;
    unidade: string;
    valorUnitario: number;
  };
}

interface ProjetoFinanceiro {
  projectId: string;
  nome: string;
  cliente: string;
  status: string;
  receitaPrevista: number;
  receitaRealizada: number;
  totalCustos: number;
  margem: number;
}

interface FinanceiroData {
  ano: number;
  mes: number | null;
  projetos: ProjetoFinanceiro[];
  totais: {
    receitaPrevista: number;
    receitaRealizada: number;
    totalCustos: number;
    margemGlobal: number;
  };
}

const TipoDespesa: Record<string, string> = {
  facilities: 'Facilities',
  fornecedor: 'Fornecedor',
  aluguel: 'Aluguel',
  endomarketing: 'Endomarketing',
  amortizacao: 'Amortização',
  rateio: 'Rateio',
  provisao: 'Provisão',
  outros: 'Outros',
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const currentYear = new Date().getFullYear();

interface ObjetoContratualSelect {
  id: string;
  numero: string;
  descricao: string;
}

interface LinhaContratualSelect {
  id: string;
  descricaoItem: string;
  unidade: string;
  valorUnitario: number;
  quantidadeAnualEstimada: number;
  valorTotalAnual: number;
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [projetos, setProjetos] = useState<ProjetoSelect[]>([]);
  const [objetosContratuais, setObjetosContratuais] = useState<ObjetoContratualSelect[]>([]);
  const [linhasContratuais, setLinhasContratuais] = useState<LinhaContratualSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState<string>('');
  const [view, setView] = useState<'resumo' | 'despesas' | 'receitas'>('resumo');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState<'despesa' | 'receita'>('despesa');
  const [receitaMode, setReceitaMode] = useState<'contrato' | 'manual'>('contrato');
  const [form, setForm] = useState({
    projectId: '',
    tipo: 'outros',
    tipoReceita: '',
    descricao: '',
    valor: '',
    valorPrevisto: '',
    valorRealizado: '',
    mes: '',
    ano: currentYear,
    objetoContratualId: '',
    linhaContratualId: '',
    quantidade: '',
  });

  const loadProjetos = () => {
    api
      .get('/projects?limit=999')
      .then((r) => {
        const projects = (r.data?.data ?? r.data ?? []).map((p: any) => ({
          id: p.id,
          codigo: p.codigo,
          nome: p.nome,
        }));
        setProjetos(projects);
      })
      .catch(() => {});
  };

  const loadResumo = () => {
    setLoading(true);
    const url = mes
      ? `/dashboard/financeiro?ano=${ano}&mes=${mes}`
      : `/dashboard/financeiro?ano=${ano}`;
    api
      .get(url)
      .then((r) => setData(r.data))
      .catch(() => setError('Não foi possível carregar os dados financeiros.'))
      .finally(() => setLoading(false));
  };

  const loadDespesas = () => {
    setLoading(true);
    api
      .get(`/financial/despesas?page=${page}&limit=${pageSize}&ano=${ano}${mes ? `&mes=${mes}` : ''}`)
      .then((r) => setDespesas(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar as despesas.'))
      .finally(() => setLoading(false));
  };

  const loadReceitas = () => {
    setLoading(true);
    api
      .get(`/financial/receitas?page=${page}&limit=${pageSize}&ano=${ano}${mes ? `&mes=${mes}` : ''}`)
      .then((r) => setReceitas(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar as receitas.'))
      .finally(() => setLoading(false));
  };

  const loadObjetosByProject = (projectId: string) => {
    if (!projectId) { setObjetosContratuais([]); setLinhasContratuais([]); return; }
    api.get(`/contracts/projetos/${projectId}/objetos`)
      .then((r) => setObjetosContratuais(r.data ?? []))
      .catch(() => setObjetosContratuais([]));
  };

  const loadLinhasByObjeto = (objetoId: string) => {
    if (!objetoId) { setLinhasContratuais([]); return; }
    api.get(`/contracts/objetos/${objetoId}/linhas`)
      .then((r) => setLinhasContratuais(r.data ?? []))
      .catch(() => setLinhasContratuais([]));
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  useEffect(() => {
    if (view === 'resumo') loadResumo();
    else if (view === 'despesas') loadDespesas();
    else loadReceitas();
  }, [ano, mes, view, page, pageSize]);

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
      projectId: '',
      tipo: 'outros',
      tipoReceita: '',
      descricao: '',
      valor: '',
      valorPrevisto: '',
      valorRealizado: '',
      mes: '',
      ano: currentYear,
      objetoContratualId: '',
      linhaContratualId: '',
      quantidade: '',
    });
    setObjetosContratuais([]);
    setLinhasContratuais([]);
    setReceitaMode('contrato');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const openCreateModal = () => {
    setModalType('despesa');
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (despesa: Despesa) => {
    setModalType('despesa');
    setForm({
      projectId: despesa.projectId,
      tipo: despesa.tipo,
      tipoReceita: '',
      descricao: despesa.descricao,
      valor: String(despesa.valor),
      valorPrevisto: '',
      valorRealizado: '',
      mes: String(despesa.mes),
      ano: despesa.ano,
      objetoContratualId: '',
      linhaContratualId: '',
      quantidade: '',
    });
    setEditingId(despesa.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        projectId: form.projectId,
        tipo: form.tipo,
        descricao: form.descricao,
        valor: Number(form.valor),
        mes: Number(form.mes),
        ano: Number(form.ano),
      };

      if (editingId) {
        await api.put(`/financial/despesas/${editingId}`, payload);
        setSuccessMsg('Despesa atualizada com sucesso!');
      } else {
        await api.post('/financial/despesas', payload);
        setSuccessMsg('Despesa criada com sucesso!');
      }

      closeModal();
      setPage(1);
      loadDespesas();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || `Não foi possível ${editingId ? 'atualizar' : 'criar'} a despesa.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (despesa: Despesa) => {
    if (!confirm(`Deseja excluir a despesa ${despesa.descricao}?`)) return;

    try {
      await api.delete(`/financial/despesas/${despesa.id}`);
      setSuccessMsg('Despesa excluída com sucesso!');
      if (despesas.length === 1 && page > 1) setPage(page - 1);
      else loadDespesas();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || 'Não foi possível excluir a despesa.');
      }
    }
  };

  const handleSubmitReceita = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const isContrato = receitaMode === 'contrato' && form.linhaContratualId;

    const payload: any = {
      projectId: form.projectId,
      tipoReceita: form.tipoReceita || 'Serviços',
      descricao: form.descricao,
      mes: Number(form.mes),
      ano: Number(form.ano),
    };

    if (isContrato) {
      payload.objetoContratualId = form.objetoContratualId;
      payload.linhaContratualId = form.linhaContratualId;
      payload.quantidade = Number(form.quantidade);
      // Backend calcula valorPrevisto = quantidade × valorUnitario
    } else {
      payload.valorPrevisto = Number(form.valorPrevisto);
      payload.valorRealizado = Number(form.valorRealizado);
    }

    try {
      if (editingId) {
        const updatePayload = { ...payload };
        delete updatePayload.tipoReceita;
        await api.put(`/financial/receitas/${editingId}`, updatePayload);
        setSuccessMsg('Receita atualizada com sucesso!');
      } else {
        await api.post('/financial/receitas', payload);
        setSuccessMsg('Receita criada com sucesso!');
      }

      closeModal();
      setPage(1);
      loadReceitas();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || `Não foi possível ${editingId ? 'atualizar' : 'criar'} a receita.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReceita = async (receita: Receita) => {
    if (!confirm(`Deseja excluir a receita de ${receita.tipoReceita}?`)) return;

    try {
      await api.delete(`/financial/receitas/${receita.id}`);
      setSuccessMsg('Receita excluída com sucesso!');
      if (receitas.length === 1 && page > 1) setPage(page - 1);
      else loadReceitas();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      if (Array.isArray(backendMessage)) {
        setError(backendMessage[0]);
      } else {
        setError(backendMessage || 'Não foi possível excluir a receita.');
      }
    }
  };

  const openCreateReceitaModal = () => {
    setModalType('receita');
    resetForm();
    setEditingId(null);
    setReceitaMode('contrato');
    setShowModal(true);
  };

  const openEditReceitaModal = (receita: Receita) => {
    setModalType('receita');
    const hasContrato = !!receita.linhaContratualId;
    setReceitaMode(hasContrato ? 'contrato' : 'manual');
    setForm({
      projectId: receita.projectId,
      tipo: receita.tipoReceita,
      tipoReceita: receita.tipoReceita,
      descricao: receita.descricao || '',
      valor: String(receita.valorPrevisto),
      valorPrevisto: String(receita.valorPrevisto),
      valorRealizado: String(receita.valorRealizado),
      mes: String(receita.mes),
      ano: receita.ano,
      objetoContratualId: receita.objetoContratualId || '',
      linhaContratualId: receita.linhaContratualId || '',
      quantidade: receita.quantidade ? String(receita.quantidade) : '',
    });
    if (receita.projectId) loadObjetosByProject(receita.projectId);
    if (receita.objetoContratualId) loadLinhasByObjeto(receita.objetoContratualId);
    setEditingId(receita.id);
    setShowModal(true);
  };

  const totais = data?.totais;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Receitas, custos, margens e despesas</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            >
              <option value="">Todos os meses</option>
              {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          {view === 'despesas' && (
            <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
              + Nova Despesa
            </button>
          )}
          {view === 'receitas' && (
            <button onClick={openCreateReceitaModal} className="hw1-btn-primary text-sm">
              + Nova Receita
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['resumo', 'despesas', 'receitas'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setView(t);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              view === t
                ? 'text-white shadow-hw1'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-hw1-blue'
            }`}
            style={view === t ? { background: 'linear-gradient(135deg, #1E16A0, #35277D)' } : {}}
          >
            {t === 'resumo' ? 'Resumo' : t === 'despesas' ? 'Despesas' : 'Receitas'}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>
      )}

      {view === 'resumo' && (
        <>
          {/* Totais */}
          {totais && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'Receita Prevista', value: formatBRL(totais.receitaPrevista), color: '#1E16A0', icon: '📈' },
                { title: 'Receita Realizada', value: formatBRL(totais.receitaRealizada), color: '#009792', icon: '✅' },
                { title: 'Custo Total', value: formatBRL(totais.totalCustos), color: '#E52287', icon: '💸' },
                { title: 'Margem Global', value: `${totais.margemGlobal.toFixed(1)} %`, color: '#00B3AD', icon: '📊' },
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
                    <p className="text-lg font-heading font-semibold text-hw1-navy">{k.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projetos table */}
          <div className="hw1-card p-0 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
            ) : !data || data.projetos.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">Nenhum dado financeiro encontrado para o período.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                    style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
                  >
                    <th className="px-6 py-4">Projeto</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4 text-right">Rec. Prevista</th>
                    <th className="px-6 py-4 text-right">Rec. Realizada</th>
                    <th className="px-6 py-4 text-right">Custos</th>
                    <th className="px-6 py-4 text-right">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projetos.map((p, i) => (
                    <tr
                      key={p.projectId}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-hw1-navy">{p.nome}</td>
                      <td className="px-6 py-4 text-gray-500">{p.cliente}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatBRL(p.receitaPrevista)}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatBRL(p.receitaRealizada)}</td>
                      <td className="px-6 py-4 text-right text-red-600">{formatBRL(p.totalCustos)}</td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            p.margem >= 20
                              ? 'text-emerald-600'
                              : p.margem >= 0
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {p.margem.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {view === 'despesas' && (
        <>
          {/* Despesas table */}
          <div className="hw1-card p-0 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
            ) : despesas.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">Nenhuma despesa cadastrada.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                    style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
                  >
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Mês</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map((d, i) => (
                    <tr
                      key={d.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium">{TipoDespesa[d.tipo] || d.tipo}</td>
                      <td className="px-6 py-4 text-gray-600">{d.descricao}</td>
                      <td className="px-6 py-4 text-gray-500">{String(d.mes).padStart(2, '0')}/{d.ano}</td>
                      <td className="px-6 py-4 text-right font-medium text-hw1-navy">{formatBRL(d.valor)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(d)}
                            className="px-3 py-1 text-xs font-medium rounded-lg border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(d)}
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
                disabled={despesas.length < pageSize}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          </div>
        </>
      )}

      {view === 'receitas' && (
        <>
          {/* Receitas table */}
          <div className="hw1-card p-0 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
            ) : receitas.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">Nenhuma receita cadastrada.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                    style={{ background: 'linear-gradient(90deg, #009792, #00B3AD)' }}
                  >
                    <th className="px-6 py-4">Projeto</th>
                    <th className="px-6 py-4">Obj. Contratual</th>
                    <th className="px-6 py-4">Linha / Descrição</th>
                    <th className="px-6 py-4">Unid.</th>
                    <th className="px-6 py-4">Mês</th>
                    <th className="px-6 py-4 text-right">Qtd</th>
                    <th className="px-6 py-4 text-right">Vl. Unit.</th>
                    <th className="px-6 py-4 text-right">Previsto</th>
                    <th className="px-6 py-4 text-right">Realizado</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {receitas.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium">{r.project?.nome || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {r.objetoContratual ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                            📑 {r.objetoContratual.numero}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{r.linhaContratual?.descricaoItem || r.descricao || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs capitalize">{r.unidade || r.linhaContratual?.unidade || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{String(r.mes).padStart(2, '0')}/{r.ano}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{r.quantidade ? Number(r.quantidade).toLocaleString('pt-BR') : '-'}</td>
                      <td className="px-6 py-4 text-right text-gray-500 text-xs">{r.valorUnitario ? formatBRL(Number(r.valorUnitario)) : '-'}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatBRL(r.valorPrevisto)}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-700">{formatBRL(r.valorRealizado)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditReceitaModal(r)}
                            className="px-3 py-1 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReceita(r)}
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
                disabled={receitas.length < pageSize}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {modalType === 'receita' 
                  ? editingId ? 'Editar Receita' : 'Nova Receita'
                  : editingId ? 'Editar Despesa' : 'Nova Despesa'
                }
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form onSubmit={modalType === 'receita' ? handleSubmitReceita : handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Projeto *</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setForm({ ...form, projectId: pid, objetoContratualId: '', linhaContratualId: '', quantidade: '' });
                      if (modalType === 'receita') loadObjetosByProject(pid);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    <option value="">Selecione um projeto...</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} — {p.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {modalType === 'receita' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Modo</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setReceitaMode('contrato')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${receitaMode === 'contrato' ? 'border-hw1-blue bg-hw1-blue/10 text-hw1-blue' : 'border-gray-200 text-gray-500'}`}>
                        📑 Via Contrato
                      </button>
                      <button type="button" onClick={() => setReceitaMode('manual')}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${receitaMode === 'manual' ? 'border-hw1-blue bg-hw1-blue/10 text-hw1-blue' : 'border-gray-200 text-gray-500'}`}>
                        ✏️ Manual
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'receita' && receitaMode === 'contrato' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Objeto Contratual *</label>
                      <select
                        value={form.objetoContratualId}
                        onChange={(e) => {
                          const oid = e.target.value;
                          setForm({ ...form, objetoContratualId: oid, linhaContratualId: '', quantidade: '' });
                          loadLinhasByObjeto(oid);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                        required
                        disabled={!form.projectId}
                      >
                        <option value="">Selecione o objeto...</option>
                        {objetosContratuais.map((o) => (
                          <option key={o.id} value={o.id}>{o.numero} — {o.descricao}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Linha Contratual *</label>
                      <select
                        value={form.linhaContratualId}
                        onChange={(e) => setForm({ ...form, linhaContratualId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                        required
                        disabled={!form.objetoContratualId}
                      >
                        <option value="">Selecione a linha...</option>
                        {linhasContratuais.map((l) => (
                          <option key={l.id} value={l.id}>{l.descricaoItem} ({l.unidade} — {formatBRL(Number(l.valorUnitario))})</option>
                        ))}
                      </select>
                    </div>

                    {/* Card com detalhes da linha selecionada (US1) */}
                    {form.linhaContratualId && (() => {
                      const linhaSel = linhasContratuais.find(l => l.id === form.linhaContratualId);
                      if (!linhaSel) return null;
                      return (
                        <div className="md:col-span-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                          <p className="text-xs font-semibold text-emerald-800 mb-2">📋 Dados da Linha Contratual</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div><span className="text-gray-500">Descrição:</span><br/><span className="font-medium">{linhaSel.descricaoItem}</span></div>
                            <div><span className="text-gray-500">Unidade:</span><br/><span className="font-medium capitalize">{linhaSel.unidade}</span></div>
                            <div><span className="text-gray-500">Qtd. Anual:</span><br/><span className="font-medium">{Number(linhaSel.quantidadeAnualEstimada).toLocaleString('pt-BR')}</span></div>
                            <div><span className="text-gray-500">Vl. Unitário:</span><br/><span className="font-medium text-emerald-700">{formatBRL(Number(linhaSel.valorUnitario))}</span></div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-emerald-200 text-xs">
                            <span className="text-gray-500">Valor Total Anual Contratado:</span>{' '}
                            <span className="font-bold text-emerald-700">{formatBRL(Number(linhaSel.valorTotalAnual || (Number(linhaSel.quantidadeAnualEstimada) * Number(linhaSel.valorUnitario))))}</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantidade do Período *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.quantidade}
                        onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                        placeholder="Quantidade no mês"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                        required
                      />
                    </div>
                    {form.linhaContratualId && form.quantidade && (() => {
                      const linhaSel = linhasContratuais.find(l => l.id === form.linhaContratualId);
                      const vlCalc = linhaSel ? Number(form.quantidade) * Number(linhaSel.valorUnitario) : 0;
                      return (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Valor Previsto (auto)</label>
                          <div className="w-full px-3 py-2 border border-gray-100 bg-emerald-50 rounded-xl text-sm font-semibold text-emerald-700">
                            {formatBRL(vlCalc)}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">= {form.quantidade} × {linhaSel ? formatBRL(Number(linhaSel.valorUnitario)) : ''}</p>
                        </div>
                      );
                    })()}
                  </>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {modalType === 'receita' ? 'Tipo de Receita *' : 'Tipo *'}
                  </label>
                  <select
                    value={modalType === 'receita' ? form.tipoReceita : form.tipo}
                    onChange={(e) => setForm({ 
                      ...form, 
                      ...(modalType === 'receita' 
                        ? { tipoReceita: e.target.value }
                        : { tipo: e.target.value }
                      )
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required={modalType !== 'receita'}
                  >
                    {modalType === 'receita' ? (
                      <>
                        <option value="">Selecione...</option>
                        <option value="Vendas">Vendas</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      Object.entries(TipoDespesa).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className={modalType === 'receita' && receitaMode === 'contrato' ? '' : 'md:col-span-2'}>
                  <label className="block text-xs text-gray-500 mb-1">Descrição {modalType === 'receita' ? '' : '*'}</label>
                  <input
                    type="text"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    placeholder={modalType === 'receita' ? 'Descrição da receita (opcional)' : 'Descrição da despesa'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required={modalType !== 'receita'}
                  />
                </div>

                {modalType === 'receita' && receitaMode === 'manual' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Valor Previsto *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.valorPrevisto}
                        onChange={(e) => setForm({ ...form, valorPrevisto: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Valor Realizado *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.valorRealizado}
                        onChange={(e) => setForm({ ...form, valorRealizado: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                        required
                      />
                    </div>
                  </>
                )}

                {modalType !== 'receita' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Valor *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mês *</label>
                  <select
                    value={form.mes}
                    onChange={(e) => setForm({ ...form, mes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    <option value="">Selecione...</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, '0')} - {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ano *</label>
                  <select
                    value={form.ano}
                    onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 hw1-btn-primary text-sm disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
