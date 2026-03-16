'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

/* â”€â”€ tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface Sindicato {
  id: string;
  nome: string;
  regiao: string;
  percentualDissidio: number;
  dataDissidio?: string;
  regimeTributario: string;
  _count?: { colaboradores: number };
}

interface SimulacaoResult {
  salarioBase: number;
  encargos: Array<{ tipo: string; percentual: number; valor: number }>;
  totalEncargos: number;
  custoTotalMensal: number;
  percentualEncargos: number;
  dissidio?: { percentual: number; salarioReajustado: number };
  custoHora?: number;
  custoAnual?: number;
}

interface RegiaoRelatorio {
  regiao: string;
  totalSindicatos: number;
  mediaPercentualDissidio: number;
  sindicatos: Sindicato[];
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatPct = (v: number | string) => `${Number(v || 0).toFixed(2)}%`;

/* â”€â”€ componente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function SindicatosPage() {
  const [sindicatos, setSindicatos] = useState<Sindicato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');

  /* form criar/editar */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    regiao: '',
    percentualDissidio: '',
    regimeTributario: 'LUCRO_PRESUMIDO',
  });

  /* dissÃ­dio */
  const [showDissidio, setShowDissidio] = useState(false);
  const [dissidioForm, setDissidioForm] = useState({
    sindicatoId: '',
    percentualReajuste: '',
    dataBase: '',
  });

  /* simulaÃ§Ã£o */
  const [showSimulacao, setShowSimulacao] = useState(false);
  const [simForm, setSimForm] = useState({
    salarioBase: '5000',
    cargaHoraria: '176',
    sindicatoId: '',
  });
  const [simResult, setSimResult] = useState<SimulacaoResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  /* relatÃ³rio por regiÃ£o */
  const [regioes, setRegioes] = useState<RegiaoRelatorio[]>([]);
  const [showRegioes, setShowRegioes] = useState(false);

  const loadSindicatos = useCallback(() => {
    setLoading(true);
    api
      .get('/sindicatos')
      .then((r) => {
        const items = r.data?.data ?? r.data ?? [];
        const normalized = (Array.isArray(items) ? items : []).map((s: any) => ({
          ...s,
          percentualDissidio: Number(s?.percentualDissidio ?? 0),
          regimeTributario: s?.regimeTributario || 'LUCRO_PRESUMIDO',
        }));
        setSindicatos(normalized);
      })
      .catch(() => setError('NÃ£o foi possÃ­vel carregar os sindicatos.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSindicatos();
  }, [loadSindicatos]);

  /* auto-clear */
  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(t); }
  }, [successMsg]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  /* CRUD */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome: form.nome,
        regiao: form.regiao,
        percentualDissidio: parseFloat(form.percentualDissidio) || 0,
        regimeTributario: form.regimeTributario,
      };
      if (editingId) {
        await api.put(`/sindicatos/${editingId}`, payload);
        setSuccessMsg('Sindicato atualizado com sucesso!');
      } else {
        await api.post('/sindicatos', payload);
        setSuccessMsg('Sindicato criado com sucesso!');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ nome: '', regiao: '', percentualDissidio: '', regimeTributario: 'LUCRO_PRESUMIDO' });
      loadSindicatos();
    } catch {
      setError(editingId ? 'Erro ao atualizar sindicato.' : 'Erro ao criar sindicato.');
    }
  };

  const handleEdit = (s: Sindicato) => {
    setEditingId(s.id);
    setForm({
      nome: s.nome,
      regiao: s.regiao,
      percentualDissidio: String(s.percentualDissidio),
      regimeTributario: s.regimeTributario,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este sindicato?')) return;
    try {
      await api.delete(`/sindicatos/${id}`);
      setSuccessMsg('Sindicato excluÃ­do.');
      loadSindicatos();
    } catch {
      setError('Erro ao excluir. Pode haver colaboradores vinculados.');
    }
  };

  /* DissÃ­dio */
  const handleDissidio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sindicatos/dissidio/aplicar', {
        sindicatoId: dissidioForm.sindicatoId,
        percentualReajuste: parseFloat(dissidioForm.percentualReajuste),
        dataBase: dissidioForm.dataBase || undefined,
      });
      setSuccessMsg('DissÃ­dio aplicado com sucesso! Taxas dos colaboradores atualizadas.');
      setShowDissidio(false);
      setDissidioForm({ sindicatoId: '', percentualReajuste: '', dataBase: '' });
      loadSindicatos();
    } catch {
      setError('Erro ao aplicar dissÃ­dio.');
    }
  };

  /* SimulaÃ§Ã£o */
  const handleSimulacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await api.post('/sindicatos/simulacao/impacto-financeiro', {
        salarioBase: parseFloat(simForm.salarioBase),
        cargaHorariaMensal: parseInt(simForm.cargaHoraria),
        sindicatoId: simForm.sindicatoId || undefined,
      });
      const sim = res.data?.simulacao ?? res.data;
      setSimResult(sim);
    } catch {
      setError('Erro ao executar simulaÃ§Ã£o.');
    } finally {
      setSimLoading(false);
    }
  };

  /* RelatÃ³rio por regiÃ£o */
  const handleLoadRegioes = async () => {
    try {
      const res = await api.get('/sindicatos/relatorio/regioes');
      const payload = res.data?.data ?? res.data ?? {};
      const entries = Object.entries(payload?.regioes ?? {}).map(([regiao, info]: [string, any]) => ({
        regiao,
        totalSindicatos: Number(info?.sindicatos ?? 0),
        mediaPercentualDissidio: Number(info?.mediaDissidio ?? 0),
        sindicatos: [],
      }));
      setRegioes(entries);
      setShowRegioes(true);
    } catch {
      setError('Erro ao carregar relatÃ³rio por regiÃµes.');
    }
  };

  const filtered = sindicatos.filter(
    (s) =>
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      s.regiao.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Sindicatos</h1>
          <p className="text-sm text-gray-500 mt-0.5">GestÃ£o sindical, dissÃ­dio e simulaÃ§Ãµes trabalhistas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleLoadRegioes} className="hw1-btn-secondary text-sm">RelatÃ³rio RegiÃµes</button>
          <button onClick={() => setShowDissidio(!showDissidio)} className="hw1-btn-accent text-sm">Aplicar DissÃ­dio</button>
          <button onClick={() => setShowSimulacao(!showSimulacao)} className="px-4 py-2 text-sm font-semibold rounded-xl border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all">
            SimulaÃ§Ã£o
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nome: '', regiao: '', percentualDissidio: '', regimeTributario: 'LUCRO_PRESUMIDO' }); }} className="hw1-btn-primary text-sm">
            + Novo Sindicato
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      {/* Form Sindicato */}
      {showForm && (
        <form onSubmit={handleSubmit} className="hw1-card space-y-4">
          <h3 className="font-heading font-semibold text-hw1-navy">{editingId ? 'Editar Sindicato' : 'Novo Sindicato'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">RegiÃ£o</label>
              <input type="text" value={form.regiao} onChange={(e) => setForm({ ...form, regiao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" placeholder="Sudeste" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Percentual DissÃ­dio (%)</label>
              <input type="number" step="0.01" value={form.percentualDissidio} onChange={(e) => setForm({ ...form, percentualDissidio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Regime TributÃ¡rio</label>
              <select value={form.regimeTributario} onChange={(e) => setForm({ ...form, regimeTributario: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
                <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                <option value="CPRB">CPRB</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="hw1-btn-primary text-sm">{editingId ? 'Salvar AlteraÃ§Ãµes' : 'Criar Sindicato'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      {/* DissÃ­dio */}
      {showDissidio && (
        <form onSubmit={handleDissidio} className="hw1-card space-y-4 border-l-4 border-hw1-pink">
          <h3 className="font-heading font-semibold text-hw1-navy">Aplicar DissÃ­dio</h3>
          <p className="text-sm text-gray-500">Aplica reajuste percentual na taxa/hora de todos os colaboradores vinculados ao sindicato.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sindicato</label>
              <select value={dissidioForm.sindicatoId} onChange={(e) => setDissidioForm({ ...dissidioForm, sindicatoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required>
                <option value="">Selecione...</option>
                {sindicatos.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.regiao})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Percentual Reajuste (%)</label>
              <input type="number" step="0.01" value={dissidioForm.percentualReajuste}
                onChange={(e) => setDissidioForm({ ...dissidioForm, percentualReajuste: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Base (opcional)</label>
              <input type="date" value={dissidioForm.dataBase}
                onChange={(e) => setDissidioForm({ ...dissidioForm, dataBase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="hw1-btn-accent text-sm">Aplicar DissÃ­dio</button>
            <button type="button" onClick={() => setShowDissidio(false)} className="px-4 py-2 text-sm text-gray-500 rounded-xl border border-gray-200">Cancelar</button>
          </div>
        </form>
      )}

      {/* SimulaÃ§Ã£o */}
      {showSimulacao && (
        <div className="hw1-card space-y-4 border-l-4 border-hw1-blue">
          <h3 className="font-heading font-semibold text-hw1-navy">SimulaÃ§Ã£o de Impacto Financeiro</h3>
          <form onSubmit={handleSimulacao} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">SalÃ¡rio Base (R$)</label>
              <input type="number" step="0.01" value={simForm.salarioBase}
                onChange={(e) => setSimForm({ ...simForm, salarioBase: e.target.value })}
                className="w-40 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Carga HorÃ¡ria</label>
              <input type="number" value={simForm.cargaHoraria}
                onChange={(e) => setSimForm({ ...simForm, cargaHoraria: e.target.value })}
                className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sindicato (opcional)</label>
              <select value={simForm.sindicatoId} onChange={(e) => setSimForm({ ...simForm, sindicatoId: e.target.value })}
                className="w-52 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                <option value="">Sem sindicato</option>
                {sindicatos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <button type="submit" disabled={simLoading} className="hw1-btn-primary text-sm">
              {simLoading ? 'Calculando...' : 'Simular'}
            </button>
          </form>

          {simResult && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">SalÃ¡rio Base</p>
                  <p className="text-lg font-heading font-semibold text-hw1-navy">{formatBRL(simResult.salarioBase)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Encargos</p>
                  <p className="text-lg font-heading font-semibold text-red-600">{formatBRL(simResult.totalEncargos)}</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-hw1-blue text-white">
                  <p className="text-xs text-white/70 mb-1">Custo Total</p>
                  <p className="text-lg font-heading font-semibold">{formatBRL(simResult.custoTotalMensal)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">% Encargos</p>
                  <p className="text-lg font-heading font-semibold text-hw1-navy">{formatPct(simResult.percentualEncargos)}</p>
                </div>
              </div>
              {simResult.encargos && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Detalhamento de Encargos</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {simResult.encargos.map((encargo) => (
                      <div key={encargo.tipo} className="flex justify-between px-2">
                        <span className="text-gray-600">{encargo.tipo}</span>
                        <span className="font-medium text-hw1-navy">{formatBRL(Number(encargo.valor || 0))} <span className="text-xs text-gray-400">({formatPct(encargo.percentual)})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {simResult.custoHora !== undefined && (
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Custo/Hora: <strong className="text-hw1-navy">{formatBRL(simResult.custoHora)}</strong></span>
                  {simResult.custoAnual !== undefined && (
                    <span className="text-gray-500">Custo Anual: <strong className="text-hw1-navy">{formatBRL(simResult.custoAnual)}</strong></span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RelatÃ³rio por RegiÃµes */}
      {showRegioes && regioes.length > 0 && (
        <div className="hw1-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-hw1-navy">RelatÃ³rio por RegiÃ£o</h3>
            <button onClick={() => setShowRegioes(false)} className="text-xs text-gray-400 hover:text-gray-600">Fechar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regioes.map((r) => (
              <div key={r.regiao} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-heading font-semibold text-hw1-navy mb-1">{r.regiao}</h4>
                <p className="text-xs text-gray-500">{r.totalSindicatos} sindicato{r.totalSindicatos !== 1 ? 's' : ''}</p>
                <p className="text-sm mt-2">MÃ©dia dissÃ­dio: <strong className="text-hw1-blue">{formatPct(r.mediaPercentualDissidio)}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar sindicatoâ€¦"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
      />

      {/* Tabela */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nenhum sindicato encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">RegiÃ£o</th>
                <th className="px-6 py-4">DissÃ­dio</th>
                <th className="px-6 py-4">Regime</th>
                <th className="px-6 py-4">Colaboradores</th>
                <th className="px-6 py-4 text-center">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{s.nome}</td>
                  <td className="px-6 py-4 text-gray-500">{s.regiao}</td>
                  <td className="px-6 py-4">
                    <span className="hw1-badge-blue">{formatPct(s.percentualDissidio)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{String(s.regimeTributario || '').replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 text-gray-600">{s._count?.colaboradores ?? 'â€”'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(s)} className="text-hw1-blue hover:text-hw1-purple text-xs transition-colors">Editar</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-xs transition-colors">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} sindicato{filtered.length !== 1 ? 's' : ''} cadastrado{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

