'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/services/api';
import { isLocalDevBypassSession } from '@/services/localDev';

interface ProjetoSelect {
  id: string;
  codigo: string;
  nome: string;
}

interface Despesa {
  id: string;
  projectId: string;
  tipo: string;
  naturezaCusto?: 'FIXO' | 'VARIAVEL';
  descricao: string;
  valor: number;
  mes: number;
  ano: number;
  fornecedorId?: string;
  dataVencimento?: string;
  anexoUrl?: string;
  fornecedor?: { id: string; razaoSocial: string; cnpj: string };
  createdAt?: string;
}

interface TipoDespesaConfig {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface FornecedorSelect {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
}

interface Receita {
  id: string;
  projectId: string;
  tipoReceita: string;
  descricao?: string;
  valorPrevisto: number;
  valorRealizado: number;
  justificativa?: string | null;
  mes: number;
  ano: number;
  objetoContratualId?: string;
  linhaContratualId?: string;
  quantidade?: number;
  quantidadeRealizada?: number; // RN-003
  valorUnitario?: number;
  unidade?: string;
  project?: {
    id: string;
    codigo: string;
    nome: string;
  };
  objetoContratual?: {
    id: string;
    nome: string;
    descricao: string;
  };
  linhaContratual?: {
    id: string;
    descricaoItem: string;
    unidade: string;
    valorUnitario: number;
    saldoQuantidade?: number;
    saldoValor?: number;
  };
}

interface ProjetoFinanceiro {
  projectId: string;
  nome: string;
  cliente: string;
  status: string;
  receitaPrevista: number;
  receitaRealizada: number;
  custoPessoal: number;
  despesas: number;
  impostos: number;
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
  comerciais: 'Comerciais',
  operacao: 'Operacao',
  taxas: 'Taxas',
  administrativas: 'Administrativas',
  software: 'Software',
  tributarias: 'Tributarias',
  financeiras: 'Financeiras',
  facilities: 'Facilities',
  fornecedor: 'Fornecedor',
  aluguel: 'Aluguel',
  endomarketing: 'Endomarketing',
  amortizacao: 'Amortização',
  rateio: 'Rateio',
  provisao: 'Provisão',
  outros: 'Outros',
};

const NaturezaCustoLabel: Record<'FIXO' | 'VARIAVEL', string> = {
  FIXO: 'Fixo',
  VARIAVEL: 'Variável',
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
  saldoQuantidade?: number;
  saldoValor?: number;
}

interface ImportResultUI {
  success: boolean;
  message: string;
  validas: number;
  erros: Array<{ linha: number; erros: string[] }>;
  registrosCriados?: any[];
  tipoRegistro: 'despesa' | 'receita';
}

const toErrorText = (value: unknown, fallback = 'Erro inesperado'): string => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(', ')
      .trim();
    return joined || fallback;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.mensagem === 'string') return obj.mensagem;
    if (Array.isArray(obj.message)) return toErrorText(obj.message, fallback);
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const extractApiErrorMessage = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  return toErrorText(
    data?.message ?? data?.mensagem ?? data?.detalhes ?? err?.message,
    fallback,
  );
};

const normalizeImportResult = (payload: any, tipoRegistro: 'despesa' | 'receita'): ImportResultUI => {
  const validationErrors = Array.isArray(payload?.erros)
    ? payload.erros.map((item: any) => ({
        linha: Number(item?.linha ?? 0),
        erros: Array.isArray(item?.erros)
          ? item.erros.map((msg: unknown) => toErrorText(msg, 'Erro de validação'))
          : [toErrorText(item?.motivo ?? item?.mensagem ?? item, 'Erro de validação')],
      }))
    : Array.isArray(payload?.errosValidacao)
      ? payload.errosValidacao.map((item: any) => ({
          linha: Number(item?.linha ?? 0),
          erros: [toErrorText(item?.motivo ?? item?.mensagem ?? item, 'Erro de validação')],
        }))
      : [];

  const importErrors = Array.isArray(payload?.importacao?.detalhes)
    ? payload.importacao.detalhes
        .filter((item: any) => String(item?.status ?? '').toUpperCase() === 'ERRO')
        .map((item: any) => ({
          linha: Number(item?.indice ?? 0),
          erros: [toErrorText(item?.mensagem, 'Erro na importação')],
        }))
    : [];

  const erros = [...validationErrors, ...importErrors];

  return {
    success: typeof payload?.success === 'boolean' ? payload.success : erros.length === 0,
    message: toErrorText(payload?.message ?? payload?.mensagem, 'Importação concluída'),
    validas: Number(payload?.validas ?? payload?.totalLinhasValidas ?? 0),
    erros,
    registrosCriados: Array.isArray(payload?.despesasCriadas)
      ? payload.despesasCriadas
      : Array.isArray(payload?.receitasCriadas)
        ? payload.receitasCriadas
        : Array.isArray(payload?.registrosCriados)
          ? payload.registrosCriados
          : [],
    tipoRegistro,
  };
};

const getImportSuccessCount = (payload: any, normalized: ImportResultUI): number => {
  const importacao = payload?.importacao ?? {};
  const explicitSuccess = Number(importacao.totalSucesso ?? importacao.sucessos ?? NaN);
  if (!Number.isNaN(explicitSuccess)) return explicitSuccess;

  const details = Array.isArray(importacao.detalhes)
    ? importacao.detalhes
    : [];
  if (details.length > 0) {
    return details.filter((item: any) => String(item?.status ?? '').toUpperCase() === 'SUCESSO').length;
  }

  return Number(normalized?.registrosCriados?.length ?? 0);
};

export default function FinanceiroPage() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [projetos, setProjetos] = useState<ProjetoSelect[]>([]);
  const [tiposDespesaDinamicos, setTiposDespesaDinamicos] = useState<TipoDespesaConfig[]>([]);
  const [fornecedoresList, setFornecedoresList] = useState<FornecedorSelect[]>([]);
  const [objetosContratuais, setObjetosContratuais] = useState<ObjetoContratualSelect[]>([]);
  const [linhasContratuais, setLinhasContratuais] = useState<LinhaContratualSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState<string>('');
  const [view, setView] = useState<'resumo' | 'despesas' | 'receitas'>('resumo');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalType, setModalType] = useState<'despesa' | 'receita'>('despesa');
  const [receitaMode, setReceitaMode] = useState<'contrato' | 'manual'>('contrato');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedDespesaIds, setSelectedDespesaIds] = useState<Set<string>>(new Set());
  const [selectedReceitaIds, setSelectedReceitaIds] = useState<Set<string>>(new Set());
  const [sortByDespesa, setSortByDespesa] = useState<string | null>(null);
  const [sortDirDespesa, setSortDirDespesa] = useState<'asc' | 'desc'>('asc');
  const [sortByReceita, setSortByReceita] = useState<string | null>(null);
  const [sortDirReceita, setSortDirReceita] = useState<'asc' | 'desc'>('asc');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSortDespesa = (field: string) => {
    if (sortByDespesa === field) {
      setSortDirDespesa(sortDirDespesa === 'asc' ? 'desc' : 'asc');
    } else {
      setSortByDespesa(field);
      setSortDirDespesa('asc');
    }
  };

  const handleSortReceita = (field: string) => {
    if (sortByReceita === field) {
      setSortDirReceita(sortDirReceita === 'asc' ? 'desc' : 'asc');
    } else {
      setSortByReceita(field);
      setSortDirReceita('asc');
    }
  };

  const sortArray = <T,>(arr: T[], field: string | null, dir: 'asc' | 'desc', getFieldValue?: (obj: T, f: string) => any): T[] => {
    if (!field) return arr;
    const sorted = [...arr].sort((a, b) => {
      const aVal = getFieldValue ? getFieldValue(a, field) : (a as any)[field];
      const bVal = getFieldValue ? getFieldValue(b, field) : (b as any)[field];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir === 'asc' ? aVal.localeCompare(bVal, 'pt-BR') : bVal.localeCompare(aVal, 'pt-BR');
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return dir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [form, setForm] = useState({
    projectId: '',
    tipo: 'outros',
    naturezaCusto: 'VARIAVEL' as 'FIXO' | 'VARIAVEL',
    replicarAteFimContrato: false,
    tipoReceita: '',
    descricao: '',
    valor: '',
    valorPrevisto: '',
    valorRealizado: '',
    justificativa: '',
    mes: '',
    ano: currentYear,
    mesesAdicionais: '0',
    objetoContratualId: '',
    linhaContratualId: '',
    quantidade: '0',
    quantidadeRealizada: '', // RN-003
    fornecedorId: '',
    dataVencimento: '',
  });

  // Estados para importação de despesas via Excel
  const [uploading, setUploading] = useState(false);
  const [uploadingReceitas, setUploadingReceitas] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResultUI | null>(null);

  const loadProjetos = () => {
    api
      .get('/projects?limit=100&page=1')
      .then((r) => {
        const list = r.data?.data ?? r.data ?? [];
        const projects = list.map((p: any) => ({
          id: p.id,
          codigo: p.codigo,
          nome: p.nome,
        }));
        setProjetos(projects);
      })
      .catch(() => {});
  };

  const loadTiposDespesa = () => {
    api
      .get('/financial/tipos-despesa?apenasAtivos=true')
      .then((r) => setTiposDespesaDinamicos(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };

  const loadFornecedores = () => {
    api
      .get('/financial/fornecedores')
      .then((r) => setFornecedoresList(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  };

  const loadResumo = () => {
    setLoading(true);
    let url = `/dashboard/financeiro?ano=${ano}`;
    if (mes && mes !== '') url += `&mes=${mes}`;
    if (selectedProjectId && selectedProjectId !== '') url += `&projectId=${selectedProjectId}`;
    api
      .get(url)
      .then((r) => setData(r.data))
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Não foi possível carregar os dados financeiros.';
        console.error('Erro ao carregar resumo:', { url, status: err?.response?.status, message: msg });
        setError(toErrorText(msg, 'Não foi possível carregar os dados financeiros.'));
      })
      .finally(() => setLoading(false));
  };

  const loadDespesas = () => {
    setLoading(true);
    setError(''); // Limpa erro anterior
    let url = `/financial/despesas?page=${page}&limit=${pageSize}&ano=${ano}`;
    if (mes && mes !== '') url += `&mes=${mes}`;
    if (selectedProjectId && selectedProjectId !== '') url += `&projectId=${selectedProjectId}`;
    
    console.log('[DESPESAS] Carregando:', { url, selectedProjectId, mes, ano, page, pageSize });
    
    api
      .get(url)
      .then((r) => {
        console.log('[DESPESAS] Resposta:', r.data);
        const items = r.data?.data ?? r.data ?? [];
        setDespesas(Array.isArray(items) ? items : []);
        setSelectedDespesaIds(new Set());
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Não foi possível carregar as despesas.';
        console.error('Erro despesas:', { url, status: err?.response?.status, message: msg, erro: err });
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        setDespesas([]); // Garante lista vazia em caso de erro
      })
      .finally(() => setLoading(false));
  };

  const loadReceitas = () => {
    setLoading(true);
    setError('');
    let url = `/financial/receitas?page=${page}&limit=${pageSize}&ano=${ano}`;
    if (mes && mes !== '') url += `&mes=${mes}`;
    if (selectedProjectId && selectedProjectId !== '') url += `&projectId=${selectedProjectId}`;
    api
      .get(url)
      .then((r) => {
        const items = r.data?.data ?? r.data ?? [];
        setReceitas(Array.isArray(items) ? items : []);
        setSelectedReceitaIds(new Set());
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Não foi possível carregar as receitas.';
        console.error('Erro receitas:', { url, status: err?.response?.status, message: msg });

        if (isLocalDevBypassSession()) {
          setReceitas([]);
          setSelectedReceitaIds(new Set());
          setError('');
          return;
        }

        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      })
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
    loadTiposDespesa();
    loadFornecedores();
  }, []);

  useEffect(() => {
    if (view === 'resumo') loadResumo();
    else if (view === 'despesas') loadDespesas();
    else loadReceitas();
  }, [ano, mes, view, page, pageSize, selectedProjectId]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Função para baixar template Excel
  const handleBaixarTemplate = async () => {
    try {
      const response = await api.get('/financial/despesas/template', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_despesas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMsg('Template baixado com sucesso!');
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Erro ao baixar template'));
    }
  };

  // Função para fazer upload do arquivo Excel
  const handleImportarExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    // Validação básica do arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      inputEl.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
      inputEl.value = '';
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/financial/despesas/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const normalizedResult = normalizeImportResult(response.data, 'despesa');
      setImportResult(normalizedResult);
      setShowImportModal(true);

      // Se teve sucesso, recarrega a lista de despesas
      const totalSucesso = getImportSuccessCount(response.data, normalizedResult);
      if (totalSucesso > 0) {
        setTimeout(() => {
          loadDespesas();
        }, 1000);
      }
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Erro ao importar arquivo'));
    } finally {
      setUploading(false);
      // Limpa o input para permitir upload do mesmo arquivo novamente
      if (inputEl) inputEl.value = '';
    }
  };

  const handleBaixarTemplateReceitas = async () => {
    if (!selectedProjectId) {
      setError('Selecione um projeto para gerar o template de receitas com objetos e linhas contratuais.');
      return;
    }

    const projetoSelecionado = projetos.find((p) => p.id === selectedProjectId);

    try {
      const response = await api.get(`/financial/receitas/template?projectId=${selectedProjectId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sufixoProjeto = projetoSelecionado?.codigo || selectedProjectId;
      link.download = `template_receitas_${sufixoProjeto}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMsg('Template de receitas baixado com objetos e linhas do projeto selecionado.');
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Erro ao baixar template de receitas'));
    }
  };

  const handleImportarExcelReceitas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      inputEl.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
      inputEl.value = '';
      return;
    }

    setUploadingReceitas(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/financial/receitas/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const normalizedResult = normalizeImportResult(response.data, 'receita');
      setImportResult(normalizedResult);
      setShowImportModal(true);

      const totalSucesso = getImportSuccessCount(response.data, normalizedResult);
      if (totalSucesso > 0) {
        setTimeout(() => {
          loadReceitas();
        }, 1000);
      }
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Erro ao importar receitas via arquivo'));
    } finally {
      setUploadingReceitas(false);
      if (inputEl) inputEl.value = '';
    }
  };

  useEffect(() => {
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
      naturezaCusto: 'VARIAVEL',
      replicarAteFimContrato: false,
      tipoReceita: '',
      descricao: '',
      valor: '',
      valorPrevisto: '',
      valorRealizado: '',
      justificativa: '',
      mes: '',
      ano: currentYear,
      mesesAdicionais: '0',
      objetoContratualId: '',
      linhaContratualId: '',
      quantidade: '0',
      quantidadeRealizada: '', // RN-003
      fornecedorId: '',
      dataVencimento: '',
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
      naturezaCusto: despesa.naturezaCusto ?? 'VARIAVEL',
      replicarAteFimContrato: false,
      tipoReceita: '',
      descricao: despesa.descricao,
      valor: String(despesa.valor),
      valorPrevisto: '',
      valorRealizado: '',
      justificativa: '',
      mes: String(despesa.mes),
      ano: despesa.ano,
      mesesAdicionais: '0',
      objetoContratualId: '',
      linhaContratualId: '',
      quantidade: '',
      quantidadeRealizada: '', // RN-003
      fornecedorId: despesa.fornecedorId || '',
      dataVencimento: despesa.dataVencimento ? despesa.dataVencimento.slice(0, 10) : '',
    });
    setEditingId(despesa.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const createPayload = {
        projectId: form.projectId,
        tipo: form.tipo,
        naturezaCusto: form.naturezaCusto,
        replicarAteFimContrato: form.naturezaCusto === 'FIXO' ? form.replicarAteFimContrato : false,
        descricao: form.descricao,
        valor: Number(form.valor),
        mes: Number(form.mes),
        ano: Number(form.ano),
        mesesAdicionais: Number(form.mesesAdicionais || 0),
        fornecedorId: form.fornecedorId || undefined,
        dataVencimento: form.dataVencimento || undefined,
      };

      if (editingId) {
        // UpdateDespesaDto aceita apenas: tipo, descricao, valor, mes, ano, naturezaCusto.
        const updatePayload = {
          tipo: form.tipo,
          descricao: form.descricao,
          valor: Number(form.valor),
          mes: Number(form.mes),
          ano: Number(form.ano),
          naturezaCusto: form.naturezaCusto,
          fornecedorId: form.fornecedorId || null,
          dataVencimento: form.dataVencimento || null,
        };
        await api.put(`/financial/despesas/${editingId}`, updatePayload);
        setSuccessMsg('Despesa atualizada com sucesso!');
      } else {
        const response = await api.post('/financial/despesas', createPayload);
        const totalCriados = Number(response.data?.totalCriados ?? 1);
        setSuccessMsg(
          totalCriados > 1
            ? `${totalCriados} despesas criadas com sucesso!`
            : 'Despesa criada com sucesso!',
        );
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

  const handleBulkDeleteDespesas = async () => {
    if (selectedDespesaIds.size === 0) return;
    const confirmText = `Deseja excluir ${selectedDespesaIds.size} despesa(s) selecionada(s)?`;
    if (!confirm(confirmText)) return;

    try {
      const results = await Promise.allSettled(
        Array.from(selectedDespesaIds).map((id) => api.delete(`/financial/despesas/${id}`)),
      );
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        setSuccessMsg(
          failCount === 0
            ? `${successCount} despesa(s) excluída(s) com sucesso!`
            : `${successCount} despesa(s) excluída(s). ${failCount} falha(s).`,
        );
      }
      if (failCount > 0) {
        setError(`Não foi possível excluir ${failCount} despesa(s).`);
      }

      setSelectedDespesaIds(new Set());
      if (despesas.length === successCount && page > 1) setPage(page - 1);
      else loadDespesas();
    } catch {
      setError('Não foi possível excluir as despesas selecionadas.');
    }
  };

  const handleSubmitReceita = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const isContrato = receitaMode === 'contrato' && form.linhaContratualId;
    const linhaSelecionada = linhasContratuais.find((l) => l.id === form.linhaContratualId);

    const valorPrevistoCalculado = isContrato
      ? Number(form.quantidade || 0) * Number(linhaSelecionada?.valorUnitario || 0)
      : Number(form.valorPrevisto || 0);

    const valorRealizadoCalculado = isContrato
      ? Number(form.quantidadeRealizada || 0) * Number(linhaSelecionada?.valorUnitario || 0)
      : Number(form.valorRealizado || 0);

    const precisaJustificativa =
      valorRealizadoCalculado > 0 && Math.abs(valorRealizadoCalculado - valorPrevistoCalculado) >= 0.01;

    const hasQuantidadeRealizada =
      form.quantidadeRealizada !== '' && form.quantidadeRealizada !== null && form.quantidadeRealizada !== undefined;

    if (precisaJustificativa && !form.justificativa.trim()) {
      setSaving(false);
      setError('Justificativa é obrigatória quando valor realizado for diferente do planejado (exceto quando realizado for 0).');
      return;
    }

    if (!form.projectId) {
      setSaving(false);
      setError('Projeto é obrigatório.');
      return;
    }

    if (!isContrato && !form.valorPrevisto) {
      setSaving(false);
      setError('Valor Previsto é obrigatório.');
      return;
    }

    if (!isContrato && !form.valorRealizado) {
      setSaving(false);
      setError('Valor Realizado é obrigatório.');
      return;
    }

    // Verificar se há overage de saldo e pedir confirmação
    if (isContrato && !editingId) {
      const competenciasCount = 1 + Number(form.mesesAdicionais || 0);
      const quantidadeRealizadaTotal = Number(form.quantidadeRealizada || 0) * competenciasCount;
      const valorRealizadoTotal = valorRealizadoCalculado * competenciasCount;
      const saldoQtd = Number(linhaSelecionada?.saldoQuantidade ?? 0);
      const saldoVal = Number(linhaSelecionada?.saldoValor ?? 0);

      const excedeSaldoQtd = quantidadeRealizadaTotal > saldoQtd && saldoQtd > 0;
      const excedeSaldoVal = valorRealizadoTotal > saldoVal && saldoVal > 0;

      if ((excedeSaldoQtd || excedeSaldoVal) && !editingId) {
        const detalhes = [];
        if (excedeSaldoQtd) {
          detalhes.push(`Quantidade: ${quantidadeRealizadaTotal} > ${saldoQtd} (saldo)`);
        }
        if (excedeSaldoVal) {
          detalhes.push(`Valor: R$ ${valorRealizadoTotal.toLocaleString('pt-BR')} > R$ ${saldoVal.toLocaleString('pt-BR')} (saldo)`);
        }
        const mensagem = `⚠️ ALERTA: A receita vai exceder o saldo do contrato:\n\n${detalhes.join('\n')}\n\nDeseja continuar mesmo assim?`;
        if (!confirm(mensagem)) {
          setSaving(false);
          return;
        }
      }
    }

    const payload: any = {
      projectId: form.projectId,
      tipoReceita: form.tipoReceita || 'Serviços',
      descricao: form.descricao,
      justificativa: form.justificativa.trim() || undefined,
      mes: Number(form.mes),
      ano: Number(form.ano),
      mesesAdicionais: Number(form.mesesAdicionais || 0),
    };

    if (isContrato) {
      payload.objetoContratualId = form.objetoContratualId;
      payload.linhaContratualId = form.linhaContratualId;
      payload.quantidade = Number(form.quantidade);
      // RN-003: Quantidade Realizada e Valor Realizado calculado
      if (hasQuantidadeRealizada) {
        payload.quantidadeRealizada = Number(form.quantidadeRealizada);
      }
      // Calcula valorRealizado a partir de quantidadeRealizada × valorUnitario da linha
      if (hasQuantidadeRealizada) {
        payload.valorRealizado = Math.round(valorRealizadoCalculado * 100) / 100;
      } else {
        payload.valorRealizado = Number(form.valorRealizado || 0);
      }
      // Backend calcula valorPrevisto = quantidade × valorUnitario
    } else {
      payload.valorPrevisto = Number(form.valorPrevisto);
      payload.valorRealizado = Number(form.valorRealizado);
    }

    try {
      if (editingId) {
        // UpdateReceitaDto só aceita: valorPrevisto, valorRealizado, descricao, tipoReceita, quantidade, quantidadeRealizada, objetoContratualId, linhaContratualId
        const updatePayload: any = {};
        if (isContrato) {
          updatePayload.quantidade = Number(form.quantidade);
          updatePayload.descricao = form.descricao;
          if (hasQuantidadeRealizada) {
            updatePayload.quantidadeRealizada = Number(form.quantidadeRealizada);
          }
          if (form.valorRealizado !== '') {
            updatePayload.valorRealizado = Number(form.valorRealizado);
          }
          if (form.justificativa.trim()) {
            updatePayload.justificativa = form.justificativa.trim();
          }
        } else {
          updatePayload.valorPrevisto = Number(form.valorPrevisto);
          updatePayload.valorRealizado = Number(form.valorRealizado);
          updatePayload.descricao = form.descricao;
          if (form.justificativa.trim()) {
            updatePayload.justificativa = form.justificativa.trim();
          }
        }
        const updateResponse = await api.put(`/financial/receitas/${editingId}`, updatePayload);
        const alertasSaldo = Array.isArray(updateResponse?.data?.alertasSaldo)
          ? updateResponse.data.alertasSaldo
          : [];
        setSuccessMsg(
          alertasSaldo.length > 0
            ? `Receita atualizada com sucesso. Atenção: ${alertasSaldo.join(' ')}`
            : 'Receita atualizada com sucesso!',
        );
      } else {
        const response = await api.post('/financial/receitas', payload);
        const totalCriados = Number(response.data?.totalCriados ?? 1);
        const alertasSaldo = Array.isArray(response.data?.alertasSaldo) ? response.data.alertasSaldo : [];
        setSuccessMsg(
          alertasSaldo.length > 0
            ? `${
                totalCriados > 1
                  ? `${totalCriados} receitas criadas com sucesso!`
                  : 'Receita criada com sucesso!'
              } Atenção: ${alertasSaldo.join(' ')}`
            : totalCriados > 1
              ? `${totalCriados} receitas criadas com sucesso!`
              : 'Receita criada com sucesso!',
        );
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

  const handleBulkDeleteReceitas = async () => {
    if (selectedReceitaIds.size === 0) return;
    const confirmText = `Deseja excluir ${selectedReceitaIds.size} receita(s) selecionada(s)?`;
    if (!confirm(confirmText)) return;

    try {
      const results = await Promise.allSettled(
        Array.from(selectedReceitaIds).map((id) => api.delete(`/financial/receitas/${id}`)),
      );
      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        setSuccessMsg(
          failCount === 0
            ? `${successCount} receita(s) excluída(s) com sucesso!`
            : `${successCount} receita(s) excluída(s). ${failCount} falha(s).`,
        );
      }
      if (failCount > 0) {
        setError(`Não foi possível excluir ${failCount} receita(s).`);
      }

      setSelectedReceitaIds(new Set());
      if (receitas.length === successCount && page > 1) setPage(page - 1);
      else loadReceitas();
    } catch {
      setError('Não foi possível excluir as receitas selecionadas.');
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
      naturezaCusto: 'VARIAVEL',
      replicarAteFimContrato: false,
      tipoReceita: receita.tipoReceita,
      descricao: receita.descricao || '',
      valor: String(receita.valorPrevisto),
      valorPrevisto: String(receita.valorPrevisto),
      valorRealizado: String(receita.valorRealizado),
      justificativa: receita.justificativa || '',
      mes: String(receita.mes),
      ano: receita.ano,
      objetoContratualId: receita.objetoContratualId || '',
      linhaContratualId: receita.linhaContratualId || '',
      quantidade:
        receita.quantidade !== undefined && receita.quantidade !== null ? String(receita.quantidade) : '0',
      mesesAdicionais: '0',
      quantidadeRealizada:
        receita.quantidadeRealizada !== undefined && receita.quantidadeRealizada !== null
          ? String(receita.quantidadeRealizada)
          : '', // RN-003
      fornecedorId: '',
      dataVencimento: '',
    });
    if (receita.projectId) loadObjetosByProject(receita.projectId);
    if (receita.objetoContratualId) loadLinhasByObjeto(receita.objetoContratualId);
    setEditingId(receita.id);
    setShowModal(true);
  };

  const totais = data?.totais;
  const totalDespesasValor = despesas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
  const totalReceitasPrevisto = receitas.reduce((acc, item) => acc + Number(item.valorPrevisto || 0), 0);
  const totalReceitasRealizado = receitas.reduce((acc, item) => acc + Number(item.valorRealizado || 0), 0);

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
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            >
              <option value="">Todos os projetos</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
              ))}
            </select>
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
            <div className="flex gap-2">
              <button 
                onClick={handleBaixarTemplate} 
                className="px-4 py-2 bg-white border border-hw1-blue text-hw1-blue rounded-xl text-sm font-medium hover:bg-blue-50 transition-all"
              >
                📥 Baixar Template
              </button>
              <label className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all cursor-pointer">
                {uploading ? '⏳ Importando...' : '📤 Importar Excel'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportarExcel}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button onClick={openCreateModal} className="hw1-btn-primary text-sm">
                + Nova Despesa
              </button>
              <button
                onClick={handleBulkDeleteDespesas}
                disabled={selectedDespesaIds.size === 0}
                className="px-4 py-2 border border-red-200 text-red-700 rounded-xl text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Excluir selecionadas ({selectedDespesaIds.size})
              </button>
            </div>
          )}
          {view === 'receitas' && (
            <div className="flex gap-2">
              <button
                onClick={handleBaixarTemplateReceitas}
                disabled={!selectedProjectId}
                title={!selectedProjectId ? 'Selecione um projeto para gerar o template de receitas contextualizado' : 'Gerar template com objetos e linhas do projeto selecionado'}
                className="px-4 py-2 bg-white border border-emerald-600 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📥 Template Receitas
              </button>
              <label className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all cursor-pointer">
                {uploadingReceitas ? '⏳ Importando...' : '📤 Importar Receitas'}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportarExcelReceitas}
                  disabled={uploadingReceitas}
                  className="hidden"
                />
              </label>
              <button onClick={openCreateReceitaModal} className="hw1-btn-primary text-sm">
                + Nova Receita
              </button>
              <button
                onClick={handleBulkDeleteReceitas}
                disabled={selectedReceitaIds.size === 0}
                className="px-4 py-2 border border-red-200 text-red-700 rounded-xl text-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Excluir selecionadas ({selectedReceitaIds.size})
              </button>
            </div>
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
              <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
            ) : !data || data.projetos.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">Nenhum dado financeiro encontrado para o período.</div>
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
                    <th className="px-6 py-4 text-right">Impostos</th>
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
                      <td className="px-6 py-4 text-right text-orange-600">{formatBRL(p.impostos ?? 0)}</td>
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
              <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
            ) : despesas.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">Nenhuma despesa cadastrada.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                    style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
                  >
                    <th className="px-4 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={despesas.length > 0 && selectedDespesaIds.size === despesas.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDespesaIds(new Set(despesas.map((item) => item.id)));
                          } else {
                            setSelectedDespesaIds(new Set());
                          }
                        }}
                        aria-label="Selecionar todas as despesas"
                      />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortDespesa('tipo')} title="Clique para ordenar">Tipo {sortByDespesa === 'tipo' && (sortDirDespesa === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortDespesa('naturezaCusto')} title="Clique para ordenar">Natureza {sortByDespesa === 'naturezaCusto' && (sortDirDespesa === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortDespesa('descricao')} title="Clique para ordenar">Descrição {sortByDespesa === 'descricao' && (sortDirDespesa === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortDespesa('mes')} title="Clique para ordenar">Mês {sortByDespesa === 'mes' && (sortDirDespesa === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:opacity-75" onClick={() => handleSortDespesa('valor')} title="Clique para ordenar">Valor {sortByDespesa === 'valor' && (sortDirDespesa === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortArray(despesas, sortByDespesa, sortDirDespesa, (obj, field) => {
                    if (field === 'tipo') return TipoDespesa[obj.tipo as keyof typeof TipoDespesa] || obj.tipo;
                    if (field === 'naturezaCusto') return NaturezaCustoLabel[obj.naturezaCusto || 'VARIAVEL'];
                    if (field === 'descricao') return obj.descricao;
                    if (field === 'mes') return obj.mes;
                    if (field === 'valor') return obj.valor;
                    return '';
                  }).map((d, i) => (
                    <tr
                      key={d.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedDespesaIds.has(d.id)}
                          onChange={(e) => {
                            setSelectedDespesaIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(d.id);
                              else next.delete(d.id);
                              return next;
                            });
                          }}
                          aria-label={`Selecionar despesa ${d.descricao}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{TipoDespesa[d.tipo] || d.tipo}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{NaturezaCustoLabel[d.naturezaCusto || 'VARIAVEL']}</td>
                      <td className="px-6 py-4 text-gray-600">{d.descricao}</td>
                      <td className="px-6 py-4 text-gray-500">{String(d.mes).padStart(2, '0')}/{d.ano}</td>
                      <td className="px-6 py-4 text-right font-medium text-hw1-navy">{formatBRL(d.valor)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block" ref={openMenuId === d.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all text-lg leading-none"
                            title="Ações"
                          >
                            ⋮
                          </button>
                          {openMenuId === d.id && (
                            <div className="absolute right-0 z-50 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 animate-fade-in">
                              <button
                                onClick={() => { openEditModal(d); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-hw1-navy hover:bg-blue-50 transition-colors"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => { handleDelete(d); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                🗑️ Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200 font-semibold text-hw1-navy">
                    <td className="px-4 py-3" />
                    <td className="px-6 py-3" colSpan={4}>Total da página</td>
                    <td className="px-6 py-3 text-right">{formatBRL(totalDespesasValor)}</td>
                    <td className="px-6 py-3" />
                  </tr>
                </tfoot>
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
          {/* Guia rápido de importação de receitas */}
          <details className="hw1-card border border-emerald-100 bg-emerald-50/40 group" open={false}>
            <summary className="list-none cursor-pointer flex items-center justify-between text-sm font-semibold text-emerald-800">
              <span>Guia rápido: Importar Receitas por Excel</span>
              <span className="text-emerald-700 group-open:rotate-180 transition-transform">⌄</span>
            </summary>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white border border-emerald-200 rounded-xl">
                <p className="font-semibold text-emerald-700 mb-2">Modo Manual</p>
                <p className="text-gray-600 mb-2">Preencha estes campos por linha:</p>
                <p className="text-gray-700">projectId, modo=manual, tipoReceita, valorPrevisto, mes, ano</p>
                <p className="text-gray-500 mt-2">Opcional: descricao, valorRealizado, mesesAdicionais, justificativa</p>
              </div>
              <div className="p-3 bg-white border border-emerald-200 rounded-xl">
                <p className="font-semibold text-emerald-700 mb-2">Modo Contrato</p>
                <p className="text-gray-600 mb-2">Preencha estes campos por linha:</p>
                <p className="text-gray-700">projectId, modo=contrato, linhaContratualId, quantidade, mes, ano</p>
                <p className="text-gray-500 mt-2">Opcional: quantidadeRealizada, objetoContratualId, descricao</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-gray-600">
              <p>
                Para baixar o template de receitas, selecione primeiro um projeto no filtro superior.
              </p>
              <p className="mt-1">
                Dica: se modo estiver vazio e linhaContratualId for informado, o sistema assume automaticamente modo contrato.
              </p>
              <p className="mt-1">
                Regra: quando valor realizado for diferente do planejado e maior que zero, informe a justificativa.
              </p>
            </div>
          </details>

          {/* Receitas table */}
          <div className="hw1-card p-0 overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
            ) : receitas.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">Nenhuma receita cadastrada.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                    style={{ background: 'linear-gradient(90deg, #009792, #00B3AD)' }}
                  >
                    <th className="px-4 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={receitas.length > 0 && selectedReceitaIds.size === receitas.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReceitaIds(new Set(receitas.map((item) => item.id)));
                          } else {
                            setSelectedReceitaIds(new Set());
                          }
                        }}
                        aria-label="Selecionar todas as receitas"
                      />
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('project')} title="Clique para ordenar">Projeto {sortByReceita === 'project' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('objetoContratual')} title="Clique para ordenar">Obj. Contratual {sortByReceita === 'objetoContratual' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('descricao')} title="Clique para ordenar">Linha / Descrição {sortByReceita === 'descricao' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('unidade')} title="Clique para ordenar">Unid. {sortByReceita === 'unidade' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('mes')} title="Clique para ordenar">Mês {sortByReceita === 'mes' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('quantidade')} title="Clique para ordenar">Qtd {sortByReceita === 'quantidade' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('valorUnitario')} title="Clique para ordenar">Vl. Unit. {sortByReceita === 'valorUnitario' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('valorPrevisto')} title="Clique para ordenar">Previsto {sortByReceita === 'valorPrevisto' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('valorRealizado')} title="Clique para ordenar">Realizado {sortByReceita === 'valorRealizado' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 cursor-pointer hover:opacity-75" onClick={() => handleSortReceita('justificativa')} title="Clique para ordenar">Justificativa {sortByReceita === 'justificativa' && (sortDirReceita === 'asc' ? '↑' : '↓')}</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortArray(receitas, sortByReceita, sortDirReceita, (obj, field) => {
                    if (field === 'project') return obj.project?.nome || 'N/A';
                    if (field === 'objetoContratual') return obj.objetoContratual?.nome || '';
                    if (field === 'descricao') return obj.linhaContratual?.descricaoItem || obj.descricao || '';
                    if (field === 'unidade') return obj.unidade || obj.linhaContratual?.unidade || '';
                    if (field === 'mes') return obj.mes;
                    if (field === 'quantidade') return obj.quantidade || 0;
                    if (field === 'valorUnitario') return obj.valorUnitario || 0;
                    if (field === 'valorPrevisto') return obj.valorPrevisto;
                    if (field === 'valorRealizado') return obj.valorRealizado;
                    if (field === 'justificativa') return obj.justificativa || '';
                    return '';
                  }).map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedReceitaIds.has(r.id)}
                          onChange={(e) => {
                            setSelectedReceitaIds((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(r.id);
                              else next.delete(r.id);
                              return next;
                            });
                          }}
                          aria-label={`Selecionar receita ${r.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <span>{r.project?.nome || 'N/A'}</span>
                          {(Number(r.linhaContratual?.saldoValor ?? 0) < 0 || Number(r.linhaContratual?.saldoQuantidade ?? 0) < 0) && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-semibold whitespace-nowrap">
                              ⚠️ Saldo Insuficiente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {r.objetoContratual ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                            📑 {r.objetoContratual.nome}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{r.linhaContratual?.descricaoItem || r.descricao || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs capitalize">{r.unidade || r.linhaContratual?.unidade || '-'}</td>
                      <td className="px-6 py-4 text-gray-500">{String(r.mes).padStart(2, '0')}/{r.ano}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{r.quantidade !== undefined && r.quantidade !== null ? Number(r.quantidade).toLocaleString('pt-BR') : '-'}</td>
                      <td className="px-6 py-4 text-right text-gray-500 text-xs">{r.valorUnitario ? formatBRL(Number(r.valorUnitario)) : '-'}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">{formatBRL(r.valorPrevisto)}</td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          Number(r.linhaContratual?.saldoValor ?? 0) < 0 || Number(r.linhaContratual?.saldoQuantidade ?? 0) < 0
                            ? 'text-red-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatBRL(r.valorRealizado)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-[260px] truncate" title={r.justificativa || ''}>
                        {r.justificativa || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block" ref={openMenuId === r.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-lg leading-none"
                            title="Ações"
                          >
                            ⋮
                          </button>
                          {openMenuId === r.id && (
                            <div className="absolute right-0 z-50 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 animate-fade-in">
                              <button
                                onClick={() => { openEditReceitaModal(r); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-hw1-navy hover:bg-emerald-50 transition-colors"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => { handleDeleteReceita(r); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                🗑️ Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t border-emerald-200 font-semibold text-emerald-900">
                    <td className="px-4 py-3" />
                    <td className="px-6 py-3" colSpan={8}>Total da página</td>
                    <td className="px-6 py-3 text-right">{formatBRL(totalReceitasPrevisto)}</td>
                    <td className="px-6 py-3 text-right">{formatBRL(totalReceitasRealizado)}</td>
                    <td className="px-6 py-3" />
                  </tr>
                </tfoot>
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
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
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
                      setForm({ ...form, projectId: pid, objetoContratualId: '', linhaContratualId: '', quantidade: '0' });
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
                          setForm({ ...form, objetoContratualId: oid, linhaContratualId: '', quantidade: '0' });
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
                          <div className="mt-1 text-xs text-gray-600">
                            <span className="text-gray-500">Saldo Quantidade:</span>{' '}
                            <span className={Number(linhaSel.saldoQuantidade ?? 0) < 0 ? 'font-semibold text-red-600' : 'font-medium'}>
                              {Number(linhaSel.saldoQuantidade ?? 0).toLocaleString('pt-BR')}
                            </span>
                            {' | '}
                            <span className="text-gray-500">Saldo Valor:</span>{' '}
                            <span className={Number(linhaSel.saldoValor ?? 0) < 0 ? 'font-semibold text-red-600' : 'font-medium'}>
                              {formatBRL(Number(linhaSel.saldoValor ?? 0))}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantidade do Período Previsto</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.quantidade}
                        onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                        placeholder="Quantidade no mês"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                      />
                    </div>
                    {form.linhaContratualId && form.quantidade !== '' && (() => {
                      const linhaSel = linhasContratuais.find(l => l.id === form.linhaContratualId);
                      const vlCalc = linhaSel ? Number(form.quantidade) * Number(linhaSel.valorUnitario) : 0;
                      const qtdReal = Number(form.quantidadeRealizada || 0);
                      const vlRealCalc = linhaSel ? qtdReal * Number(linhaSel.valorUnitario) : 0;
                      const competenciasCount = Number(form.mesesAdicionais || 0) + 1;
                      const excedeSaldoQuantidade =
                        form.quantidadeRealizada !== '' && qtdReal * competenciasCount > Number(linhaSel?.saldoQuantidade ?? 0);
                      const excedeSaldoValor =
                        form.quantidadeRealizada !== '' && vlRealCalc * competenciasCount > Number(linhaSel?.saldoValor ?? 0);
                      return (
                        <>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Valor Previsto (auto)</label>
                            <div className="w-full px-3 py-2 border border-gray-100 bg-emerald-50 rounded-xl text-sm font-semibold text-emerald-700">
                              {formatBRL(vlCalc)}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">= {form.quantidade} × {linhaSel ? formatBRL(Number(linhaSel.valorUnitario)) : ''}</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Quantidade do Período Realizado</label>
                            <input
                              type="number"
                              step="0.01"
                              value={form.quantidadeRealizada}
                              onChange={(e) => setForm({ ...form, quantidadeRealizada: e.target.value })}
                              placeholder="Opcional"
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Valor Realizado (Contrato)</label>
                            <div
                              className={`w-full px-3 py-2 border rounded-xl text-sm font-semibold ${
                                excedeSaldoQuantidade || excedeSaldoValor
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-gray-100 bg-blue-50 text-blue-700'
                              }`}
                            >
                              {form.quantidadeRealizada !== '' && linhaSel
                                ? formatBRL(Number(form.quantidadeRealizada) * Number(linhaSel.valorUnitario))
                                : '—'}
                            </div>
                            {form.quantidadeRealizada !== '' && linhaSel && (
                              <p className="text-[10px] text-gray-500 mt-0.5">= {form.quantidadeRealizada} × {formatBRL(Number(linhaSel.valorUnitario))}</p>
                            )}
                          </div>
                          {(excedeSaldoQuantidade || excedeSaldoValor) && (
                            <div className="md:col-span-2">
                              <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                Atenção: o lançamento ultrapassa o saldo remanescente do contrato.
                                {excedeSaldoQuantidade
                                  ? ` Quantidade total realizada (${(qtdReal * competenciasCount).toLocaleString('pt-BR')}) maior que saldo (${Number(linhaSel?.saldoQuantidade ?? 0).toLocaleString('pt-BR')}).`
                                  : ''}
                                {excedeSaldoValor
                                  ? ` Valor total realizado (${formatBRL(vlRealCalc * competenciasCount)}) maior que saldo (${formatBRL(Number(linhaSel?.saldoValor ?? 0))}).`
                                  : ''}
                                O sistema permitirá salvar com este alerta.
                              </p>
                            </div>
                          )}
                        </>
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
                    ) : tiposDespesaDinamicos.length > 0 ? (
                      tiposDespesaDinamicos.map((td) => (
                        <option key={td.id} value={td.nome}>{td.nome}</option>
                      ))
                    ) : (
                      Object.entries(TipoDespesa).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))
                    )}
                  </select>
                </div>

                {modalType !== 'receita' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Natureza do Custo *</label>
                    <select
                      value={form.naturezaCusto}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          naturezaCusto: e.target.value as 'FIXO' | 'VARIAVEL',
                          replicarAteFimContrato: e.target.value === 'FIXO' ? form.replicarAteFimContrato : false,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    >
                      <option value="VARIAVEL">Variável</option>
                      <option value="FIXO">Fixo</option>
                    </select>
                    {form.naturezaCusto === 'FIXO' && (
                      <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={form.replicarAteFimContrato}
                          onChange={(e) =>
                            setForm({ ...form, replicarAteFimContrato: e.target.checked })
                          }
                        />
                        Replicar automaticamente até o fim da vigência do contrato
                      </label>
                    )}
                  </div>
                )}

                {/* Campos extras para despesa tipo fornecedor */}
                {modalType !== 'receita' && form.tipo === 'fornecedor' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fornecedor</label>
                      <select
                        value={form.fornecedorId}
                        onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                      >
                        <option value="">Nenhum (avulso)</option>
                        {fornecedoresList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.razaoSocial}{f.nomeFantasia ? ` (${f.nomeFantasia})` : ''} — {f.cnpj}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Data de Vencimento</label>
                      <input
                        type="date"
                        value={form.dataVencimento}
                        onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                      />
                    </div>
                  </>
                )}

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

                {modalType === 'receita' && (() => {
                  const linhaSel = linhasContratuais.find((l) => l.id === form.linhaContratualId);
                  const previsto = receitaMode === 'contrato'
                    ? Number(form.quantidade || 0) * Number(linhaSel?.valorUnitario || 0)
                    : Number(form.valorPrevisto || 0);
                  const realizado = receitaMode === 'contrato'
                    ? Number(form.quantidadeRealizada || 0) * Number(linhaSel?.valorUnitario || 0)
                    : Number(form.valorRealizado || 0);
                  const precisaJustificar = realizado > 0 && Math.abs(realizado - previsto) >= 0.01;

                  return (
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Justificativa {precisaJustificar ? '*' : '(opcional)'}
                      </label>
                      <textarea
                        value={form.justificativa}
                        onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
                        placeholder={
                          precisaJustificar
                            ? 'Explique a diferença entre valor planejado e realizado'
                            : 'Informe uma justificativa se necessário'
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue min-h-[84px]"
                        required={precisaJustificar}
                        maxLength={1000}
                      />
                      {precisaJustificar && (
                        <p className="mt-1 text-[11px] text-amber-700">
                          Valor realizado diferente do planejado com realizado maior que zero exige justificativa.
                        </p>
                      )}
                    </div>
                  );
                })()}

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

                {!editingId && (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Replicar para mais meses</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="36"
                        value={form.mesesAdicionais}
                        onChange={(e) => setForm({ ...form, mesesAdicionais: e.target.value })}
                        disabled={modalType === 'despesa' && form.naturezaCusto === 'FIXO' && form.replicarAteFimContrato}
                        className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <p className="text-xs text-gray-500">
                        {modalType === 'despesa' && form.naturezaCusto === 'FIXO' && form.replicarAteFimContrato
                          ? 'Replicação até o fim da vigência será calculada automaticamente.'
                          : '0 = somente a competência informada. Valores maiores replicam para os próximos meses, inclusive virando o ano.'}
                      </p>
                    </div>
                  </div>
                )}
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

      {/* Modal de Resultado da Importação */}
      {showImportModal && importResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-hw1-navy">
                {importResult.success ? '✅ Importação Concluída' : '⚠️ Importação com Erros'}
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="text-gray-500 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Resumo */}
              <div className={`p-4 rounded-xl mb-4 ${
                importResult.success 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`font-medium ${
                  importResult.success ? 'text-emerald-700' : 'text-yellow-700'
                }`}>
                  {importResult.message}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>✓ Linhas válidas: <strong>{importResult.validas}</strong></p>
                  <p>✗ Linhas com erro: <strong>{importResult.erros.length}</strong></p>
                  {importResult.registrosCriados && importResult.registrosCriados.length > 0 && (
                    <p>
                      💾 {importResult.tipoRegistro === 'receita' ? 'Receitas criadas' : 'Despesas criadas'}:{' '}
                      <strong>{importResult.registrosCriados.length}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Erros */}
              {importResult.erros.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Erros Encontrados:</h4>
                  <div className="space-y-2">
                    {importResult.erros.map((erro, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-700 mb-1">
                          Linha {erro.linha}:
                        </p>
                        <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                          {erro.erros.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registros Criados com Sucesso */}
              {importResult.registrosCriados && importResult.registrosCriados.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {importResult.tipoRegistro === 'receita' ? 'Receitas Importadas:' : 'Despesas Importadas:'}
                  </h4>
                  <div className="space-y-2">
                    {importResult.registrosCriados
                      .filter((item) => item && typeof item === 'object')
                      .slice(0, 10)
                      .map((registro, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        {importResult.tipoRegistro === 'receita' ? (
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <p className="font-medium text-emerald-700">{registro.descricao || registro.tipoReceita}</p>
                              <p className="text-gray-600">
                                {registro.tipoReceita} • {String(registro.mes).padStart(2, '0')}/{registro.ano}
                              </p>
                            </div>
                            <p className="font-semibold text-emerald-700">
                              {formatBRL(Number(registro.valorPrevisto || 0))}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start text-xs">
                            <div>
                              <p className="font-medium text-emerald-700">{registro.descricao}</p>
                              <p className="text-gray-600">
                                {TipoDespesa[registro.tipo as keyof typeof TipoDespesa]} • 
                                {String(registro.mes).padStart(2, '0')}/{registro.ano}
                              </p>
                            </div>
                            <p className="font-semibold text-emerald-700">
                              {formatBRL(Number(registro.valor || 0))}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    {importResult.registrosCriados.length > 10 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        + {importResult.registrosCriados.length - 10} registro(s) a mais...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Instruções em caso de erro */}
              {!importResult.success && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">💡 Dicas:</h4>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                    <li>Corrija os erros listados acima no arquivo Excel</li>
                    <li>Verifique se os IDs ou códigos de projeto estão corretos</li>
                    <li>Certifique-se de que os valores numéricos estão no formato correto</li>
                    <li>
                      {importResult.tipoRegistro === 'receita'
                        ? 'Preencha o tipo de receita e valor previsto em todas as linhas válidas'
                        : 'O tipo de despesa deve ser um dos valores válidos: facilities, fornecedor, aluguel, etc.'}
                    </li>
                    <li>Baixe o template atualizado se tiver dúvidas sobre o formato</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="hw1-btn-primary text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
