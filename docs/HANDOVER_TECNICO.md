# Handover Técnico — Gestor Multiprojetos

**De:** Equipe de Desenvolvimento  
**Para:** Equipe de Operações / Administradores  
**Data:** Março 2026

---

## 1. Visão Geral da Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Nginx     │────▶│   Frontend   │     │  Prometheus  │
│   (proxy)   │     │  Next.js:3000│     │    :9090     │
│   :80/:443  │     └──────────────┘     └──────┬──────┘
│             │                                  │
│             │────▶┌──────────────┐     ┌──────▼──────┐
│             │     │   Backend    │     │   Grafana   │
│             │     │  NestJS:3001 │     │    :3002    │
│             │     └───┬─────┬───┘     └─────────────┘
│             │         │     │
└─────────────┘    ┌────▼─┐ ┌─▼────┐
                   │Postgres│ │Redis │
                   │ :5432  │ │:6379 │
                   └────────┘ └──────┘
```

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Next.js + React | 14.2 + 18 |
| Backend | NestJS + TypeScript | 10.x + 5.2 |
| ORM | Prisma | 5.22 |
| Banco | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Proxy | Nginx | Alpine |
| Monitoramento | Prometheus + Grafana | Latest |
| Containers | Docker Compose | v2 |

---

## 2. Estrutura de Diretórios

```
gestor_multiprojetos/
├── apps/
│   ├── backend/                 # API NestJS
│   │   ├── prisma/              # Schema, migrations, seed, migrate-data
│   │   ├── src/
│   │   │   ├── modules/         # Módulos de negócio
│   │   │   │   ├── auth/        # Autenticação JWT + RBAC
│   │   │   │   ├── users/       # Gerenciamento de usuários
│   │   │   │   ├── projects/    # Projetos
│   │   │   │   ├── hr/          # Recursos Humanos
│   │   │   │   ├── financial/   # Financeiro
│   │   │   │   ├── dashboard/   # Dashboard + KPIs
│   │   │   │   ├── operations/  # Operações em massa
│   │   │   │   ├── calendario/  # Calendários + feriados
│   │   │   │   ├── sindicato/   # Sindicatos + dissídio
│   │   │   │   └── config/      # Configurações do sistema
│   │   │   ├── prisma/          # Prisma Module/Service
│   │   │   ├── app.module.ts    # Módulo raiz + ThrottlerModule
│   │   │   └── main.ts          # Bootstrap + Helmet + Swagger
│   │   ├── k6/                  # Testes de performance
│   │   └── test/                # Testes E2E backend
│   └── frontend/                # UI Next.js
│       ├── src/app/             # Pages (App Router)
│       ├── src/stores/          # Zustand (auth, ui)
│       ├── cypress/             # Testes E2E
│       └── public/              # Assets estáticos
├── docs/                        # Documentação completa
├── infrastructure/              # Configs de infra
│   ├── nginx/nginx.conf         # Proxy reverso
│   └── prometheus.yml           # Métricas
├── docker-compose.yml           # Dev
├── docker-compose.prod.yml      # Produção
└── .env.production.example      # Template de variáveis
```

---

## 3. Comandos Essenciais

### Desenvolvimento

```bash
# Iniciar ambiente completo (dev)
docker compose up -d

# Rebuild após mudanças no código
docker compose build backend frontend
docker compose up -d

# Acessar logs
docker compose logs -f backend
docker compose logs -f frontend

# Executar seed
docker compose exec backend npx prisma db seed

# Executar migrations
docker compose exec backend npx prisma migrate deploy
```

### Produção

```bash
# Deploy inicial
cp .env.production.example .env
# Edite .env com valores reais
docker compose -f docker-compose.prod.yml up -d --build

# Migração de dados
docker compose exec backend npx ts-node prisma/migrate-data.ts

# Verificar saúde
curl https://seudominio.com.br/health

# Backup do banco
docker compose exec postgres pg_dump -U gestor_admin gestor_multiprojetos > backup_$(date +%Y%m%d).sql

# Restore do banco
cat backup.sql | docker compose exec -T postgres psql -U gestor_admin gestor_multiprojetos
```

### Testes

```bash
# Backend unit tests
cd apps/backend && npx jest

# Frontend unit tests
cd apps/frontend && npx jest

# E2E (Cypress)
cd apps/frontend && npx cypress run

# Performance (k6)
k6 run apps/backend/k6/load-test.js
```

---

## 4. Autenticação e Segurança

### Fluxo JWT

1. `POST /auth/login` → retorna `{ accessToken, refreshToken, expiresIn }`
2. Access token: válido por 1h, enviado em `Authorization: Bearer <token>`
3. Refresh token: válido por 7d, armazenado no banco com revogação
4. `POST /auth/refresh` → gera novo par de tokens

### Segurança Implementada

| Controle | Detalhe |
|---|---|
| Rate Limiting | 200 req/min global, 30 req/min login, 5 req/min registro |
| Security Headers | helmet (CSP, HSTS, X-Frame-Options, etc.) |
| Password Policy | Min 8 chars, maiúscula, minúscula, número, especial |
| CORS | Origin restrito a FRONTEND_URL |
| Input Validation | ValidationPipe com whitelist + forbidNonWhitelisted |
| SQL Injection | Prisma ORM (queries parametrizadas) |
| JWT | Sem fallback de secret — crash se não configurado |

### Roles e Permissões

| Role | Acesso |
|---|---|
| ADMIN | Tudo |
| PMO | Projetos, Dashboard, Operações, Config |
| PROJECT_MANAGER | Projetos (seus), RH (leitura), Dashboard |
| HR | RH (total), Projetos (leitura) |
| FINANCE | Financeiro (total), Projetos (leitura) |
| VIEWER | Leitura em tudo |

---

## 5. Banco de Dados

### Models Principais

| Tabela | Descrição |
|---|---|
| users | Usuários do sistema |
| projects | Projetos e dados base |
| colaboradores | Colaboradores/funcionários |
| jornadas | Jornadas mensais por colaborador |
| despesas | Despesas por projeto |
| provisoes | Provisões financeiras |
| sindicatos | Sindicatos e regras trabalhistas |
| calendarios | Feriados e calendário |
| indices_financeiros | IPCA, IGP-M, etc. |
| audit_logs | Auditoria de ações |

### Migrations

```bash
# Ver estado das migrations
npx prisma migrate status

# Aplicar migrations pendentes
npx prisma migrate deploy

# Reset completo (DANGER — apaga dados!)
npx prisma migrate reset
```

---

## 6. Monitoramento

### Prometheus (:/9090)

Coleta métricas de:
- Backend HTTP requests
- Response times
- Database connections
- Redis cache hits/misses

### Grafana (:/3002)

- **Login padrão:** admin / (definido em GRAFANA_PASSWORD)
- Configurar Data Source: Prometheus → http://prometheus:9090
- Importar dashboards: Node.js, PostgreSQL, Redis

### Health Check

```bash
curl http://localhost:3001/health
# Retorna: { "status": "ok", "timestamp": "..." }
```

---

## 7. Troubleshooting

| Problema | Causa Provável | Solução |
|---|---|---|
| Backend não inicia | JWT_SECRET não configurado | Verificar .env |
| 401 em todas as rotas | Token expirado | Fazer novo login |
| 429 Too Many Requests | Rate limiting | Aguardar 1 minuto |
| 503 Service Unavailable | Container down | `docker compose up -d` |
| Prisma error | Migration pendente | `npx prisma migrate deploy` |
| Redis connection error | Redis down ou senha errada | Verificar REDIS_PASSWORD |
| Login retorna undefined token | Campo `accessToken` (camelCase) | Verificar frontend authStore |

---

## 8. Checklist de Deploy

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] JWT_SECRET gerado com `openssl rand -base64 64`
- [ ] JWT_REFRESH_SECRET diferente do JWT_SECRET
- [ ] Senhas do banco e Redis fortes (20+ caracteres)
- [ ] Certificados TLS em `infrastructure/certs/`
- [ ] DNS configurado para o domínio
- [ ] `docker compose -f docker-compose.prod.yml up -d --build`
- [ ] Migrations aplicadas: `docker compose exec backend npx prisma migrate deploy`
- [ ] Seed executado: `docker compose exec backend npx prisma db seed`
- [ ] Dados migrados: `docker compose exec backend npx ts-node prisma/migrate-data.ts`
- [ ] Health check OK: `curl https://dominio/health`
- [ ] Login de admin funcionando
- [ ] Grafana configurado com data source
- [ ] Backup automático do banco configurado (cron)

---

*Handover Técnico — Gestor Multiprojetos v1.0*
