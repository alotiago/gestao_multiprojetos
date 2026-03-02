# 🚀 COMECE AQUI - Entry Point Principal

**Bem-vindo ao Gestor Multiprojetos (PR_SEEC_2026)**

Você está aqui porque Sprint 2 está **95% completo** e precisa de infraestrutura para terminar. Este arquivo vai te guiar em 5 minutos.

---

## ⚡ QUICK START - 3 PASSOS (15 minutos)

### Passo 1️⃣: Escolha Sua Infraestrutura (2 minutos)

**Você tem Docker instalado?**
- ✅ SIM → Vá para **Opção A** (abaixo)
- ❌ NÃO → Vá para **Opção B** (abaixo)

**Opção A: Docker Compose (Recomendado)**
```powershell
# Validar Docker
docker --version

# Iniciar infraestrutura
docker compose up -d

# Pronto! ✅ Passe para Passo 2
```

**Opção B: PostgreSQL Local**
```powershell
# Ver INFRAESTRUTURA_SETUP.md seção "PostgreSQL Local"
# Instalar e criar banco de dados

# Pronto! ✅ Passe para Passo 2
```

**Opção C: WSL2**
```powershell
# Ver INFRAESTRUTURA_SETUP.md seção "WSL2"
# Instalar WSL2 e Docker dentro dele

# Pronto! ✅ Passe para Passo 2
```

### Passo 2️⃣: Executar Setup (10 minutos)

```powershell
# Abra terminal na raiz do projeto
cd c:\des\gestor_multiprojetos

# Terminal 1: Preparar banco
npm run db:reset
npm run db:seed

# Terminal 2: Iniciar backend
cd apps/backend
npm run dev

# Esperado: "Server running on http://localhost:3001"
```

### Passo 3️⃣: Validar (2 minutos)

```powershell
# Terminal 3: Rodar testes
cd apps/backend
npm run test

# Esperado: "92 passed, 92 total" ✅
```

---

## 📍 Onde Você Está Agora

```
Fase 1: Sprint 2 Planejamento ✅
         ↓
Fase 2: Sprint 2 Desenvolvimento ✅ (2800+ linhas de código)
         ↓
Fase 3: Sprint 2 Documentação ✅ (10+ documentos)
         ↓
Fase 4: Sprint 2 Infraestrutura ← 🔴 VOCÊ ESTÁ AQUI
         ├─ Escolher opção (Docker/PostgreSQL/WSL2)
         ├─ Executar setup
         ├─ Rodar migrations
         ├─ Seed dados
         └─ Validar testes
         ↓
Fase 5: Sprint 2 Conclusão ⏳
         ├─ Testes passando
         ├─ Go-live ok
         └─ Sprint 2 = 100%
         ↓
Fase 6: Sprint 3 (Projeto Module)
```

---

## 🎯 Escolha Seu Próximo Documento

### Opção 1: Quer fazer setup AGORA?
→ **[QUICK_START.md](./QUICK_START.md)** (3 minutos)

### Opção 2: Quer entender a infraestrutura?
→ **[INFRAESTRUTURA_SETUP.md](./INFRAESTRUTURA_SETUP.md)** (10 minutos com 3 opções detalhadas)

### Opção 3: Quer ver os passos completos?
→ **[SETUP_AND_VALIDATION.md](./SETUP_AND_VALIDATION.md)** (20 minutos step-by-step)

### Opção 4: Quer saber qual infraestrutura escolher?
→ **[ARVORE_DECISAO.md](./ARVORE_DECISAO.md)** (5 minutos com flowchart visual)

### Opção 5: Quer entender todo o projeto?
→ **[MAPA_NAVEGACAO.md](./MAPA_NAVEGACAO.md)** (15 minutos com guia por perfil)

### Opção 6: Quer validar tudo depois do setup?
→ **[docs/SPRINT_2_VALIDATION_GUIDE.md](./docs/SPRINT_2_VALIDATION_GUIDE.md)** (QA Testing guide)

---

## 🔧 Credenciais Temporárias (Para Testes)

| Email | Senha | Rol | Tipo |
|-------|-------|-----|------|
| admin@sistema.com | Admin123! | ADMIN | Teste |
| pmo@sistema.com | Admin123! | PMO | Teste |
| pm@sistema.com | Admin123! | PM | Teste |
| hr@sistema.com | Admin123! | HR | Teste |
| finance@sistema.com | Admin123! | FINANCE | Teste |
| viewer@sistema.com | Admin123! | VIEWER | Teste |

💡 **Trocar senhas em PRODUÇÃO!** Esses são apenas para desenvolvimento.

---

## ⚠️ Possíveis Problemas

### ❌ Docker não encontrado
```
'docker' is not recognized...
```
**Solução**: Use Opção B (PostgreSQL) ou Opção C (WSL2)  
→ Ver **[INFRAESTRUTURA_SETUP.md](./INFRAESTRUTURA_SETUP.md)**

### ❌ PostgreSQL não conecta
```
Error: P1000: Authentication failed
```
**Solução**: Verifique credenciais no .env  
Executar: `cat .env` para validar DATABASE_URL

### ❌ Testes falhando
```
FAIL src/auth/auth.service.spec.ts
```
**Solução**: Garantir que banco de dados está rodando  
Execute: `docker compose up -d` (se Docker) ou próximo passo

### ❌ Backend não inicia
```
error: listen EADDRINUSE :::3001
```
**Solução**: Porta 3001 já está em uso  
Execute: `netstat -ano | findstr :3001` (Windows)

---

## 📊 Checklist - Sprint 2 Completo

- [ ] **Infraestrutura Escolhida**
  - [ ] Docker OR PostgreSQL OR WSL2

- [ ] **Banco de Dados Pronto**
  - [ ] PostgreSQL rodando
  - [ ] Redis rodando
  - [ ] Migrations executadas

- [ ] **Dados Seeded**
  - [ ] 6 usuários criados
  - [ ] Roles atribuídos
  - [ ] Senhas hasheadas

- [ ] **Testes Validando**
  - [ ] `npm run test` → 92 passed
  - [ ] 0 falhas

- [ ] **Backend Respondendo**
  - [ ] `npm run dev` → Server running
  - [ ] http://localhost:3001/api/docs (Swagger)

- [ ] **Credenciais Testadas**
  - [ ] Login com admin funciona
  - [ ] Login com viewer funciona
  - [ ] Tokens sendo emitidos

- [ ] **RBAC Validado**
  - [ ] Admin consegue listar usuários
  - [ ] Viewer bloqueado de listar usuários
  - [ ] Permissões granulares ok

- [ ] **Sprint 2 = 100%** ✅

---

## 📞 Próximos Passos Após Validação

**Se tudo passou ✅:**
1. → Sprint 2 está **100% COMPLETO**
2. → Pronto para **Sprint 3 (Projeto Module)**
3. → Ver roadmap em **[docs/proposta_tecnica_scrum.md](./docs/proposta_tecnica_scrum.md)**

**Se algo falhou ❌:**
1. → Ver seção "Possíveis Problemas" acima
2. → Consultar logs em Terminal
3. → Reportar bug em [docs/SPRINT_2_FINAL_REPORT.md](./docs/SPRINT_2_FINAL_REPORT.md#problemas)

---

## 🗺️ Árvore de Documentação

```
📁 RAIZ
├── COMECE_AQUI.md ← Você está aqui!
├── QUICK_START.md (3 minutos)
├── ARVORE_DECISAO.md (5 minutos)
├── INFRAESTRUTURA_SETUP.md (10 minutos)
├── SETUP_AND_VALIDATION.md (20 minutos)
├── MAPA_NAVEGACAO.md (por perfil)
│
├── 📁 docs/
│   ├── README_SPRINT_2.md
│   ├── SPRINT_2_EXECUTIVE_SUMMARY.md
│   ├── SPRINT_2_FINAL_REPORT.md
│   ├── SPRINT_2_RBAC_ARCHITECTURE.md
│   ├── SPRINT_2_RBAC_IMPLEMENTATION_GUIDE.md
│   ├── SPRINT_2_VALIDATION_GUIDE.md
│   ├── SPRINT_2_TESTE_FINAL_REPORT.md
│   ├── ÍNDICE_DOCUMENTAÇÃO.md
│   ├── FASE_2_SPRINT_2_PROGRESSO.md
│   ├── STATUS_SPRINT_2.md
│   ├── SESSAO_01_03_2026.md
│   └── proposta_tecnica_scrum.md
│
└── 📁 apps/backend/
    ├── src/
    ├── prisma/
    ├── package.json
    └── .env
```

---

## ⏱️ Tempo Estimado Total

```
5 min   → COMECE_AQUI.md (este arquivo)
5 min   → ARVORE_DECISAO.md (escolher infraestrutura)
15 min  → INFRAESTRUTURA_SETUP.md (instalar/rodar)
10 min  → SETUP_AND_VALIDATION.md (migrations + seed + testes)
────────────────────────────────
~35 min → Sprint 2 = 100% COMPLETO ✅
```

---

## 🚀 AÇÃO AGORA

**Escolha uma opção:**

1. **APRESSADO** (5 min)  
   → [QUICK_START.md](./QUICK_START.md)

2. **PRECISO ESCOLHER INFRAESTRUTURA** (10 min)  
   → [INFRAESTRUTURA_SETUP.md](./INFRAESTRUTURA_SETUP.md)

3. **QUERO ENTENDER TUDO** (30 min)  
   → [SETUP_AND_VALIDATION.md](./SETUP_AND_VALIDATION.md)

4. **PRECISO DOS DETALHES** (15 min)  
   → [MAPA_NAVEGACAO.md](./MAPA_NAVEGACAO.md)

---

**Bom trabalho! 💪 Sprint 2 está quase 100%**
