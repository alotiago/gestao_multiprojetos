# Teste de Validação Sprint 11 — Homologação 🧪

**Data de Teste:** 05/03/2026  
**Versão:** Sprint 11 (4 Bugs + 3 RNs)  
**Ambiente:** Homologação Local (Docker Compose)  
**Status:** PRONTO PARA EXECUÇÃO

---

## 🎯 Escopo de Testes

```
✅ BUG-001: Custos não aparecem no relatório (Despesas)
✅ BUG-002: Custos não aparecem no relatório (Impostos)
✅ BUG-003: Custos não aparecem no relatório (Custos Mensais)
✅ BUG-004: Despesas não carregam na tela
✅ RN-001: Saldo Contratual deve ser exibido
✅ RN-003: Campos de Quantidade e Valor Realizado
```

---

## 👥 Dados de Teste — Credenciais

```
URL Base: http://localhost:3000

Login: admin@company.com
Senha: admin123456

Após autenticação, sistema deve redirecionar para Dashboard
```

### 1️⃣ POST /auth/login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "admin123456"
  }'
```

**Resposta Esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@company.com",
    "role": "ADMIN"
  }
}
```

---

## 📋 Teste #1: BUG-001/002/003 — Relatório de Custos ✅

**Objetivo:** Validar que o Dashboard de Relatórios exibe:
- Custos de Despesas
- Custos de Impostos
- Custos Mensais de Pessoal

### 1.1 — Acessar Dashboard via UI

```
1. Ir para http://localhost:3000
2. Login com admin@company.com / admin123456
3. Clique em "Relatórios" (menu lateral)
4. Selecione "Dashboard de Contratos"
5. Escolha ano: 2026
```

**Verificações Visuais:**
- [ ] Tabela com colunas aparece completa
- [ ] Coluna "Custos Totais" está visível
- [ ] Valores numéricos aparecem e não são zero
- [ ] Sem mensagens de erro na tela

### 1.2 — Teste via API (Backend)

```bash
# Obter dashboard
curl -X GET "http://localhost:3001/relatorios/contratos-dashboard?ano=2026" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Resposta Esperada (200 OK):**
```json
{
  "dados": [
    {
      "contrato_id": "uuid-123",
      "contrato_nome": "Contrato de Desenvolvimento",
      "custos_despesas": 5000.00,
      "custos_impostos": 1200.00,
      "custos_mensais": 3500.00,
      "custos_totais": 9700.00
    },
    {
      "contrato_id": "uuid-456",
      "contrato_nome": "Contrato de Consultoria",
      "custos_despesas": 2300.00,
      "custos_impostos": 450.00,
      "custos_mensais": 1800.00,
      "custos_totais": 4550.00
    }
  ],
  "resumo": {
    "total_custos": 14250.00,
    "total_impostos": 1650.00,
    "quantidade_contratos": 2
  }
}
```

**Validações:**
- [ ] Status code 200
- [ ] Campo `custos_despesas` > 0
- [ ] Campo `custos_impostos` > 0
- [ ] Campo `custos_mensais` > 0
- [ ] `custos_totais` = soma dos três campos acima
- [ ] Sem erros HTTP 500

---

## 📋 Teste #2: BUG-004 — Despesas Carregam ✅

**Objetivo:** Validar que a lista de despesas carrega sem erros

### 2.1 — Acessar Lista de Despesas via UI

```
1. Ir para http://localhost:3000
2. Login com admin@company.com / admin123456
3. Clique em "Financeiro" (menu lateral)
4. Selecione "Despesas"
5. Aguarde carregamento
```

**Verificações Visuais:**
- [ ] Lista não está vazia
- [ ] Paginação funciona (se houver > 10 itens)
- [ ] Valores monetários formatados corretamente
- [ ] Sem mensagens de erro
- [ ] Botões "Editar" e "Deletar" visíveis

### 2.2 — Teste via API

```bash
# Listar despesas
curl -X GET "http://localhost:3001/financial/despesas?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Resposta Esperada (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-001",
      "descricao": "Materiais de Escritório",
      "valor": 250.00,
      "data": "2026-03-01",
      "categoria": "MATERIAL",
      "status": "PAGO"
    },
    {
      "id": "uuid-002",
      "descricao": "Viagem para São Paulo",
      "valor": 1500.00,
      "data": "2026-03-02",
      "categoria": "VIAGEM",
      "status": "PENDENTE"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

**Validações:**
- [ ] Status code 200
- [ ] Array `data` não vazio (ou contém mensagem amigável se vazio)
- [ ] Cada item tem `id`, `descricao`, `valor`, `data`
- [ ] Sem erro HTTP 500

---

## 📋 Teste #3: RN-001 — Saldo Contratual Visível ✅

**Objetivo:** Validar que o Saldo Contratual é exibido nas cards de contratos

### 3.1 — Acessar Lista de Contratos via UI

```
1. Ir para http://localhost:3000
2. Login com admin@company.com / admin123456
3. Clique em "Contratos" (menu lateral)
4. Veja a lista de contratos
```

**Verificações Visuais:**
- [ ] Cada card de contrato mostra "Saldo Contratual"
- [ ] Valor exibido em cor VERDE (saldo positivo) ou VERMELHO (saldo negativo)
- [ ] Formato: R$ XXX,XX
- [ ] Sem valores "undefined" ou "null"

### 3.2 — Teste via API

```bash
# Obter contrato específico
curl -X GET "http://localhost:3001/contracts/uuid-contrato-123" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Resposta Esperada (200 OK):**
```json
{
  "id": "uuid-contrato-123",
  "numero": "CT-2026-001",
  "descricao": "Desenvolvimento de Sistema",
  "valorTotal": 50000.00,
  "saldoContratual": 35000.00,
  "saldoQuantidade": 10,
  "linhas": [
    {
      "id": "uuid-linha-001",
      "descricao": "Desenvolvimento Backend",
      "valorLinha": 25000.00,
      "quantidadeLinha": 5,
      "saldoValor": 20000.00,
      "saldoQuantidade": 2
    }
  ]
}
```

**Validações:**
- [ ] Campo `saldoContratual` presente
- [ ] Valor é número (não string)
- [ ] Campo não é null ou undefined
- [ ] Cada linha tem `saldoValor` e `saldoQuantidade`
- [ ] `saldoValor` + `saldoQuantidade` > 0 (em verde) ou <= 0 (em vermelho)

---

## 📋 Teste #4: RN-003 — Campos Realizado ✅

**Objetivo:** Validar que os campos de Quantidade Realizada e Valor Realizado funcionam

### 4.1 — Adicionar Receita via UI

```
1. Ir para http://localhost:3000
2. Login com admin@company.com / admin123456
3. Clique em "Financeiro" (menu lateral)
4. Clique em "Receitas"
5. Clique em "+ Nova Receita"
```

**Formulário deve ter campos:**
- [ ] Descrição (texto)
- [ ] Valor Realizado (número com validação)
- [ ] Quantidade Realizada (número com validação)
- [ ] Data (data)
- [ ] Contrato (select)
- [ ] Linha Contratual (select)

**Preenchimento Exemplo:**
```
Descrição: "Primeira Parcela - Backend"
Valor Realizado: 5000.00
Quantidade Realizada: 2
Data: 2026-03-05
Contrato: "CT-2026-001"
Linha: "Desenvolvimento Backend"
```

**Verificações após salvar:**
- [ ] Mensagem de sucesso: "Receita criada com sucesso"
- [ ] Receita aparece na lista
- [ ] Saldo Contratual foi atualizado na card
- [ ] Sem erro HTTP 500

### 4.2 — Validação de Saldo via API

```bash
# Criar receita
curl -X POST "http://localhost:3001/financial/receitas" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Primeira Parcela",
    "valorRealizado": 5000.00,
    "quantidadeRealizada": 2,
    "data": "2026-03-05",
    "contratoId": "uuid-contrato-123",
    "linhaId": "uuid-linha-001"
  }'
```

**Resposta esperada (201 Created):**
```json
{
  "id": "uuid-receita-nova",
  "descricao": "Primeira Parcela",
  "valorRealizado": 5000.00,
  "quantidadeRealizada": 2,
  "data": "2026-03-05T00:00:00.000Z",
  "contratoId": "uuid-contrato-123",
  "linhaId": "uuid-linha-001"
}
```

### 4.3 — Validação de Excesso de Saldo (Erro Esperado)

```bash
# Tentar criar receita que EXCEDE o saldo
curl -X POST "http://localhost:3001/financial/receitas" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Receita que excede saldo",
    "valorRealizado": 999999.00,
    "quantidadeRealizada": 100,
    "data": "2026-03-05",
    "contratoId": "uuid-contrato-123",
    "linhaId": "uuid-linha-001"
  }'
```

**Resposta esperada (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Quantidade realizada excede o saldo disponível",
  "error": "Conflict"
}
```

**Validações:**
- [ ] Sistema rejeita com HTTP 409 (não 500)
- [ ] Mensagem é clara e em português
- [ ] Receita NÃO é criada no banco

---

## 🔄 Teste #5: Transações Atômicas ✅

**Objetivo:** Validar que múltiplas receitas funcionam atomicamente

### 5.1 — Criar 3 receitas sequencialmente

```bash
# Receita 1
curl -X POST "http://localhost:3001/financial/receitas" ...

# Receita 2
curl -X POST "http://localhost:3001/financial/receitas" ...

# Receita 3
curl -X POST "http://localhost:3001/financial/receitas" ...
```

**Verificações:**
- [ ] Todas as 3 receitas são criadas
- [ ] Saldo diminui após cada receita
- [ ] Ordem de criação é respeitada
- [ ] Sem sincronismo de dados

---

## 📊 Matriz de Testes

| Teste ID | Funcionalidade | Status | Observações |
|----------|---|--------|---|
| T001 | Dashboard Custos Despesas | ⏳ Pendente | Aguardando execução |
| T002 | Dashboard Custos Impostos | ⏳ Pendente | Aguardando execução |
| T003 | Dashboard Custos Mensais | ⏳ Pendente | Aguardando execução |
| T004 | Despesas Carregam | ⏳ Pendente | Aguardando execução |
| T005 | Saldo Contratual Verde | ⏳ Pendente | Aguardando execução |
| T006 | Saldo Contratual Vermelho | ⏳ Pendente | Aguardando execução |
| T007 | Receita com Realizado | ⏳ Pendente | Aguardando execução |
| T008 | Validação Saldo Excedido | ⏳ Pendente | Aguardando execução |
| T009 | Transações Atômicas | ⏳ Pendente | Aguardando execução |

---

## 🛠️ Troubleshooting

### ❌ Error: "Cannot connect to Docker daemon"
```
→ Certifique que Docker Desktop está rodando
→ Ou use: docker-compose ps
```

### ❌ Error: "Port 3000 already in use"
```
→ Kill o processo: taskkill /PID <PID> /F
→ Ou restarte: docker-compose restart
```

### ❌ Error: "401 Unauthorized"
```
→ Token expirado, faça login novamente
→ Crie token fresco com POST /auth/login
```

### ❌ Error: "Database connection refused"
```
→ Postgres não iniciou ainda
→ Aguarde 30s e tente novamente
→ Check: docker-compose logs postgres
```

### ⚠️ Performance lenta
```
→ Aguarde 1-2 minutos na primeira requisição
→ Sistema está fazendo warm-up
```

---

## 📝 Template de Relatório

```markdown
# Relatório de Testes — Sprint 11

**Data:** 05/03/2026
**Testador:** [Nome]
**Ambiente:** Homologação Local

## Resultados
- ✅ Testes: X/9 passaram
- ❌ Falhas: Y

## Bugs Encontrados
1. [Descrição]
   - Steps para reproduzir
   - Log de erro

## Aprovação
- [ ] Aprova para produção
- [ ] Rejeita - volta para dev
```

---

## ✅ Conclusão dos Testes

Se **todos os 9 testes passarem**, o Sprint 11 está pronto para:
1. ✅ Notificação ao PO
2. ✅ Preparação para deploy em produção
3. ✅ Agendamento de go-live

Se **algum teste falhar**, documento deve ser criado com:
- Teste que falhou
- Steps para reproduzir
- Log/screenshot
- Severidade (critica/alta/média/baixa)

---

> **Próximo Passo:** Execute os testes acima e preencha a matriz.  
> **Tempo Estimado:** 30-45 minutos
