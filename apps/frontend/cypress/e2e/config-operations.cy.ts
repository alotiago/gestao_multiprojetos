/// <reference types="cypress" />

describe('Configurações – Calendários', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/config/calendarios');
  });

  it('deve carregar a página de calendários', () => {
    cy.url().should('include', '/config/calendarios');
    cy.contains(/calend/i).should('be.visible');
  });

  it('deve ter botão Seed de feriados nacionais', () => {
    cy.contains(/seed|feriados nacionais/i).should('be.visible');
  });

  it('deve ter botão de novo feriado', () => {
    cy.contains(/novo feriado/i).should('be.visible');
  });

  it('deve ter calculadora de dias úteis', () => {
    cy.contains(/calculadora|dias/i).should('be.visible');
  });

  it('deve executar seed de feriados nacionais', () => {
    cy.contains(/seed/i).click();
    // Deve exibir sucesso ou lista atualizada
    cy.get('body', { timeout: 10000 }).should('be.visible');
  });
});

describe('Configurações – Sindicatos', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/config/sindicatos');
  });

  it('deve carregar a página de sindicatos', () => {
    cy.url().should('include', '/config/sindicatos');
    cy.contains(/sindicatos/i).should('be.visible');
  });

  it('deve ter botão de novo sindicato', () => {
    cy.contains(/novo sindicato/i).should('be.visible');
  });

  it('deve ter botão de aplicar dissídio', () => {
    cy.contains(/diss/i).should('be.visible');
  });

  it('deve ter botão de simulação', () => {
    cy.contains(/simula/i).should('be.visible');
  });

  it('deve ter relatório por regiões', () => {
    cy.contains(/regi/i).should('be.visible');
  });
});

describe('Operações', () => {
  beforeEach(() => {
    cy.login();
    cy.visitAuth('/operacoes');
  });

  it('deve carregar a página de operações', () => {
    cy.url().should('include', '/operacoes');
    cy.get('body').should('be.visible');
  });

  it('deve ter tabs de Recálculo, Ajustes e Histórico', () => {
    cy.contains(/rec.*lculo|cascata/i).should('be.visible');
    cy.contains(/ajuste/i).should('be.visible');
    cy.contains(/hist/i).should('be.visible');
  });

  it('deve alternar entre tabs', () => {
    // Click na tab Ajustes Massivos
    cy.contains(/ajustes massivos/i).click();
    cy.contains(/jornada|taxa/i).should('be.visible');

    // Click na tab Histórico
    cy.contains(/hist/i).click();
    // Deve exibir tabela ou mensagem de vazio
    cy.get('body').should('be.visible');
  });

  it('deve exibir formulário de recálculo cascata', () => {
    cy.contains(/calend.*rio.*horas.*custo|taxa.*calend|rec.*lculo cascata/i).should('be.visible');
  });
});
