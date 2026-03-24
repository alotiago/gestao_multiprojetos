'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/cockpit', label: 'Cockpit do Sócio', icon: '🎯' },
  { href: '/cockpit/status-reports', label: 'Status Reports', icon: '🚦', sub: true },
  { href: '/cockpit/go-lives', label: 'Pipeline Go-Live', icon: '🚀', sub: true },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/projetos', label: 'Projetos', icon: '📁' },
  { href: '/contratos', label: 'Contratos', icon: '📑' },
  { href: '/rh', label: 'Recursos Humanos', icon: '👥' },
  { href: '/financeiro', label: 'Financeiro', icon: '💰' },
  { href: '/relatorios/contratos-dashboard', label: 'Relatórios', icon: '📈' },
  { href: '/operacoes', label: 'Operações', icon: '🔄' },
  { href: '/unidades', label: 'Unidades', icon: '🏢' },
  { href: '/config', label: 'Configurações', icon: '⚙️' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const showExpanded = sidebarOpen || mobileNavOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F5F9]">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-[#050439]/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 lg:static lg:z-auto ${
          mobileNavOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]'
        } ${sidebarOpen ? 'lg:w-[260px]' : 'lg:w-[72px]'} lg:translate-x-0`}
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
          {showExpanded && (
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
            const isSub = 'sub' in item && (item as any).sub;
            const active = isSub
              ? pathname === item.href
              : pathname === item.href || (pathname.startsWith(item.href + '/') && !navItems.some(n => n !== item && n.href.startsWith(item.href + '/') && pathname.startsWith(n.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 ${isSub ? 'px-4 pl-8' : 'px-4'} py-2.5 mx-2 rounded-xl mb-0.5 transition-all duration-150 group ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                style={active ? { background: isSub ? 'rgba(30, 22, 160, 0.5)' : 'rgba(30, 22, 160, 0.8)' } : {}}
                title={!showExpanded ? item.label : undefined}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className={`${isSub ? 'text-sm' : 'text-base'} flex-shrink-0`}>{item.icon}</span>
                {showExpanded && (
                  <span className={`${isSub ? 'text-xs' : 'text-sm'} font-medium truncate`}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {showExpanded && (
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
          className="hidden lg:block p-3 text-white/40 hover:text-white hover:bg-white/10 transition-colors self-end m-2 rounded-lg"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 text-hw1-navy flex items-center justify-center"
              aria-label="Abrir menu"
            >
              ☰
            </button>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
