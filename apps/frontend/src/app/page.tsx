'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  clearLocalAutoLoginSuppression,
  isLocalhost,
  shouldSkipLocalAutoLogin,
} from '@/services/localDev';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoginSuppressed, setAutoLoginSuppressed] = useState(false);
  const login = useAuthStore((state) => state.login);
  const loginLocalDev = useAuthStore((state) => state.loginLocalDev);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  // Auto-login em ambiente local (localhost)
  useEffect(() => {
    const autoLoginLocal = async () => {
      if (typeof window !== 'undefined' && isAuthenticated) {
        router.push('/dashboard');
        return;
      }

      if (isLocalhost() && shouldSkipLocalAutoLogin()) {
        setAutoLoginSuppressed(true);
        setLoading(false);
        return;
      }

      if (isLocalhost() && !isAuthenticated) {
        setLoading(true);
        try {
          clearLocalAutoLoginSuppression();
          await login('admin@sistema.com', 'Admin123!');
          router.push('/dashboard');
        } catch {
          clearLocalAutoLoginSuppression();
          loginLocalDev();
          router.push('/dashboard');
        }
      }
    };

    autoLoginLocal();
  }, [isAuthenticated, login, loginLocalDev, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      clearLocalAutoLoginSuppression();
      await login(email, password);
      router.push('/dashboard');
    } catch {
      setError('Email ou senha inválidos. Tente admin@sistema.com / Admin123!');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalReentry = () => {
    clearLocalAutoLoginSuppression();
    setAutoLoginSuppressed(false);
    setError('');
    setLoading(true);
    loginLocalDev();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--hw1-navy)' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col items-start justify-center w-1/2 px-16 py-20"
        style={{ background: 'linear-gradient(135deg, #050439 0%, #1E16A0 60%, #35277D 100%)' }}
      >
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-white text-3xl font-bold"
          style={{ background: 'linear-gradient(135deg, #E52287, #F70085)' }}
        >
          H
        </div>
        <h1 className="text-white text-4xl font-heading font-semibold leading-tight mb-4">
          Gestor<br />Multiprojetos
        </h1>
        <p className="text-white/60 text-base font-body max-w-sm">
          Plataforma integrada de gestão de projetos, recursos humanos e financeiro.
        </p>

        {/* Decorative teal line */}
        <div
          className="mt-10 h-1 w-20 rounded-full"
          style={{ background: 'linear-gradient(90deg, #00B3AD, #00DDD5)' }}
        />

        {/* Floating badge */}
        <div className="mt-8 flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            🏆 HW1 — Confederação Nacional da Indústria
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#F4F5F9]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #E52287, #F70085)' }}
            >
              H
            </div>
            <p className="text-hw1-navy font-heading font-semibold text-xl">
              Gestor Multiprojetos
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-hw1-lg p-8">
            <h2 className="text-2xl font-heading font-semibold text-hw1-navy mb-1">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Acesse com suas credenciais do sistema
            </p>

            {isLocalhost() && autoLoginSuppressed && (
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Sessão local encerrada. Se quiser voltar sem digitar credenciais, use a entrada local abaixo.
              </div>
            )}

            {isLocalhost() && autoLoginSuppressed && (
              <button
                type="button"
                onClick={handleLocalReentry}
                disabled={loading}
                className="mb-5 w-full rounded-xl border border-hw1-blue/20 bg-hw1-blue/5 py-3 text-sm font-semibold text-hw1-blue transition-all duration-200 disabled:opacity-60"
              >
                {loading ? 'Entrando...' : 'Entrar novamente em modo local'}
              </button>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-hw1-blue/30 focus:border-hw1-blue
                             text-sm transition-all disabled:bg-gray-50"
                  placeholder="admin@sistema.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-hw1-blue/30 focus:border-hw1-blue
                             text-sm transition-all disabled:bg-gray-50"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm
                           transition-all duration-200 disabled:opacity-60"
                style={{
                  background: loading
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #1E16A0, #35277D)',
                }}
              >
                {loading ? 'Entrando...' : 'Entrar no sistema'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-gray-500">
              admin@sistema.com · Admin123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

