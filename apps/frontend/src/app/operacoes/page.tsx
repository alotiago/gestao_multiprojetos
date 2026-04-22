'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import RowActionsMenu from '@/app/components/RowActionsMenu';

/* ── tipos ─────────────────────────────────────────────────── */
interface Historico {
  id: string;
  tipo: string;
  descricao: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  criadoPor?: string;
  criadoEm: string;
}

interface CascataDetalhe {
  colaboradorId: string;
  nome: string;
  matricula: string;
  diasUteis: number;
  horasPrevistas: number;
  custoVariavel: number;
  fte: number;
}

interface CascataResult {
  success: boolean;
  processados: number;
  historicoId: string;
  detalhes: CascataDetalhe[];
  resumo: {
    totalHorasPrevistas: number;
    totalCustoVariavel: number;
    fteMedia: number;
  };
}

interface RangeResult {
  success: boolean;
  totalMeses: number;
  resultados: CascataResult[];
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ── componente ────────────────────────────────────────────── */
export default function OperacoesPage() {
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* tabs */
  const [tab, setTab] = useState<'cascata' | 'massivo' | 'historico'>('cascata');

  /* projetos para seletor */
  const [projetos, setProjetos] = useState<{ id: string; nome: string; codigo: string }[]>([]);

  /* recálculo cascata */
  const [cascataForm, setCascataForm] = useState({
    projectId: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    motivo: '',
  });
  const [cascataResult, setCascataResult] = useState<CascataResult | null>(null);
  const [cascataLoading, setCascataLoading] = useState(false);

  /* recálculo range */
  const [showRange, setShowRange] = useState(false);
  const [rangeForm, setRangeForm] = useState({
    projectId: '',
    mesInicio: 1,
    mesFim: 12,
    ano: new Date().getFullYear(),
    motivo: '',
  });
  const [rangeResult, setRangeResult] = useState<RangeResult | null>(null);
  const [rangeLoading, setRangeLoading] = useState(false);

  /* ajuste massivo jornada */
  const [jornadaForm, setJornadaForm] = useState({
    projectId: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    percentualAjuste: '',
    motivo: 'Ajuste massivo de jornada',
  });
  const [jornadaLoading, setJornadaLoading] = useState(false);

  /* ajuste massivo taxa */
  const [taxaForm, setTaxaForm] = useState({
    projectId: '',
    percentualReajuste: '',
    motivo: 'Ajuste massivo de taxa',
  });
  const [taxaLoading, setTaxaLoading] = useState(false);

  const loadHistorico = useCallback(() => {
    setLoading(true);
    api
      .get('/operations/mass-update/historico?limit=50')
      .then((r) => setHistorico(r.data?.data ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadProjetos = useCallback(() => {
    api
      .get('/projects')
      .then((r) => setProjetos(r.data?.data ?? r.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadHistorico();
    loadProjetos();
  }, [loadHistorico, loadProjetos]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(''), 5000); return () => clearTimeout(t); }
  }, [successMsg]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(''), 5000); return () => clearTimeout(t); }
  }, [error]);

  /* Recálculo Cascata */
  const handleCascata = async (e: React.FormEvent) => {
    e.preventDefault();
    setCascataLoading(true);
    setCascataResult(null);
    try {
      const res = await api.post('/operations/mass-update/recalculo-cascata', cascataForm);
      setCascataResult(res.data);
      setSuccessMsg(`Recálculo cascata concluído: ${res.data.processados} colaboradores processados.`);
      loadHistorico();
    } catch {
      setError('Erro ao executar recálculo em cascata.');
    } finally {
      setCascataLoading(false);
    }
  };

  /* Recálculo Range */
  const handleRange = async (e: React.FormEvent) => {
    e.preventDefault();
    setRangeLoading(true);
    setRangeResult(null);
    try {
      const res = await api.post('/operations/mass-update/recalculo-cascata/range', rangeForm);
      setRangeResult(res.data);
      setSuccessMsg(`Recálculo range concluído: ${res.data.totalMeses} meses processados.`);
      loadHistorico();
    } catch {
      setError('Erro ao executar recálculo range.');
    } finally {
      setRangeLoading(false);
    }
  };

  /* Ajuste Massivo Jornada */
  const handleJornada = async (e: React.FormEvent) => {
    e.preventDefault();
    setJornadaLoading(true);
    try {
      await api.post('/operations/mass-update/jornadas', {
        ...jornadaForm,
        percentualAjuste: parseFloat(jornadaForm.percentualAjuste),
      });
      setSuccessMsg('Ajuste massivo de jornada aplicado com sucesso!');
      loadHistorico();
    } catch {
      setError('Erro ao aplicar ajuste de jornada.');
    } finally {
      setJornadaLoading(false);
    }
  };

  /* Ajuste Massivo Taxa */
  const handleTaxa = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaxaLoading(true);
    try {
      await api.post('/operations/mass-update/taxas', {
        ...taxaForm,
        percentualReajuste: parseFloat(taxaForm.percentualReajuste),
      });
      setSuccessMsg('Ajuste massivo de taxa aplicado com sucesso!');
      loadHistorico();
    } catch {
      setError('Erro ao aplicar ajuste de taxa.');
    } finally {
      setTaxaLoading(false);
    }
  };

  /* Rollback */
  const handleRollback = async (id: string) => {
    if (!confirm('Deseja reverter esta operação? Isto aplicará os valores anteriores.')) return;
    try {
      await api.post(`/operations/mass-update/rollback/${id}`);
      setSuccessMsg('Rollback aplicado com sucesso!');
      loadHistorico();
    } catch {
      setError('Erro ao aplicar rollback.');
    }
  };

  /* Seletor de projetos reutilizável */
  const ProjetoSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required>
      <option value="">Selecione o projeto...</option>
      {projetos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Operações</h1>
          <p className="text-sm text-gray-500 mt-0.5">Recálculos em cascata, ajustes massivos e histórico</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'cascata' as const, label: 'Recálculo Cascata', icon: '🔄' },
          { key: 'massivo' as const, label: 'Ajustes Massivos', icon: '⚡' },
          { key: 'historico' as const, label: 'Histórico', icon: '📋' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              tab === t.key
                ? 'text-white shadow-hw1'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-hw1-blue'
            }`}
            style={tab === t.key ? { background: 'linear-gradient(135deg, #1E16A0, #35277D)' } : {}}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Recálculo Cascata */}
      {tab === 'cascata' && (
        <div className="space-y-4">
          <div className="hw1-card space-y-4">
            <h3 className="font-heading font-semibold text-hw1-navy">
              Recálculo em Cascata: TAXA × CALENDÁRIO × HORAS × CUSTO × FTE
            </h3>
            <p className="text-sm text-gray-500">
              Recalcula automaticamente horas previstas (via calendário regional), custos e FTE de todos os colaboradores de um projeto.
            </p>

            <form onSubmit={handleCascata} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Projeto</label>
                <ProjetoSelect value={cascataForm.projectId} onChange={(v) => setCascataForm({ ...cascataForm, projectId: v })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mês</label>
                  <select value={cascataForm.mes} onChange={(e) => setCascataForm({ ...cascataForm, mes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {mesesLabels.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ano</label>
                  <select value={cascataForm.ano} onChange={(e) => setCascataForm({ ...cascataForm, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Motivo</label>
                <input type="text" value={cascataForm.motivo}
                  onChange={(e) => setCascataForm({ ...cascataForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  placeholder="Ex: Recálculo após atualização de calendário" required />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" disabled={cascataLoading} className="hw1-btn-primary text-sm">
                  {cascataLoading ? 'Recalculando...' : 'Executar Recálculo Cascata'}
                </button>
                <button type="button" onClick={() => setShowRange(!showRange)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-hw1-teal text-hw1-teal-green hover:bg-hw1-teal hover:text-white transition-all">
                  Range de Meses
                </button>
              </div>
            </form>
          </div>

          {/* Resultado Cascata */}
          {cascataResult && (
            <div className="hw1-card border-l-4 border-emerald-400">
              <h4 className="font-heading font-semibold text-hw1-navy mb-3">Resultado do Recálculo</h4>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Horas Previstas</p>
                  <p className="text-xl font-heading font-semibold text-hw1-navy">{cascataResult.resumo.totalHorasPrevistas.toFixed(0)}h</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Custo Variável</p>
                  <p className="text-xl font-heading font-semibold text-red-600">{formatBRL(cascataResult.resumo.totalCustoVariavel)}</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-hw1-blue text-white">
                  <p className="text-xs text-white/70">FTE Média</p>
                  <p className="text-xl font-heading font-semibold">{cascataResult.resumo.fteMedia.toFixed(2)}</p>
                </div>
              </div>
              {cascataResult.detalhes.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-3 py-2">Colaborador</th>
                        <th className="px-3 py-2">Dias Úteis</th>
                        <th className="px-3 py-2">Horas</th>
                        <th className="px-3 py-2">Custo</th>
                        <th className="px-3 py-2">FTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cascataResult.detalhes.map((d) => (
                        <tr key={d.colaboradorId} className="border-b border-gray-50">
                          <td className="px-3 py-2 font-medium text-hw1-navy">{d.nome} <span className="text-gray-500">({d.matricula})</span></td>
                          <td className="px-3 py-2">{d.diasUteis}</td>
                          <td className="px-3 py-2">{d.horasPrevistas.toFixed(0)}h</td>
                          <td className="px-3 py-2">{formatBRL(d.custoVariavel)}</td>
                          <td className="px-3 py-2">{d.fte.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Range */}
          {showRange && (
            <form onSubmit={handleRange} className="hw1-card space-y-4 border-l-4 border-hw1-teal">
              <h4 className="font-heading font-semibold text-hw1-navy">Recálculo em Range de Meses</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Projeto</label>
                  <ProjetoSelect value={rangeForm.projectId} onChange={(v) => setRangeForm({ ...rangeForm, projectId: v })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mês Início</label>
                  <select value={rangeForm.mesInicio} onChange={(e) => setRangeForm({ ...rangeForm, mesInicio: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {mesesLabels.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mês Fim</label>
                  <select value={rangeForm.mesFim} onChange={(e) => setRangeForm({ ...rangeForm, mesFim: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {mesesLabels.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ano</label>
                  <select value={rangeForm.ano} onChange={(e) => setRangeForm({ ...rangeForm, ano: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Motivo</label>
                <input type="text" value={rangeForm.motivo}
                  onChange={(e) => setRangeForm({ ...rangeForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
              </div>
              <button type="submit" disabled={rangeLoading} className="hw1-btn-secondary text-sm">
                {rangeLoading ? 'Executando...' : `Recalcular Range (${rangeForm.mesInicio}–${rangeForm.mesFim}/${rangeForm.ano})`}
              </button>
            </form>
          )}

          {rangeResult && (
            <div className="hw1-card border-l-4 border-hw1-teal">
              <h4 className="font-heading font-semibold text-hw1-navy mb-2">Resultado Range: {rangeResult.totalMeses} meses processados</h4>
              <div className="grid grid-cols-3 gap-2">
                {rangeResult.resultados.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-2 text-center text-xs">
                    <p className="text-gray-500 mb-1">Mês {i + 1}</p>
                    <p className="font-semibold text-hw1-navy">{r.processados} colaboradores</p>
                    <p className="text-gray-500">{formatBRL(r.resumo.totalCustoVariavel)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Ajustes Massivos */}
      {tab === 'massivo' && (
        <div className="space-y-4">
          {/* Ajuste Jornada */}
          <form onSubmit={handleJornada} className="hw1-card space-y-4">
            <h3 className="font-heading font-semibold text-hw1-navy">Ajuste Massivo de Jornada</h3>
            <p className="text-sm text-gray-500">Aplica ajuste percentual nas horas realizadas de todos os colaboradores do projeto.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Projeto</label>
                <ProjetoSelect value={jornadaForm.projectId} onChange={(v) => setJornadaForm({ ...jornadaForm, projectId: v })} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mês</label>
                <select value={jornadaForm.mes} onChange={(e) => setJornadaForm({ ...jornadaForm, mes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                  {mesesLabels.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ano</label>
                <select value={jornadaForm.ano} onChange={(e) => setJornadaForm({ ...jornadaForm, ano: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">% Ajuste</label>
                <input type="number" step="0.01" value={jornadaForm.percentualAjuste}
                  onChange={(e) => setJornadaForm({ ...jornadaForm, percentualAjuste: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  placeholder="Ex: 10 ou -15" required />
              </div>
            </div>
            <button type="submit" disabled={jornadaLoading} className="hw1-btn-primary text-sm">
              {jornadaLoading ? 'Aplicando...' : 'Aplicar Ajuste de Jornada'}
            </button>
          </form>

          {/* Ajuste Taxa */}
          <form onSubmit={handleTaxa} className="hw1-card space-y-4">
            <h3 className="font-heading font-semibold text-hw1-navy">Ajuste Massivo de Taxa</h3>
            <p className="text-sm text-gray-500">Aplica reajuste percentual na taxa/hora de todos os colaboradores do projeto.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Projeto</label>
                <ProjetoSelect value={taxaForm.projectId} onChange={(v) => setTaxaForm({ ...taxaForm, projectId: v })} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">% Reajuste</label>
                <input type="number" step="0.01" value={taxaForm.percentualReajuste}
                  onChange={(e) => setTaxaForm({ ...taxaForm, percentualReajuste: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                  placeholder="Ex: 5.5" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Motivo</label>
                <input type="text" value={taxaForm.motivo}
                  onChange={(e) => setTaxaForm({ ...taxaForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
              </div>
            </div>
            <button type="submit" disabled={taxaLoading} className="hw1-btn-accent text-sm">
              {taxaLoading ? 'Aplicando...' : 'Aplicar Reajuste de Taxa'}
            </button>
          </form>
        </div>
      )}

      {/* TAB: Histórico */}
      {tab === 'historico' && (
        <div className="hw1-card p-0 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
          ) : historico.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">Nenhum histórico de operações encontrado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                  style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Campo</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Autor</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, i) => (
                  <tr key={h.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {new Date(h.criadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        h.tipo.includes('CASCATA') ? 'hw1-badge-blue'
                          : h.tipo.includes('JORNADA') ? 'hw1-badge-green'
                          : h.tipo.includes('TAXA') ? 'hw1-badge-yellow'
                          : 'hw1-badge-blue'
                      }>
                        {h.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{h.campo}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{h.descricao}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{h.criadoPor ?? 'Sistema'}</td>
                    <td className="px-6 py-4 text-center">
                      <RowActionsMenu
                        items={[
                          { label: 'Rollback', icon: '↩️', onClick: () => handleRollback(h.id) },
                        ]}
                        align="left"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
