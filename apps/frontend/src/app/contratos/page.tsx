'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface ProjetoSelect { id: string; codigo: string; nome: string; }

interface ObjetoContratual {
  id: string;
  projectId: string;
  numero: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  ativo: boolean;
  valorTotalContratado?: number;
  project?: { id: string; codigo: string; nome: string };
  _count?: { linhasContratuais: number };
}

interface LinhaContratual {
  id: string;
  objetoContratualId: string;
  descricaoItem: string;
  unidade: string;
  quantidadeAnualEstimada: number;
  valorUnitario: number;
  valorTotalAnual: number;
  objetoContratual?: { id: string; numero: string; descricao: string; projectId: string };
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const UNIDADES = ['hora', 'mês', 'pacote', 'serviço', 'diária', 'unidade'];

export default function ContratosPage() {
  const [projetos, setProjetos] = useState<ProjetoSelect[]>([]);
  const [objetos, setObjetos] = useState<ObjetoContratual[]>([]);
  const [linhas, setLinhas] = useState<LinhaContratual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtros
  const [filterProjectId, setFilterProjectId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Objeto Contratual expandido (para ver linhas)
  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);

  // Modais
  const [showObjetoModal, setShowObjetoModal] = useState(false);
  const [showLinhaModal, setShowLinhaModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [objetoForm, setObjetoForm] = useState({
    projectId: '', numero: '', descricao: '', dataInicio: '', dataFim: '',
  });
  const [linhaForm, setLinhaForm] = useState({
    objetoContratualId: '',
    descricaoItem: '', unidade: 'hora', quantidadeAnualEstimada: '', valorUnitario: '',
  });

  // ══════════════ Loaders ══════════════
  const loadProjetos = () => {
    api.get('/projects?limit=999').then((r) => {
      setProjetos((r.data?.data ?? r.data ?? []).map((p: any) => ({ id: p.id, codigo: p.codigo, nome: p.nome })));
    }).catch(() => {});
  };

  const loadObjetos = () => {
    setLoading(true);
    const url = filterProjectId
      ? `/contracts/objetos?page=${page}&limit=${pageSize}&projectId=${filterProjectId}`
      : `/contracts/objetos?page=${page}&limit=${pageSize}`;
    api.get(url)
      .then((r) => setObjetos(r.data?.data ?? []))
      .catch(() => setError('Não foi possível carregar os objetos contratuais.'))
      .finally(() => setLoading(false));
  };

  const loadLinhas = (objetoId: string) => {
    api.get(`/contracts/objetos/${objetoId}/linhas`)
      .then((r) => setLinhas(r.data ?? []))
      .catch(() => setError('Não foi possível carregar as linhas contratuais.'));
  };

  useEffect(() => { loadProjetos(); }, []);
  useEffect(() => { loadObjetos(); }, [filterProjectId, page]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  // ══════════════ Objetos CRUD ══════════════
  const openCreateObjeto = () => {
    setEditingId(null);
    setObjetoForm({ projectId: filterProjectId || '', numero: '', descricao: '', dataInicio: '', dataFim: '' });
    setShowObjetoModal(true);
  };

  const openEditObjeto = (obj: ObjetoContratual) => {
    setEditingId(obj.id);
    setObjetoForm({
      projectId: obj.projectId,
      numero: obj.numero,
      descricao: obj.descricao,
      dataInicio: obj.dataInicio?.split('T')[0] ?? '',
      dataFim: obj.dataFim?.split('T')[0] ?? '',
    });
    setShowObjetoModal(true);
  };

  const handleSubmitObjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/contracts/objetos/${editingId}`, {
          descricao: objetoForm.descricao,
          dataInicio: objetoForm.dataInicio,
          dataFim: objetoForm.dataFim || undefined,
        });
        setSuccessMsg('Objeto contratual atualizado!');
      } else {
        await api.post('/contracts/objetos', objetoForm);
        setSuccessMsg('Objeto contratual criado!');
      }
      setShowObjetoModal(false);
      loadObjetos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar objeto contratual.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObjeto = async (obj: ObjetoContratual) => {
    if (!confirm(`Deseja excluir o objeto ${obj.numero} — ${obj.descricao}?`)) return;
    try {
      await api.delete(`/contracts/objetos/${obj.id}`);
      setSuccessMsg('Objeto contratual excluído!');
      loadObjetos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir.');
    }
  };

  // ══════════════ Linhas CRUD ══════════════
  const toggleExpand = (objId: string) => {
    if (expandedObjId === objId) {
      setExpandedObjId(null);
      setLinhas([]);
    } else {
      setExpandedObjId(objId);
      loadLinhas(objId);
    }
  };

  const openCreateLinha = (objetoId: string) => {
    setEditingId(null);
    setLinhaForm({ objetoContratualId: objetoId, descricaoItem: '', unidade: 'hora', quantidadeAnualEstimada: '', valorUnitario: '' });
    setShowLinhaModal(true);
  };

  const openEditLinha = (linha: LinhaContratual) => {
    setEditingId(linha.id);
    setLinhaForm({
      objetoContratualId: linha.objetoContratualId,
      descricaoItem: linha.descricaoItem,
      unidade: linha.unidade,
      quantidadeAnualEstimada: String(linha.quantidadeAnualEstimada),
      valorUnitario: String(linha.valorUnitario),
    });
    setShowLinhaModal(true);
  };

  const handleSubmitLinha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        objetoContratualId: linhaForm.objetoContratualId,
        descricaoItem: linhaForm.descricaoItem,
        unidade: linhaForm.unidade,
        quantidadeAnualEstimada: Number(linhaForm.quantidadeAnualEstimada),
        valorUnitario: Number(linhaForm.valorUnitario),
      };
      if (editingId) {
        const { objetoContratualId, ...upd } = payload;
        await api.put(`/contracts/linhas/${editingId}`, upd);
        setSuccessMsg('Linha contratual atualizada!');
      } else {
        await api.post('/contracts/linhas', payload);
        setSuccessMsg('Linha contratual criada!');
      }
      setShowLinhaModal(false);
      if (expandedObjId) loadLinhas(expandedObjId);
      loadObjetos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar linha contratual.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLinha = async (linha: LinhaContratual) => {
    if (!confirm(`Deseja excluir a linha "${linha.descricaoItem}"?`)) return;
    try {
      await api.delete(`/contracts/linhas/${linha.id}`);
      setSuccessMsg('Linha contratual excluída!');
      if (expandedObjId) loadLinhas(expandedObjId);
      loadObjetos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir.');
    }
  };

  const vlTotalCalc = Number(linhaForm.quantidadeAnualEstimada || 0) * Number(linhaForm.valorUnitario || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Contratos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Objetos Contratuais e Linhas Contratuais</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterProjectId}
            onChange={(e) => { setFilterProjectId(e.target.value); setPage(1); setExpandedObjId(null); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
            ))}
          </select>
          <button onClick={openCreateObjeto} className="hw1-btn-primary text-sm">
            + Novo Objeto Contratual
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      {/* Tabela Objetos */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : objetos.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nenhum objeto contratual cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white" style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                <th className="px-6 py-4 w-8"></th>
                <th className="px-6 py-4">Número</th>
                <th className="px-6 py-4">Projeto</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4 text-center">Linhas</th>
                <th className="px-6 py-4 text-right">Valor Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {objetos.map((obj, i) => (
                <>
                  <tr
                    key={obj.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    onClick={() => toggleExpand(obj.id)}
                  >
                    <td className="px-6 py-4 text-gray-400">{expandedObjId === obj.id ? '▼' : '▶'}</td>
                    <td className="px-6 py-4 font-medium text-hw1-navy">{obj.numero}</td>
                    <td className="px-6 py-4 text-gray-600">{obj.project?.codigo} — {obj.project?.nome}</td>
                    <td className="px-6 py-4 text-gray-600">{obj.descricao}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {obj.dataInicio?.split('T')[0]} {obj.dataFim ? `→ ${obj.dataFim.split('T')[0]}` : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-white" style={{ background: '#1E16A0' }}>
                        {obj._count?.linhasContratuais ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-700">
                      {formatBRL(obj.valorTotalContratado ?? 0)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditObjeto(obj)}
                          className="px-3 py-1 text-xs font-medium rounded-lg border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteObjeto(obj)}
                          className="px-3 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Linhas expandidas */}
                  {expandedObjId === obj.id && (
                    <tr key={`${obj.id}-linhas`}>
                      <td colSpan={8} className="p-0">
                        <div className="bg-blue-50/50 border-l-4 border-hw1-blue px-6 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-hw1-navy">
                              Linhas Contratuais — {obj.numero}
                            </h3>
                            <button
                              onClick={() => openCreateLinha(obj.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-hw1-blue text-white hover:bg-hw1-navy transition-all"
                            >
                              + Nova Linha
                            </button>
                          </div>

                          {linhas.length === 0 ? (
                            <p className="text-sm text-gray-400">Nenhuma linha contratual.</p>
                          ) : (
                            <table className="w-full text-sm bg-white rounded-xl overflow-hidden shadow-sm">
                              <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white" style={{ background: 'linear-gradient(90deg, #009792, #00B3AD)' }}>
                                  <th className="px-4 py-3">Descrição Item</th>
                                  <th className="px-4 py-3">Unidade</th>
                                  <th className="px-4 py-3 text-right">Qtd. Anual</th>
                                  <th className="px-4 py-3 text-right">Vl. Unitário</th>
                                  <th className="px-4 py-3 text-right">Vl. Total Anual</th>
                                  <th className="px-4 py-3 text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {linhas.map((l, li) => (
                                  <tr key={l.id} className={`border-b border-gray-50 ${li % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="px-4 py-3 font-medium">{l.descricaoItem}</td>
                                    <td className="px-4 py-3 text-gray-500 capitalize">{l.unidade}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{Number(l.quantidadeAnualEstimada).toLocaleString('pt-BR')}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{formatBRL(Number(l.valorUnitario))}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatBRL(Number(l.valorTotalAnual))}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => openEditLinha(l)}
                                          className="px-2 py-1 text-xs font-medium rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLinha(l)}
                                          className="px-2 py-1 text-xs font-medium rounded border border-red-200 text-red-600 hover:bg-red-50 transition-all"
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
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
          ← Anterior
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">Página {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={objetos.length < pageSize}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
          Próxima →
        </button>
      </div>

      {/* ═════════ Modal Objeto Contratual ═════════ */}
      {showObjetoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Objeto Contratual' : 'Novo Objeto Contratual'}
              </h2>
              <button onClick={() => setShowObjetoModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmitObjeto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Projeto *</label>
                <select value={objetoForm.projectId} onChange={(e) => setObjetoForm({ ...objetoForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required disabled={!!editingId}>
                  <option value="">Selecione...</option>
                  {projetos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Número *</label>
                  <input type="text" value={objetoForm.numero} onChange={(e) => setObjetoForm({ ...objetoForm, numero: e.target.value })}
                    placeholder="Ex: OC-001" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    required disabled={!!editingId} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Descrição *</label>
                  <input type="text" value={objetoForm.descricao} onChange={(e) => setObjetoForm({ ...objetoForm, descricao: e.target.value })}
                    placeholder="Descrição do objeto contratual" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Início *</label>
                  <input type="date" value={objetoForm.dataInicio} onChange={(e) => setObjetoForm({ ...objetoForm, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
                  <input type="date" value={objetoForm.dataFim} onChange={(e) => setObjetoForm({ ...objetoForm, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowObjetoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 hw1-btn-primary text-sm disabled:opacity-50">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════ Modal Linha Contratual ═════════ */}
      {showLinhaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">
                {editingId ? 'Editar Linha Contratual' : 'Nova Linha Contratual'}
              </h2>
              <button onClick={() => setShowLinhaModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmitLinha} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Descrição do Item *</label>
                <input type="text" value={linhaForm.descricaoItem} onChange={(e) => setLinhaForm({ ...linhaForm, descricaoItem: e.target.value })}
                  placeholder="Ex: Consultoria técnica especializada" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unidade *</label>
                  <select value={linhaForm.unidade} onChange={(e) => setLinhaForm({ ...linhaForm, unidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required>
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Qtd. Anual Estimada *</label>
                  <input type="number" step="0.01" value={linhaForm.quantidadeAnualEstimada}
                    onChange={(e) => setLinhaForm({ ...linhaForm, quantidadeAnualEstimada: e.target.value })}
                    placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valor Unitário (R$) *</label>
                  <input type="number" step="0.01" value={linhaForm.valorUnitario}
                    onChange={(e) => setLinhaForm({ ...linhaForm, valorUnitario: e.target.value })}
                    placeholder="0.00" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valor Total Anual</label>
                  <div className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-xl text-sm font-semibold text-emerald-700">
                    {formatBRL(vlTotalCalc)}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowLinhaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 hw1-btn-primary text-sm disabled:opacity-50">
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
