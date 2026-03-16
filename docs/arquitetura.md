# Arquitetura do Sistema

> **Status:** Em definição  
> **Última atualização:** 2026-03

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Princípios Arquiteturais](#princípios-arquiteturais)
- [Diagrama de Contexto](#diagrama-de-contexto)
- [Componentes Principais](#componentes-principais)
- [Modelo de Dados](#modelo-de-dados)
- [Decisões Técnicas](#decisões-técnicas)
- [Segurança](#segurança)
- [Escalabilidade](#escalabilidade)

---

## 🗺️ Visão Geral

O **Gestão de Multiprojetos** seguirá uma arquitetura orientada a serviços com separação clara entre as camadas de apresentação, negócio e dados.

O sistema será composto por:

- **API back-end** — responsável pelas regras de negócio e acesso a dados.
- **Interface web (front-end)** — responsável pela experiência do usuário.
- **Banco de dados relacional** — armazenamento persistente de projetos, tarefas, usuários e recursos.
- **Sistema de filas (opcional)** — processamento assíncrono de notificações e relatórios.

---

## 🎯 Princípios Arquiteturais

| Princípio | Descrição |
|---|---|
| **Separação de responsabilidades** | Cada módulo tem uma responsabilidade bem definida |
| **API-first** | Toda a lógica de negócio é exposta via API, permitindo múltiplos clientes |
| **Segurança por padrão** | Autenticação e autorização em todas as rotas sensíveis |
| **Observabilidade** | Logs estruturados, métricas e rastreamento para monitoramento em produção |
| **Testabilidade** | Código escrito para facilitar testes unitários e de integração |
| **Escalabilidade horizontal** | Componentes stateless para permitir escalabilidade |

---

## 🔷 Diagrama de Contexto

```
┌─────────────────────────────────────────────────────────┐
│                    Gestão de Multiprojetos               │
│                                                         │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │   Front-end  │────▶│          API REST             │  │
│  │  (Browser)   │◀────│       (Back-end)              │  │
│  └──────────────┘     └──────────────┬───────────────┘  │
│                                      │                   │
│                       ┌──────────────▼───────────────┐  │
│                       │      Banco de Dados           │  │
│                       │      (Relacional)             │  │
│                       └──────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                                     │
         ▼                                     ▼
   Usuários/Gestores               Integrações externas
   (via Browser)                  (e-mail, calendário)
```

---

## 🧩 Componentes Principais

### Módulo de Autenticação e Autorização
- Registro e login de usuários
- Gerenciamento de sessões (JWT ou similar)
- Controle de acesso baseado em papéis (RBAC)
  - **Administrador:** acesso total ao sistema
  - **Gestor de Portfólio:** visualiza e gerencia todos os projetos
  - **Gerente de Projeto:** gerencia seu(s) projeto(s) específico(s)
  - **Membro da Equipe:** acessa e atualiza tarefas atribuídas

### Módulo de Projetos
- CRUD de projetos
- Definição de escopo, prazo, orçamento e status
- Histórico de alterações por projeto
- Vinculação de equipes e recursos

### Módulo de Tarefas
- CRUD de tarefas vinculadas a projetos
- Atribuição de responsáveis
- Definição de prioridade, prazo e estimativa de esforço
- Rastreamento de status e progresso

### Módulo de Equipes e Recursos
- Cadastro de membros da equipe
- Alocação de recursos por projeto
- Monitoramento de carga de trabalho

### Módulo de Dashboard e Relatórios
- Painel com visão do portfólio de projetos
- KPIs: percentual de conclusão, projetos em risco, tarefas atrasadas
- Exportação de relatórios (PDF, CSV)

### Módulo de Notificações
- Alertas por e-mail sobre prazos e mudanças de status
- Notificações in-app (tempo real)

---

## 🗃️ Modelo de Dados

> O modelo de dados será detalhado durante a fase de design. Abaixo está a proposta inicial das entidades principais.

### Entidades Principais

```
Usuario
├── id (UUID)
├── nome
├── email (único)
├── senha_hash
├── papel (admin | gestor_portfolio | gerente_projeto | membro)
├── criado_em
└── atualizado_em

Projeto
├── id (UUID)
├── nome
├── descricao
├── status (planejamento | ativo | pausado | concluido | cancelado)
├── data_inicio
├── data_fim_prevista
├── orcamento
├── gerente_id (FK -> Usuario)
├── criado_em
└── atualizado_em

Tarefa
├── id (UUID)
├── projeto_id (FK -> Projeto)
├── titulo
├── descricao
├── status (pendente | em_andamento | em_revisao | concluida)
├── prioridade (baixa | media | alta | critica)
├── responsavel_id (FK -> Usuario)
├── data_vencimento
├── esforco_estimado (horas)
├── criado_em
└── atualizado_em

Recurso
├── id (UUID)
├── nome
├── tipo (humano | material | financeiro)
├── disponibilidade
└── criado_em

AlocacaoRecurso
├── id (UUID)
├── projeto_id (FK -> Projeto)
├── recurso_id (FK -> Recurso)
├── percentual_alocacao
├── data_inicio
└── data_fim

Risco
├── id (UUID)
├── projeto_id (FK -> Projeto)
├── descricao
├── probabilidade (baixa | media | alta)
├── impacto (baixo | medio | alto)
├── plano_mitigacao
├── status (identificado | mitigado | ocorrido | encerrado)
└── criado_em
```

---

## 🏗️ Decisões Técnicas

As decisões técnicas serão registradas nesta seção como **ADRs (Architecture Decision Records)**.

### ADR-001: Estilo Arquitetural

| Campo | Valor |
|---|---|
| **Data** | A definir |
| **Status** | Proposto |
| **Decisão** | A definir — monolito modular ou microserviços |
| **Justificativa** | Avaliar complexidade, tamanho da equipe e necessidades de escala |

### ADR-002: Stack Tecnológico

| Campo | Valor |
|---|---|
| **Data** | A definir |
| **Status** | Proposto |
| **Decisão** | A definir |
| **Justificativa** | Definir com base em familiaridade da equipe e requisitos do projeto |

---

## 🔒 Segurança

- Senhas armazenadas com hash seguro (bcrypt ou similar)
- Comunicação via HTTPS obrigatória em produção
- Tokens de autenticação com expiração e renovação
- Proteção contra ataques comuns: SQL Injection, XSS, CSRF
- Rate limiting nas rotas públicas da API
- Auditoria de ações críticas (logs de auditoria)

---

## 📈 Escalabilidade

- Componentes da API sem estado (stateless) para escalabilidade horizontal
- Cache de consultas frequentes (Redis ou similar)
- Paginação em todas as listagens da API
- Processamento assíncrono para operações pesadas (geração de relatórios, envio de e-mails)
