'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';

type UserRole = 'ADMIN' | 'PMO' | 'PROJECT_MANAGER' | 'HR' | 'FINANCE' | 'VIEWER';
type UserStatus = 'ATIVO' | 'INATIVO' | 'DESLIGADO';

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  ativo?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  PMO: 'PMO',
  PROJECT_MANAGER: 'Gerente de Projetos',
  HR: 'RH',
  FINANCE: 'Financeiro',
  VIEWER: 'Visualizador',
};

export default function UsuariosConfigPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'VIEWER' as UserRole,
    status: 'ATIVO' as UserStatus,
  });

  const loadUsers = () => {
    setLoading(true);
    api
      .get(`/users?page=${page}&limit=${limit}`)
      .then((r) => {
        const items = r.data?.data ?? [];
        setUsers(Array.isArray(items) ? items : []);
      })
      .catch(() => setError('Nao foi possivel carregar usuarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

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

  const openCreate = () => {
    setEditingId(null);
    setForm({ email: '', name: '', password: '', role: 'VIEWER', status: 'ATIVO' });
    setShowModal(true);
  };

  const openEdit = (u: UserItem) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      name: u.name,
      password: '',
      role: u.role,
      status: u.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ email: '', name: '', password: '', role: 'VIEWER', status: 'ATIVO' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const payload: any = {
          name: form.name.trim(),
          role: form.role,
          status: form.status,
        };
        if (form.password.trim()) payload.password = form.password;
        await api.put(`/users/${editingId}`, payload);
        setSuccessMsg('Usuario atualizado com sucesso!');
      } else {
        await api.post('/users', {
          email: form.email.trim(),
          name: form.name.trim(),
          password: form.password,
          role: form.role,
        });
        setSuccessMsg('Usuario criado com sucesso!');
      }

      closeModal();
      loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) setError(msg[0]);
      else setError(msg || `Nao foi possivel ${editingId ? 'atualizar' : 'criar'} usuario.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`Deseja desativar o usuario ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setSuccessMsg('Usuario desativado com sucesso!');
      loadUsers();
    } catch {
      setError('Nao foi possivel desativar usuario.');
    }
  };

  const handleActivate = async (u: UserItem) => {
    try {
      await api.post(`/users/${u.id}/activate`);
      setSuccessMsg('Usuario ativado com sucesso!');
      loadUsers();
    } catch {
      setError('Nao foi possivel ativar usuario.');
    }
  };

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role].some((v) => String(v || '').toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-hw1-navy">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">CRUD de usuarios e niveis de acesso</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue w-64"
          />
          <button onClick={openCreate} className="hw1-btn-primary text-sm">+ Novo Usuario</button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{successMsg}</div>}

      <div className="hw1-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nenhum usuario encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-white" style={{ background: 'linear-gradient(90deg, #050439, #1E16A0)' }}>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Nivel de Acesso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ultimo Login</th>
                <th className="px-6 py-4 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-6 py-4 font-medium text-hw1-navy">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-gray-500">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-6 py-4">
                    <span className={u.status === 'ATIVO' ? 'hw1-badge-green' : u.status === 'INATIVO' ? 'hw1-badge-yellow' : 'hw1-badge-red'}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="px-3 py-1 text-xs font-medium rounded-lg border border-hw1-blue text-hw1-blue hover:bg-hw1-blue hover:text-white transition-all">Editar</button>
                      {u.status !== 'ATIVO' && (
                        <button onClick={() => handleActivate(u)} className="px-3 py-1 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all">Ativar</button>
                      )}
                      <button onClick={() => handleDelete(u)} className="px-3 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all">Desativar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">Anterior</button>
        <span className="px-4 py-2 text-sm text-gray-600">Pagina {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={users.length < limit} className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">Proxima</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-hw1-navy">{editingId ? 'Editar Usuario' : 'Novo Usuario'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 text-xl leading-none" aria-label="Fechar">x</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Senha {editingId ? '(opcional para alterar)' : '*'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue" required={!editingId} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nivel de Acesso *</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                {editingId && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-hw1-blue">
                      <option value="ATIVO">ATIVO</option>
                      <option value="INATIVO">INATIVO</option>
                      <option value="DESLIGADO">DESLIGADO</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50" disabled={saving}>Cancelar</button>
                <button type="submit" className="hw1-btn-primary text-sm" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
