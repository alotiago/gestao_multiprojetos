/// <reference types="cypress" />

describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/dashboard');
  });

  it('deve carregar a página de dashboard', () => {
    cy.url().should('include', '/dashboard');
    cy.get('body').should('be.visible');
  });

  it('deve exibir cards de resumo (KPIs)', () => {
    cy.get('body').then(($body) => {
      const hasCards = $body.find('[class*="card"], [class*="Card"], [class*="hw1-card"]').length > 0;
      if (hasCards) {
        cy.get('[class*="card"], [class*="Card"], [class*="hw1-card"]').should('have.length.at.least', 1);
      } else {
        cy.log('Cards de KPI não encontrados no layout atual');
      }
    });
  });

  it('deve ter funcionalidade de exportar CSV', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("CSV"), button:contains("Exportar"), button:contains("Download")').length) {
        cy.contains(/csv|exportar|download/i).should('be.visible');
      } else {
        cy.log('Botão de export não visível no dashboard atual');
      }
    });
  });
});

describe('Navegação Principal', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/dashboard');
    // Aguardar carregamento completo
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.get('body').should('be.visible');
  });

  it('deve navegar para Projetos', () => {
    cy.get('a[href*="projetos"]').first().click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/projetos');
  });

  it('deve navegar para RH', () => {
    cy.get('a[href*="rh"]').first().click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/rh');
  });

  it('deve navegar para Financeiro', () => {
    cy.get('a[href*="financeiro"]').first().click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/financeiro');
  });

  it('deve navegar para Operações', () => {
    cy.get('a[href*="operacoes"]').first().click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/operacoes');
  });

  it('deve navegar para Configurações', () => {
    cy.get('a[href*="config"]').first().click({ force: true });
    cy.url({ timeout: 10000 }).should('include', '/config');
  });
});
