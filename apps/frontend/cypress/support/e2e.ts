/// <reference types="cypress" />

/* ── Comandos customizados ── */

/**
 * Faz login via API e armazena o token para uso posterior em visitAuth().
 */
Cypress.Commands.add('login', (email = 'admin@sistema.com', password = 'Admin123!') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL') || 'http://localhost:3001'}/auth/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((resp) => {
    if (resp.status === 200 || resp.status === 201) {
      const token = resp.body.accessToken || resp.body.access_token || resp.body.token;
      const user = resp.body.user || { id: '1', email, name: 'Admin', role: 'ADMIN' };
      Cypress.env('_authToken', token);
      Cypress.env('_authUser', user);
    }
  });
});

/**
 * Visita uma URL injetando auth no localStorage ANTES do JS da página carregar.
 * Isso garante que o Zustand persist já encontre o estado autenticado.
 */
Cypress.Commands.add('visitAuth', (url: string) => {
  const token = Cypress.env('_authToken');
  const user = Cypress.env('_authUser');
  cy.visit(url, {
    failOnStatusCode: false,
    onBeforeLoad(win) {
      if (token) {
        win.localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token,
            user,
            isAuthenticated: true,
          },
          version: 0,
        }));
        win.localStorage.setItem('auth-token', token);
      }
    },
  });
});

/**
 * Limpa sessão
 */
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.visit('/');
});

/* ── Types ── */
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      visitAuth(url: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}

export {};
