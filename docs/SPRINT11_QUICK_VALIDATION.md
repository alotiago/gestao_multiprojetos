# 🚀 Sprint 11 — Guia Rápido de Validação

**Status:** Deploy em Homologação ✅  
**Ambiente:** http://localhost:3000 (Frontend) + http://localhost:3001 (Backend)  
**Data:** 05/03/2026

---

## ⚡ Quick Start — 5 Minutos

### 1️⃣ Validar Que o Sistema Está Rodando

```bash
# Backend saudável?
curl -s http://localhost:3001/health | jq

# Frontend respondendo?
curl -s -I http://localhost:3000 | head -5
```

### 2️⃣ Fazer Login

**Via Browser:**
```
Abra: http://localhost:3000
Email: admin@company.com
Senha: admin123456
```

**Via API (obter token):**
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "admin123456"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

---

## 🧪 Teste Rápido — 1 Teste por Linha

### ✅ Teste 1: Dashboard Custos (BUG-001/002/003)

```bash
curl -s "http://localhost:3001/relatorios/contratos-dashboard?ano=2026" \
  -H "Authorization: Bearer $TOKEN" | jq '.dados[0] | {custos_despesas, custos_impostos, custos_mensais, custos_totais}'
```

**Esperado:** `{ custos_despesas: número > 0, custos_impostos: número > 0, ... }`

### ✅ Teste 2: Listar Despesas (BUG-004)

```bash
curl -s "http://localhost:3001/financial/despesas?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
```

**Esperado:** Um número > 0 (quantidade de despesas)

### ✅ Teste 3: Contratos com Saldo (RN-001)

```bash
curl -s "http://localhost:3001/contracts?page=1&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0] | {numero, saldoContratual, saldoQuantidade}'
```

**Esperado:** `{ numero: "CT-2026-...", saldoContratual: número, saldoQuantidade: número }`

### ✅ Teste 4: Criar Receita com Realizado (RN-003)

```bash
# Obter ID do contrato
CONTRATO_ID=$(curl -s "http://localhost:3001/contracts?page=1&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

# Obter ID da linha do contrato  
LINHA_ID=$(curl -s "http://localhost:3001/contracts/$CONTRATO_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.linhas[0].id')

# Criar receita
curl -s -X POST "http://localhost:3001/financial/receitas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"descricao\": \"Teste RN-003\",
    \"valorRealizado\": 1000.00,
    \"quantidadeRealizada\": 1,
    \"data\": \"2026-03-05\",
    \"contratoId\": \"$CONTRATO_ID\",
    \"linhaId\": \"$LINHA_ID\"
  }" | jq '{id, descricao, valorRealizado, quantidadeRealizada}'
```

**Esperado:** `{ id: "uuid", descricao: "Teste RN-003", valorRealizado: 1000, quantidadeRealizado: 1 }`

### ✅ Teste 5: Validação Saldo (Deve Falhar)

```bash
# Tentar EXCEDER o saldo
curl -s -X POST "http://localhost:3001/financial/receitas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"descricao\": \"Teste Excesso\",
    \"valorRealizado\": 999999999.00,
    \"quantidadeRealizada\": 999999,
    \"data\": \"2026-03-05\",
    \"contratoId\": \"$CONTRATO_ID\",
    \"linhaId\": \"$LINHA_ID\"
  }" | jq '.statusCode'
```

**Esperado:** `409` (Conflict — não deve dar 500)

---

## 📊 Checklist Visual (UI)

| Item | Ação | ✅ Esperado |
|------|------|-----------|
| Dashboard | Ir para Relatórios → Dashboard | Ver custos: Despesas, Impostos, Mensais |
| Despesas | Ir para Financeiro → Despesas | Ver tabela com dados |
| Contratos | Ir para Contratos | Cada card mostra "Saldo Contratual" em verde/vermelho |
| Receita | Clicar "+ Nova Receita" | Formulário tem campo "Quantidade Realizada" |

---

## 🔍 Debug — Se Algo Falhar

```bash
# Ver logs do backend
docker-compose logs backend --tail=50

# Ver logs do frontend
docker-compose logs frontend --tail=50

# Verificar status dos containers
docker-compose ps

# Testar conectividade ao banco
docker-compose exec postgres psql -U gestor_homolog -d gestor_multiprojetos_homolog -c "SELECT COUNT(*) FROM \"Contrato\";"
```

---

## 📋 Resultado Final

| Teste | Status | Notas |
|-------|--------|-------|
| Dashboard Custos | ⏳ | Preencheras após executar |
| Despesas Carregam | ⏳ | |
| Saldo Contratual | ⏳ | |
| Receita Realizado | ⏳ | |
| Validação Saldo | ⏳ | |

---

## ✅ Aprovação Sprint 11

- [ ] Todos os 5 testes passaram
- [ ] Nenhum erro HTTP 500 nos logs
- [ ] UI carrega sem lags
- [ ] Pronto para produção

---

> **Tempo total:** ~15 minutos  
> **Próximo:** Se tudo OK → Deploy em produção  
> **Se erro:** Documentar e reportar ao time
