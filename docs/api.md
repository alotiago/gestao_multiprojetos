# Referência da API

> **Versão:** v1 (planejada)  
> **Status:** Em definição  
> **Última atualização:** 2026-03

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Convenções](#convenções)
- [Tratamento de Erros](#tratamento-de-erros)
- [Endpoints](#endpoints)
  - [Autenticação](#endpoints-de-autenticação)
  - [Usuários](#endpoints-de-usuários)
  - [Projetos](#endpoints-de-projetos)
  - [Tarefas](#endpoints-de-tarefas)
  - [Equipes e Recursos](#endpoints-de-equipes-e-recursos)
  - [Riscos](#endpoints-de-riscos)
  - [Dashboard e Relatórios](#endpoints-de-dashboard-e-relatórios)

---

## 🗺️ Visão Geral

A API do **Gestão de Multiprojetos** é uma API RESTful que retorna dados no formato JSON.

**URL Base:**

```
https://api.gestao-multiprojetos.local/v1
```

> A URL base será atualizada quando o ambiente de produção for configurado.

---

## 🔒 Autenticação

A API utiliza autenticação via **JWT (JSON Web Token)**.

Para acessar endpoints protegidos, inclua o token no cabeçalho `Authorization`:

```http
Authorization: Bearer <seu_token_jwt>
```

O token é obtido no endpoint de login (veja [POST /auth/login](#post-authlogin)) e tem validade configurável (padrão: 8 horas).

---

## 📐 Convenções

### Formato de Requisição e Resposta

- Todas as requisições e respostas utilizam **JSON** (`Content-Type: application/json`).
- Datas e horários seguem o formato **ISO 8601**: `2026-03-16T10:00:00Z`.
- IDs são **UUIDs** no formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

### Paginação

Listagens são paginadas. Use os parâmetros de query:

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | inteiro | `1` | Número da página |
| `per_page` | inteiro | `20` | Itens por página (máx. 100) |

Resposta paginada inclui metadados:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

### Filtros e Ordenação

Listagens suportam filtros via query params:

```
GET /v1/projetos?status=ativo&ordenar_por=nome&ordem=asc
```

---

## ⚠️ Tratamento de Erros

Em caso de erro, a API retorna um objeto com:

```json
{
  "erro": {
    "codigo": "PROJETO_NAO_ENCONTRADO",
    "mensagem": "O projeto solicitado não foi encontrado.",
    "detalhes": {}
  }
}
```

### Códigos HTTP Utilizados

| Código | Significado |
|---|---|
| `200 OK` | Requisição bem-sucedida |
| `201 Created` | Recurso criado com sucesso |
| `204 No Content` | Operação bem-sucedida sem conteúdo de retorno |
| `400 Bad Request` | Dados inválidos na requisição |
| `401 Unauthorized` | Token ausente ou inválido |
| `403 Forbidden` | Sem permissão para realizar a ação |
| `404 Not Found` | Recurso não encontrado |
| `409 Conflict` | Conflito (ex.: e-mail já cadastrado) |
| `422 Unprocessable Entity` | Erro de validação dos campos |
| `500 Internal Server Error` | Erro interno do servidor |

---

## 🔗 Endpoints

> **Nota:** Os endpoints descritos abaixo representam o planejamento da API. A implementação será documentada com exemplos completos de requisição e resposta conforme o desenvolvimento avançar.

---

### Endpoints de Autenticação

#### POST /auth/login

Autentica um usuário e retorna um token JWT.

**Requisição:**
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "senha": "SenhaSegura123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expira_em": "2026-03-16T18:00:00Z",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "usuario@exemplo.com",
    "papel": "gerente_projeto"
  }
}
```

---

#### POST /auth/logout

Invalida o token atual.

**Requisição:**
```http
POST /v1/auth/logout
Authorization: Bearer <token>
```

**Resposta:** `204 No Content`

---

#### POST /auth/recuperar-senha

Solicita o envio de e-mail para recuperação de senha.

**Requisição:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta (200):**
```json
{
  "mensagem": "Se o e-mail estiver cadastrado, você receberá as instruções em breve."
}
```

---

### Endpoints de Usuários

#### GET /usuarios/me

Retorna os dados do usuário autenticado.

**Resposta (200):**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "usuario@exemplo.com",
  "papel": "gerente_projeto",
  "criado_em": "2026-01-01T00:00:00Z"
}
```

---

#### PATCH /usuarios/me

Atualiza os dados do usuário autenticado.

**Requisição:**
```json
{
  "nome": "João P. Silva"
}
```

---

### Endpoints de Projetos

#### GET /projetos

Lista todos os projetos acessíveis ao usuário autenticado.

**Parâmetros de Query:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | string | Filtra por status do projeto |
| `gerente_id` | UUID | Filtra por gerente responsável |
| `ordenar_por` | string | Campo para ordenação (`nome`, `data_inicio`, `data_fim`) |
| `ordem` | string | `asc` ou `desc` |

**Resposta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Sistema ERP",
      "status": "ativo",
      "data_inicio": "2026-01-01",
      "data_fim_prevista": "2026-12-31",
      "percentual_conclusao": 35,
      "gerente": {
        "id": "uuid",
        "nome": "Maria Santos"
      }
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

---

#### POST /projetos

Cria um novo projeto.

**Requisição:**
```json
{
  "nome": "Novo Projeto",
  "descricao": "Descrição do projeto",
  "data_inicio": "2026-04-01",
  "data_fim_prevista": "2026-12-31",
  "orcamento": 150000.00,
  "gerente_id": "uuid-do-gerente"
}
```

**Resposta (201):**
```json
{
  "id": "uuid-gerado",
  "nome": "Novo Projeto",
  "status": "planejamento",
  ...
}
```

---

#### GET /projetos/:id

Retorna os detalhes de um projeto específico.

---

#### PATCH /projetos/:id

Atualiza um projeto existente.

---

#### DELETE /projetos/:id

Exclui um projeto (somente Administradores).

**Resposta:** `204 No Content`

---

### Endpoints de Tarefas

#### GET /projetos/:projeto_id/tarefas

Lista todas as tarefas de um projeto.

**Parâmetros de Query:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | string | Filtra por status da tarefa |
| `responsavel_id` | UUID | Filtra por responsável |
| `prioridade` | string | Filtra por prioridade |

---

#### POST /projetos/:projeto_id/tarefas

Cria uma nova tarefa em um projeto.

**Requisição:**
```json
{
  "titulo": "Implementar login",
  "descricao": "Desenvolver tela e lógica de autenticação",
  "prioridade": "alta",
  "responsavel_id": "uuid",
  "data_vencimento": "2026-05-01",
  "esforco_estimado": 16
}
```

---

#### GET /projetos/:projeto_id/tarefas/:id

Retorna os detalhes de uma tarefa.

---

#### PATCH /projetos/:projeto_id/tarefas/:id

Atualiza uma tarefa.

---

#### DELETE /projetos/:projeto_id/tarefas/:id

Exclui uma tarefa.

---

### Endpoints de Equipes e Recursos

#### GET /projetos/:projeto_id/membros

Lista os membros da equipe de um projeto.

---

#### POST /projetos/:projeto_id/membros

Adiciona um membro à equipe do projeto.

**Requisição:**
```json
{
  "usuario_id": "uuid",
  "papel": "desenvolvedor",
  "percentual_alocacao": 80,
  "data_inicio": "2026-04-01",
  "data_fim": "2026-12-31"
}
```

---

#### DELETE /projetos/:projeto_id/membros/:usuario_id

Remove um membro da equipe do projeto.

---

### Endpoints de Riscos

#### GET /projetos/:projeto_id/riscos

Lista os riscos registrados de um projeto.

---

#### POST /projetos/:projeto_id/riscos

Registra um novo risco.

**Requisição:**
```json
{
  "descricao": "Atraso na entrega de componentes de hardware",
  "probabilidade": "media",
  "impacto": "alto",
  "plano_mitigacao": "Solicitar componentes com antecedência e manter estoque reserva"
}
```

---

#### PATCH /projetos/:projeto_id/riscos/:id

Atualiza um risco (incluindo status).

---

### Endpoints de Dashboard e Relatórios

#### GET /dashboard

Retorna os dados consolidados do portfólio para o dashboard.

**Resposta (200):**
```json
{
  "resumo": {
    "total_projetos": 15,
    "projetos_ativos": 8,
    "projetos_em_risco": 3,
    "projetos_concluidos": 4
  },
  "kpis": {
    "percentual_medio_conclusao": 47,
    "tarefas_atrasadas": 12,
    "recursos_superalocados": 2
  },
  "projetos_em_destaque": [...]
}
```

---

#### GET /relatorios/projeto/:id

Gera o relatório de progresso de um projeto.

**Parâmetros de Query:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `formato` | string | `json` (padrão), `pdf`, `csv` |
| `data_inicio` | date | Período do relatório |
| `data_fim` | date | Período do relatório |

---

*Esta documentação será expandida com exemplos completos e detalhes adicionais conforme a implementação avançar.*
