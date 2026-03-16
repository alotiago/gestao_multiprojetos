# Guia de Deploy — Sprint 11 para Homologação

**Data:** 05/03/2026  
**Versão:** Sprint 11 (Correções Pós-Go-Live)  
**Ambiente:** Homologação

---

## 📋 Pré-requisitos

### Verificação de Ambiente
```bash
# Verificar Node.js
node --version        # v18.x ou superior

# Verificar npm
npm --version         # v9.x ou superior

# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version
```

### Credenciais Necessárias
- [ ] Acesso Docker Registry (se houver)
- [ ] Credenciais de banco de dados Homologação
- [ ] Variáveis de ambiente (`.env.homolog`)

---

## 🔄 Procedimento de Deploy

### 1️⃣ Preparação Local

```bash
# Navegar ao diretório do projeto
cd c:\des\gestor_multiprojetos

# Verificar status do Git
git status

# Fazer commit das alterações (se necessário)
git add .
git commit -m "Sprint 11: Correções de custos, saldo contratual e campos realizado"

# Criar tag de versão
git tag -a v1.11.0 -m "Sprint 11 - Correções Pós-Go-Live"

# Verificar se está sincronizado
git log --oneline -5
```

### 2️⃣ Build Docker

```bash
# Limpar build anterior
docker-compose down -v

# Construir imagens (usando docker-compose.prod.yml)
docker-compose -f docker-compose.prod.yml build --no-cache

# Verificar tamanho das imagens
docker images | grep gestor
```

**Tempo Estimado:** 10-15 minutos

### 3️⃣ Configurar Ambiente de Homologação

#### Arquivo `.env.homolog` (criar na raiz)

```env
# ═══════════ BACKEND ═══════════
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@db-homolog:5432/gestor_mprojetos_homolog

# JWT
JWT_SECRET=use-a-different-secret-for-homolog
JWT_EXPIRATION=24h

# Cors
CORS_ORIGIN=https://homolog.gestor-multiprojetos.internal

# ═══════════ FRONTEND ═══════════
NEXT_PUBLIC_API_URL=https://api-homolog.gestor-multiprojetos.internal

# ═══════════ DATABASE ═══════════
POSTGRES_USER=gestor_user
POSTGRES_PASSWORD=secure_password_for_homolog
POSTGRES_DB=gestor_mprojetos_homolog

# ═══════════ MONITORING ═══════════
GRAFANA_ADMIN_PASSWORD=admin_password_homolog
```

### 4️⃣ Fazer Deploy

#### Opção A: Deploy com Docker Compose (recomendado para Homolog)

```bash
# Copiar env
cp .env.homolog .env

# Iniciar serviços (em background)
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Aguardar inicialização (~30s)
sleep 30
```

#### Opção B: Deploy Manual (se usar servidor externo)

```bash
# Construir aplicação
npm run build

# Fazer deploy dos artefatos
# - apps/backend/dist → servidor backend
# - apps/frontend/.next → servidor nginx/vercel
# - apps/backend/prisma/migrations → executar migrações

# Executar migrações
npx prisma migrate deploy
```

### 5️⃣ Validação Pós-Deploy

```bash
# Verificar se containers estão rodando
docker-compose ps

# Testar endpoint de health check
curl http://localhost:3001/health

# Testar frontend
curl http://localhost:3000

# Verificar logs de startup
docker-compose logs backend | grep -i "listening\|error\|warn"
docker-compose logs frontend | grep -i "listening\|error\|warn"
```

**Esperado:**
```
✅ Backend listening on port 3001
✅ Frontend running on http://localhost:3000
✅ Database connected successfully
```

---

## 🧪 Testes de Homologação

### Test 1: Módulo Relatórios ✅

```bash
# Endpoint
GET http://api-homolog/relatorios/contratos-dashboard?ano=2026

# Validação
- Status: 200 ✅
- Campo custoTotal > 0 (antes eram 0)
- Gráfico "Receita vs Custo" com duas séries
```

### Test 2: Saldo Contratual ✅

```bash
# Criar contrato com linhas
POST http://api-homolog/contracts
{
  "nomeContrato": "Teste Sprint 11",
  "cliente": "Cliente Teste",
  "numeroContrato": "CT-2026-001",
  "dataInicio": "2026-03-01"
}

# Verificar saldoContratual
GET http://api-homolog/contracts/{id}

# Validação
- saldoContratual > 0 (inicializado)
- Atualiza ao criar receita com quantidadeRealizada
```

### Test 3: Receita com Realizado ✅

```bash
# Criar receita Via Contrato com realizado
POST http://api-homolog/financial/receitas
{
  "projectId": "proj-123",
  "linhaContratualId": "linha-456",
  "quantidade": 10,
  "quantidadeRealizada": 5,
  "mes": 3,
  "ano": 2026
}

# Validação
- Status: 201 ✅
- valorRealizado = 5 × valorUnitario
- saldoQuantidade decrementado
- saldoValor decrementado
```

### Test 4: Bug-004 (Despesas) ✅

```bash
# Frontend: Abrir Financeiro > Despesa tab
# Validação
- [ ] Despesas carregam (lista não vazia)
- [ ] Console mostra logs de debug [DESPESAS] Carregando
- [ ] Spinner visível durante carregamento
```

---

## 📊 Checklist de Deploy

- [ ] Build compila sem erros
- [ ] Testes locais passam (npm run test)
- [ ] Docker images construídas
- [ ] `.env.homolog` configurado
- [ ] Containers iniciados com sucesso
- [ ] Health checks respondendo
- [ ] Endpoints básicos testados
- [ ] Logs sem erros críticos
- [ ] Database migrações aplicadas
- [ ] Dados de teste preparados

---

## 🆘 Troubleshooting

### Erro: "Database connection refused"

```bash
# Verificar se container postgres está rodando
docker-compose ps

# Se não estiver:
docker-compose restart db

# Verificar logs
docker-compose logs db
```

### Erro: "Port 3001/3000 already in use"

```bash
# Encontrar processo usando a porta (Windows)
netstat -ano | findstr :3001

# Matar processo
taskkill /PID {PID} /F

# Tentar novamente
docker-compose up -d
```

### Erro: "TypeScript errors on build"

```bash
# Limpar cache
rm -r apps/frontend/.next
rm -r apps/backend/dist

# Tentar rebuild
npm run build

# Se persistir, verificar erros
npm run lint
```

### Erro: "Migration failed"

```bash
# Verificar status de migrações
npx prisma migrate status

# Resetar migrações (CUIDADO: deleta dados!)
npx prisma migrate reset

# Ou aplicar manualmente
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

---

## 📈 Monitoramento em Homologação

### Observar por 72h após deploy:

- [ ] **Logs:** Sem erros críticos ou warnings repetidos
- [ ] **Performance:** Tempo de resposta < 500ms
- [ ] **Disponibilidade:** 99.9% uptime
- [ ] **Erros de Usuário:** Nenhum erro 500
- [ ] **Database:** Livre espaço em disco, CPU < 80%

### Métricas Importantes

```bash
# Memory usage
docker stats --no-stream

# Disk usage
docker exec db-homolog du -sh /var/lib/postgresql/data

# Log monitoring
docker-compose logs --tail=100 backend | grep ERROR
```

---

## ✅ Critérios de Sucesso

**Deploy é considerado bem-sucedido quando:**

1. ✅ Nenhum erro HTTP 500 nos primeiros 24h
2. ✅ Todas as 4 correções testadas funcionam
3. ✅ Sem regressões (features anteriores funcionam)
4. ✅ Performance similar ou melhor
5. ✅ Usuários conseguem fazer login
6. ✅ Dados persistem corretamente

---

## 📞 Contatos de Suporte

**Em caso de problema durante deploy:**

- Backend: @dev-backend (Slack)
- Frontend: @dev-frontend (Slack)
- Database: @dba-homolog (Slack)
- Operações: @devops-team (Slack)

---

## 📝 Rollback (Se Necessário)

```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Voltar a versão anterior (Git)
git checkout v1.10.0

# Fazer rebuild
docker-compose -f docker-compose.prod.yml build --no-cache

# Reiniciar
docker-compose -f docker-compose.prod.yml up -d
```

---

> **Importante:** Este é um guia gerenciado. Customizar conforme ambiente específico colete informações com o DevOps.

*Documento gerado em 05/03/2026*
