'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface Contrato {
  id: string;
  nomeContrato: string;
  cliente: string;
  numeroContrato: string;
  dataInicio: string;
  dataFim?: string;
  status: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  _count?: { objetos: number; projetos: number };
  objetos?: ObjetoContratual[];
}

interface ObjetoContratual {
  id: string;
  contratoId: string;
  nome: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
  valorTotalContratado?: number;
  ativo: boolean;
  linhasContratuais?: LinhaContratual[];
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
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
const UNIDADES = ['hora', 'mês', 'pacote', 'serviço', 'diária', 'unidade', 'projeto'];
const STATUS_OPTIONS = ['RASCUNHO', 'VIGENTE', 'ENCERRADO', 'CANCELADO'];

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // Expansão de hierarquia
  const [expandedContratoId, setExpandedContratoId] = useState<string | null>(null);
  const [expandedObjetoId, setExpandedObjetoId] = useState<string | null>(null);
  const [contratoDetalhes, setContratoDetalhes] = useState<Contrato | null>(null);

  // Modais
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [showObjetoModal, setShowObjetoModal] = useState(false);
  const [showLinhaModal, setShowLinhaModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [contratoParaClonar, setContratoParaClonar] = useState<Contrato | null>(null);
  const [cloneForm, setCloneForm] = useState({ novoNome: '', novoNumero: '' });

  // Forms
  const [contratoForm, setContratoForm] = useState({
    nomeContrato: '', cliente: '', numeroContrato: '',
    dataInicio: '', dataFim: '', status: 'RASCUNHO', observacoes: '',
  });
  const [objetoForm, setObjetoForm] = useState({
    contratoId: '', nome: '', descricao: '',
    dataInicio: '', dataFim: '', observacoes: '',
  });
  const [linhaForm, setLinhaForm] = useState({
    objetoContratualId: '', descricaoItem: '', unidade: 'hora',
    quantidadeAnualEstimada: '', valorUnitario: '',
  });

  // ══════════════ Loaders ══════════════
  const loadContratos = () => {
    setLoading(true);
    api.get(`/contracts?page=${page}&limit=${pageSize}`)
      .then((r) => {
        setContratos(r.data?.data ?? []);
        setTotal(r.data?.total ?? 0);
      })
      .catch(() => setError('Não foi possível carregar os contratos.'))
      .finally(() => setLoading(false));
  };

  const loadContratoDetalhes = (contratoId: string) => {
    api.get(`/contracts/${contratoId}`)
      .then((r) => {
        setContratoDetalhes(r.data);
        setExpandedContratoId(contratoId);
      })
      .catch(() => setError('Não foi possível carregar detalhes do contrato.'));
  };

  useEffect(() => { loadContratos(); }, [page]);
  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  // ══════════════ CRUD Contratos ══════════════
  const openCreateContrato = () => {
    setEditingId(null);
    setContratoForm({
      nomeContrato: '', cliente: '', numeroContrato: '',
      dataInicio: '', dataFim: '', status: 'RASCUNHO', observacoes: '',
    });
    setShowContratoModal(true);
  };

  const openEditContrato = (contrato: Contrato) => {
    setEditingId(contrato.id);
    setContratoForm({
      nomeContrato: contrato.nomeContrato,
      cliente: contrato.cliente,
      numeroContrato: contrato.numeroContrato,
      dataInicio: contrato.dataInicio.split('T')[0],
      dataFim: contrato.dataFim ? contrato.dataFim.split('T')[0] : '',
      status: contrato.status,
      observacoes: contrato.observacoes || '',
    });
    setShowContratoModal(true);
  };

  const handleSaveContrato = async () => {
    if (!contratoForm.nomeContrato || !contratoForm.cliente || !contratoForm.numeroContrato || !contratoForm.dataInicio) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/contracts/${editingId}`, contratoForm);
        setSuccessMsg('Contrato atualizado!');
      } else {
        await api.post('/contracts', contratoForm);
        setSuccessMsg('Contrato criado!');
      }
      setShowContratoModal(false);
      loadContratos();
      if (expandedContratoId) loadContratoDetalhes(expandedContratoId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar contrato.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContrato = async (id: string) => {
    if (!confirm('Deseja excluir este contrato?')) return;
    try {
      await api.delete(`/contracts/${id}`);
      setSuccessMsg('Contrato excluído!');
      loadContratos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir.');
    }
  };

  const openCloneContrato = (contrato: Contrato) => {
    setContratoParaClonar(contrato);
    setCloneForm({
      novoNome: `${contrato.nomeContrato} (Cópia)`,
      novoNumero: `${contrato.numeroContrato}-CLONE`,
    });
    setShowCloneModal(true);
  };

  const handleSaveClone = async () => {
    if (!cloneForm.novoNome || !cloneForm.novoNumero || !contratoParaClonar) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/contracts/${contratoParaClonar.id}/clone`, {
        novoNome: cloneForm.novoNome,
        novoNumero: cloneForm.novoNumero,
      });
      setSuccessMsg('Contrato clonado com sucesso!');
      setShowCloneModal(false);
      setContratoParaClonar(null);
      setCloneForm({ novoNome: '', novoNumero: '' });
      setPage(1);
      loadContratos();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao clonar contrato.');
    } finally {
      setSaving(false);
    }
  };

  // ══════════════ CRUD Objetos ══════════════
  const openCreateObjeto = (contratoId: string) => {
    setEditingId(null);
    setObjetoForm({
      contratoId, nome: '', descricao: '',
      dataInicio: '', dataFim: '', observacoes: '',
    });
    setShowObjetoModal(true);
  };

  const openEditObjeto = (objeto: ObjetoContratual) => {
    setEditingId(objeto.id);
    setObjetoForm({
      contratoId: objeto.contratoId,
      nome: objeto.nome,
      descricao: objeto.descricao,
      dataInicio: objeto.dataInicio ? objeto.dataInicio.split('T')[0] : '',
      dataFim: objeto.dataFim ? objeto.dataFim.split('T')[0] : '',
      observacoes: objeto.observacoes || '',
    });
    setShowObjetoModal(true);
  };

  const handleSaveObjeto = async () => {
    if (!objetoForm.nome || !objetoForm.descricao || !objetoForm.dataInicio) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/contracts/objetos/${editingId}`, objetoForm);
        setSuccessMsg('Objeto atualizado!');
      } else {
        await api.post(`/contracts/${objetoForm.contratoId}/objetos`, objetoForm);
        setSuccessMsg('Objeto criado!');
      }
      setShowObjetoModal(false);
      if (expandedContratoId) loadContratoDetalhes(expandedContratoId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar objeto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObjeto = async (id: string) => {
    if (!confirm('Deseja excluir este objeto?')) return;
    try {
      await api.delete(`/contracts/objetos/${id}`);
      setSuccessMsg('Objeto excluído!');
      if (expandedContratoId) loadContratoDetalhes(expandedContratoId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao excluir.');
    }
  };

  // ══════════════ CRUD Linhas ══════════════
  const openCreateLinha = (objetoId: string) => {
    setEditingId(null);
    setLinhaForm({
      objetoContratualId: objetoId, descricaoItem: '', unidade: 'hora',
      quantidadeAnualEstimada: '', valorUnitario: '',
    });
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

  const handleSaveLinha = async () => {
    if (!linhaForm.descricaoItem || !linhaForm.quantidadeAnualEstimada || !linhaForm.valorUnitario) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...linhaForm,
        quantidadeAnualEstimada: Number(linhaForm.quantidadeAnualEstimada),
        valorUnitario: Number(linhaForm.valorUnitario),
      };
      if (editingId) {
        await api.put(`/contracts/linhas/${editingId}`, payload);
        setSuccessMsg('Linha atualizada!');
      } else {
        await api.post(`/contracts/objetos/${linhaForm.objetoContratualId}/linhas`, payload);
        setSuccessMsg('Linha criada!');
      }
      setShowLinhaModal(false);
      if (expandedContratoId) loadContratoDetalhes(expandedContratoId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar linha.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLinha = async (id: string) => {
    if (!confirm('Deseja excluir esta linha?')) return;
    try {
      await api.delete(`/contracts/linhas/${id}`);
      setSuccessMsg('Linha excluída!');
      if (expandedContratoId) loadContratoDetalhes(expandedContratoId);
    } catch (err: any) {
      setError(err?.response?. data?.message || 'Erro ao excluir.');
    }
  };

  const vlTotalCalc = Number(linhaForm.quantidadeAnualEstimada || 0) * Number(linhaForm.valorUnitario || 0);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Contratos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão completa de Contratos, Objetos e Linhas Contratuais</p>
        </div>
        <button onClick={openCreateContrato} className="hw1-btn-primary text-sm">
          + Novo Contrato
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {/* Lista de Contratos */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : contratos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Nenhum contrato cadastrado.</div>
      ) : (
        <div className="space-y-4">
          {contratos.map((contrato) => (
            <div key={contrato.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Cabeçalho do Contrato */}
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-hw1-navy/5 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-hw1-navy">{contrato.nomeContrato}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contrato.status === 'VIGENTE' ? 'bg-green-100 text-green-800' :
                        contrato.status === 'RASCUNHO' ? 'bg-yellow-100 text-yellow-800' :
                        contrato.status === 'ENCERRADO' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contrato.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-sm">
                      <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{contrato.cliente}</span></div>
                      <div><span className="text-gray-500">Número:</span> <span className="font-mono text-hw1-blue font-medium">{contrato.numeroContrato}</span></div>
                      <div><span className="text-gray-500">Início:</span> {formatDate(contrato.dataInicio)}</div>
                      <div><span className="text-gray-500">Fim:</span> {formatDate(contrato.dataFim)}</div>
                      <div><span className="text-gray-500">Objetos:</span> <span className="font-semibold">{contrato._count?.objetos ?? 0}</span></div>
                      <div><span className="text-gray-500">Projetos:</span> <span className="font-semibold">{contrato._count?.projetos ?? 0}</span></div>
                    </div>
                    {contrato.observacoes && <p className="text-xs text-gray-600 mt-2 italic">{contrato.observacoes}</p>}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        if (expandedContratoId === contrato.id) {
                          setExpandedContratoId(null);
                          setContratoDetalhes(null);
                        } else {
                          loadContratoDetalhes(contrato.id);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-hw1-blue border border-hw1-blue rounded-lg hover:bg-hw1-blue hover:text-white transition-colors"
                    >
                      {expandedContratoId === contrato.id ? 'Ocultar' : 'Ver Objetos'}
                    </button>
                    <button
                      onClick={() => openEditContrato(contrato)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => openCloneContrato(contrato)}
                      className="px-3 py-1.5 text-xs font-medium text-hw1-gold border border-hw1-gold rounded-lg hover:bg-hw1-gold hover:text-white transition-colors"
                    >
                      Clonar
                    </button>
                    <button
                      onClick={() => handleDeleteContrato(contrato.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              {/* Objetos Contratuais (expandível) */}
              {expandedContratoId === contrato.id && contratoDetalhes && (
                <div className="px-5 py-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Objetos Contratuais</h4>
                    <button
                      onClick={() => openCreateObjeto(contrato.id)}
                      className="px-3 py-1.5 text-xs font-medium text-hw1-gold bg-white border border-hw1-gold rounded-lg hover:bg-hw1-gold hover:text-white transition-colors"
                    >
                      + Novo Objeto
                    </button>
                  </div>

                  {!contratoDetalhes.objetos || contratoDetalhes.objetos.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">Nenhum objeto contratual vinculado.</p>
                  ) : (
                    <div className="space-y-3">
                      {contratoDetalhes.objetos.map((objeto) => (
                        <div key={objeto.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-hw1-navy text-sm">{objeto.nome}</h5>
                              <p className="text-sm text-gray-600 mt-1">{objeto.descricao}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>Início: {formatDate(objeto.dataInicio)}</span>
                                {objeto.dataFim && <span>Fim: {formatDate(objeto.dataFim)}</span>}
                                <span className="font-semibold">Linhas: {objeto._count?.linhasContratuais ?? 0}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (expandedObjetoId === objeto.id) {
                                    setExpandedObjetoId(null);
                                  } else {
                                    setExpandedObjetoId(objeto.id);
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-medium text-hw1-gold border border-hw1-gold rounded hover:bg-hw1-gold hover:text-white transition-colors"
                              >
                                {expandedObjetoId === objeto.id ? 'Ocultar' : 'Ver Linhas'}
                              </button>
                              <button
                                onClick={() => openEditObjeto(objeto)}
                                className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteObjeto(objeto.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>

                          {/* Linhas Contratuais (expandível) */}
                          {expandedObjetoId === objeto.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-xs font-semibold text-gray-600 uppercase">Linhas Contratuais</h6>
                                <button
                                  onClick={() => openCreateLinha(objeto.id)}
                                  className="px-2.5 py-1 text-xs font-medium text-hw1-blue bg-white border border-hw1-blue rounded hover:bg-hw1-blue hover:text-white transition-colors"
                                >
                                  + Nova Linha
                                </button>
                              </div>

                              {!objeto.linhasContratuais || objeto.linhasContratuais.length === 0 ? (
                                <p className="text-xs text-gray-500 py-2">Nenhuma linha contratual cadastrada.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="text-left px-2 py-1.5 font-medium text-gray-700">Item</th>
                                        <th className="text-left px-2 py-1.5 font-medium text-gray-700">Unidade</th>
                                        <th className="text-right px-2 py-1.5 font-medium text-gray-700">Qtd.  Anual</th>
                                        <th className="text-right px-2 py-1.5 font-medium text-gray-700">Vl. Unitário</th>
                                        <th className="text-right px-2 py-1.5 font-medium text-gray-700">Vl. Total</th>
                                        <th className="text-center px-2 py-1.5 font-medium text-gray-700">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {objeto.linhasContratuais.map((linha) => (
                                        <tr key={linha.id} className="border-t border-gray-200 hover:bg-gray-50">
                                          <td className="px-2 py-1.5">{linha.descricaoItem}</td>
                                          <td className="px-2 py-1.5">{linha.unidade}</td>
                                          <td className="px-2 py-1.5 text-right">{linha.quantidadeAnualEstimada}</td>
                                          <td className="px-2 py-1.5 text-right">{formatBRL(linha.valorUnitario)}</td>
                                          <td className="px-2 py-1.5 text-right font-semibold">{formatBRL(linha.valorTotalAnual)}</td>
                                          <td className="px-2 py-1.5 text-center">
                                            <div className="flex justify-center gap-2">
                                              <button
                                                onClick={() => openEditLinha(linha)}
                                                className="text-hw1-blue hover:text-hw1-blue/80 font-medium"
                                              >
                                                Editar
                                              </button>
                                              <button
                                                onClick={() => handleDeleteLinha(linha.id)}
                                                className="text-red-600 hover:text-red-700 font-medium"
                                              >
                                                Excluir
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal Contrato */}
      {showContratoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-hw1-navy">
                {editingId ? 'Editar Contrato' : 'Novo Contrato'}
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contrato *</label>
                <input
                  type="text"
                  value={contratoForm.nomeContrato}
                  onChange={(e) => setContratoForm({ ...contratoForm, nomeContrato: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Ex: Contrato de Consultoria ACME"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <input
                  type="text"
                  value={contratoForm.cliente}
                  onChange={(e) => setContratoForm({ ...contratoForm, cliente: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Contrato *</label>
                <input
                  type="text"
                  value={contratoForm.numeroContrato}
                  onChange={(e) => setContratoForm({ ...contratoForm, numeroContrato: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Ex: CONT-2024-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                  <input
                    type="date"
                    value={contratoForm.dataInicio}
                    onChange={(e) => setContratoForm({ ...contratoForm, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                  <input
                    type="date"
                    value={contratoForm.dataFim}
                    onChange={(e) => setContratoForm({ ...contratoForm, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={contratoForm.status}
                  onChange={(e) => setContratoForm({ ...contratoForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={contratoForm.observacoes}
                  onChange={(e) => setContratoForm({ ...contratoForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowContratoModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveContrato}
                className="px-4 py-2 bg-hw1-navy text-white rounded-lg hover:bg-hw1-navy/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Objeto */}
      {showObjetoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-hw1-navy">
                {editingId ? 'Editar Objeto Contratual' : 'Novo Objeto Contratual'}
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Objeto *</label>
                <input
                  type="text"
                  value={objetoForm.nome}
                  onChange={(e) => setObjetoForm({ ...objetoForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Ex: OC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <textarea
                  value={objetoForm.descricao}
                  onChange={(e) => setObjetoForm({ ...objetoForm, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  rows={3}
                  placeholder="Descrição detalhada do objeto contratual"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                  <input
                    type="date"
                    value={objetoForm.dataInicio}
                    onChange={(e) => setObjetoForm({ ...objetoForm, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                  <input
                    type="date"
                    value={objetoForm.dataFim}
                    onChange={(e) => setObjetoForm({ ...objetoForm, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={objetoForm.observacoes}
                  onChange={(e) => setObjetoForm({ ...objetoForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  rows={2}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowObjetoModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveObjeto}
                className="px-4 py-2 bg-hw1-gold text-white rounded-lg hover:bg-hw1-gold/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Linha */}
      {showLinhaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-hw1-navy">
                {editingId ? 'Editar Linha Contratual' : 'Nova Linha Contratual'}
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Item *</label>
                <input
                  type="text"
                  value={linhaForm.descricaoItem}
                  onChange={(e) => setLinhaForm({ ...linhaForm, descricaoItem: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Ex: Consultoria Senior"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade *</label>
                <select
                  value={linhaForm.unidade}
                  onChange={(e) => setLinhaForm({ ...linhaForm, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Anual *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={linhaForm.quantidadeAnualEstimada}
                    onChange={(e) => setLinhaForm({ ...linhaForm, quantidadeAnualEstimada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={linhaForm.valorUnitario}
                    onChange={(e) => setLinhaForm({ ...linhaForm, valorUnitario: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="bg-hw1-navy/5 border border-hw1-navy/20 rounded-lg px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Valor Total Anual:</span>
                  <span className="text-lg font-bold text-hw1-navy">{formatBRL(vlTotalCalc)}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowLinhaModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLinha}
                className="px-4 py-2 bg-hw1-blue text-white rounded-lg hover:bg-hw1-blue/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Clonar Contrato */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-hw1-navy">
                Clonar Contrato
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Clonando: <strong>{contratoParaClonar?.nomeContrato}</strong>
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Novo Nome *</label>
                <input
                  type="text"
                  value={cloneForm.novoNome}
                  onChange={(e) => setCloneForm({ ...cloneForm, novoNome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Nome do contrato clonado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Novo Número *</label>
                <input
                  type="text"
                  value={cloneForm.novoNumero}
                  onChange={(e) => setCloneForm({ ...cloneForm, novoNumero: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hw1-blue"
                  placeholder="Número único para o novo contrato"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
                ℹ️ O novo contrato incluirá todos os Objetos e Linhas Contratuais do contrato original.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCloneModal(false);
                  setContratoParaClonar(null);
                  setCloneForm({ novoNome: '', novoNumero: '' });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClone}
                className="px-4 py-2 bg-hw1-navy text-white rounded-lg hover:bg-hw1-navy/90 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Clonando...' : 'Clonar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
