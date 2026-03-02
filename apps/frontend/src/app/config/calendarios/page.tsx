'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

/* ── tipos ─────────────────────────────────────────────────── */
interface Feriado {
  id: string;
  data: string;
  descricao: string;
  tipo: string;
  cidade?: string;
  estado?: string;
  diaSemana: number;
  nacional: boolean;
}

interface DiasUteisResult {
  mes: number;
  ano: number;
  totalDias: number;
  diasUteis: number;
  feriados: number;
  feriadosEmDiaUtil: number;
  diasUteisLiquidos: number;
  horasUteis: number;
}

const tipoLabels: Record<string, string> = {
  NACIONAL: 'Nacional',
  ESTADUAL: 'Estadual',
  MUNICIPAL: 'Municipal',
};

const diaSemanaLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

/* ── componente ────────────────────────────────────────────── */
export default function CalendariosPage() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');

  /* form */
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    data: '',
    descricao: '',
    tipo: 'NACIONAL',
    cidade: '',
    estado: '',
    nacional: true,
  });

  /* calculadora */
  const [calcEstado, setCalcEstado] = useState('SP');
  const [calcCidade, setCalcCidade] = useState('');
  const [calcMes, setCalcMes] = useState(new Date().getMonth() + 1);
  const [diasUteis, setDiasUteis] = useState<DiasUteisResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  /* seed */
  const [seeding, setSeeding] = useState(false);

  const loadFeriados = useCallback(() => {
    setLoading(true);
    api
      .get(`/calendario?ano=${ano}`)
      .then((r) => setFeriados(r.data?.data ?? r.data ?? []))
      .catch(() => setError('Não foi possível carregar os feriados.'))
      .finally(() => setLoading(false));
  }, [ano]);

  useEffect(() => {
    loadFeriados();
  }, [loadFeriados]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/calendario', {
        ...form,
        nacional: form.tipo === 'NACIONAL',
      });
      setShowForm(false);
      setForm({ data: '', descricao: '', tipo: 'NACIONAL', cidade: '', estado: '', nacional: true });
      setSuccessMsg('Feriado criado com sucesso!');
      loadFeriados();
    } catch {
      setError('Erro ao criar feriado.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este feriado?')) return;
    try {
      await api.delete(`/calendario/${id}`);
      setSuccessMsg('Feriado excluído.');
      loadFeriados();
    } catch {
      setError('Erro ao excluir feriado.');
    }
  };

  const handleCalcDiasUteis = async () => {
    setCalcLoading(true);
    setDiasUteis(null);
    try {
      const params = new URLSearchParams({
        mes: String(calcMes),
        ano: String(ano),
        estado: calcEstado,
      });
      if (calcCidade) params.set('cidade', calcCidade);
      const res = await api.get(`/calendario/calcular/dias-uteis?${params.toString()}`);
      setDiasUteis(res.data);
    } catch {
      setError('Erro ao calcular dias úteis.');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post(`/calendario/seed/${ano}`);
      setSuccessMsg(`Feriados nacionais de ${ano} importados com sucesso!`);
      loadFeriados();
    } catch {
      setError(`Erro ao importar feriados de ${ano}.`);
    } finally {
      setSeeding(false);
    }
  };

  /* auto-clear messages */
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

  const filtered = feriados.filter(
    (f) =>
      f.descricao.toLowerCase().includes(search.toLowerCase()) ||
      (f.estado ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (f.cidade ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Calendário de Feriados</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de feriados e cálculo de dias úteis por região</p>
        </div>
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
          <button onClick={handleSeed} disabled={seeding} className="hw1-btn-secondary text-sm">
            {seeding ? 'Importando...' : `Seed ${ano}`}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="hw1-btn-primary text-sm">
            + Novo Feriado
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>
      )}

      {/* Criar feriado */}
      {showForm && (
        <form onSubmit={handleCreate} className="hw1-card space-y-4">
          <h3 className="font-heading font-semibold text-hw1-navy">Novo Feriado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                placeholder="Ex: Natal"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value, nacional: e.target.value === 'NACIONAL' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
              >
                <option value="NACIONAL">Nacional</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="MUNICIPAL">Municipal</option>
              </select>
            </div>
            {form.tipo !== 'NACIONAL' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                    placeholder="SP"
                  />
                </div>
                {form.tipo === 'MUNICIPAL' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={form.cidade}
                      onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
                      placeholder="São Paulo"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="hw1-btn-primary text-sm">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Calculadora de dias úteis */}
      <div className="hw1-card">
        <h3 className="font-heading font-semibold text-hw1-navy mb-4">Calculadora de Dias Úteis</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mês</label>
            <select
              value={calcMes}
              onChange={(e) => setCalcMes(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            >
              {mesesLabels.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <input
              type="text"
              value={calcEstado}
              onChange={(e) => setCalcEstado(e.target.value.toUpperCase())}
              maxLength={2}
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cidade (opcional)</label>
            <input
              type="text"
              value={calcCidade}
              onChange={(e) => setCalcCidade(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
              placeholder="São Paulo"
            />
          </div>
          <button onClick={handleCalcDiasUteis} disabled={calcLoading} className="hw1-btn-secondary text-sm">
            {calcLoading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        {diasUteis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Dias', value: diasUteis.totalDias },
              { label: 'Dias Úteis Bruto', value: diasUteis.diasUteis },
              { label: 'Feriados (dia útil)', value: diasUteis.feriadosEmDiaUtil },
              { label: 'Dias Úteis Líquidos', value: diasUteis.diasUteisLiquidos, highlight: true },
            ].map((item) => (
              <div
                key={item.label}
                className={`p-3 rounded-xl text-center ${item.highlight ? 'bg-hw1-blue text-white' : 'bg-gray-50'}`}
              >
                <p className={`text-xs ${item.highlight ? 'text-white/70' : 'text-gray-500'} mb-1`}>{item.label}</p>
                <p className={`text-2xl font-heading font-semibold ${item.highlight ? '' : 'text-hw1-navy'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar feriado…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
      />

      {/* Tabela */}
      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {search ? 'Nenhum feriado encontrado.' : `Nenhum feriado cadastrado para ${ano}. Use "Seed ${ano}" para importar os feriados nacionais.`}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
              >
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Dia</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Local</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr
                  key={f.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{formatDate(f.data)}</td>
                  <td className="px-6 py-4 text-gray-500">{diaSemanaLabels[f.diaSemana] ?? '—'}</td>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{f.descricao}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        f.tipo === 'NACIONAL'
                          ? 'hw1-badge-blue'
                          : f.tipo === 'ESTADUAL'
                          ? 'hw1-badge-yellow'
                          : 'hw1-badge-green'
                      }
                    >
                      {tipoLabels[f.tipo] ?? f.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {f.nacional ? 'Brasil' : `${f.cidade ? f.cidade + '/' : ''}${f.estado ?? ''}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-red-400 hover:text-red-600 text-xs transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {filtered.length} feriado{filtered.length !== 1 ? 's' : ''} para {ano}
      </p>
    </div>
  );
}
