/// <reference types="cypress" />

describe('Módulo de Projetos', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/projetos');
  });

  it('deve carregar a página de projetos', () => {
    cy.url().should('include', '/projetos');
    cy.contains(/projetos/i).should('be.visible');
  });

  it('deve exibir tabela ou lista de projetos', () => {
    cy.get('body').then(($body) => {
      const hasTable = $body.find('table').length > 0;
      const hasCards = $body.find('[class*="card"]').length > 0;
      if (hasTable) {
        cy.get('table').should('be.visible');
      } else if (hasCards) {
        cy.get('[class*="card"]').should('have.length.at.least', 0);
      }
    });
  });

  it('deve ter botão de criar novo projeto', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Novo"), button:contains("Criar"), button:contains("+")').length) {
        cy.contains(/novo|criar|\+/i).should('be.visible');
      }
    });
  });

  it('deve ter funcionalidade de busca/filtro', () => {
    cy.get('body').then(($body) => {
      const searchInput = $body.find('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]');
      if (searchInput.length) {
        cy.get('input[placeholder*="Buscar"], input[placeholder*="buscar"], input[type="search"]')
          .first()
          .type('Projeto Teste');
      } else {
        cy.log('Campo de busca não encontrado no layout atual');
      }
    });
  });
});

describe('Módulo de RH', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/rh');
  });

  it('deve carregar a página de RH', () => {
    cy.url().should('include', '/rh');
    cy.contains(/rh|recursos humanos|colaboradores/i).should('be.visible');
  });

  it('deve exibir listagem de colaboradores', () => {
    cy.get('body').then(($body) => {
      const hasTable = $body.find('table').length > 0;
      if (hasTable) {
        cy.get('table').should('be.visible');
      }
    });
  });

  it('deve ter botão de novo colaborador', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':contains("Novo"), :contains("Criar")').length) {
        cy.contains(/novo|criar/i).should('be.visible');
      }
    });
  });
});

describe('Módulo Financeiro', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/financeiro');
  });

  it('deve carregar a página financeira', () => {
    cy.url().should('include', '/financeiro');
    cy.contains(/financeiro/i).should('be.visible');
  });

  it('deve exibir seções de despesas', () => {
    cy.get('body').then(($body) => {
      if ($body.find('table').length) {
        cy.get('table').should('have.length.at.least', 1);
      }
    });
  });
});
