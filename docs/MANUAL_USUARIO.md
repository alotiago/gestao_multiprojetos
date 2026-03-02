# Manual do Usuário — Gestor Multiprojetos

**Versão:** 1.0  
**Última atualização:** Março 2026

---

## Sumário

1. [Primeiros Passos](#1-primeiros-passos)
2. [Login e Autenticação](#2-login-e-autenticação)
3. [Dashboard](#3-dashboard)
4. [Módulo Projetos](#4-módulo-projetos)
5. [Módulo Recursos Humanos](#5-módulo-recursos-humanos)
6. [Módulo Financeiro](#6-módulo-financeiro)
7. [Módulo Operações](#7-módulo-operações)
8. [Configurações — Calendários](#8-configurações--calendários)
9. [Configurações — Sindicatos](#9-configurações--sindicatos)
10. [Perfis e Permissões](#10-perfis-e-permissões)
11. [API REST (Swagger)](#11-api-rest-swagger)
12. [Perguntas Frequentes](#12-perguntas-frequentes)

---

## 1. Primeiros Passos

### Acesso ao Sistema

O Gestor Multiprojetos está disponível via navegador web:

- **URL do sistema:** `http://localhost:3000`
- **Navegadores suportados:** Chrome 90+, Firefox 90+, Edge 90+, Safari 15+
- **Resolução recomendada:** 1280x800 ou superior

### Requisitos

- Conexão com a internet (ou acesso à rede interna)
- Credenciais fornecidas pelo administrador do sistema

---

## 2. Login e Autenticação

### Fazendo Login

1. Acesse a URL do sistema
2. Na página de login, insira:
   - **Email:** seu email cadastrado
   - **Senha:** sua senha
3. Clique em **"Entrar"**
4. Você será redirecionado ao **Dashboard**

### Regras de Senha

- Mínimo de 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (!@#$%^&* etc.)

### Sessão

- A sessão dura **1 hora** (token de acesso)
- O sistema renova automaticamente a sessão até **7 dias** (token de refresh)
- Após 7 dias sem acesso, será necessário fazer login novamente

### Proteção de Segurança

- O sistema possui **rate limiting** — após muitas tentativas falhas, aguarde 1 minuto
- Tentativas de login são registradas para auditoria

---

## 3. Dashboard

O Dashboard é a tela inicial do sistema, com visão consolidada de todos os módulos.

### KPIs (Indicadores)

O Dashboard exibeCards com os principais indicadores:

| Card | Descrição |
|---|---|
| **Projetos Ativos** | Quantidade de projetos com status ativo |
| **Colaboradores** | Total de colaboradores ativos |
| **Orçamento Total** | Soma dos orçamentos de todos os projetos |
| **Taxa Ocupação** | Percentual de alocação dos recursos |

### Alertas

A seção de alertas exibe notificações como:
- Projetos com orçamento próximo do limite
- Colaboradores com jornada irregular
- Índices financeiros desatualizados

### Exportar CSV

1. Clique no botão **"Exportar CSV"** no Dashboard
2. Um arquivo `.csv` será baixado com os dados consolidados
3. O arquivo pode ser aberto no Excel ou Google Sheets

### Navegação pela Sidebar

A barra lateral (sidebar) à esquerda permite acesso rápido a todos os módulos:

| Ícone | Módulo | Rota |
|---|---|---|
| 📊 | Dashboard | /dashboard |
| 📁 | Projetos | /projetos |
| 👥 | Recursos Humanos | /rh |
| 💰 | Financeiro | /financeiro |
| ⚙️ | Operações | /operacoes |
| 📅 | Calendários | /config/calendarios |
| 🏢 | Sindicatos | /config/sindicatos |

A sidebar pode ser recolhida clicando no botão ◀/▶.

---

## 4. Módulo Projetos

### Visão Geral

Gerenciamento completo do portfólio de projetos, incluindo criação, edição, busca e importação em lote.

### Listar Projetos

Ao acessar **Projetos**, você verá a tabela com todos os projetos cadastrados, contendo:
- Código do projeto
- Nome
- Status (Ativo, Suspenso, Encerrado)
- Data de início e fim
- Orçamento

### Criar Projeto

1. Clique em **"Novo Projeto"** ou **"+"**
2. Preencha os campos obrigatórios:
   - **Código:** Código único do projeto (ex: PR_001)
   - **Nome:** Nome descritivo
   - **Data Início:** Data de início prevista
   - **Data Fim:** Data de término prevista
   - **Orçamento:** Valor total do orçamento
3. Clique em **"Salvar"**

### Editar Projeto

1. Na tabela de projetos, clique no projeto desejado
2. Altere os campos necessários
3. Clique em **"Salvar"**

### Buscar Projeto

Use o campo de busca no topo da tabela para filtrar projetos por nome ou código.

### Importação em Lote

1. Prepare um arquivo JSON com os dados dos projetos
2. Use o endpoint `/projects/import/bulk` via API
3. O sistema validará e importará os projetos automaticamente

---

## 5. Módulo Recursos Humanos

### Visão Geral

Gerenciamento de colaboradores, jornadas de trabalho e upload de dados via CSV.

### Listar Colaboradores

A tabela de colaboradores exibe:
- Matrícula
- Nome
- Cargo
- Cidade/Estado
- Taxa hora
- Status (Ativo/Inativo)

### Criar Colaborador

1. Clique em **"Novo Colaborador"** ou **"+"**
2. Preencha:
   - **Matrícula:** Código único
   - **Nome:** Nome completo
   - **Cargo:** Cargo funcional
   - **Taxa Hora:** Valor por hora de trabalho (R$)
   - **Carga Horária:** Horas mensais
   - **Cidade/Estado:** Localização
   - **Data Admissão:** Data de início
3. Clique em **"Salvar"**

### Upload CSV (Importação em Lote)

1. Clique em **"Upload CSV"** ou **"Importar"**
2. Selecione o arquivo CSV com os dados
3. O sistema processará e importará os colaboradores
4. Um relatório de sucesso/erros será exibido

**Formato do CSV:**
```
matricula,nome,cargo,taxaHora,cargaHoraria,cidade,estado,dataAdmissao
001,João Silva,Analista,85.50,176,Curitiba,PR,2024-01-15
```

### Jornadas

Para cada colaborador, é possível registrar jornadas mensais:
- Mês/Ano
- Horas previstas
- Horas realizadas
- Projeto associado

---

## 6. Módulo Financeiro

### Visão Geral

Controle financeiro por projeto, incluindo despesas, provisões e índices de reajuste.

### Despesas

Lista todas as despesas registradas no sistema:
- Projeto associado
- Tipo de despesa
- Valor
- Data
- Observações

### Provisões

Visualize as provisões financeiras calculadas automaticamente:
- Férias
- 13º salário
- FGTS
- Encargos sociais

### Índices

Gerencie os índices de reajuste aplicados:
- IPCA
- IGP-M
- Índice de dissídio
- Data de vigência

### Custo Total por Projeto

Consulte o custo total consolidado de um projeto, incluindo:
- Mão de obra direta
- Despesas operacionais
- Provisões
- Encargos

---

## 7. Módulo Operações

### Visão Geral

Operações em massa e recálculos automáticos do sistema.

### Recálculo Cascata

Recalcula automaticamente todos os valores dependentes de um projeto:

1. Selecione o **Projeto** no seletor
2. Selecione o **Mês/Ano** de referência
3. Clique em **"Executar Recálculo"**
4. O sistema recalculará:
   - Custos de mão de obra
   - Provisões
   - Totais financeiros

### Atualização de Jornadas em Massa

1. Selecione o **Projeto**
2. Defina o **Período** (mês/ano início e fim)
3. Clique em **"Atualizar Jornadas"**

### Recálculo de Taxas

1. Selecione o **Projeto**
2. Defina o **Percentual de ajuste**
3. Clique em **"Aplicar"**

### Histórico de Operações

A tabela de histórico mostra todas as operações realizadas:
- Data/hora
- Tipo de operação
- Projeto afetado
- Usuário que executou
- Status (sucesso/erro)

---

## 8. Configurações — Calendários

### Visão Geral

Configuração de calendários anuais com feriados e dias úteis por estado.

### Listar Calendários

A tabela exibe os calendários cadastrados por ano, com:
- Ano
- Estado
- Total de dias úteis
- Feriados configurados

### Criar Calendário

1. Clique em **"Novo"** ou **"+"**
2. Preencha o ano e estado
3. Adicione feriados manualmente ou use o Seed

### Seed (Preencher Automaticamente)

1. Clique em **"Seed"** ou **"Preencher Feriados"**
2. Selecione o **Ano**
3. O sistema preencherá automaticamente os feriados nacionais e estaduais

### Calcular Dias Úteis

O sistema calcula dias úteis considerando:
- Feriados nacionais
- Feriados estaduais
- Fins de semana

**Exemplo:** Para saber os dias úteis de junho/2026 no PR:
- O sistema retornará o total descontando feriados e weekends

---

## 9. Configurações — Sindicatos

### Visão Geral

Gerenciamento de sindicatos, aplicação de dissídios e simulação de impacto financeiro.

### Listar Sindicatos

A tabela exibe:
- Nome do sindicato
- UF
- Base de cálculo
- Percentual de dissídio
- Data base

### Criar Sindicato

1. Clique em **"Novo"** ou **"+"**
2. Preencha:
   - Nome
   - UF
   - Percentual de dissídio
   - Data base do dissídio
3. Clique em **"Salvar"**

### Aplicar Dissídio

1. Selecione o sindicato
2. Clique em **"Aplicar Dissídio"**
3. O sistema recalculará as taxas de todos os colaboradores vinculados

### Simulação de Impacto Financeiro

1. Clique em **"Simular Impacto"**
2. Defina o percentual hipotético
3. O sistema mostrará:
   - Impacto total em R$
   - Impacto por projeto
   - Colaboradores afetados

---

## 10. Perfis e Permissões

### Roles (Perfis)

O sistema possui 6 perfis de acesso:

| Role | Descrição | Acesso |
|---|---|---|
| **ADMIN** | Administrador | Acesso total a todos os módulos |
| **PMO** | Escritório de Projetos | Projetos, Dashboard, Operações, Configurações |
| **PROJECT_MANAGER** | Gerente de Projeto | Projetos (seus), RH (leitura), Dashboard |
| **HR** | Recursos Humanos | RH (total), Projetos (leitura) |
| **FINANCE** | Financeiro | Financeiro (total), Projetos (leitura) |
| **VIEWER** | Visualizador | Leitura em todos os módulos |

### Permissões Granulares

Cada role possui permissões específicas como:
- `project:create`, `project:read`, `project:update`, `project:delete`
- `hr:create`, `hr:read`, `hr:update`, `hr:delete`
- `financial:read`, `financial:create`, `financial:approve`
- `config:manage`, `operations:execute`
- E ~35 permissões adicionais

### Verificando Seu Perfil

Seu perfil e permissões são exibidos no menu do usuário (canto superior direito).

---

## 11. API REST (Swagger)

### Acesso

A documentação interativa da API está disponível em:
- **URL:** `http://localhost:3001/api/docs`
- **Disponível apenas em ambiente de desenvolvimento**

### Autenticação na API

1. Acesse `/api/docs`
2. Execute `POST /auth/login` com suas credenciais
3. Copie o `accessToken` retornado
4. Clique em **"Authorize"** (ícone de cadeado)
5. Cole o token no formato: `Bearer <seu_token>`
6. Agora pode testar todos os endpoints autenticados

### Principais Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| POST | /auth/login | Login |
| POST | /auth/register | Registro |
| POST | /auth/refresh | Renovar token |
| GET | /auth/me | Dados do usuário logado |
| GET | /projects | Listar projetos |
| POST | /projects | Criar projeto |
| GET | /hr/colaboradores | Listar colaboradores |
| POST | /hr/colaboradores | Criar colaborador |
| POST | /hr/colaboradores/upload-csv | Upload CSV |
| GET | /financial/despesas | Listar despesas |
| GET | /financial/provisoes | Listar provisões |
| GET | /financial/indices | Listar índices |
| GET | /calendario | Listar calendários |
| GET | /calendario/calcular/dias-uteis | Calcular dias úteis |
| GET | /sindicatos | Listar sindicatos |
| POST | /sindicatos/dissidio/aplicar | Aplicar dissídio |
| POST | /operations/mass-update/recalculo-cascata | Recálculo cascata |
| GET | /operations/mass-update/historico | Histórico de operações |
| GET | /dashboard/kpis | KPIs do dashboard |
| GET | /health | Status do sistema |

---

## 12. Perguntas Frequentes

### Login

**P: Esqueci minha senha. O que fazer?**  
R: Contate o administrador do sistema para reset de senha.

**P: Estou recebendo erro "Too Many Requests".**  
R: Aguarde 1 minuto e tente novamente. O sistema limita tentativas por segurança.

### Projetos

**P: Como importar projetos da planilha PR_SEEC_2026?**  
R: Use o endpoint `POST /projects/import/bulk` com os dados no formato JSON.

**P: Posso editar um projeto encerrado?**  
R: Sim, desde que seu perfil tenha permissão de edição.

### RH

**P: O upload CSV deu erro. O que verificar?**  
R: Verifique se o arquivo está no formato correto (UTF-8, separado por vírgula) e se os campos obrigatórios estão preenchidos.

### Financeiro

**P: Os valores de provisão estão incorretos.**  
R: Execute um Recálculo Cascata no módulo Operações para recalcular todos os valores.

### Geral

**P: O sistema está lento.**  
R: Verifique a conexão de rede. Se persistir, contate o suporte técnico.

**P: Como solicitar acesso?**  
R: Contate o administrador informando seu email e o perfil necessário.

---

## Suporte

- **Email:** suporte@hw1.com.br
- **Documentação Técnica:** `/docs/ARCHITECTURE.md`
- **API Docs:** `http://localhost:3001/api/docs`

---

*Manual do Usuário — Gestor Multiprojetos v1.0*
