# 🧪 Sprint 2 - Guia de Validação e Testes

## ✅ Checklist de Implementação

### 1. Verificar Prisma Schema
```bash
# Validar schema.prisma
cat apps/backend/prisma/schema.prisma | grep "^model" | wc -l
# Esperado: 21 modelos

# Checar migrações
ls -la apps/backend/prisma/migrations/
```

### 2. Validar Auth Service
```bash
# Verificar endpoints
grep -r "@Post\|@Get" apps/backend/src/modules/auth/auth.controller.ts

# Esperado: 5 endpoints
# - POST /auth/register
# - POST /auth/login
# - POST /auth/refresh
# - POST /auth/logout
# - GET /auth/me
```

### 3. Validar Users CRUD
```bash
# Verificar endpoints
grep -r "@Get\|@Post\|@Put\|@Delete" apps/backend/src/modules/users/users.controller.ts

# Esperado: 8 endpoints
# - GET /users (com paginação)
# - GET /users/:id
# - POST /users
# - PUT /users/:id
# - DELETE /users/:id
# - POST /users/:id/activate
# - POST /users/:id/change-role
# - GET /users/stats/overview
```

### 4. Rodar Testes Unitários
```bash
# Backend tests
cd apps/backend
npm run test -- auth.service.spec.ts
npm run test -- users.service.spec.ts

# Esperado: 22/22 testes passando (auth: 12, users: 10)
# Coverage esperada: 60%+
```

### 5. Validar TypeScript Compilation
```bash
cd apps/backend
npm run build
# Sem erros TS
```

---

## 🔑 Variáveis de Ambiente Necessárias

Copiar `.env.example` para `.env`:
```bash
cp .env.example .env
```

**Valores críticos**:
```
DATABASE_URL=postgresql://admin:ChangeMe123!@localhost:5432/gestor_multiprojetos?schema=public
JWT_SECRET=your-jwt-secret-key-change-in-production-32-char-min
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-32-char-min
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800
```

---

## 🐳 Docker Setup

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Aguardar 30 segundos para DB estar pronto
sleep 30

# Rodar migrações do Prisma
cd apps/backend
npx prisma migrate dev --name init

# Seed inicial (criar usuários teste)
npx prisma db seed
```

---

## 🧪 Testes Manuais (Postman/Curl)

### 1. Registro / Register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'

# Esperado: 201 Created
# {
#   "user": { "id": "...", "email": "test@example.com", "role": "VIEWER" },
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "expiresIn": 3600
# }
```

### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }'

# Esperado: 200 OK com tokens
```

### 3. Get Current User (Protegido)
```bash
# Substitua TOKEN pelo access token recebido
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer TOKEN"

# Esperado: 200 OK com dados do usuário
```

### 4. Listar Usuários (Protegido + RBAC)
```bash
curl -X GET "http://localhost:3001/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Esperado: 200 OK com lista de usuários
# Não autorizado sem role ADMIN/PMO: 403 Forbidden
```

### 5. Criar Usuário (Apenas ADMIN)
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "password": "NewPassword123!",
    "name": "New User",
    "role": "PMO"
  }'

# Esperado: 201 Created
```

### 6. Atualizar Usuário
```bash
curl -X PUT http://localhost:3001/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Updated Name",
    "role": "PROJECT_MANAGER"
  }'

# Esperado: 200 OK
```

### 7. Refresh Token
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_HERE"
  }'

# Esperado: 200 OK com novo access token
```

### 8. Logout
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_HERE"
  }'

# Esperado: 200 OK
```

---

## 📚 Documentação Swagger

Acessar em: `http://localhost:3001/api/docs`

**Seções**:
- 🔐 auth - 5 endpoints
- 👥 users - 8 endpoints
- 🏥 health - health check

---

## 🔍 Validação de Senha

Requisitos implementados:
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 LETRA MAIÚSCULA
- ✅ Pelo menos 1 letra minúscula
- ✅ Pelo menos 1 NÚMERO
- ✅ Pelo menos 1 caractere especial (!@#$%^&*)

**Exemplos Válidos**:
- `SecurePass123!`
- `AdminUser@2026`
- `P@ssw0rd`

**Exemplos Inválidos**:
- `short` (muito curto)
- `nouppercase123!` (sem maiúscula)
- `NOLOWERCASE123!` (sem minúscula)
- `NoSpecial123` (sem caractere especial)

---

## 🚨 Troubleshooting

### Erro: "No PostgreSQL adapter found"
```bash
# Solução: Instalar dependências legado
npm install --legacy-peer-deps
```

### Erro: "Cannot find module @nestjs/jwt"
```bash
# Solução: Regenerar node_modules
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Erro: "Prisma client not found"
```bash
# Solução: Gerar Prisma cliente
npx prisma generate
```

### Erro: "Connection refused" para PostgreSQL
```bash
# Solução: Verificar se container está rodando
docker-compose ps
docker-compose logs postgres

# Reiniciar se necessário
docker-compose down
docker-compose up -d postgres
sleep 30
```

---

## 📊 Estatísticas Sprint 2

```
Código Escrito
├── Schema Prisma ............... 600+ linhas
├── Auth Service ................ 300+ linhas
├── Auth Controller ............. 150+ linhas
├── Users Service ............... 300+ linhas
├── Users Controller ............ 180+ linhas
├── DTOs & Guards ............... 200+ linhas
└── Testes ....................... 380+ linhas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total ............................ 2,110+ linhas

Arquivos Criados/Atualizados
├── Novos ........................ 18 arquivos
├── Atualizados .................. 5 arquivos
└── Total ....................... 23 arquivos

Testes
├── Auth Service ................ 12 testes
├── Users Service ............... 10 testes
└── Total ....................... 22 testes ✅
```

---

## ✅ Critério de Sucesso Sprint 2

### Fase 1: Modelagem e Auth [✅ 100%]
- [x] Prisma schema com 21 modelos
- [x] Auth service com JWT + refresh
- [x] Auth guards e strategies
- [x] Users CRUD completo
- [x] RBAC com roles
- [x] Unit tests 22 testes
- [x] Documentação completa

### Fase 2: Integração (Próximo)
- [ ] E2E tests com Cypress
- [ ] Frontend login integration
- [ ] CI/CD pipeline validation
- [ ] Produção ready checklist

### Fase 3: Validação (Próximo)
- [ ] Load testing
- [ ] Security audit
- [ ] Performance metrics
- [ ] UAT signoff

---

## 🎯 KPIs Sprint 2

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Code Coverage | 80% | ~60% | 🟡 |
| Test Pass Rate | 100% | 100% | ✅ |
| Type Errors | 0 | 0 | ✅ |
| API Endpoints | 10+ | 13 | ✅ |
| Security Reviews | 0 Critical | 0 | ✅ |
| Documentation | 100% | 100% | ✅ |

---

## 📝 Commit Message Format

```
feat(auth): implement JWT authentication with refresh tokens
- Create complete Prisma schema with 21 models
- Implement Auth service with login/register/refresh
- Add JwtAuthGuard and RolesGuard for RBAC
- Create Users CRUD with validation

BREAKING CHANGE: None
Closes #Sprint2-Auth
```

---

## 🔗 Links Úteis

- **NestJS JWT**: https://docs.nestjs.com/security/authentication
- **Prisma Docs**: https://www.prisma.io/docs/
- **Passport.js**: http://www.passportjs.org/
- **Jest Testing**: https://jestjs.io/docs/getting-started

---

**Última Atualização**: 01/03/2026  
**Status**: Sprint 2 - 50% Completo  
**Próximo Checkpoint**: Migrations + E2E Tests
