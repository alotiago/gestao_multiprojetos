# 🔧 SETUP DE INFRAESTRUTURA - Gestor Multiprojetos

**Status**: Dependências NPM Instaladas ✅ | Prisma Client Gerado ✅ | **Infraestrutura: ⏳ TODO**

---

## ⚠️ Situação Atual

- ✅ Node.js e npm funcionando
- ✅ Dependências instaladas (398 packages)
- ✅ Prisma Client gerado
- ❌ PostgreSQL **NÃO ENCONTRADO** (Docker não está instalado)
- ❌ Redis **NÃO ENCONTRADO** (Docker não está instalado)

---

## 🎯 Escolha UMA das opções abaixo:

### **OPÇÃO A: Usar Docker (Recomendado)**

**Pré-requisitos:**
- Instalar Docker Desktop: https://www.docker.com/products/docker-desktop

**Passos:**
```powershell
# 1. Verificar instalação
docker --version

# 2. Iniciar infraestrutura
cd c:\des\gestor_multiprojetos
docker compose up -d

# 3. Verificar status
docker compose ps

# 4. Prosseguir para "PASSO 2: Executar Migrations"
```

**Timepo**: 5 minutos (depois de instalar Docker)

---

### **OPÇÃO B: PostgreSQL Local em Windows**

**Pré-requisitos:**
- PostgreSQL 16+ instalado: https://www.postgresql.org/download/windows/
- pgAdmin (gerenciador) ou psql (CLI)

**Passos:**

#### 1. Verificar se PostgreSQL está rodando
```powershell
# Verificar serviço
Get-Service postgresql-x64-16
```

#### 2. Criar banco de dados
```powershell
# Abrir psql
psql -U postgres

# Dentro do psql:
CREATE DATABASE gestor_multiprojetos;
CREATE USER admin WITH PASSWORD 'ChangeMe123!';
ALTER ROLE admin CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE gestor_multiprojetos TO admin;
\q
```

#### 3. Testar conexão
```powershell
psql -U admin -d gestor_multiprojetos -h localhost
```

**Tempo**: 10 minutos

---

### **OPÇÃO C: WSL2 com Docker (Windows)**

Se você tem WSL2 mas Docker Desktop não está instalado:

```powershell
# 1. Instalar Docker no WSL2
wsl --install
# (Depois configure Docker dentro do WSL)

# 2. Depois volte para OPÇÃO A: Docker Desktop
```

---

## ✅ PASSO 2: Executar Migrations

Após escolher uma opção acima e confirmar que o banco está acessível:

```powershell
cd c:\des\gestor_multiprojetos

# Testar conexão com banco
npx prisma db push --dry-run --schema=apps/backend/prisma/schema.prisma

# Se passar, executar para verdade:
npx prisma migrate dev --name init --schema=apps/backend/prisma/schema.prisma
```

**O que acontece:**
- ✅ Cria 21 tabelas no PostgreSQL
- ✅ Valida schema Prisma
- ✅ Pronto para seed e testes

**Tempo**: 2 minutos

---

## ✅ PASSO 3: Seed de Dados Iniciais

```powershell
cd c:\des\gestor_multiprojetos\apps\backend

# Executar seed
npx prisma db seed
```

**Resultado**: 6 usuários de teste criados

```
ADMIN:              admin@sistema.com        / Admin123!
PMO:                pmo@sistema.com          / Admin123!
PROJECT_MANAGER:    pm@sistema.com           / Admin123!
HR:                 hr@sistema.com           / Admin123!
FINANCE:            finance@sistema.com      / Admin123!
VIEWER:             viewer@sistema.com       / Admin123!
```

**Tempo**: 30 segundos

---

## ✅ PASSO 4: Executar Testes

```powershell
cd c:\des\gestor_multiprojetos

npm run test
```

**Esperado**: 
- 92+ testes passando
- Cobertura: 75%+
- Tempo: 2-3 minutos

**Se algum teste falhar**, consulte [TROUBLESHOOTING](#-troubleshooting)

---

## ✅ PASSO 5: Iniciar Backend

```powershell
cd c:\des\gestor_multiprojetos

npm run dev
```

**O backend deve estar listening em**: `http://localhost:3001`

---

## 🧪 VALIDAÇÃO COM cURL

Após o backend estar rodando:

```powershell
# 1. Login
$response = curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@sistema.com","password":"Admin123!"}'

# 2. Extrair token
$token = ($response | ConvertFrom-Json).access_token
echo "Token: $token"

# 3. Usar token em requisições
curl -H "Authorization: Bearer $token" `
  http://localhost:3001/api/users

# 4. Esperado: Status 200 com lista de usuários
```

---

## 🐛 Troubleshooting

### Erro: "docker command not found"
**Solução**: Instale Docker Desktop ou use OPÇÃO B (PostgreSQL Local)

### Erro: "P1000: Authentication failed"
**Solução**: 
- Verificar `.env` tem credenciais corretas
- Verificar que PostgreSQL está rodando
- Testar conexão manual com psql

### Erro: "Database does not exist"
**Solução**: 
```powershell
# Criar banco de dados manualmente
createdb -U admin gestor_multiprojetos
# Ou via psql (ver OPÇÃO B)
```

### Erro: "Jest hangs"
**Solução**:
```powershell
# Limpar cache Jest e tentar novamente
npm run test -- --clearCache
npm run test
```

### Erro: "Port 5432 already in use"
**Solução**:
```powershell
# Se Docker está rodando mas não deveria
docker compose down

# Ou mudar porta em .env
DATABASE_PORT=5433
```

---

## 📊 Checklist Final

- [ ] OPÇÃO A, B ou C escolhida e concluída
- [ ] PostgreSQL acessível em localhost:5432
- [ ] `npx prisma db push --dry-run` passou
- [ ] `npx prisma migrate dev` criou tabelas
- [ ] `npx prisma db seed` criou 6 usuários
- [ ] `npm run test` retornou 92+ testes passando
- [ ] Login com cURL funcionou
- [ ] GET /api/users retornou lista

---

## 🚀 Próximo Passo

Após completar o checklist acima:

1. **Frontend**: `cd apps/frontend && npm run dev` (porta 3000)
2. **Backend**: Já está rodando em 3001
3. **API Docs**: http://localhost:3001/api/docs (Swagger)

---

## 📞 Suporte

Se tiver problemas:

1. Ver [SETUP_AND_VALIDATION.md](./SETUP_AND_VALIDATION.md)
2. Ver [README_SPRINT_2.md](./docs/README_SPRINT_2.md)
3. Ver documentação Prisma: https://www.prisma.io/docs

---

**Tempo Total Esperado**: 15-30 minutos (depende da infraestrutura existente)
