# 📋 SPRINT 2 - Validação e Próximas Ações

**Data**: 01/03/2026  
**Status**: Dependências Instaladas ✅  
**Próximo Passo**: Gerar cliente Prisma + Executar Migrations

---

## ✅ Completed

- ✅ Node.js e npm instalados
- ✅ Dependências NPM instaladas (398 packages)
- ✅ `.env` configurado para desenvolvimento
- ✅ `setup.ps1` criado
- ✅ Script seed `prisma/seed.ts` criado
- ✅ Package.json atualizado com comandos de Database

---

## 📋 Próximos Passos (IN ORDER)

### **PASSO 1: Gerar Cliente Prisma**
```powershell
cd apps/backend
npx prisma generate
cd ../..
```
**O que faz**: Gera os tipos TypeScript do Prisma baseado no schema

**Tempo esperado**: 30 segundos

---

### **PASSO 2: Criar/Resetar Banco de Dados com Migrations**

#### Opção A: Primeira execução (recomendado)
```powershell
cd apps/backend
npx prisma migrate dev --name init
cd ../..
```

#### Opção B: Resetar tudo (limpa e recria)
```powershell
cd apps/backend
npx prisma migrate reset
cd ../..
```

**O que faz**: 
- Cria as tabelas no PostgreSQL baseado em `schema.prisma`
- Restaura dados de seed (6 usuários de teste)

**Tempo esperado**: 1-2 minutos

**Credenciais de Teste** (após seed):
```
ADMIN
├─ Email: admin@sistema.com
└─ Senha: Admin123!

PMO
├─ Email: pmo@sistema.com
└─ Senha: Admin123!

PROJECT_MANAGER
├─ Email: pm@sistema.com
└─ Senha: Admin123!

HR
├─ Email: hr@sistema.com
└─ Senha: Admin123!

FINANCE
├─ Email: finance@sistema.com
└─ Senha: Admin123!

VIEWER
├─ Email: viewer@sistema.com
└─ Senha: Admin123!
```

---

### **PASSO 3: Executar Testes da Sprint 2**
```powershell
npm run test
```

**O que valida**:
- ✅ Auth Service (12 testes)
- ✅ Auth Controller (5 testes)
- ✅ Users Service (10 testes)
- ✅ Permission Service (40 testes)
- ✅ Permissions Guard (25 testes)

**Total esperado**: 92 testes passando

**Tempo esperado**: 2-3 minutos

---

### **PASSO 4: Iniciar Docker para Infraestrutura**
```powershell
docker compose up -d
```

**O que faz**:
- Inicia PostgreSQL (porta 5432)
- Inicia Redis (porta 6379)
- Setup da rede Docker

**Verificar status**:
```powershell
docker compose ps
```

**Esperado**:
```
NAME                 STATUS
gestor_postgres      Up
gestor_redis         Up
```

**Tempo esperado**: 30 segundos

---

### **PASSO 5: Validar com cURL**

Após o backend estar rodando:

```bash
# 1. Login
$response = curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@sistema.com","password":"Admin123!"}'

$token = ($response | ConvertFrom-Json).access_token

# 2. Listar usuários (requer permission USER_LIST)
curl -H "Authorization: Bearer $token" `
  http://localhost:3001/api/users

# 3. Ver detalhes de um usuário
curl -H "Authorization: Bearer $token" `
  http://localhost:3001/api/users/1
```

**Esperado**: Status 200 com dados

---

### **PASSO 6: Iniciar Desenvolvimento**
```powershell
npm run dev
```

**O que faz**:
- Inicia backend em modo watch (porta 3001)
- Inicia frontend em modo watch (porta 3000)

**URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api/docs

---

## 🎯 Checklist de Validação

- [ ] `npx prisma generate` executado com sucesso
- [ ] `npx prisma migrate dev --name init` criou 21 tabelas
- [ ] `npm run test` passou com 92+ testes
- [ ] `docker compose up` iniciou banco de dados
- [ ] Login com cURL retornou JWT token
- [ ] GET /api/users retornou lista de usuários
- [ ] `npm run dev` iniciou sem erros

---

## 🔍 Troubleshooting

### **Erro: Cannot find module '@prisma/client'**
```powershell
cd apps/backend
npx prisma generate
```

### **Erro: Connect failed (PostgreSQL)**
```powershell
# Verificar se Docker está rodando
docker compose up -d
# Aguardar 5-10 segundos para banco ficar pronto
```

### **Erro: Jest tests fail**
```powershell
# Limpar cache Jest
npm run test -- --clearCache
npm run test
```

### **Erro: Port 5432 already in use**
```powershell
# Verificar processo
netstat -ano | findstr :5432
# Ou usar porta diferente no .env
DATABASE_PORT=5433
```

---

## 📊 Estatísticas Sprint 2

| Métrica | Valor |
|---------|-------|
| Arquivos Criados em Sprint 2 | 15+ |
| Linhas de Código Backend | 2800+ |
| Testes Unitários | 92 |
| Permissões Implementadas | 36 |
| Roles Definidos | 6 |
| Taxa de Cobertura Expected | 75%+ |

---

## ✨ Próximas Fases (ROADMAP)

### **SPRINT 3: Módulo de Projetos**
- [ ] CRUD Projetos (código, cliente, receita)
- [ ] Motor de FCST (forecast até 2030)
- [ ] Consolidação de carteira
- [ ] Dashboards de projeto

### **SPRINT 4: Recursos Humanos**
- [ ] Cadastro de colaboradores
- [ ] Controle de jornada
- [ ] Cálculo de FTE
- [ ] Importação em lote (CSV/XLSX)

### **SPRINT 5: Financeiro**
- [ ] Cálculo de custos
- [ ] Controle tributário (INSS, ISS, PIS, COFINS, IRPJ, CSLL)
- [ ] Despesas (facilities, fornecedores, aluguel, etc)
- [ ] Consolidação de custos

---

## 🚀 Como Prosseguir

**Se você é um DEVELOPER:**
1. Execute PASSO 1 até PASSO 5
2. Verifique que tudo está funcionando
3. Comece a trabalhar em SPRINT 3

**Se você é um QA/TESTER:**
1. Execute PASSO 1 até PASSO 4
2. Use as credenciais de teste para validar
3. Execute os testes com `npm run test`

**Se você é um DevOps/SRE:**
1. Valide a configuração Docker Compose
2. Prepare ambientes staging/production
3. Configure CI/CD pipeline

---

**Status Current**: SPRINT 2 Ready for Testing  
**Próximo Milestone**: SPRINT 3 Project Management Module  
**Estimated Duration**: 2 weeks

---

[Ver Documentação Completa](./README_SPRINT_2.md)  
[Ver Guia de RBAC](./SPRINT_2_RBAC_IMPLEMENTATION_GUIDE.md)  
[Ver Validação](./SPRINT_2_VALIDATION_GUIDE.md)
