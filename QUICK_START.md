# ⚡ QUICK START - Gestor Multiprojetos

**Tempo**: 15 minutos  
**Status Sprint 2**: 95% completa  
**Bloqueador**: Infraestrutura de BD

---

## 🎯 EM 3 PASSOS

### ✅ PASSO 1: Escolher Infraestrutura (5 min)

```powershell
# OPÇÃO A: Docker (RECOMENDADO)
docker compose up -d

# OPÇÃO B: PostgreSQL Local Windows
# Instale em: https://www.postgresql.org/download/windows/
# Crie BD: CREATE DATABASE gestor_multiprojetos;

# OPÇÃO C: WSL2
wsl --install
# (depois configure dentro WSL)
```

**Verificar**: `docker compose ps` ou `psql -U admin`

---

### ✅ PASSO 2: Database Setup (3 min)

```powershell
cd c:\des\gestor_multiprojetos
npx prisma migrate dev --name init --schema=apps/backend/prisma/schema.prisma
cd apps\backend && npx prisma db seed && cd ..\..
```

**Result**: 21 tabelas + 6 usuários de teste

---

### ✅ PASSO 3: Rodar & Testar (7 min)

```powershell
npm run test        # 92 testes devem passar
npm run dev         # Backend + Frontend aguardando conexões
```

**URLs**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/docs

---

## 👤 Credenciais de Teste

```
admin@sistema.com              / Admin123!
pmo@sistema.com                / Admin123!
pm@sistema.com                 / Admin123!
hr@sistema.com                 / Admin123!
finance@sistema.com            / Admin123!
viewer@sistema.com             / Admin123!
```

---

## 🆘 Algo Deu Errado?

- **Docker error**: Instale Docker Desktop
- **Database error**: Verifique PostgreSQL, porta 5432
- **Test error**: `npm run test -- --clearCache`
- **Port conflict**: Mude em .env

---

## 📚 Precisa de Mais?

- [STATUS_SPRINT_2.md](./STATUS_SPRINT_2.md) - Visão geral
- [INFRAESTRUTURA_SETUP.md](./INFRAESTRUTURA_SETUP.md) - Detalhes infraestrutura
- [SETUP_AND_VALIDATION.md](./SETUP_AND_VALIDATION.md) - Passo a passo completo
- [docs/README_SPRINT_2.md](./docs/README_SPRINT_2.md) - Documentação técnica

---

**Go!** ➡️ Escolha infraestrutura acima e execute os 3 passos
