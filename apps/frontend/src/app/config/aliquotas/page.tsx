'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';

interface Aliquota {
  id: string;
  regime: string;
  tipo: string;
  aliquota: number;
  ativo: boolean;
}

const REGIMES = [
  { value: 'LUCRO_REAL', label: 'Lucro Real' },
  { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido' },
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional' },
  { value: 'CPRB', label: 'CPRB' },
];

const TIPOS_IMPOSTO = ['PIS', 'COFINS', 'IRPJ', 'CSLL', 'ISS', 'SIMPLES', 'CPRB', 'INSS', 'FGTS', 'CPP'];

export default function AliquotasRegimePage() {
  const [aliquotas, setAliquotas] = useState<Aliquota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [regimaAtivo, setRegimaAtivo] = useState('LUCRO_REAL');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // New aliquota
  const [showAdd, setShowAdd] = useState(false);
  const [newTipo, setNewTipo] = useState('');
  const [newAliquota, setNewAliquota] = useState('');

  const [seeding, setSeeding] = useState(false);

  const fetchAliquotas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/financial/aliquotas-regime');
      const data = Array.isArray(res.data) ? res.data : [];
      setAliquotas(data.map((a: any) => ({ ...a, aliquota: Number(a.aliquota) })));
    } catch {
      setError('Erro ao carregar alíquotas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAliquotas(); }, [fetchAliquotas]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const aliquotasDoRegime = aliquotas.filter((a) => a.regime === regimaAtivo);

  // Calcular carga total do regime
  const cargaTotal = aliquotasDoRegime
    .filter((a) => a.ativo)
    .reduce((s, a) => s + a.aliquota, 0);

  const startEdit = (a: Aliquota) => {
    setEditingId(a.id);
    setEditValue((a.aliquota * 100).toFixed(4));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0 || val > 100) {
      setError('Alíquota deve ser entre 0% e 100%');
      return;
    }
    try {
      await api.put(`/financial/aliquotas-regime/${id}`, { aliquota: val / 100 });
      setSuccess('Alíquota atualizada!');
      setEditingId(null);
      fetchAliquotas();
    } catch {
      setError('Erro ao atualizar');
    }
  };

  const toggleAtivo = async (a: Aliquota) => {
    try {
      await api.put(`/financial/aliquotas-regime/${a.id}`, { ativo: !a.ativo });
      setSuccess(a.ativo ? 'Alíquota desativada' : 'Alíquota ativada');
      fetchAliquotas();
    } catch {
      setError('Erro ao atualizar');
    }
  };

  const deleteAliquota = async (a: Aliquota) => {
    if (!confirm(`Excluir alíquota ${a.tipo} do regime ${a.regime}?`)) return;
    try {
      await api.delete(`/financial/aliquotas-regime/${a.id}`);
      setSuccess('Alíquota excluída');
      fetchAliquotas();
    } catch {
      setError('Erro ao excluir');
    }
  };

  const addAliquota = async () => {
    const val = parseFloat(newAliquota);
    if (!newTipo || isNaN(val) || val < 0 || val > 100) {
      setError('Preencha tipo e alíquota (0-100%)');
      return;
    }
    try {
      await api.post('/financial/aliquotas-regime', {
        regime: regimaAtivo,
        tipo: newTipo,
        aliquota: val / 100,
      });
      setSuccess(`Alíquota ${newTipo} criada!`);
      setShowAdd(false);
      setNewTipo('');
      setNewAliquota('');
      fetchAliquotas();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao criar');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/financial/aliquotas-regime/seed');
      setSuccess(res.data?.message || 'Seed concluído!');
      fetchAliquotas();
    } catch {
      setError('Erro ao executar seed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">
            Tabela de Alíquotas por Regime
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure as alíquotas de cada imposto por regime tributário
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            {seeding ? 'Populando...' : '🌱 Seed Padrão'}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: '#8B5CF6' }}
          >
            + Nova Alíquota
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError('')}>fechar</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Tabs de Regime */}
      <div className="flex gap-2 flex-wrap">
        {REGIMES.map((r) => {
          const count = aliquotas.filter((a) => a.regime === r.value && a.ativo).length;
          return (
            <button
              key={r.value}
              onClick={() => setRegimaAtivo(r.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                regimaAtivo === r.value
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={regimaAtivo === r.value ? { background: '#8B5CF6' } : {}}
            >
              {r.label}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  regimaAtivo === r.value ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="hw1-card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Regime</p>
          <p className="text-lg font-heading font-semibold text-hw1-navy mt-1">
            {REGIMES.find((r) => r.value === regimaAtivo)?.label}
          </p>
        </div>
        <div className="hw1-card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Impostos Ativos</p>
          <p className="text-lg font-heading font-semibold text-hw1-navy mt-1">
            {aliquotasDoRegime.filter((a) => a.ativo).length}
          </p>
        </div>
        <div className="hw1-card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Carga Total</p>
          <p className="text-lg font-heading font-semibold mt-1" style={{ color: '#8B5CF6' }}>
            {(cargaTotal * 100).toFixed(2)}%
          </p>
        </div>
        <div className="hw1-card text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Exemplo (R$100k)</p>
          <p className="text-lg font-heading font-semibold text-orange-600 mt-1">
            R$ {(100000 * cargaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Formulário adicionar */}
      {showAdd && (
        <div className="hw1-card border-2" style={{ borderColor: '#8B5CF6' }}>
          <h3 className="font-heading font-semibold text-hw1-navy mb-3">
            Nova Alíquota — {REGIMES.find((r) => r.value === regimaAtivo)?.label}
          </h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo de Imposto</label>
              <select
                value={newTipo}
                onChange={(e) => setNewTipo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
              >
                <option value="">Selecione...</option>
                {TIPOS_IMPOSTO.filter((t) => !aliquotasDoRegime.some((a) => a.tipo === t))
                  .map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alíquota (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newAliquota}
                onChange={(e) => setNewAliquota(e.target.value)}
                placeholder="Ex: 1.65"
                className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
              />
            </div>
            <button
              onClick={addAliquota}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: '#8B5CF6' }}
            >
              Salvar
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewTipo(''); setNewAliquota(''); }}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela de alíquotas */}
      {loading ? (
        <div className="hw1-card text-center py-12 text-gray-400">Carregando...</div>
      ) : aliquotasDoRegime.length === 0 ? (
        <div className="hw1-card text-center py-12">
          <p className="text-gray-400 mb-3">Nenhuma alíquota cadastrada para este regime.</p>
          <p className="text-sm text-gray-400">
            Clique em <strong>🌱 Seed Padrão</strong> para popular com valores padrão.
          </p>
        </div>
      ) : (
        <div className="hw1-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imposto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alíquota (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor s/ R$100k
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {aliquotasDoRegime
                .sort((a, b) => b.aliquota - a.aliquota)
                .map((a) => (
                  <tr
                    key={a.id}
                    className={`border-b border-gray-50 transition-colors ${
                      editingId === a.id
                        ? 'bg-purple-50 ring-2 ring-inset ring-purple-200'
                        : 'hover:bg-gray-50/50'
                    } ${!a.ativo ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: a.ativo ? '#22C55E' : '#9CA3AF' }}
                        />
                        <span className="font-medium text-hw1-navy text-sm">{a.tipo}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {editingId === a.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            max="100"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(a.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            className="w-28 px-3 py-1.5 border-2 border-purple-300 rounded-lg text-sm text-right font-mono focus:outline-none focus:border-purple-500 bg-white"
                          />
                          <span className="text-gray-500 text-sm font-medium">%</span>
                          <button
                            onClick={() => saveEdit(a.id)}
                            className="ml-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-green-500 hover:bg-green-600 transition-colors"
                            title="Salvar (Enter)"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Cancelar (Esc)"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-sm">
                          {(a.aliquota * 100).toFixed(4)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-sm text-gray-600">
                      {editingId === a.id && editValue !== '' ? (
                        <span className="text-purple-600 font-medium">
                          R$ {(100000 * (parseFloat(editValue) || 0) / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : (
                        <>R$ {(100000 * a.aliquota).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}</>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => toggleAtivo(a)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.ativo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {editingId !== a.id && (
                          <button
                            onClick={() => startEdit(a)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Editar alíquota"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteAliquota(a)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {/* Linha total */}
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                <td className="px-6 py-3 text-sm text-hw1-navy">TOTAL (carga tributária)</td>
                <td className="px-6 py-3 text-right font-mono text-sm" style={{ color: '#8B5CF6' }}>
                  {(cargaTotal * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-3 text-right font-mono text-sm text-orange-600">
                  R$ {(100000 * cargaTotal).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td />
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Comparativo entre regimes */}
      {aliquotas.length > 0 && (
        <div className="hw1-card">
          <h2 className="font-heading font-semibold text-hw1-navy mb-4">
            Comparativo de Carga Tributária
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {REGIMES.map((r) => {
              const regiAliquotas = aliquotas.filter((a) => a.regime === r.value && a.ativo);
              const carga = regiAliquotas.reduce((s, a) => s + a.aliquota, 0);
              const isActive = r.value === regimaAtivo;
              return (
                <div
                  key={r.value}
                  className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    isActive ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => setRegimaAtivo(r.value)}
                >
                  <p className="text-xs text-gray-500 font-medium uppercase">{r.label}</p>
                  <p className="text-2xl font-heading font-semibold mt-1" style={{ color: '#8B5CF6' }}>
                    {(carga * 100).toFixed(2)}%
                  </p>
                  <div className="mt-2 space-y-1">
                    {regiAliquotas
                      .sort((a, b) => b.aliquota - a.aliquota)
                      .map((a) => (
                        <div key={a.id} className="flex justify-between text-xs text-gray-500">
                          <span>{a.tipo}</span>
                          <span className="font-mono">{(a.aliquota * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                    {regiAliquotas.length === 0 && (
                      <p className="text-xs text-gray-300 italic">Sem alíquotas</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
