# ÍNDICE DE DOCUMENTAÇÃO - GESTOR MULTIPROJETOS

**Data:** 01 de Março de 2026  
**Projeto:** Gestor Multiprojetos (PR_SEEC_2026)  
**Versão:** Sprint 3-4 Concluída

---

## 📚 Documentação Principal

### Propostas & Planejamento
- [Proposta Técnica Scrum](docs/proposta_tecnica_scrum.md)  
  → Documento oficial com 10 sprints (1-10)
  
- [Próximas Sprints Planejamento](PROXIMAS_SPRINTS_PLANEJAMENTO.md) ⭐ **LEIA PRIMEIRO**  
  → Guia prático com tarefas específicas para Sprint 5-10
  → Inclui templates reutilizáveis de código

### Status & Progresso
- [Sumário Executivo](SUMARIO_EXECUTIVO.md) 🎯 **RESUMO ATUAL**  
  → Melhor para entender o estado atual do projeto
  → Métricas, resultados, próximas ações

- [Sprint 3 Conclusão](SPRINT_3_CONCLUSAO.md)  
  → Importação em lote de Projetos
  → 4 testes novos

- [Sprints 3 & 4 Consolidado](SPRINTS_3_4_CONCLUSAO.md)  
  → Visão consolidada de ambas sprints
  → Padrões estabelecidos

### Análise Técnica
- [Análise Módulos Sprint 8](ANALISE_MODULOS_SPRINT_8.md)  
  → Estado de cada módulo (projetos, RH, financeiro, etc)
  → % de completude de cada funcionalidade

- [Sprint Status Atual](SPRINT_STATUS_ATUAL.md)  
  → Plano macro de todas as 10 sprints
  → Estimativas por sprint

---

## 🔧 Guia Técnico por Módulo

### Projetos (Sprint 3)
**Status:** ✅ 95% completo

**Arquivos:**
- `apps/backend/src/modules/projects/projects.service.ts` (644 linhas)
- `apps/backend/src/modules/projects/projects.controller.ts` (172 linhas)
- `apps/backend/src/modules/projects/projects.service.spec.ts` (480 linhas)

**Funcionalidades:**
- ✅ CRUD
- ✅ Gestão de receitas mensais
- ✅ Motor FCST (regressão linear)
- ✅ Cálculo de margens
- ✅ Análise de carteira
- ✅ **[NOVO] Importação em lote** ← Sprint 3

**Endpoints:**
```
GET    /projects
GET    /projects/:id
POST   /projects
PUT    /projects/:id
DELETE /projects/:id
POST   /projects/import/bulk        ← NOVO
GET    /projects/:id/fcst
GET    /projects/:id/margens
GET    /projects/:id/consolidado
GET    /projects/carteira
```

**Testes:** 25/25 ✅ (incluindo 4 novos)

---

### RH (Sprint 4)
**Status:** ✅ 90% completo

**Arquivos:**
- `apps/backend/src/modules/hr/hr.service.ts` (788 linhas)
- `apps/backend/src/modules/hr/hr.controller.ts` (200 linhas)
- `apps/backend/src/modules/hr/hr.service.spec.ts` (520 linhas)

**Funcionalidades:**
- ✅ CRUD colaboradores
- ✅ Jornadas com FTE automático
- ✅ Férias
- ✅ Desligamento
- ✅ Cálculo de custos
- ✅ **[NOVO] Importação em lote colaboradores** ← Sprint 4
- ✅ **[NOVO] Atualização em lote de jornadas** ← Sprint 4

**Endpoints:**
```
GET    /hr/colaboradores
GET    /hr/colaboradores/:id
POST   /hr/colaboradores
PUT    /hr/colaboradores/:id
DELETE /hr/colaboradores/:id
POST   /hr/colaboradores/import/bulk              ← NOVO
POST   /hr/colaboradores/jornadas/bulk-update    ← NOVO
GET    /hr/colaboradores/:id/jornadas
POST   /hr/colaboradores/:id/jornadas
PUT    /hr/colaboradores/:id/jornadas/:jornadaId
POST   /hr/colaboradores/:id/ferias
POST   /hr/colaboradores/:id/desligamento
GET    /hr/colaboradores/:id/custo
GET    /hr/colaboradores/:id/projecao
GET    /hr/colaboradores/equipe/custo
```

**Testes:** 28/28 ✅ (incluindo 6 novos)

---

### Módulos Existentes (90%+ completo)
- Financial (40 testes)
- Dashboard (12 testes)
- Auth (34 testes)
- Users (18 testes)
- Config (8 testes)
- Operations (15 testes)
- Permissions (6 testes)

---

## 🧪 Testes & Validação

### Suite de Testes
```bash
# Rodar todos os testes
npm test                    # 162/162 ✅

# Rodar por módulo
npm test -- projects        # 25/25 ✅
npm test -- hr              # 28/28 ✅
npm test -- financial       # 40/40 ✅

# Con cobertura
npm test -- --coverage
```

### Teste Integração (Manual)
```bash
# Iniciar infraestrutura
docker compose up -d --build

# Health check (deve retornar 200)
curl http://localhost:3001/health

# Dashboard
curl http://localhost:3000
```

---

## 🚀 Próximas Tarefas (Priorizado)

### 🥇 Priority 1 - Sprint 5 (1.5 dias)
**Módulo Financeiro**
- [ ] Bulk import despesas
- [ ] Bulk update impostos
- [ ] Testes + endpoints
- **Arquivo:** `PROXIMAS_SPRINTS_PLANEJAMENTO.md` seção "Sprint 5"

### 🥈 Priority 2 - Sprint 6 (2.5 dias)
**Calendários & Sindicatos**
- [ ] CRUD calendários
- [ ] CRUD sindicatos
- [ ] Engine cálculo jornada
- **Arquivo:** `PROXIMAS_SPRINTS_PLANEJAMENTO.md` seção "Sprint 6"

### 🥉 Priority 3 - Sprint 8 (2.5 dias)
**Recálculos Cascata** ⚠️ CRÍTICO
- [ ] Engine: TAXA × CAL × HORAS × CUSTO × FTE
- [ ] Snapshots + Auditoria
- [ ] Rollback
- **Arquivo:** `PROXIMAS_SPRINTS_PLANEJAMENTO.md` seção "Sprint 8"

---

## 📊 Métricas Consolidadas

| Métrica | Valor | Trend |
|---------|-------|-------|
| Testes Passando | 162/162 | ⬆️ +10 |
| Cobertura | ~95% | ⬆️ |
| Endpoints | 40+ | ⬆️ 3 novos |
| DTOs | 8 novos | ✅ |
| Módulos Prontos | 8/8 | ✅ |
| Documentação | 6 arquivos | ✅ |

---

## 🏗️ Arquitetura

### Stack
- **Backend:** NestJS, Prisma, PostgreSQL, Redis
- **Frontend:** React 18, Next.js 14, TypeScript
- **Infraestrutura:** Docker Compose, Prometheus, Grafana
- **Testes:** Jest, Cypress (planejado)
- **CI/CD:** Turbo, GitHub Actions (planejado)

### Padrões Estabelecidos

**1. Bulk Operations Pattern**
- Input: `BulkxxxDto[]`
- Processing: Item-by-item com validação
- Output: `BulkOperationResultDto` com sucesso/erro/aviso

**2. Service Layer Pattern**
- Validações de entrada
- Lógica de negócio isolada
- Auditoria em `historicoCalculo`

**3. Controller Layer Pattern**
- @UseGuards(JwtAuthGuard, PermissionsGuard)
- @Permissions(Permission.XXX)
- Resposta HTTP apropriada

**4. Teste Pattern**
- Sucesso (dados válidos)
- Erro (validação falha)
- Aviso (regra de negócio)

---

## 📝 Como Usar Este Índice

### Se você quer...

**...entender o estado atual do projeto:**
→ Leia [SUMARIO_EXECUTIVO.md](SUMARIO_EXECUTIVO.md)

**...implementar Sprint 5:**
→ Vá para [PROXIMAS_SPRINTS_PLANEJAMENTO.md](PROXIMAS_SPRINTS_PLANEJAMENTO.md), seção "Sprint 5"

**...ver status de cada módulo:**
→ Consulte [ANALISE_MODULOS_SPRINT_8.md](ANALISE_MODULOS_SPRINT_8.md)

**...entender o que foi feito em Sprint 3:**
→ Leia [SPRINT_3_CONCLUSAO.md](SPRINT_3_CONCLUSAO.md)

**...copiar template de código:**
→ Procure em [PROXIMAS_SPRINTS_PLANEJAMENTO.md](PROXIMAS_SPRINTS_PLANEJAMENTO.md) seção "Código Pronto para Copiar"

**...listar todos os endpoints:**
→ Procure em cada módulo dentro de "Endpoints"

---

## 🔗 Arquivo Raiz do Repo

```
gestor_multiprojetos/
├─ SUMARIO_EXECUTIVO.md                    ⭐ COMECE AQUI
├─ PROXIMAS_SPRINTS_PLANEJAMENTO.md         📋 TAREFAS
├─ SPRINT_3_CONCLUSAO.md
├─ SPRINTS_3_4_CONCLUSAO.md
├─ SPRINT_STATUS_ATUAL.md
├─ ANALISE_MODULOS_SPRINT_8.md
├─ docs/
│  └─ proposta_tecnica_scrum.md            (Proposta oficial)
├─ apps/
│  ├─ backend/
│  │  └─ src/modules/
│  │     ├─ projects/
│  │     ├─ hr/
│  │     ├─ financial/
│  │     ├─ dashboard/
│  │     └─ ...
│  └─ frontend/
└─ docker-compose.yml
```

---

## ⚡ Comandos Úteis Rápidos

```bash
# Desenvolvimento
npm test                    # Rodar testes
npm run build              # Build
npm run start:dev          # Dev mode

# Docker
docker compose up -d --build    # Iniciar infraestrutura
docker compose ps               # Ver status
docker compose down             # Parar

# Testes específicos
npm test -- projects -- --verbose
npm test -- hr -- --coverage
npm test -- --testNamePattern="deve importar"

# Build otimizado
npm run build -- --filter=gestor-backend
```

---

## 📞 Suporte

**Dúvidas sobre:**
- Tarefas futuras → `PROXIMAS_SPRINTS_PLANEJAMENTO.md`
- Estado atual → `SUMARIO_EXECUTIVO.md`
- Implementação específica → Arquivo do módulo (`hr.service.ts`, etc)
- Testes → `*.spec.ts` files

---

**Última Atualização:** 01 de Março de 2026  
**Próxima Review:** Após Sprint 5 (Financeiro)

