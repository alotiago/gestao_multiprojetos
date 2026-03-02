'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/projetos', label: 'Projetos', icon: '📁' },
  { href: '/rh', label: 'Recursos Humanos', icon: '👥' },
  { href: '/financeiro', label: 'Financeiro', icon: '💰' },
  { href: '/operacoes', label: 'Operações', icon: '🔄' },
  { href: '/unidades', label: 'Unidades', icon: '🏢' },
  { href: '/config', label: 'Configurações', icon: '⚙️' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F9]">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        }`}
        style={{ background: 'var(--hw1-navy)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #E52287, #F70085)' }}
          >
            H
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-heading font-semibold text-sm leading-tight truncate">
                Gestor
              </p>
              <p className="text-hw1-cyan text-xs font-secondary truncate">
                Multiprojetos
              </p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-150 group ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                style={active ? { background: 'rgba(30, 22, 160, 0.8)' } : {}}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00B3AD, #00DDD5)' }}
              >
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name ?? 'Usuário'}</p>
                <p className="text-white/50 text-xs truncate">{user?.email ?? ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left text-white/60 hover:text-white text-xs px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 text-white/40 hover:text-white hover:bg-white/10 transition-colors self-end m-2 rounded-lg"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-base font-heading font-semibold text-hw1-navy">
              {navItems.find((n) => pathname.startsWith(n.href))?.label ?? 'Início'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="text-xs px-3 py-1 rounded-full font-medium text-white"
              style={{ background: 'linear-gradient(90deg, #1E16A0, #35277D)' }}
            >
              HW1 Sistema
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
