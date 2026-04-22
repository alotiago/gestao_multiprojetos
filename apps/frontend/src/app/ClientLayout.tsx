'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { suppressLocalAutoLogin } from '@/services/localDev';

const navItems = [
  { href: '/cockpit', label: 'Cockpit do Sócio', icon: '🎯', section: 'Cockpit' },
  { href: '/cockpit/status-reports', label: 'Status Reports', icon: '🚦', sub: true, section: 'Cockpit' },
  { href: '/cockpit/go-lives', label: 'Pipeline Go-Live', icon: '🚀', sub: true, section: 'Cockpit' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', section: 'Gestão' },
  { href: '/projetos', label: 'Projetos', icon: '📁', section: 'Gestão' },
  { href: '/contratos', label: 'Contratos', icon: '📑', section: 'Gestão' },
  { href: '/rh', label: 'Recursos Humanos', icon: '👥', section: 'Gestão' },
  { href: '/financeiro', label: 'Financeiro', icon: '💰', section: 'Gestão' },
  { href: '/relatorios/contratos-dashboard', label: 'Relatórios', icon: '📈', section: 'Gestão' },
  { href: '/operacoes', label: 'Operações', icon: '🔄', section: 'Gestão' },
  { href: '/config', label: 'Configurações', icon: '⚙️', section: 'Admin' },
];

const navSections = ['Cockpit', 'Gestão', 'Admin'] as const;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    suppressLocalAutoLogin();
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const showExpanded = sidebarOpen || mobileNavOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,179,173,0.10),_transparent_28%),linear-gradient(180deg,#F6F8FC_0%,#EEF1F7_100%)]">
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
        role="navigation"
        aria-label="Navegação principal"
        className={`fixed inset-y-3 left-3 z-40 flex flex-col overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_80px_rgba(5,4,57,0.35)] transition-all duration-300 lg:static lg:z-auto lg:m-4 lg:mr-0 ${
          mobileNavOpen ? 'translate-x-0 w-[292px]' : '-translate-x-full w-[292px]'
        } ${sidebarOpen ? 'lg:w-[272px]' : 'lg:w-[84px]'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #050439 0%, #0B0A56 38%, #141179 72%, #0A8F92 100%)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg shadow-[0_10px_24px_rgba(229,34,135,0.35)]"
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
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 mt-1 truncate">
                Painel Operacional
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto px-2">
          {navSections.map((section) => (
            <div key={section} className="mb-5">
              {showExpanded && (
                <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.16em] text-cyan-100/70 font-semibold">
                  {section}
                </p>
              )}
              {navItems.filter((item) => item.section === section).map((item) => {
                const isSub = 'sub' in item && (item as any).sub;
                const active = isSub
                  ? pathname === item.href
                  : pathname === item.href || (pathname.startsWith(item.href + '/') && !navItems.some(n => n !== item && n.href.startsWith(item.href + '/') && pathname.startsWith(n.href)));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 ${isSub ? 'px-4 pl-8' : 'px-4'} py-3 mx-2 rounded-2xl mb-1 transition-all duration-150 group ${
                      active
                        ? '!text-white shadow-[0_14px_30px_rgba(10,15,70,0.28)]'
                        : '!text-white/90 hover:!text-white hover:bg-white/10'
                    }`}
                    style={active ? { background: isSub ? 'linear-gradient(90deg, rgba(0,151,146,0.40), rgba(0,179,173,0.24))' : 'linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))', border: '1px solid rgba(255,255,255,0.10)' } : {}}
                    title={!showExpanded ? item.label : undefined}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {active && <span className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-hw1-cyan shadow-[0_0_12px_rgba(0,221,213,0.8)]" />}
                    <span aria-hidden="true" className={`${isSub ? 'text-sm' : 'text-base'} flex-shrink-0 ${active ? 'scale-105' : ''} transition-transform`}>{item.icon}</span>
                    {showExpanded && (
                      <span className={`${isSub ? 'text-xs' : 'text-sm'} font-medium tracking-[0.01em] truncate`}>{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User area */}
        {showExpanded && (
          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3 rounded-2xl bg-white/6 px-3 py-3 border border-white/10">
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
              className="w-full text-left text-white/70 hover:text-white text-xs px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:block p-3 text-white/40 hover:text-white hover:bg-white/10 transition-colors self-end m-2 rounded-2xl"
          aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white/86 backdrop-blur-xl border-b border-white/70 flex items-center px-4 lg:px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl border border-gray-200 text-hw1-navy flex items-center justify-center shadow-sm"
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
              className="text-xs px-3 py-1.5 rounded-full font-medium text-white shadow-[0_10px_24px_rgba(30,22,160,0.22)]"
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
