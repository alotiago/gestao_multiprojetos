/**
 * Cockpit do Sócio — API Service
 *
 * Consome o endpoint real GET /dashboard/cockpit?ano=YYYY
 */

import api from './api';

// ─── Types ──────────────────────────────────────────────────────────────

export interface BigNumber {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  meta?: string;
  type: 'currency' | 'percent' | 'number';
  variant: 'default' | 'success' | 'danger' | 'warning';
  icon: string;
}

export type StatusColor = 'green' | 'yellow' | 'red';

export interface StatusUpdate {
  date: string;
  text: string;
}

export interface FteMensalPoint {
  mes: number;
  label: string;
  fte: number;
}

export interface LinhaSaldo {
  id: string;
  descricaoItem: string;
  unidade: string;
  valorTotalAnual: number;
  saldoQuantidade: number;
  saldoValor: number;
}

export interface ObjetoSaldo {
  id: string;
  nome: string;
  descricao: string;
  saldoValor: number;
  linhas: LinhaSaldo[];
}

export interface PortfolioProject {
  id: string;
  nome: string;
  status: StatusColor;
  margem: number;
  gargalo: string;
  acaoCLevel: string;
  detalheGargalo: string;
  statusUpdates: StatusUpdate[];
  contratoNome: string;
  saldoContratual: number;
  saldoLinhas: number;
  fteAtual: number;
  fteMensal: FteMensalPoint[];
  objetos: ObjetoSaldo[];
}

export interface BurnRatePoint {
  mes: string;
  receita: number;
  custos: number;
  projetado: boolean;
}

export interface GoLiveProject {
  id: string;
  cliente: string;
  dataGoLive: string;
  atrasado: boolean;
}

export interface GoLiveData {
  proximos30: GoLiveProject[];
  proximos60: GoLiveProject[];
}

export interface CockpitInsights {
  fteMensal: FteMensalPoint[];
  contratos: Array<{
    id: string;
    nomeContrato: string;
    cliente: string;
    saldoContratual: number;
    saldoLinhas: number;
    objetos: ObjetoSaldo[];
  }>;
  saldoContratualTotal: number;
  saldoLinhasTotal: number;
}

// ─── Cached cockpit data ────────────────────────────────────────────────

interface CockpitResponse {
  bigNumbers: BigNumber[];
  portfolio: PortfolioProject[];
  burnRate: BurnRatePoint[];
  goLive: GoLiveData;
  insights: CockpitInsights;
}

let _cache: CockpitResponse | null = null;

async function fetchCockpit(): Promise<CockpitResponse> {
  if (_cache) return _cache;
  const ano = new Date().getFullYear();
  const res = await api.get(`/dashboard/cockpit?ano=${ano}`);
  _cache = res.data;
  return _cache!;
}

/** Limpa o cache para forçar recarregamento */
export function invalidateCockpitCache() {
  _cache = null;
}

// ─── API Functions ──────────────────────────────────────────────────────

export async function fetchBigNumbers(): Promise<BigNumber[]> {
  const data = await fetchCockpit();
  return data.bigNumbers;
}

export async function fetchPortfolio(): Promise<PortfolioProject[]> {
  const data = await fetchCockpit();
  return data.portfolio;
}

export async function fetchBurnRate(): Promise<BurnRatePoint[]> {
  const data = await fetchCockpit();
  return data.burnRate;
}

export async function fetchGoLive(): Promise<GoLiveData> {
  const data = await fetchCockpit();
  return data.goLive;
}

export async function fetchCockpitInsights(): Promise<CockpitInsights> {
  const data = await fetchCockpit();
  return data.insights;
}
