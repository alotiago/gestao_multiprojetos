/**
 * @jest-environment jsdom
 */

/* ── mock de next/navigation ─────────────────────────────── */
const mockPush = jest.fn();
const mockPathname = '/config/calendarios';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => mockPathname,
}));

/* ── mock de api ─────────────────────────────────────────── */
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => jest.fn().mockResolvedValue({ data: {} })(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

/* ── mock authStore ──────────────────────────────────────── */
jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { name: 'Admin', email: 'admin@test.com' },
    logout: jest.fn(),
  }),
}));

/* ── imports ─────────────────────────────────────────────── */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';

/* helper: render + flush microtasks */
async function renderAsync(ui: React.ReactElement) {
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(ui);
  });
  return result!;
}

describe('Frontend Pages – Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: {} });
  });

  /* ────────── Calendários ────────── */
  describe('CalendariosPage', () => {
    it('deve renderizar titulo e botoes de acao', async () => {
      const Page = (await import('@/app/config/calendarios/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        expect(screen.getByText(/Calend.*rio de Feriados/)).toBeDefined();
        expect(screen.getByText(/Novo Feriado/)).toBeDefined();
        expect(screen.getByText(/Calculadora de Dias/)).toBeDefined();
      });
    });

    it('deve exibir mensagem vazia quando nao ha feriados', async () => {
      mockGet.mockResolvedValue({ data: [] });
      const Page = (await import('@/app/config/calendarios/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        expect(screen.getByText(/Nenhum feriado cadastrado/)).toBeDefined();
      });
    });
  });

  /* ────────── Sindicatos ────────── */
  describe('SindicatosPage', () => {
    it('deve renderizar titulo e botoes de acao', async () => {
      const Page = (await import('@/app/config/sindicatos/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        expect(screen.getByText('Sindicatos')).toBeDefined();
        expect(screen.getByText(/Novo Sindicato/)).toBeDefined();
        // usar regex para evitar problemas de encoding com acentos no JSDOM
        expect(screen.getByText(/Aplicar Diss/)).toBeDefined();
        expect(screen.getByText(/Simula/)).toBeDefined();
      });
    });
  });

  /* ────────── Operações ────────── */
  describe('OperacoesPage', () => {
    it('deve renderizar titulo e tabs', async () => {
      const Page = (await import('@/app/operacoes/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        // titulo h1
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeDefined();
        // tab buttons (getAllByText porque a tab ativa duplica texto no conteúdo)
        expect(screen.getAllByText(/Rec.*lculo Cascata/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Ajustes Massivos/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Hist.*rico/).length).toBeGreaterThan(0);
      });
    });

    it('deve exibir form de recalculo cascata por padrao', async () => {
      const Page = (await import('@/app/operacoes/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        expect(screen.getByText(/Rec.*lculo em Cascata.*TAXA/)).toBeDefined();
        expect(screen.getByText(/Executar Rec.*lculo Cascata/)).toBeDefined();
      });
    });
  });

  /* ────────── Config ────────── */
  describe('ConfigPage', () => {
    it('deve renderizar cards de navegacao', async () => {
      const Page = (await import('@/app/config/page')).default;
      await renderAsync(<Page />);
      await waitFor(() => {
        expect(screen.getByText(/Configura/)).toBeDefined();
        expect(screen.getByText(/Calend.*rio de Feriados/)).toBeDefined();
        expect(screen.getByText('Sindicatos')).toBeDefined();
        expect(screen.getByText(/ndices Financeiros/)).toBeDefined();
      });
    });
  });
});
