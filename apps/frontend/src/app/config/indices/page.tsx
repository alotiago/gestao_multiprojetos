'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

interface IndiceFinanceiro {
  id: string;
  tipo: string;
  valor: number;
  mesReferencia: number;
  anoReferencia: number;
  createdAt?: string;
}

const TIPOS = ['IPCA', 'INPC', 'CDI', 'SELIC', 'IGPM'];

const formatPercent = (v: number) => `${(Number(v || 0) * 100).toFixed(2)}%`;

export default function IndicesFinanceirosPage() {
  const [indices, setIndices] = useState<IndiceFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    tipo: 'IPCA',
    valorPercentual: '',
    mesReferencia: new Date().getMonth() + 1,
    anoReferencia: new Date().getFullYear(),
  });

  const loadIndices = () => {
    setLoading(true);
    const params: string[] = [];
    if (filtroTipo) params.push(`tipo=${encodeURIComponent(filtroTipo)}`);
    if (filtroAno) params.push(`ano=${filtroAno}`);
    const qs = params.length ? `?${params.join('&')}` : '';

    api
      .get(`/financial/indices${qs}`)
      .then((r) => {
        const items = r.data?.data ?? r.data ?? [];
        const normalized = (Array.isArray(items) ? items : []).map((item: any) => ({
          ...item,
          valor: Number(item?.valor ?? 0),
        }));
        setIndices(normalized);
      })
      .catch(() => setError('Nao foi possivel carregar os indices financeiros.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIndices();
  }, [filtroTipo, filtroAno]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(''), 4000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const valorDecimal = Number(form.valorPercentual.replace(',', '.')) / 100;

    if (!Number.isFinite(valorDecimal)) {
      setError('Informe um valor percentual valido. Exemplo: 0,56');
      setSaving(false);
      return;
    }

    try {
      await api.post('/financial/indices', {
        tipo: form.tipo,
        valor: valorDecimal,
        mesReferencia: Number(form.mesReferencia),
        anoReferencia: Number(form.anoReferencia),
      });

      setSuccessMsg('Indice financeiro cadastrado com sucesso!');
      setForm({
        tipo: form.tipo,
        valorPercentual: '',
        mesReferencia: form.mesReferencia,
        anoReferencia: form.anoReferencia,
      });
      loadIndices();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) setError(msg[0]);
      else setError(msg || 'Nao foi possivel cadastrar o indice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Indices Financeiros</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cadastro mensal de indicadores economicos</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="hw1-card grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Valor (%)</label>
          <input
            type="text"
            value={form.valorPercentual}
            onChange={(e) => setForm({ ...form, valorPercentual: e.target.value })}
            placeholder="Ex: 0,56"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Mes Referencia</label>
          <select
            value={form.mesReferencia}
            onChange={(e) => setForm({ ...form, mesReferencia: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Ano Referencia</label>
          <select
            value={form.anoReferencia}
            onChange={(e) => setForm({ ...form, anoReferencia: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={saving} className="hw1-btn-primary text-sm disabled:opacity-50">
          {saving ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>

      <div className="hw1-card">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            <option value="">Todos os tipos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
        ) : indices.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Nenhum indice encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white" style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Mes/Ano</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {indices.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white border-b border-gray-100' : 'bg-gray-50/50 border-b border-gray-100'}>
                    <td className="px-4 py-3 font-medium text-hw1-navy">{item.tipo}</td>
                    <td className="px-4 py-3 text-gray-600">{String(item.mesReferencia).padStart(2, '0')}/{item.anoReferencia}</td>
                    <td className="px-4 py-3 text-right font-semibold text-hw1-blue">{formatPercent(item.valor)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
