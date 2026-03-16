# Requisitos do Sistema

> **Versão:** 1.0  
> **Status:** Em revisão  
> **Última atualização:** 2026-03

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Partes Interessadas](#partes-interessadas)
- [Requisitos Funcionais](#requisitos-funcionais)
- [Requisitos Não Funcionais](#requisitos-não-funcionais)
- [Regras de Negócio](#regras-de-negócio)
- [Restrições](#restrições)
- [Casos de Uso Principais](#casos-de-uso-principais)

---

## 🗺️ Visão Geral

O **Gestão de Multiprojetos** deve prover uma plataforma web para que organizações possam gerenciar múltiplos projetos de forma centralizada, acompanhando o progresso, recursos e riscos de cada projeto e do portfólio como um todo.

---

## 👥 Partes Interessadas

| Parte Interessada | Papel | Necessidades Principais |
|---|---|---|
| **Gestor de Portfólio** | Supervisiona todos os projetos | Visão consolidada, KPIs, relatórios executivos |
| **Gerente de Projeto** | Gerencia projetos específicos | Gestão de tarefas, equipe, prazos e riscos |
| **Membro da Equipe** | Executa tarefas dos projetos | Ver tarefas atribuídas, atualizar status, colaborar |
| **Administrador do Sistema** | Configura e mantém o sistema | Gerenciar usuários, papéis e configurações |

---

## ✅ Requisitos Funcionais

### RF-01: Autenticação e Controle de Acesso

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01.1 | O sistema deve permitir que usuários se cadastrem com nome, e-mail e senha | Alta |
| RF-01.2 | O sistema deve autenticar usuários via e-mail e senha | Alta |
| RF-01.3 | O sistema deve implementar recuperação de senha por e-mail | Alta |
| RF-01.4 | O sistema deve oferecer diferentes níveis de acesso: Administrador, Gestor de Portfólio, Gerente de Projeto e Membro da Equipe | Alta |
| RF-01.5 | O sistema deve encerrar sessões inativas após período configurável | Média |

### RF-02: Gestão de Projetos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-02.1 | O sistema deve permitir criar projetos com nome, descrição, datas e orçamento | Alta |
| RF-02.2 | O sistema deve permitir editar e excluir projetos | Alta |
| RF-02.3 | O sistema deve permitir definir o status do projeto: Planejamento, Ativo, Pausado, Concluído, Cancelado | Alta |
| RF-02.4 | O sistema deve registrar o histórico de alterações de cada projeto | Média |
| RF-02.5 | O sistema deve permitir vincular documentos e anexos a projetos | Baixa |
| RF-02.6 | O sistema deve exibir alertas quando projetos estiverem com prazo em risco | Alta |

### RF-03: Gestão de Tarefas

| ID | Requisito | Prioridade |
|---|---|---|
| RF-03.1 | O sistema deve permitir criar tarefas vinculadas a projetos | Alta |
| RF-03.2 | O sistema deve permitir atribuir tarefas a membros da equipe | Alta |
| RF-03.3 | O sistema deve permitir definir prioridade, prazo e estimativa de esforço | Alta |
| RF-03.4 | O sistema deve permitir atualizar o status das tarefas | Alta |
| RF-03.5 | O sistema deve permitir adicionar comentários às tarefas | Média |
| RF-03.6 | O sistema deve notificar responsáveis sobre tarefas atribuídas ou alteradas | Média |
| RF-03.7 | O sistema deve permitir dependências entre tarefas | Baixa |

### RF-04: Gestão de Equipes e Recursos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-04.1 | O sistema deve permitir cadastrar membros da equipe por projeto | Alta |
| RF-04.2 | O sistema deve permitir definir o papel de cada membro no projeto | Alta |
| RF-04.3 | O sistema deve exibir a carga de trabalho atual de cada recurso | Média |
| RF-04.4 | O sistema deve alertar sobre superalocação de recursos | Média |
| RF-04.5 | O sistema deve permitir registrar recursos materiais e orçamentários | Baixa |

### RF-05: Dashboard e Relatórios

| ID | Requisito | Prioridade |
|---|---|---|
| RF-05.1 | O sistema deve oferecer um dashboard com visão geral do portfólio | Alta |
| RF-05.2 | O dashboard deve exibir: total de projetos, projetos em risco, projetos concluídos | Alta |
| RF-05.3 | O sistema deve permitir filtrar projetos por status, período e responsável | Alta |
| RF-05.4 | O sistema deve gerar relatório de progresso por projeto | Alta |
| RF-05.5 | O sistema deve permitir exportar relatórios em PDF e CSV | Média |
| RF-05.6 | O sistema deve exibir cronograma visual (Gantt) por projeto | Média |

### RF-06: Gestão de Riscos

| ID | Requisito | Prioridade |
|---|---|---|
| RF-06.1 | O sistema deve permitir registrar riscos por projeto | Alta |
| RF-06.2 | O sistema deve permitir classificar riscos por probabilidade e impacto | Alta |
| RF-06.3 | O sistema deve permitir registrar planos de mitigação para cada risco | Alta |
| RF-06.4 | O sistema deve exibir matriz de riscos por projeto | Média |

### RF-07: Notificações

| ID | Requisito | Prioridade |
|---|---|---|
| RF-07.1 | O sistema deve enviar notificações por e-mail para eventos críticos | Alta |
| RF-07.2 | O sistema deve exibir notificações in-app em tempo real | Média |
| RF-07.3 | O sistema deve permitir que usuários configurem suas preferências de notificação | Baixa |

---

## ⚙️ Requisitos Não Funcionais

### RNF-01: Desempenho

| ID | Requisito |
|---|---|
| RNF-01.1 | Páginas devem carregar em menos de 3 segundos em condições normais de rede |
| RNF-01.2 | A API deve responder em menos de 500ms para 95% das requisições |
| RNF-01.3 | O sistema deve suportar ao menos 100 usuários simultâneos na versão inicial |

### RNF-02: Segurança

| ID | Requisito |
|---|---|
| RNF-02.1 | Toda comunicação deve ser protegida por HTTPS/TLS |
| RNF-02.2 | Senhas devem ser armazenadas com hash seguro (bcrypt, Argon2 ou equivalente) |
| RNF-02.3 | O sistema deve registrar logs de auditoria de ações críticas |
| RNF-02.4 | O sistema deve estar protegido contra as vulnerabilidades do OWASP Top 10 |
| RNF-02.5 | Sessões devem expirar após período de inatividade |

### RNF-03: Usabilidade

| ID | Requisito |
|---|---|
| RNF-03.1 | A interface deve ser responsiva e funcionar em dispositivos móveis, tablets e desktops |
| RNF-03.2 | A interface deve seguir boas práticas de acessibilidade (WCAG 2.1 AA) |
| RNF-03.3 | O sistema deve ter interface em português brasileiro |

### RNF-04: Confiabilidade

| ID | Requisito |
|---|---|
| RNF-04.1 | O sistema deve ter disponibilidade de 99,5% (uptime) |
| RNF-04.2 | O sistema deve realizar backups automáticos dos dados |
| RNF-04.3 | O sistema deve ser capaz de se recuperar de falhas sem perda de dados |

### RNF-05: Manutenibilidade

| ID | Requisito |
|---|---|
| RNF-05.1 | O código deve ter cobertura de testes de ao menos 80% |
| RNF-05.2 | O código deve seguir padrões e convenções definidos no guia de desenvolvimento |
| RNF-05.3 | O sistema deve ter logs detalhados para facilitar a identificação de erros |

---

## 📏 Regras de Negócio

| ID | Regra |
|---|---|
| RN-01 | Um projeto deve ter exatamente um Gerente de Projeto responsável |
| RN-02 | Somente Administradores podem excluir projetos definitivamente |
| RN-03 | Membros da Equipe só podem visualizar e atualizar tarefas dos projetos aos quais estão alocados |
| RN-04 | Um projeto não pode ser marcado como Concluído enquanto houver tarefas em aberto |
| RN-05 | A data de fim do projeto não pode ser anterior à data de início |
| RN-06 | Um risco de impacto Alto com probabilidade Alta deve gerar alerta automático ao Gerente do Projeto |
| RN-07 | A alocação total de um recurso humano não pode exceder 100% da sua disponibilidade |

---

## 🚧 Restrições

- O sistema deve ser desenvolvido como aplicação web acessível via browser.
- O sistema deve operar inicialmente em português brasileiro.
- O orçamento e prazo de desenvolvimento serão definidos com os stakeholders.
- Integrações com ferramentas externas (Google Calendar, Jira, etc.) são fora de escopo na versão inicial.

---

## 📌 Casos de Uso Principais

### UC-01: Criar um Novo Projeto

**Ator:** Gestor de Portfólio ou Administrador  
**Pré-condição:** Usuário autenticado  
**Fluxo Principal:**
1. Usuário acessa o menu "Projetos" e seleciona "Novo Projeto"
2. Preenche nome, descrição, data de início, data de fim prevista, orçamento e seleciona o Gerente de Projeto
3. Confirma a criação
4. Sistema salva o projeto com status "Planejamento" e exibe a página do projeto

**Fluxo Alternativo:**
- Se campos obrigatórios não forem preenchidos, o sistema exibe mensagens de validação

---

### UC-02: Acompanhar o Dashboard do Portfólio

**Ator:** Gestor de Portfólio  
**Pré-condição:** Usuário autenticado com papel de Gestor de Portfólio  
**Fluxo Principal:**
1. Usuário acessa o Dashboard
2. Sistema exibe visão consolidada com total de projetos, KPIs de progresso e alertas de risco
3. Usuário pode filtrar por status, período ou responsável
4. Usuário pode clicar em um projeto para ver os detalhes

---

### UC-03: Atualizar Status de uma Tarefa

**Ator:** Membro da Equipe  
**Pré-condição:** Usuário autenticado e alocado no projeto da tarefa  
**Fluxo Principal:**
1. Usuário acessa a lista de suas tarefas
2. Seleciona a tarefa desejada
3. Altera o status (ex.: de "Em Andamento" para "Em Revisão")
4. Sistema salva a alteração e notifica o Gerente de Projeto
