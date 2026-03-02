/**
 * k6 – Testes de Performance e Carga
 * Gestor Multiprojetos – Sprint 9
 *
 * Requisitos:
 *   • Tempo de resposta < 2s para consultas
 *   • Tempo de resposta < 5s para cálculos massivos
 *
 * Execução:  k6 run apps/backend/k6/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/* ── Métricas customizadas ── */
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const queryDuration = new Trend('query_duration');
const calcDuration = new Trend('calc_duration');

/* ── Opções ── */
export const options = {
  stages: [
    { duration: '10s', target: 5 },   // ramp-up
    { duration: '30s', target: 10 },   // carga sustentada
    { duration: '10s', target: 20 },   // pico
    { duration: '10s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% das requisições < 2s
    errors: ['rate<0.1'],               // < 10% de erros
    login_duration: ['p(95)<3000'],     // login < 3s
    query_duration: ['p(95)<2000'],     // consultas < 2s
    calc_duration: ['p(95)<5000'],      // cálculos < 5s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

/* ── Setup: obtém token JWT ── */
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: 'admin@sistema.com', password: 'Admin123!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const ok = check(loginRes, {
    'login status 200/201': (r) => r.status === 200 || r.status === 201,
  });

  if (!ok) {
    console.error(`Login falhou: ${loginRes.status} ${loginRes.body}`);
    return { token: '' };
  }

  const body = JSON.parse(loginRes.body);
  return { token: body.accessToken || body.access_token || '' };
}

/* ── Cenário principal ── */
export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  /* ─── 1. Health check ─── */
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { 'health 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(0.3);

  /* ─── 2. Login (autenticação) ─── */
  group('Autenticação', () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email: 'admin@sistema.com', password: 'Admin123!' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
    loginDuration.add(Date.now() - start);
    check(res, { 'auth 200': (r) => r.status === 200 || r.status === 201 });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 3. Listar projetos ─── */
  group('GET /projects', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/projects`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'projects 200': (r) => r.status === 200,
      'projects < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 4. Listar colaboradores ─── */
  group('GET /hr/colaboradores', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/hr/colaboradores`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'hr 200': (r) => r.status === 200,
      'hr < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 5. Listar calendários ─── */
  group('GET /calendario', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/calendario`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'calendario 200': (r) => r.status === 200,
      'calendario < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 6. Listar sindicatos ─── */
  group('GET /sindicatos', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/sindicatos`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'sindicatos 200': (r) => r.status === 200,
      'sindicatos < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 7. Calcular dias úteis ─── */
  group('GET /calendario/calcular/dias-uteis', () => {
    const start = Date.now();
    const res = http.get(
      `${BASE_URL}/calendario/calcular/dias-uteis?mes=6&ano=2026&estado=PR`,
      { headers },
    );
    calcDuration.add(Date.now() - start);
    check(res, {
      'dias-uteis 200': (r) => r.status === 200,
      'dias-uteis < 5s': (r) => r.timings.duration < 5000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 8. Despesas financeiras ─── */
  group('GET /financial/despesas', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/financial/despesas`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'despesas 200': (r) => r.status === 200,
      'despesas < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 9. Provisões financeiras ─── */
  group('GET /financial/provisoes', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/financial/provisoes`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'provisoes 200': (r) => r.status === 200,
      'provisoes < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 10. Índices financeiros ─── */
  group('GET /financial/indices', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/financial/indices`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'indices 200': (r) => r.status === 200,
      'indices < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 11. Histórico de operações ─── */
  group('GET /operations/mass-update/historico', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/operations/mass-update/historico?limit=10`, { headers });
    queryDuration.add(Date.now() - start);
    check(res, {
      'historico 200': (r) => r.status === 200,
      'historico < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(res.status >= 400);
  });

  sleep(0.3);

  /* ─── 11. Swagger docs ─── */
  group('GET /api/docs', () => {
    const res = http.get(`${BASE_URL}/api/docs`);
    check(res, { 'swagger 200': (r) => r.status === 200 });
    errorRate.add(res.status >= 400);
  });

  sleep(0.5);
}

/* ── Teardown ── */
export function teardown(data) {
  console.log('=== Performance Test Completo ===');
  console.log(`Token utilizado: ${data.token ? 'Sim' : 'Não'}`);
}
