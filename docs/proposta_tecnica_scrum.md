# Proposta Técnica – Gestor Multiprojetos (PR_SEEC_2026)

## Plano de Execução – Metodologia Ágil (Scrum)

**Versão:** 1.0
**Data:** 01/03/2026
**Classificação:** Documento Técnico / Proposta Comercial

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Escopo Técnico Completo](#2-escopo-técnico-completo)
3. [Arquitetura Detalhada](#3-arquitetura-detalhada)
4. [Estrutura da Execução (Scrum)](#4-estrutura-da-execução-scrum)
5. [Planejamento Macro de Sprints](#5-planejamento-macro-de-sprints)
6. [Lista de Entregáveis](#6-lista-de-entregáveis)
7. [Estimativa de Time Necessário](#7-estimativa-de-time-necessário)
8. [Premissas e Exclusões](#8-premissas-e-exclusões)
9. [Plano de Garantia e Suporte](#9-plano-de-garantia-e-suporte)
10. [Instruções Finais](#10-instruções-finais)
11. [Identidade Visual da Aplicação](#11-identidade-visual-da-aplicação)

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo

Desenvolvimento de uma plataforma web de **Gestão Multiprojetos** que substitua a atual planilha PR_SEEC_2026, automatizando processos de controle financeiro, gestão de recursos humanos, calendários regionais, premissas sindicais e dashboards executivos, consolidando informações de múltiplos projetos com projeções até 2030.

### 1.2 Justificativa

A solução atual baseada em planilha apresenta limitações críticas de escalabilidade, rastreabilidade, controle de acesso e automação. A migração para uma plataforma web permitirá:

- Acesso simultâneo multiusuário com controle de perfis
- Automação de cálculos complexos (FCST, FTE, custos, impostos)
- Auditoria e rastreabilidade completa
- Dashboards em tempo real para decisão executiva
- Integração com sistemas externos e ferramentas de BI

### 1.3 Público-alvo

| Perfil               | Descrição                                              |
|-----------------------|--------------------------------------------------------|
| Diretoria / C-level   | Visualização de indicadores consolidados e carteiras   |
| PMO                   | Gestão de portfólio, planejamento e alocação           |
| Gestores de Projeto   | Controle operacional de projetos individuais           |
| RH / Operações        | Gestão de colaboradores, jornadas e custos de pessoal  |
| Financeiro            | Controle tributário, despesas e consolidações          |
| DevOps / TI           | Administração da plataforma e integrações              |

---

## 2. Escopo Técnico Completo

### 2.1 Módulos Funcionais

#### Módulo 1 – Gestão de Contratos e Projetos
- Cadastro completo de projetos (código, cliente, unidade, status, tipo)
- Controle de receitas mensais e anuais
- Registro de serviços e tipos de receita
- Projeções financeiras até 2030
- Consolidação de valores previstos vs. realizados
- Análise de carteira por mês, ano e período acumulado
- Evolução temporal do projeto
- Cálculo de margens e indicadores financeiros
- Visões consolidadas para diretoria

#### Módulo 2 – Recursos Humanos (HC & Equipe)
- Cadastro completo de profissionais (matrícula, nome, cargo, classe, TX, CH, cidade, estado)
- Controle de status (ativo, desligado)
- Registro por função (scanner, higienização, QA, remontagem etc.)
- Controle de horas mensais por funcionário
- Cálculo automático de custos individuais
- Cálculo automático de FTE por mês e colaborador
- Controle de férias (início, fim) e desligamentos
- Ajustes massivos de horas (contratação, férias, demissão)
- Aplicação automática de jornada/CH mensal por calendário regional
- Sincronização de TAXA, CALENDÁRIO, HORAS e CUSTO
- Projeção de custos de pessoal (2026–2027+)

#### Módulo 3 – Gestão Financeira
- Cálculo de custos fixos e variáveis por colaborador
- Registro de custos mensais
- Controle de impostos (INSS, ISS, PIS, COFINS, IRPJ, CSLL etc.)
- Alíquotas conforme regime tributário
- Controle de despesas: Facilities, Fornecedores, Aluguel de equipamentos, Endomarketing, Amortizações, Transferências (rateio)
- Registro de provisões financeiras
- Impactos tributários por estado e sindicato
- Custo total do projeto (mensal e anual)
- Indicadores consolidados de gastos e desempenho

#### Módulo 4 – Calendário e Feriados
- Cadastro de feriados nacionais, estaduais e municipais
- Identificação por cidade e estado
- Indicação do dia da semana
- Códigos e flags automatizados para cálculo de jornada
- Integração ao cálculo de horas previstas, custo e FTE
- Ajustes automáticos no planejamento conforme região

#### Módulo 5 – Premissas Contratuais e Sindicais
- Tabela completa de sindicatos e regras
- Aplicação de dissídio e reajustes por região
- Registro de IPCA e índices financeiros
- Configuração de regime tributário (CPRB, híbrido etc.)
- Percentuais específicos por categoria sindical
- Simulações trabalhistas e impacto financeiro

#### Módulo 6 – Automação & Integração
- Cálculo automático de FCST para anos futuros
- Engine de regras para consolidação de dados cruzados (HORAS × TAXA × CALENDÁRIO × CUSTO × FTE)
- Faixas dinâmicas com suporte a milhares de registros
- Exportação para BI e relatórios
- API para integração com sistemas externos

#### Módulo 7 – Dashboards e Consolidações
- Resumo geral: receita total, custos totais, outras despesas, carteira acumulada
- Visão ano a ano até 2030
- Indicadores executivos consolidados
- Painéis financeiros interativos
- Visão para diretoria / C-level

#### Módulo 8 – PMO e Operações
- Estrutura para planos de implantação, integração e rollout
- Históricos e requisitos organizados
- Mapeamento de papéis, cargas horárias e alocações
- Previsão de necessidades de recursos
- Rastreabilidade de jornadas e fluxos

### 2.2 Requisitos Não Funcionais

| Requisito             | Especificação                                              |
|-----------------------|------------------------------------------------------------|
| Performance           | Tempo de resposta < 2s para consultas; < 5s para cálculos massivos |
| Escalabilidade        | Suporte a 500+ usuários simultâneos                       |
| Disponibilidade       | SLA 99,5% em horário comercial                            |
| Segurança             | HTTPS, OAuth 2.0 / OIDC, RBAC, logs de auditoria          |
| Compatibilidade       | Chrome, Edge, Firefox (últimas 2 versões)                  |
| Responsividade        | Desktop-first com suporte a tablets                        |
| Backup                | RPO 1h / RTO 4h                                           |
| Auditoria             | Log de todas as operações de escrita com usuário e timestamp |

---

## 3. Arquitetura Detalhada

### 3.1 Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │   SPA (Single Page Application) – React / Next.js          │ │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │ │
│  │   │Dashboard │ │Projetos  │ │   RH     │ │ Financeiro   │ │ │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │ │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐  │ │
│  │   │Calendário│ │Sindicatos│ │  Configurações / Admin   │  │ │
│  │   └──────────┘ └──────────┘ └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                        API GATEWAY / BFF                         │
│         (Autenticação, Rate Limiting, Roteamento)                │
├──────────────────────────────────────────────────────────────────┤
│                       CAMADA DE SERVIÇOS                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Auth       │ │ Projetos   │ │ RH/HC      │ │ Financeiro   │ │
│  │ Service    │ │ Service    │ │ Service    │ │ Service      │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Calendário │ │ Sindicatos │ │ Cálculo    │ │ Exportação   │ │
│  │ Service    │ │ Service    │ │ Engine     │ │ Service      │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                       CAMADA DE DADOS                            │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL       │  │ Redis Cache  │  │ Object Storage   │  │
│  │ (Dados Principais│  │ (Sessão,     │  │ (Relatórios,     │  │
│  │  + Auditoria)    │  │  Cache)      │  │  Exportações)    │  │
│  └──────────────────┘  └──────────────┘  └──────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                     INFRAESTRUTURA / DevOps                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │ Docker   │ │ CI/CD    │ │ Monitor  │ │ IaC (Terraform/    │ │
│  │ K8s      │ │ Pipeline │ │ Logging  │ │  Ansible)          │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Stack Tecnológica

| Camada           | Tecnologia                                    |
|------------------|-----------------------------------------------|
| Front-end        | React 18+ / Next.js 14+ com TypeScript        |
| UI Components    | Ant Design ou Material UI                     |
| Gráficos         | Recharts / Apache ECharts                     |
| Back-end         | Node.js (NestJS) ou Python (FastAPI)          |
| ORM              | Prisma (Node) ou SQLAlchemy (Python)          |
| Banco de Dados   | PostgreSQL 16+                                |
| Cache            | Redis 7+                                      |
| Autenticação     | Keycloak / Auth0 (OAuth 2.0 + OIDC)          |
| Mensageria       | RabbitMQ ou Bull (filas de processamento)     |
| Containerização  | Docker + Docker Compose                       |
| Orquestração     | Kubernetes (produção)                         |
| CI/CD            | GitHub Actions / GitLab CI                    |
| Monitoramento    | Prometheus + Grafana                          |
| Logging          | ELK Stack (Elasticsearch, Logstash, Kibana)   |
| IaC              | Terraform + Ansible                           |
| Testes           | Jest, Cypress, k6 (carga)                     |

### 3.3 Modelo de Dados (Entidades Principais)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Projeto    │────▶│  ReceitaMensal   │     │   Colaborador    │
│──────────────│     │──────────────────│     │──────────────────│
│ id           │     │ id               │     │ id               │
│ codigo       │     │ projeto_id       │     │ matricula        │
│ cliente      │     │ mes              │     │ nome             │
│ unidade      │     │ ano              │     │ cargo            │
│ status       │     │ valor_previsto   │     │ classe           │
│ tipo         │     │ valor_realizado  │     │ taxa_hora        │
│ data_inicio  │     └──────────────────┘     │ carga_horaria    │
│ data_fim     │                               │ cidade           │
└──────────────┘                               │ estado           │
       │                                       │ status           │
       │         ┌──────────────────┐          │ sindicato_id     │
       │────────▶│   Alocacao       │◀─────────│ projeto_id       │
                 │──────────────────│          └──────────────────┘
                 │ id               │                   │
                 │ projeto_id       │                   ▼
                 │ colaborador_id   │          ┌──────────────────┐
                 │ funcao           │          │  ControlFerias   │
                 │ horas_mes        │          │──────────────────│
                 │ fte              │          │ id               │
                 └──────────────────┘          │ colaborador_id   │
                                               │ data_inicio      │
┌──────────────────┐    ┌────────────────────┐ │ data_fim         │
│   Sindicato      │    │   CustoMensal      │ └──────────────────┘
│──────────────────│    │────────────────────│
│ id               │    │ id                 │ ┌──────────────────┐
│ nome             │    │ colaborador_id     │ │  Desligamento    │
│ regiao           │    │ projeto_id         │ │──────────────────│
│ percentual_diss  │    │ mes                │ │ id               │
│ data_dissidio    │    │ ano                │ │ colaborador_id   │
│ regime_tributario│    │ custo_fixo         │ │ data_desligamento│
└──────────────────┘    │ custo_variavel     │ │ motivo           │
                        │ impostos           │ └──────────────────┘
                        │ custo_total        │
                        └────────────────────┘

┌──────────────────┐    ┌────────────────────┐ ┌──────────────────┐
│  Calendario      │    │   Despesa          │ │  IndiceFinanceiro│
│──────────────────│    │────────────────────│ │──────────────────│
│ id               │    │ id                 │ │ id               │
│ data             │    │ projeto_id         │ │ tipo (IPCA, etc) │
│ tipo_feriado     │    │ tipo               │ │ valor            │
│ descricao        │    │ (facilities, etc)  │ │ mes_referencia   │
│ cidade           │    │ valor              │ │ ano_referencia   │
│ estado           │    │ mes                │ └──────────────────┘
│ dia_semana       │    │ ano                │
│ nacional         │    └────────────────────┘
└──────────────────┘

┌──────────────────┐    ┌────────────────────┐
│  Imposto         │    │   Provisao         │
│──────────────────│    │────────────────────│
│ id               │    │ id                 │
│ projeto_id       │    │ projeto_id         │
│ tipo (INSS, etc) │    │ tipo               │
│ aliquota         │    │ valor              │
│ valor            │    │ mes                │
│ mes              │    │ ano                │
│ ano              │    └────────────────────┘
└──────────────────┘
```

### 3.4 Arquitetura de Integrações

```
                    ┌─────────────────┐
                    │  Gestor Multi   │
                    │  Projetos       │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │  BI / Power  │  │  ERP         │  │  Folha de    │
   │  BI          │  │  (Futuro)    │  │  Pagamento   │
   └──────────────┘  └──────────────┘  └──────────────┘
   (Exportação CSV/   (REST API)       (Importação CSV/
    API REST)                           Integração API)
```

---

## 4. Estrutura da Execução (Scrum)

### 4.1 Papéis e Responsabilidades

| Papel                | Responsabilidades                                                                                   |
|----------------------|-----------------------------------------------------------------------------------------------------|
| **Product Owner (PO)** | Priorização do backlog, validação de critérios de aceite, comunicação com stakeholders, decisões de negócio |
| **Scrum Master (SM)**  | Facilitação das cerimônias, remoção de impedimentos, proteção do time, métricas de processo          |
| **Desenvolvedores (Devs)** | Implementação front-end e back-end, code review, testes unitários, documentação técnica          |
| **QA (Quality Assurance)** | Elaboração de planos de teste, testes funcionais e não funcionais, automação de testes, report de bugs |
| **DevOps**             | Infraestrutura, CI/CD, ambientes, monitoramento, deploy, segurança de infraestrutura                |

### 4.2 Organização em Sprints

| Parâmetro                | Valor                          |
|--------------------------|--------------------------------|
| Duração da Sprint        | 2 semanas (10 dias úteis)      |
| Total de Sprints         | 10                             |
| Duração Total Estimada   | 20 semanas (~5 meses)          |
| Capacidade por Sprint    | Calculada conforme velocity    |
| Definition of Ready      | História com critérios de aceite definidos, estimada e sem dependências bloqueantes |
| Definition of Done       | Código revisado, testes passando, documentação atualizada, aceite do PO |

### 4.3 Cerimônias Obrigatórias

#### Sprint Planning
| Item             | Detalhe                                                |
|------------------|--------------------------------------------------------|
| **Quando**       | Primeiro dia da Sprint                                 |
| **Duração**      | 2–4 horas                                              |
| **Participantes**| PO, SM, Devs, QA                                       |
| **Objetivo**     | Selecionar itens do backlog, definir Sprint Goal, decompor em tarefas |
| **Artefatos**    | Sprint Backlog, Sprint Goal documentado                |

#### Daily Standup
| Item             | Detalhe                                                |
|------------------|--------------------------------------------------------|
| **Quando**       | Todos os dias úteis                                    |
| **Duração**      | 15 minutos (máximo)                                    |
| **Participantes**| SM, Devs, QA, DevOps                                   |
| **Formato**      | O que fiz ontem? O que farei hoje? Há impedimentos?    |
| **Observação**   | PO pode participar como ouvinte                        |

#### Sprint Review
| Item             | Detalhe                                                |
|------------------|--------------------------------------------------------|
| **Quando**       | Penúltimo dia da Sprint                                |
| **Duração**      | 1–2 horas                                              |
| **Participantes**| PO, SM, Devs, QA, Stakeholders                        |
| **Objetivo**     | Demonstrar incremento funcional, coletar feedback      |
| **Artefatos**    | Demo ao vivo, release notes da Sprint                  |

#### Sprint Retrospective
| Item             | Detalhe                                                |
|------------------|--------------------------------------------------------|
| **Quando**       | Último dia da Sprint                                   |
| **Duração**      | 1–1,5 horas                                            |
| **Participantes**| PO, SM, Devs, QA, DevOps                               |
| **Objetivo**     | Identificar melhorias de processo, ações corretivas    |
| **Formato**      | O que foi bom? O que pode melhorar? Ações concretas    |

### 4.4 Artefatos Scrum

| Artefato               | Descrição                                                       |
|------------------------|-----------------------------------------------------------------|
| **Product Backlog**    | Lista priorizada de todas as funcionalidades, mantida pelo PO   |
| **Sprint Backlog**     | Subconjunto do Product Backlog selecionado para a Sprint        |
| **Incremento**         | Software funcional entregue ao final de cada Sprint             |
| **Burndown Chart**     | Gráfico de acompanhamento do progresso da Sprint                |
| **Velocity**           | Métrica de capacidade do time por Sprint (em Story Points)      |

---

## 5. Planejamento Macro de Sprints

### Sprint 1 – Kickoff + Arquitetura

**Sprint Goal:** Estabelecer as bases técnicas e organizacionais do projeto.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Refinamento técnico completo dos requisitos   | Alta       | 5            |
| 2 | Definição e documentação da arquitetura       | Alta       | 8            |
| 3 | Setup de repositórios (monorepo ou multi-repo)| Alta       | 3            |
| 4 | Configuração de CI/CD (build, lint, test)     | Alta       | 5            |
| 5 | Provisionamento de ambientes (dev, staging)   | Alta       | 5            |
| 6 | Definição das entidades principais do domínio | Alta       | 8            |
| 7 | Setup do projeto front-end (boilerplate)      | Média      | 3            |
| 8 | Setup do projeto back-end (boilerplate)       | Média      | 3            |
| 9 | Documentação de padrões de código e contribuição | Média   | 2            |

**Entregáveis:**
- Documento de Arquitetura (ADR)
- Repositórios configurados com pipelines CI/CD funcionais
- Ambientes de desenvolvimento e staging ativos
- Modelo de domínio inicial documentado
- Boilerplate funcional front-end e back-end

---

### Sprint 2 – Modelagem + Back-End Base

**Sprint Goal:** Implementar a modelagem de dados e os serviços fundamentais da plataforma.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Modelagem completa do banco de dados          | Alta       | 8            |
| 2 | Scripts de migração (migrations)              | Alta       | 5            |
| 3 | Serviço de autenticação (login, JWT, refresh) | Alta       | 8            |
| 4 | CRUD de usuários                              | Alta       | 5            |
| 5 | Sistema de perfis e permissões (RBAC)         | Alta       | 8            |
| 6 | Middleware de autorização                     | Alta       | 3            |
| 7 | Seed de dados iniciais                        | Média      | 3            |
| 8 | Testes unitários dos serviços base            | Média      | 5            |
| 9 | Tela de login e gestão de sessão (front-end)  | Média      | 5            |

**Entregáveis:**
- Banco de dados modelado e migrado
- Serviço de autenticação completo com JWT
- CRUD de usuários funcional
- Sistema RBAC implementado
- Tela de login funcional

---

### Sprint 3 – Módulo de Projetos

**Sprint Goal:** Disponibilizar a gestão completa de projetos com cálculos financeiros básicos e FCST.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | CRUD de Projetos (código, cliente, unidade, status, tipo) | Alta | 8      |
| 2 | Registro de receitas mensais e anuais         | Alta       | 5            |
| 3 | Registro de serviços e tipos de receita       | Alta       | 5            |
| 4 | Cálculo de margens e indicadores financeiros  | Alta       | 8            |
| 5 | Motor de FCST (projeções até 2030)            | Alta       | 13           |
| 6 | Consolidação previsto vs. realizado           | Média      | 5            |
| 7 | Análise de carteira (mês, ano, acumulado)     | Média      | 5            |
| 8 | Telas front-end do módulo de Projetos         | Média      | 8            |
| 9 | Testes do módulo                              | Média      | 5            |

**Entregáveis:**
- Módulo de Projetos completo (back-end + front-end)
- Motor de cálculo FCST funcional
- Relatório de carteira consolidada
- Suite de testes do módulo

---

### Sprint 4 – Recursos Humanos

**Sprint Goal:** Implementar o módulo completo de gestão de pessoal com controle de jornada e custos.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Cadastro completo de colaboradores            | Alta       | 8            |
| 2 | Importação em lote de dados de colaboradores (CSV/XLSX) | Alta | 8       |
| 3 | Controle de jornada e carga horária mensal    | Alta       | 8            |
| 4 | Cálculo automático de FTE por mês/colaborador | Alta       | 8            |
| 5 | Controle de férias (início, fim, impacto)     | Alta       | 5            |
| 6 | Controle de desligamentos                     | Alta       | 5            |
| 7 | Cálculo automático de custos individuais      | Média      | 5            |
| 8 | Telas front-end do módulo RH                  | Média      | 8            |
| 9 | Testes do módulo                              | Média      | 5            |

**Entregáveis:**
- Módulo RH completo com importação de dados
- Cálculos automáticos de FTE e custos
- Controle de férias e desligamentos
- Interface de gestão de colaboradores

---

### Sprint 5 – Financeiro

**Sprint Goal:** Implementar o módulo financeiro completo com controle tributário e despesas.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Cálculo de custos fixos e variáveis por colaborador | Alta | 8           |
| 2 | Controle de impostos (INSS, ISS, PIS, COFINS, IRPJ, CSLL) | Alta | 8   |
| 3 | Engine de alíquotas conforme regime tributário | Alta      | 8            |
| 4 | Controle de despesas diversas (facilities, fornecedores, aluguel, endomarketing, amortizações, rateio) | Alta | 8 |
| 5 | Registro de provisões financeiras             | Alta       | 5            |
| 6 | Impactos tributários por estado e sindicato   | Média      | 5            |
| 7 | Custo total do projeto (mensal e anual)       | Média      | 5            |
| 8 | Telas front-end do módulo Financeiro          | Média      | 8            |
| 9 | Testes do módulo                              | Média      | 5            |

**Entregáveis:**
- Módulo Financeiro completo
- Engine de cálculo tributário
- Controle de despesas categorizado
- Consolidação de custos por projeto

---

### Sprint 6 – Calendários + Regras Sindicais

**Sprint Goal:** Implementar gestão de calendários regionais e regras sindicais com impacto automático nos cálculos.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Cadastro de feriados (nacionais, estaduais, municipais) | Alta | 8      |
| 2 | Engine de cálculo de jornada por região       | Alta       | 8            |
| 3 | Integração calendário → horas previstas, custo, FTE | Alta | 8          |
| 4 | Tabela de sindicatos e regras trabalhistas    | Alta       | 5            |
| 5 | Aplicação de dissídio e reajustes por região  | Alta       | 8            |
| 6 | Registro de IPCA e índices financeiros        | Média      | 3            |
| 7 | Configuração de regime tributário (CPRB, híbrido) | Média  | 5            |
| 8 | Simulações trabalhistas e impacto financeiro  | Média      | 8            |
| 9 | Telas front-end dos módulos                   | Média      | 5            |
| 10| Testes dos módulos                            | Média      | 5            |

**Entregáveis:**
- Módulo de Calendários funcional integrado
- Módulo de Regras Sindicais com simulação
- Recálculo automático em cascata (calendário → jornada → custo → FTE)

---

### Sprint 7 – Dashboards e Consolidações

**Sprint Goal:** Entregar painéis executivos e visões consolidadas para tomada de decisão.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Dashboard executivo consolidado               | Alta       | 13           |
| 2 | Painel financeiro (receita, custos, margens)  | Alta       | 8            |
| 3 | Visão de carteira acumulada                   | Alta       | 5            |
| 4 | Resumo ano a ano até 2030                     | Alta       | 5            |
| 5 | Indicadores de desempenho (KPIs)              | Alta       | 8            |
| 6 | Visão consolidada para diretoria / C-level    | Média      | 8            |
| 7 | Exportação de relatórios (PDF, Excel, CSV)    | Média      | 5            |
| 8 | Filtros dinâmicos e drill-down                | Média      | 5            |
| 9 | Testes do módulo                              | Média      | 3            |

**Entregáveis:**
- Dashboard executivo com gráficos interativos
- Painéis financeiros completos
- Exportação de relatórios em múltiplos formatos
- Visão C-level funcional

---

### Sprint 8 – Ajuste Massivo + Processos Operacionais

**Sprint Goal:** Implementar mecanismos de alteração em lote e workflows operacionais.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Mecanismo de ajuste massivo de horas          | Alta       | 8            |
| 2 | Ajuste em lote de taxas e custos              | Alta       | 8            |
| 3 | Recálculo em cascata (TAXA × CALENDÁRIO × HORAS × CUSTO) | Alta | 13   |
| 4 | Workflows de aprovação                        | Alta       | 8            |
| 5 | Controle de versão de dados (snapshots)       | Média      | 8            |
| 6 | Log de alterações massivas com rollback       | Média      | 5            |
| 7 | Estrutura para planos operacionais (PMO)      | Média      | 5            |
| 8 | Telas front-end dos processos                 | Média      | 5            |
| 9 | Testes do módulo                              | Média      | 5            |

**Entregáveis:**
- Engine de ajuste massivo com recálculo automático
- Workflows de aprovação configuráveis
- Sistema de snapshots e rollback
- Módulo PMO básico

---

### Sprint 9 – Testes Completos + Segurança

**Sprint Goal:** Garantir a qualidade e segurança da plataforma com testes abrangentes.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Testes funcionais end-to-end (Cypress)        | Alta       | 13           |
| 2 | Testes de integração entre módulos            | Alta       | 8            |
| 3 | Testes de performance e carga (k6)            | Alta       | 8            |
| 4 | Auditoria de segurança (OWASP Top 10)        | Alta       | 8            |
| 5 | Penetration testing básico                    | Alta       | 5            |
| 6 | Revisão de RBAC e permissões                  | Alta       | 3            |
| 7 | Correção de bugs identificados               | Alta       | 8            |
| 8 | Otimização de performance                     | Média      | 5            |
| 9 | Documentação final de APIs (Swagger/OpenAPI)  | Média      | 3            |
| 10| Documentação de usuário                       | Média      | 5            |

**Entregáveis:**
- Relatório de testes com cobertura > 80%
- Relatório de segurança
- Bugs críticos corrigidos
- Documentação completa (técnica + usuário)
- API documentada via Swagger

---

### Sprint 10 – Go-Live

**Sprint Goal:** Realizar a entrega em produção com treinamento e plano de estabilização.

| # | Item                                          | Prioridade | Story Points |
|---|-----------------------------------------------|------------|--------------|
| 1 | Handover técnico completo                     | Alta       | 8            |
| 2 | Migração de dados da planilha para o sistema  | Alta       | 8            |
| 3 | Deploy em produção                            | Alta       | 5            |
| 4 | Treinamento para usuários-chave               | Alta       | 8            |
| 5 | Treinamento para administradores              | Alta       | 5            |
| 6 | Manual do usuário final                       | Alta       | 5            |
| 7 | Configuração de monitoramento em produção     | Alta       | 3            |
| 8 | Suporte intensivo pós go-live (1 semana)      | Alta       | 5            |
| 9 | Correções emergenciais                        | Alta       | 5            |
| 10| Aceite formal do projeto                      | Alta       | 2            |

**Entregáveis:**
- Sistema em produção
- Dados migrados e validados
- Treinamentos realizados (atas assinadas)
- Manual do usuário
- Termo de aceite formal
- Plano de suporte pós go-live

---

## 6. Lista de Entregáveis

### 6.1 Entregáveis Técnicos

| #  | Entregável                                    | Sprint   |
|----|-----------------------------------------------|----------|
| 1  | Documento de Arquitetura (ADR)                | Sprint 1 |
| 2  | Repositórios + CI/CD configurados             | Sprint 1 |
| 3  | Modelo de Dados documentado                   | Sprint 2 |
| 4  | Serviço de Autenticação e RBAC                | Sprint 2 |
| 5  | Módulo de Projetos + FCST                     | Sprint 3 |
| 6  | Módulo de Recursos Humanos                    | Sprint 4 |
| 7  | Módulo Financeiro                             | Sprint 5 |
| 8  | Módulo de Calendários + Sindicatos            | Sprint 6 |
| 9  | Dashboards e Consolidações                    | Sprint 7 |
| 10 | Engine de Ajuste Massivo + Workflows          | Sprint 8 |
| 11 | Relatório de Testes e Segurança               | Sprint 9 |
| 12 | Sistema em Produção                           | Sprint 10|

### 6.2 Entregáveis Documentais

| #  | Entregável                                    | Sprint      |
|----|-----------------------------------------------|-------------|
| 1  | Documento de Arquitetura                      | Sprint 1    |
| 2  | Modelo Entidade-Relacionamento                | Sprint 2    |
| 3  | Documentação de APIs (Swagger/OpenAPI)        | Sprint 9    |
| 4  | Manual do Usuário                             | Sprint 10   |
| 5  | Manual do Administrador                       | Sprint 10   |
| 6  | Plano de Testes                               | Sprint 9    |
| 7  | Relatório de Segurança                        | Sprint 9    |
| 8  | Runbook de Operações                          | Sprint 10   |
| 9  | Termo de Aceite                               | Sprint 10   |

---

## 7. Estimativa de Time Necessário

### 7.1 Composição do Time

| Papel               | Quantidade | Dedicação  | Perfil                                       |
|----------------------|-----------|------------|----------------------------------------------|
| Product Owner        | 1         | Parcial    | Conhecimento profundo do negócio e da planilha|
| Scrum Master         | 1         | Parcial    | Certificado CSM/PSM, experiência em projetos de TI |
| Dev Full-Stack Sênior| 2         | Integral   | React + Node/Python, experiência em sistemas financeiros |
| Dev Full-Stack Pleno | 2         | Integral   | React + Node/Python                          |
| Dev Back-End Pleno   | 1         | Integral   | Especialista em cálculos e regras de negócio |
| QA Analyst           | 1         | Integral   | Automação de testes, testes de carga          |
| DevOps Engineer      | 1         | Parcial    | Docker, K8s, CI/CD, IaC                      |
| UX/UI Designer       | 1         | Parcial    | Design de dashboards e interfaces complexas   |
| **Total**            | **10**    |            |                                              |

### 7.2 Estimativa de Esforço

| Métrica                          | Valor                    |
|----------------------------------|--------------------------|
| Total de Story Points estimados  | ~620 SP                  |
| Velocity média esperada          | ~60–65 SP por Sprint     |
| Total de Sprints                 | 10                       |
| Duração total                    | 20 semanas (~5 meses)    |
| Esforço total estimado           | ~3.200 horas-homem       |

---

## 8. Premissas e Exclusões

### 8.1 Premissas

1. **Acesso aos dados:** O cliente disponibilizará a planilha PR_SEEC_2026 completa e atualizada, bem como acesso a especialistas de negócio para esclarecimentos.
2. **Disponibilidade do PO:** O Product Owner (lado cliente) terá disponibilidade mínima de 4 horas/dia para refinamento e validação.
3. **Infraestrutura:** O cliente fornecerá ou aprovará a infraestrutura cloud necessária (AWS, Azure ou GCP).
4. **Aprovações:** Validações e aprovações de Sprint Review serão realizadas em até 2 dias úteis.
5. **Dados de teste:** O cliente fornecerá massa de dados representativa para testes.
6. **Comunicação:** Ferramentas de comunicação (Slack, Teams) e gestão (Jira, Azure DevOps) serão acordadas no kickoff.
7. **Escopo fixo por Sprint:** Alterações de escopo dentro de uma Sprint em andamento seguirão o processo de change request.
8. **Ambiente de produção:** O ambiente de produção estará provisionado até a Sprint 9.

### 8.2 Exclusões

1. **Desenvolvimento mobile nativo** (iOS/Android) – apenas responsivo para tablets.
2. **Integração com ERP** – prevista como ponto de extensão, não implementada no escopo.
3. **Migração de dados históricos** além da planilha PR_SEEC_2026.
4. **Customizações pós go-live** fora do período de estabilização.
5. **Treinamento presencial** – treinamentos serão remotos, salvo acordo contrário.
6. **Consultoria tributária ou trabalhista** – regras serão implementadas conforme especificação do cliente.
7. **Licenças de software de terceiros** (Keycloak, ferramentas de BI etc.) – custos à parte.
8. **Suporte 24×7** – suporte em horário comercial, conforme SLA acordado.

---

## 9. Plano de Garantia e Suporte

### 9.1 Período de Garantia

| Item                          | Detalhe                                        |
|-------------------------------|------------------------------------------------|
| Duração                       | 90 dias corridos após o aceite formal          |
| Cobertura                     | Correção de bugs e defeitos do escopo entregue |
| Tempo de Resposta (Crítico)   | Até 4 horas úteis                              |
| Tempo de Resposta (Alto)      | Até 8 horas úteis                              |
| Tempo de Resposta (Médio)     | Até 24 horas úteis                             |
| Tempo de Resposta (Baixo)     | Até 48 horas úteis                             |
| Canal de suporte              | Sistema de tickets + canal dedicado            |

### 9.2 Classificação de Severidade

| Severidade | Descrição                                                        | SLA Resolução  |
|------------|------------------------------------------------------------------|----------------|
| Crítica    | Sistema indisponível ou perda de dados                           | Até 8h úteis   |
| Alta       | Funcionalidade core inoperante, sem workaround                   | Até 24h úteis  |
| Média      | Funcionalidade com defeito, com workaround disponível            | Até 48h úteis  |
| Baixa      | Defeitos cosméticos ou melhorias menores                         | Até 5 dias úteis|

### 9.3 Suporte Pós-Garantia (Opcional)

| Modalidade                    | Descrição                                      |
|-------------------------------|------------------------------------------------|
| Pacote de Horas               | Banco de horas para manutenção evolutiva       |
| Contrato de Sustentação       | Time dedicado parcial para melhorias contínuas |
| SLA Estendido                 | Extensão do período de garantia                |

---

## 10. Instruções Finais

### 10.1 Metodologia de Trabalho

- **Framework:** Scrum com Sprints de 2 semanas
- **Ferramenta de Gestão:** Jira / Azure DevOps (a definir no kickoff)
- **Repositório:** GitHub / GitLab com branch protection e code review obrigatório
- **CI/CD:** Pipeline automatizado com build, testes, análise estática e deploy
- **Comunicação:** Daily assíncrona (texto) + síncrona (vídeo) conforme necessidade
- **Documentação:** Confluence / Wiki no repositório
- **Code Review:** Pull Requests com mínimo de 1 aprovação
- **Branching Strategy:** GitFlow ou Trunk-Based Development (a definir)

### 10.2 Critérios de Aceite do Projeto

1. Todos os módulos funcionais entregues e aprovados pelo PO
2. Cobertura de testes ≥ 80%
3. Zero bugs críticos ou altos em aberto
4. Documentação técnica e de usuário entregues
5. Treinamentos realizados com atas assinadas
6. Sistema em produção e estável por 5 dias úteis
7. Migração de dados validada pelo cliente

### 10.3 Riscos Identificados

| #  | Risco                                         | Probabilidade | Impacto | Mitigação                                    |
|----|-----------------------------------------------|---------------|---------|----------------------------------------------|
| 1  | Complexidade das regras tributárias maior que o estimado | Média | Alto | Spike técnico na Sprint 1; especialista de negócio dedicado |
| 2  | Indisponibilidade do PO para validações       | Média         | Alto    | PO substituto definido; validação assíncrona  |
| 3  | Volume de dados excede expectativas de performance | Baixa   | Alto    | Testes de carga antecipados; cache e indexação |
| 4  | Mudanças de escopo frequentes                 | Média         | Médio   | Change request formal; buffer de 10% por Sprint |
| 5  | Integração com sistemas legados               | Baixa         | Médio   | API bem definida; mock services para testes   |
| 6  | Rotatividade de equipe                        | Baixa         | Alto    | Documentação contínua; pair programming       |

### 10.4 Contato e Próximos Passos

1. **Aprovação desta proposta** pelo cliente
2. **Kickoff meeting** com todos os stakeholders
3. **Definição das ferramentas** de gestão e comunicação
4. **Onboarding do time** e acesso aos ambientes
5. **Início da Sprint 1** conforme planejamento acordado

---

---

## 11. Identidade Visual da Aplicação

A identidade visual do **Gestor Multiprojetos** segue as diretrizes de marca da **HW1** (hw1.com.br), extraídas diretamente do site institucional da empresa. Este guia define os padrões visuais que devem ser aplicados em todas as interfaces da aplicação, garantindo consistência com a marca corporativa.

### 11.1 Paleta de Cores

A paleta de cores é organizada em três categorias: **cores primárias**, **cores de apoio** e **cores de fundo de seções**.

#### 11.1.1 Cores Primárias

| Token                | Cor          | Hex       | Uso Principal                                      |
|----------------------|--------------|-----------|---------------------------------------------------|
| **Branco**           | ⬜ Branco     | `#FFFFFF` | Backgrounds claros, texto sobre fundos escuros     |
| **Preto**            | ⬛ Preto      | `#0D0E0E` | Texto corpo, ícones sobre fundo claro              |
| **Roxo Profundo**    | 🟪 Roxo       | `#35277D` | Links de navegação, texto destaque                 |
| **Magenta/Pink**     | 🩷 Magenta    | `#E52287` | Cor de ação (accent), hover em menus, CTAs         |

#### 11.1.2 Cores de Apoio

| Token                | Cor            | Hex       | Uso Principal                                    |
|----------------------|----------------|-----------|--------------------------------------------------|
| **Teal**             | 🩵 Teal        | `#00B3AD` | Cards, destaques secundários                     |
| **Azul Índigo**      | 🔵 Índigo      | `#1E16A0` | Títulos icon-box, menus dropdown, cards           |
| **Navy Escuro**      | 🔵 Navy        | `#050439` | Fundos hero, hover de navegação, overlay          |
| **Rosa Intenso**     | 🩷 Hot Pink    | `#F70085` | Destaques vibrantes, badges                      |
| **Ciano Brilhante**  | 🩵 Ciano       | `#00DDD5` | Links do mega-menu, destaques luminosos           |
| **Teal Escuro**      | 🟢 Teal Escuro | `#009792` | Cards secundários, backgrounds complementares     |
| **Laranja Claro**    | 🟠 Laranja     | `#FFBC7D` | Transição de página (page transition)             |

#### 11.1.3 Cores de Fundo de Seções

| Seção                  | Hex         | Descrição                                 |
|------------------------|-------------|-------------------------------------------|
| Hero / Banner          | Gradiente   | Imagem `HW1-GRADIENT-C90.webp`            |
| Seção Teal             | `#005C59`   | Fundo verde-escuro para blocos de conteúdo|
| Seção Índigo           | `#130F60`   | Fundo azul-escuro para seções destacadas  |
| Seção Magenta          | `#87144F`   | Fundo magenta-escuro para CTAs            |
| Overlay Escuro         | `#05043985` | Sobreposição semi-transparente (53% opacidade) |
| Header (scroll)        | `#FFFFFF00` | Transparente com backdrop-filter blur(30px) |

### 11.2 Tipografia

A aplicação utiliza três famílias tipográficas do **Google Fonts**, cada uma com função específica na hierarquia visual.

#### 11.2.1 Famílias Tipográficas

| Nível          | Fonte        | Peso(s)     | Função                                      |
|----------------|--------------|-------------|----------------------------------------------|
| **Primária**   | Montserrat   | 600, 700    | Títulos principais, headings H1-H2, logo menu |
| **Secundária** | Cabin        | 400, 500    | Subtítulos, descrições de seção, H3-H4       |
| **Texto**      | Open Sans    | 400, 500, 600 | Corpo de texto, parágrafos, labels, menus   |

#### 11.2.2 Escala Tipográfica

| Elemento                  | Fonte      | Tamanho | Peso | Line-Height | Letter-Spacing |
|---------------------------|------------|---------|------|-------------|----------------|
| Hero Heading (H1)         | Montserrat | 60px    | 700  | 70px        | —              |
| Hero Subtítulo            | Cabin      | 25px    | 400  | 32px        | 1px            |
| Heading de Seção (H2)     | Cabin      | 54px    | 400  | 66px        | —              |
| Card Title (H3)           | Cabin      | 45px    | 400  | —           | —              |
| Partners Heading          | Montserrat | 50px    | 700  | —           | —              |
| Partners Description      | Cabin      | 25px    | 400  | 35px        | —              |
| Corpo de Texto            | Open Sans  | 25px    | 400  | —           | —              |
| Texto Secundário          | Open Sans  | 16px    | 600  | —           | —              |
| Menu Icon-Box Title       | Montserrat | 20px    | 600  | —           | —              |
| Menu Icon-Box Description | Cabin      | 400     | —    | —           | —              |
| Navegação Principal       | Montserrat | —       | 600  | —           | —              |
| Menu Dropdown             | Open Sans  | —       | 500  | —           | —              |

> **Fallback:** Todas as fontes utilizam `Sans-serif` como fallback genérico.

### 11.3 Logotipo e Ícones

| Ativo                  | Arquivo                | Formato | Uso                                                |
|------------------------|------------------------|---------|----------------------------------------------------|
| Logo Branco (principal)| `HW1-LOGO-WHT.svg`    | SVG     | Header, fundos escuros, impressões em negativo     |
| Ícone da Marca         | `HW1-ICON-512.png`    | PNG     | Favicon, ícone de app, redes sociais (512×512 px)  |
| Gradiente de Fundo     | `HW1-GRADIENT-C90.webp` | WebP  | Hero banner, background decorativo                 |

**Regras de uso do logo:**
- Sobre fundos escuros: utilizar a versão branca (`HW1-LOGO-WHT.svg`)
- Tamanho mínimo no header: **100px** de largura
- Manter área de respiro ao redor do logo
- Não distorcer proporções

### 11.4 Layout e Grid

| Propriedade              | Valor       | Descrição                                    |
|--------------------------|-------------|----------------------------------------------|
| Container Max-Width      | **1140px**  | Largura máxima do conteúdo centralizado       |
| Sistema de Layout        | Flexbox     | Containers flexíveis com Elementor            |
| Direção Padrão           | Column      | Seções empilhadas verticalmente               |
| Direção Interna          | Row         | Colunas lado a lado dentro das seções         |
| Flex-Wrap (mobile)       | Wrap        | Empilhamento automático em telas pequenas     |

### 11.5 Breakpoints Responsivos

A aplicação deve ser construída seguindo os breakpoints customizados da marca:

| Breakpoint             | Largura   | Direção | Descrição                          |
|------------------------|-----------|---------|------------------------------------|
| **Mobile (retrato)**   | ≤ 767px   | max     | Smartphones em modo retrato        |
| **Mobile (paisagem)**  | ≤ 880px   | max     | Smartphones em modo paisagem       |
| **Tablet (retrato)**   | ≤ 1024px  | max     | Tablets em modo retrato            |
| **Tablet (paisagem)**  | ≤ 1200px  | max     | Tablets em modo paisagem           |
| **Notebook**           | ≤ 1366px  | max     | Telas de notebook padrão           |
| **Widescreen**         | ≥ 2400px  | min     | Monitores ultrawide / 4K           |

### 11.6 Componentes de Interface

#### 11.6.1 Navegação (Header)

- **Posição:** Fixa no topo (`position: absolute`, `z-index: 100`)
- **Fundo inicial:** Transparente (`#FFFFFF00`)
- **Fundo com scroll:** Backdrop-filter `blur(30px)` com transição de 0.5s
- **Links normais:** Cor `#35277D` (Roxo Profundo) — fonte Montserrat 600
- **Links hover/active:** Cor `#E52287` (Magenta) com underline animado
- **Animação underline:** Background `#E52287` com efeito shutter, border-radius 2px
- **Padding dos itens:** 22px horizontal, 8px vertical
- **Menu toggle (mobile):** Cor branca, sem borda, border-radius 2px

#### 11.6.2 Mega-Menu (Dropdown)

- **Fundo:** Branco (`#FFFFFF`) com row layout
- **Títulos de item:** Montserrat 20px, peso 600, cor `#1E16A0` (Índigo)
- **Descrições:** Cabin, peso 400, cor `#0D0E0E` (Preto)
- **Ícones:** 50px (categoria principal) / 24px (subitens), cor `#1E16A0`
- **Hover:** Background `#0D0E0E12` (preto 7% opacidade) com transição 0.5s
- **Padding item:** 15px 30px (categoria) / 3px 20px 10px (subitem)

#### 11.6.3 Cards de Seção

Os cards de conteúdo utilizam fundos coloridos da paleta de apoio:

| Variante      | Background          | Texto        |
|---------------|---------------------|--------------|
| Card Teal     | `#009792`           | `#FFFFFF`    |
| Card Índigo   | `#1E16A0`           | `#FFFFFF`    |
| Card Magenta  | `#E52287`           | `#FFFFFF`    |

- **Título do card:** Cabin, 45px, peso 400
- **Corpo do card:** Open Sans, 25px, peso 400, cor branca

#### 11.6.4 Footer

- **Fundo:** Cor escura da marca (gradiente ou `--e-global-color-secondary`)
- **Texto de copyright:** `2026 © HW1. Todos os direitos reservados.`
- **Links de lista:** Colunas organizadas por **Serviços**, **Produtos** (duas colunas)
- **Separador:** Divider horizontal antes do copyright
- **Link "voltar ao topo":** Ícone chevron-up com texto inline

### 11.7 Efeitos e Transições

| Efeito                     | Propriedade             | Valor                      |
|----------------------------|-------------------------|----------------------------|
| Hover em cards/itens       | `background-color`      | `#0D0E0E12` (7% opacidade)|
| Transição de hover         | `transition`            | `background 0.5s`         |
| Scroll do header           | `backdrop-filter`       | `blur(30px)` com 0.5s ease|
| Transição de página        | `background-color`      | `#FFBC7D` (Laranja Claro) |
| Animação de entrada        | `fadeIn`                | CSS animation padrão       |
| Lazy load de seções        | IntersectionObserver    | rootMargin `200px 0px`     |

### 11.8 Implementação na Aplicação (CSS Custom Properties)

Para garantir consistência visual, a aplicação deve definir variáveis CSS globais baseadas nos tokens da marca:

```css
:root {
  /* Cores Primárias */
  --hw1-color-white: #FFFFFF;
  --hw1-color-black: #0D0E0E;
  --hw1-color-purple: #35277D;
  --hw1-color-magenta: #E52287;

  /* Cores de Apoio */
  --hw1-color-teal: #00B3AD;
  --hw1-color-indigo: #1E16A0;
  --hw1-color-navy: #050439;
  --hw1-color-hot-pink: #F70085;
  --hw1-color-cyan: #00DDD5;
  --hw1-color-teal-dark: #009792;
  --hw1-color-orange-light: #FFBC7D;

  /* Cores de Seção */
  --hw1-section-teal: #005C59;
  --hw1-section-indigo: #130F60;
  --hw1-section-magenta: #87144F;

  /* Tipografia */
  --hw1-font-primary: 'Montserrat', sans-serif;
  --hw1-font-secondary: 'Cabin', sans-serif;
  --hw1-font-body: 'Open Sans', sans-serif;

  /* Layout */
  --hw1-container-max-width: 1140px;
}
```

### 11.9 Referência de Origem

Toda a identidade visual documentada nesta seção foi extraída do site institucional da HW1:

- **URL:** https://hw1.com.br
- **Plataforma:** WordPress 6.9 + Elementor 3.27.6
- **Theme:** Hello Elementor
- **Data da extração:** 2026

> **Nota:** Eventuais atualizações na identidade visual do site institucional devem ser refletidas nesta documentação e na aplicação Gestor Multiprojetos, mediante aprovação do Product Owner.

---

> **Nota:** Este documento constitui a proposta técnica e plano de execução para o projeto Gestor Multiprojetos. Valores comerciais, cronograma com datas específicas e condições contratuais serão apresentados em documento complementar mediante aprovação desta proposta técnica.

---

*Documento gerado em 01/03/2026 – Proposta Técnica v1.0*
