'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import RowActionsMenu from '@/app/components/RowActionsMenu';

interface Projeto {
  id: string;
  codigo: string;
  nome: string;
}

interface Imposto {
  id: string;
  projectId: string;
  tipo: string;
  aliquota: number;
  valor: number;
  mes: number;
  ano: number;
}

const TIPOS_IMPOSTO = ['INSS', 'ISS', 'PIS', 'COFINS', 'IRPJ', 'CSLL', 'FGTS', 'CPP', 'CPRB', 'OUTROS'] as const;

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const currentYear = new Date().getFullYear();

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatPct = (v: number) => {
  const pct = v < 1 ? v * 100 : v;
  return `${pct.toFixed(2)}%`;
};

export default function ImpostosConfigPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projectId, setProjectId] = useState('');
  const [ano, setAno] = useState(currentYear);
  const [impostos, setImpostos] = useState<Imposto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ tipo: '', aliquota: '', valor: '' });

  /* carregar projetos */
  useEffect(() => {
    api.get('/projects')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data?.data ?? [];
        setProjetos(list);
        if (list.length === 1) setProjectId(list[0].id);
      })
      .catch(() => setProjetos([]));
  }, []);

  /* carregar impostos */
  const loadImpostos = () => {
    if (!projectId) return;
    setLoading(true);
    api
      .get(`/financial/projetos/${projectId}/impostos`, { params: { ano } })
      .then((r) => setImpostos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setError('Não foi possível carregar impostos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (projectId) loadImpostos();
  }, [projectId, ano]);

  /* limpar mensagens */
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

  /* edição inline */
  const startEdit = (imp: Imposto) => {
    setEditingId(imp.id);
    const aliq = Number(imp.aliquota);
    setEditForm({
      tipo: imp.tipo,
      aliquota: (aliq < 1 ? (aliq * 100).toFixed(2) : aliq.toFixed(2)),
      valor: Number(imp.valor).toFixed(2),
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/financial/impostos/${id}`, {
        tipo: editForm.tipo,
        aliquota: parseFloat(editForm.aliquota) / 100,
        valor: parseFloat(editForm.valor),
      });
      setSuccessMsg('Imposto atualizado!');
      setEditingId(null);
      loadImpostos();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imp: Imposto) => {
    if (!confirm(`Excluir ${imp.tipo} de ${MESES[imp.mes - 1]}/${imp.ano}?`)) return;
    try {
      await api.delete(`/financial/impostos/${imp.id}`);
      setSuccessMsg('Imposto excluído!');
      loadImpostos();
    } catch {
      setError('Não foi possível excluir.');
    }
  };

  /* filtros */
  const filtered = impostos.filter((imp) => {
    if (filtroTipo && imp.tipo !== filtroTipo) return false;
    if (search) {
      const s = search.toLowerCase();
      return imp.tipo.toLowerCase().includes(s) || MESES[imp.mes - 1].toLowerCase().includes(s);
    }
    return true;
  });

  const porMes = filtered.reduce<Record<number, Imposto[]>>((acc, imp) => {
    (acc[imp.mes] ??= []).push(imp);
    return acc;
  }, {});

  const totalGeral = filtered.reduce((s, i) => s + Number(i.valor), 0);
  const tiposPresentes = [...new Set(impostos.map((i) => i.tipo))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Impostos Cadastrados</h1>
          <p className="text-sm text-gray-500 mt-0.5">Consulte e altere os tributos lançados por projeto</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            <option value="">Selecione o projeto</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mensagens */}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      {/* Sem projeto */}
      {!projectId && (
        <div className="hw1-card p-12 text-center text-gray-500">
          Selecione um projeto para consultar os impostos.
        </div>
      )}

      {/* Resumo + Filtros */}
      {projectId && !loading && impostos.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="hw1-card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Impostos ({ano})</p>
              <p className="text-2xl font-heading font-bold text-orange-600 mt-1">{formatBRL(totalGeral)}</p>
            </div>
            <div className="hw1-card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Registros</p>
              <p className="text-2xl font-heading font-bold text-hw1-navy mt-1">
                {filtered.length} <span className="text-sm font-normal text-gray-500">de {impostos.length}</span>
              </p>
            </div>
            <div className="hw1-card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Meses com Lançamento</p>
              <p className="text-2xl font-heading font-bold text-hw1-blue mt-1">{Object.keys(porMes).length}</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Buscar por tipo ou mês..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
            />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue"
            >
              <option value="">Todos os tipos</option>
              {tiposPresentes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {(search || filtroTipo) && (
              <button
                onClick={() => { setSearch(''); setFiltroTipo(''); }}
                className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </>
      )}

      {/* Tabela */}
      {projectId && (
        <div className="hw1-card p-0 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Carregando...</div>
          ) : impostos.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Nenhum imposto cadastrado para este projeto em {ano}.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              Nenhum resultado para os filtros aplicados.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs font-semibold uppercase tracking-wide text-white"
                  style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}
                >
                  <th className="px-6 py-4">Mês</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Alíquota</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(porMes)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .flatMap(([mes, items]) => {
                    const subtotal = items.reduce((s, i) => s + Number(i.valor), 0);
                    const rows = items.map((imp, idx) => (
                      <tr
                        key={imp.id}
                        className={`border-b border-gray-50 ${editingId === imp.id ? 'bg-blue-50/60' : Number(mes) % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                      >
                        {idx === 0 && (
                          <td className="px-6 py-3 font-medium text-hw1-navy align-top" rowSpan={items.length}>
                            {MESES[Number(mes) - 1]}
                          </td>
                        )}

                        {/* Tipo */}
                        <td className="px-6 py-3">
                          {editingId === imp.id ? (
                            <select
                              value={editForm.tipo}
                              onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                              className="px-2 py-1 border border-hw1-blue rounded-lg text-sm w-28"
                            >
                              {TIPOS_IMPOSTO.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-700 font-medium">
                              {imp.tipo}
                            </span>
                          )}
                        </td>

                        {/* Alíquota */}
                        <td className="px-6 py-3 text-right">
                          {editingId === imp.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={editForm.aliquota}
                              onChange={(e) => setEditForm({ ...editForm, aliquota: e.target.value })}
                              className="px-2 py-1 border border-hw1-blue rounded-lg text-sm text-right w-24"
                            />
                          ) : (
                            <span className="font-mono text-gray-600">{formatPct(Number(imp.aliquota))}</span>
                          )}
                        </td>

                        {/* Valor */}
                        <td className="px-6 py-3 text-right">
                          {editingId === imp.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editForm.valor}
                              onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })}
                              className="px-2 py-1 border border-hw1-blue rounded-lg text-sm text-right w-32"
                            />
                          ) : (
                            <span className="font-mono text-gray-800">{formatBRL(Number(imp.valor))}</span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-3 text-right">
                          {editingId === imp.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => saveEdit(imp.id)}
                                disabled={saving}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
                              >
                                {saving ? '...' : '✓ Salvar'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <RowActionsMenu
                              items={[
                                { label: 'Editar', icon: '✏️', onClick: () => startEdit(imp) },
                                { label: 'Excluir', icon: '🗑️', tone: 'danger', onClick: () => handleDelete(imp) },
                              ]}
                            />
                          )}
                        </td>
                      </tr>
                    ));

                    rows.push(
                      <tr key={`sub-${mes}`} className="border-b-2 border-gray-200 bg-gray-50">
                        <td colSpan={3} className="px-6 py-2 text-right text-xs text-gray-500 font-semibold uppercase">
                          Subtotal {MESES[Number(mes) - 1]}
                        </td>
                        <td className="px-6 py-2 text-right font-mono font-semibold text-orange-600">{formatBRL(subtotal)}</td>
                        <td />
                      </tr>,
                    );
                    return rows;
                  })}

                <tr style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                  <td colSpan={3} className="px-6 py-4 text-right text-white font-semibold uppercase text-xs tracking-wide">
                    Total {ano}
                  </td>
                  <td className="px-6 py-4 text-right text-white font-bold font-mono text-base">{formatBRL(totalGeral)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
