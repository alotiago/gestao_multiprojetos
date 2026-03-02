/// <reference types="cypress" />

describe('Autenticação', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('deve exibir tela de login quando não autenticado', () => {
    // A página raiz é o formulário de login
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
    // Deve exibir inputs de email e senha
    cy.get('input').should('have.length.at.least', 2);
  });

  it('deve fazer login com credenciais válidas', () => {
    // Preenche formulário de login
    cy.get('input[type="email"], input[name="email"], input[placeholder*="@"]').first().clear().type('admin@sistema.com');
    cy.get('input[type="password"], input[name="password"]').first().clear().type('Admin123!');
    cy.get('button[type="submit"]').click();
    // Deve redirecionar ao dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });

  it('deve rejeitar credenciais inválidas', () => {
    cy.get('input[type="email"], input[name="email"], input[placeholder*="@"]').first().clear().type('invalido@test.com');
    cy.get('input[type="password"], input[name="password"]').first().clear().type('senhaerrada');
    cy.get('button[type="submit"]').click();
    // Deve permanecer na página de login (NÃO redirecionar ao dashboard)
    cy.wait(3000);
    cy.url().should('not.include', '/dashboard');
    // Deve exibir algum feedback de erro (div vermelha ou texto)
    cy.get('body').then(($body) => {
      const hasErrorDiv = $body.find('div[class*="red"], [class*="error"], [role="alert"]').length > 0;
      const hasErrorText = $body.text().match(/inv.*lid|erro|falh/i);
      expect(hasErrorDiv || hasErrorText).to.be.ok;
    });
  });
});
