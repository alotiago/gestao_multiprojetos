# 🚀 Gestor Multiprojetos – PR_SEEC_2026

Plataforma web de **Gestão Multiprojetos** que automatiza processos de controle financeiro, gestão de recursos humanos, calendários regionais, premissas sindicais e dashboards executivos.

> 📊 **Status Sprint 2**: ✅ 95% Completa | Aguardando Infraestrutura (DB+Cache)

## ⚡ 🆕 COMECE AQUI - Entry Point Principal

**👉 [COMECE_AQUI.md](./COMECE_AQUI.md)** ← Leia isto primeiro (5 minutos)

Outras opções rápidas:
- **3 minutos**: [QUICK_START.md](./QUICK_START.md)
- **5 minutos**: [ARVORE_DECISAO.md](./ARVORE_DECISAO.md) (escolher infraestrutura)
- **20 minutos**: [SETUP_AND_VALIDATION.md](./SETUP_AND_VALIDATION.md) (completo)
- **Por perfil**: [MAPA_NAVEGACAO.md](./MAPA_NAVEGACAO.md)

## 📋 Informações do Projeto

- **Projeto:** PR_SEEC_2026
- **Versão:** 1.0 Beta (Sprint 2)
- **Metodologia:** Scrum (10 Sprints de 2 semanas)
- **Data Início:** 01/03/2026
- **Status Atual:** Sprint 2 | Autenticação + RBAC Completo
- **próxima Sprint:** Sprint 3 (Módulo de Projetos) - 20/03/2026
- **Stack Principal:** TypeScript + NestJS + Next.js + PostgreSQL + Redis

### 🎯 Sprint 2 Status
- ✅ Autenticação JWT (Acesso + Refresh)
- ✅ RBAC com 36 permissões e 6 roles
- ✅ User Management CRUD
- ✅ 92 testes unitários (75% coverage)
- ✅ Documentação profissional (10 docs)
- ⏳ Infraestrutura (PostgreSQL + Redis) - 5% restante

## 🏗️ Estrutura do Projeto (Monorepo)

```
gestor_multiprojetos/
├── apps/
│   ├── frontend/              # SPA (Next.js + React)
│   └── backend/               # API (NestJS)
├── infrastructure/            # Configurações de infra (Docker, K8s, etc)
├── docs/                      # Documentação técnica
├── .github/workflows/         # GitHub Actions (CI/CD)
├── docker-compose.yml         # Orquestração de containers
├── .env.example              # Variáveis de ambiente (template)
├── package.json              # Monorepo root
├── turbo.json                # Configuração Turbo
└── README.md                 # Este arquivo
```

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** >= 18.0.0 ✅
- **npm** >= 9.0.0 ✅
- **Docker** >= 20.10.0 OR **PostgreSQL** >= 16 ⏳ (Choose one)

### 3 Passos Rápidos (15 minutos)

1. **Infraestrutura**: Ver [QUICK_START.md](./QUICK_START.md)
2. **Setup**: `npx prisma migrate dev --name init --schema=apps/backend/prisma/schema.prisma`
3. **Testes**: `npm run test` → 92 testes devem passar

### 📚 Documentação Rápida

```
COMECE AQUI ➡️ Escolha seu perfil:

🎯 Novo no Projeto?
   → [QUICK_START.md](./QUICK_START.md) (3 minutos)
   → [STATUS_SPRINT_2.md](./STATUS_SPRINT_2.md) (5 minutos)

👨‍💻 Developer?
   → [INFRAESTRUTURA_SETUP.md](./INFRAESTRUTURA_SETUP.md) (setup DB)
   → [docs/SPRINT_2_RBAC_IMPLEMENTATION_GUIDE.md](./docs/SPRINT_2_RBAC_IMPLEMENTATION_GUIDE.md) (usar RBAC)

📊 Liderança?
   → [docs/SPRINT_2_EXECUTIVE_SUMMARY.md](./docs/SPRINT_2_EXECUTIVE_SUMMARY.md)

🧪 QA/Tester?
   → [docs/SPRINT_2_VALIDATION_GUIDE.md](./docs/SPRINT_2_VALIDATION_GUIDE.md)

❓ Precisa de Help?
   → [docs/ÍNDICE_DOCUMENTAÇÃO.md](./docs/ÍNDICE_DOCUMENTAÇÃO.md) - Índice completo
```

### 🚀 Instalação e Execução Local

1. **Clonar o repositório**
   ```bash
   git clone <repo-url>
   cd gestor_multiprojetos
   ```

2. **Copiar arquivo de ambiente**
   ```bash
   cp .env.example .env
   ```

3. **Instalar dependências** (se rodar localmente sem Docker)
   ```bash
   npm install
   ```

4. **Iniciar com Docker Compose**
   ```bash
   docker-compose up -d
   ```

   Serviços disponíveis após o startup:
   - **Frontend:** http://localhost:3000
   - **Backend:** http://localhost:3001
   - **PostgreSQL:** localhost:5432
   - **Redis:** localhost:6379
   - **Prometheus:** http://localhost:9090
   - **Grafana:** http://localhost:3002

5. **Parar os containers**
   ```bash
   docker-compose down
   ```

## 📦 Scripts Disponíveis

### Monorepo (Turbo)

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npm run test

# Linting
npm run lint

# Formatação (Prettier)
npm run format

# Limpeza completa
npm run clean
```

### Backend Específico

```bash
cd apps/backend
npm run dev         # Iniciar em modo desenvolvimento
npm run build       # Build para produção
npm run test        # Testes
npm run migrate     # Migrações de banco de dados
```

### Frontend Específico

```bash
cd apps/frontend
npm run dev         # Iniciar em modo desenvolvimento
npm run build       # Build para produção
npm run export      # Export estático (se necessário)
```

## 🗄️ Banco de Dados

### Migrações

As migrações são gerenciadas via **Prisma** (backend):

```bash
cd apps/backend

# Criar nova migração
npm run prisma migrate dev --name add_users_table

# Aplicar migrações pendentes
npm run prisma migrate deploy

# Resetar banco (apenas desenvolvimento)
npm run prisma migrate reset
```

### Seed (Dados Iniciais)

```bash
cd apps/backend
npm run seed
```

## 🔐 Autenticação

A plataforma utiliza **JWT (JSON Web Tokens)** para autenticação:

- **Token JWT:** Válido por `24h` (configurável)
- **Refresh Token:** Válido por `7d` (configurável)
- **Armazenamento:** localStorage (frontend) + HttpOnly Cookies (opcional)

### Fluxo de Login

1. Usuário envia credenciais (email + senha)
2. Backend valida e retorna JWT + Refresh Token
3. Frontend armazena JWT no localStorage
4. Todas as requisições incluem o JWT no header `Authorization: Bearer <token>`
5. Se JWT expirar, frontend usa Refresh Token para obter novo

## 📊 Monitoramento e Logs

### Prometheus + Grafana

Painel de monitoramento disponível em:
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3002 (user: `admin` / password: `admin`)

### Métricas Coletadas

- Requisições HTTP (latência, taxa de erro)
- Performance do banco de dados
- Uso de memória
- Taxa de CPU

### Logs

Os logs são centralizados em:
- **Backend:** `apps/backend/logs/`
- **Frontend:** Console do navegador + Sentry (futuro)

## 🧪 Testes

### Backend

```bash
cd apps/backend

# Testes unitários
npm run test

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Frontend

```bash
cd apps/frontend

# Testes com Jest
npm run test

# Testes E2E com Cypress
npm run cypress

# Cobertura
npm run test:cov
```

## 🔄 CI/CD (GitHub Actions)

O projeto possui pipelines CI/CD automáticos:

### Trigger

- **Push em `main`:** Build + Testes + Deploy em Staging
- **Pull Request:** Linting + Testes + Code Review
- **Tag de Release:** Build + Deploy em Produção

### Workflows

Veja [.github/workflows/](.github/workflows/) para detalhes dos workflows.

## 📖 Documentação

- [Proposta Técnica](docs/proposta_tecnica_scrum.md) – Requisitos, escopo, arquitetura
- [Identidade Visual](docs/identidade_visual_hw1.md) – Design system da HW1
- [API (Swagger)](http://localhost:3001/api/docs) – Documentação das endpoints (quando backend rodar)
- [ADR (Architecture Decision Records)](docs/adr/) – Decisões arquiteturais

## 🛠️ Troubleshooting

### Problema: Porta 3000 ou 3001 já em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Problema: PostgreSQL não inicia

```bash
# Verificar logs
docker-compose logs postgres

# Resetar banco
docker-compose down -v
docker-compose up -d
```

### Problema: Frontend não conecta ao backend

- Verificar se backend está rodando: `curl http://localhost:3001/health`
- Verificar variável `NEXT_PUBLIC_API_URL` em `.env`
- Limpar cache do navegador (Ctrl+Shift+Delete)

## 💼 Equipe do Projeto

- **Product Owner:** (a definir)
- **Scrum Master:** (a definir)
- **Tech Lead Frontend:** (a definir)
- **Tech Lead Backend:** (a definir)
- **DevOps:** (a definir)
- **QA Lead:** (a definir)

## 📄 Licença

Propriedade da CNI (Confederação Nacional da Indústria).

---

**Versão do Documento:** 1.0 | **Data:** 01/03/2026
