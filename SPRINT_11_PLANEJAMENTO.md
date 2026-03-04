# Sprint 11 — Planejamento: Correções Pós-Go-Live

**Sprint:** 11 — Correções e Evoluções Funcionais  
**Período:** Março 2026  
**Status:** 🔴 Planejamento — Aguardando Início  
**Origem:** Achados de teste manual em 03/03/2026  
**Referência:** `docs/BUGS_REGRAS_NEGOCIO_03_03_2026.md`

---

## Sprint Goal

> Corrigir todos os defeitos de exibição de custos no módulo Relatórios, implementar o controle de Saldo Contratual e adicionar o registro de realizado (quantidade e valor) no lançamento de receitas Via Contrato.

---

## Backlog da Sprint

### Prioridade 1 — Alta (Bugs críticos de negócio)

---

#### TASK-001 — [BUG-001/002/003] Corrigir ausência de dados de custo no módulo Relatórios

**Estimativa:** 4h  
**Arquivos envolvidos:**
- `apps/backend/src/modules/financial/financial.service.ts` — query de custos
- `apps/frontend/src/app/relatorios/page.tsx` (ou similar) — mapeamento de dados
- `apps/frontend/src/app/relatorios/contratos-dashboard/page.tsx` — gráfico Receita vs Custo

**Tarefas:**
- [ ] Inspecionar endpoint `/financial/relatorio` ou equivalente para verificar retorno de `custoTotal`
- [ ] Confirmar que `custos_mensais` e `historicos_calculo` são consultados na aggregation
- [ ] Corrigir mapeamento no frontend: campo retornado pela API → prop do componente de exibição
- [ ] Corrigir série de custo no gráfico Recharts (verificar nome do campo no dataset)
- [ ] Corrigir tabela de Detalhamento Mensal: garantir JOIN entre receitas e custos por `mesAno`
- [ ] Adicionar tratamento de `undefined` → exibir `R$ 0,00`
- [ ] Testes: adicionar/atualizar teste unitário que valida retorno de `custoTotal` no service

**Critérios de Done:**
- [ ] Custos Totais exibidos no painel de Relatórios
- [ ] Gráfico Receita vs Custo exibe ambas as séries
- [ ] Detalhamento Mensal exibe valores de custo por mês

---

#### TASK-002 — [BUG-004] Corrigir carregamento de despesas no módulo Financeiro

**Estimativa:** 2h  
**Arquivos envolvidos:**
- `apps/frontend/src/app/financeiro/` — tab/botão Despesa
- `apps/frontend/src/services/financial.service.ts` (ou similar) — chamada API despesas

**Tarefas:**
- [ ] Inspecionar o handler do botão/aba "Despesa" no componente financeiro
- [ ] Verificar se `projectId` está sendo passado corretamente para `GET /financial/despesas`
- [ ] Verificar parâmetros de query obrigatórios no endpoint
- [ ] Adicionar `console.error` / toast de erro para erros silenciosos
- [ ] Verificar se a resposta da API está sendo desestruturada corretamente (ex: `data.items` vs `data`)
- [ ] Testar no browser após correção

**Critérios de Done:**
- [ ] Despesas carregam ao clicar na aba
- [ ] Spinner visível durante carregamento
- [ ] Mensagem "Nenhuma despesa" quando lista vazia

---

#### TASK-003 — [RN-003] Campos Quantidade Realizada e Valor Realizado (Via Contrato) — Backend

**Estimativa:** 4h  
**Arquivos envolvidos:**
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/modules/financial/dto/`
- `apps/backend/src/modules/financial/financial.service.ts`

**Tarefas:**
- [ ] Adicionar campos ao `schema.prisma`:
  ```prisma
  // ReceitaMensal
  quantidadeRealizada  Decimal?  @map("quantidade_realizada")
  valorRealizado       Decimal?  @map("valor_realizado")
  
  // LinhaContratual
  saldoQuantidade  Decimal  @default(0) @map("saldo_quantidade")
  saldoValor       Decimal  @default(0) @map("saldo_valor")
  ```
- [ ] Gerar e aplicar migration: `npx prisma migrate dev --name add_realizado_saldo_linha`
- [ ] Atualizar DTOs:
  - `CreateReceitaMensalDto`: adicionar `quantidadeRealizada?: number` e `valorRealizado?: number` (opcionais)
  - `ReceitaMensalResponseDto`: incluir os dois campos novos
  - `LinhaContratualResponseDto`: incluir `saldoQuantidade` e `saldoValor`
- [ ] Atualizar `financial.service.ts` — método de criação de receita:
  ```typescript
  // Em createReceita(), quando for Via Contrato e tiver quantidadeRealizada:
  // 1. Calcular valorRealizado = quantidadeRealizada × linhaContratual.valorUnitario
  // 2. Validar: quantidadeRealizada <= linhaContratual.saldoQuantidade
  // 3. Validar: valorRealizado <= linhaContratual.saldoValor
  // 4. Em transação:
  //    - Criar ReceitaMensal com quantidadeRealizada e valorRealizado
  //    - Decrementar LinhaContratual.saldoQuantidade
  //    - Decrementar LinhaContratual.saldoValor
  //    - Decrementar Contrato.saldoContratual
  ```
- [ ] Atualizar testes unitários do `financial.service.spec.ts`

**Critérios de Done:**
- [ ] Migration aplicada sem erros
- [ ] Endpoint cria receita com campos de realizado
- [ ] Saldo da linha contratual decrementado atomicamente
- [ ] Validação retorna erro 422 quando quantidade excede saldo
- [ ] Testes passando (234+ testes)

---

### Prioridade 2 — Média

---

#### TASK-004 — [RN-001] Saldo Contratual no modelo Contrato — Backend

**Estimativa:** 2h  
**Arquivos envolvidos:**
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/modules/contratos/` (ou `projects/`)

**Tarefas:**
- [ ] Adicionar campo `saldoContratual Decimal @default(0)` ao modelo `Contrato` no schema
- [ ] Migration: `npx prisma migrate dev --name add_saldo_contratual`
- [ ] `createContrato()`: inicializar `saldoContratual = valorTotal`
- [ ] Atualizar DTO de resposta para incluir `saldoContratual`
- [ ] Integração com TASK-003: `createReceita()` também decrementa `Contrato.saldoContratual`

**Critérios de Done:**
- [ ] Novo contrato criado com `saldoContratual = valorTotal`
- [ ] Saldo decrementado após lançamento de receita
- [ ] `GET /contratos/:id` retorna `saldoContratual`

---

#### TASK-005 — [RN-001] Saldo Contratual — Frontend (card do contrato)

**Estimativa:** 1.5h  
**Arquivos envolvidos:**
- `apps/frontend/src/app/contratos/` — card/detail de contrato

**Tarefas:**
- [ ] Exibir campo `saldoContratual` no card/detalhe do contrato
- [ ] Aplicar cor dinâmica:
  - Verde: saldo > 20% do valor total
  - Amarelo: saldo entre 1% e 20%
  - Vermelho: saldo esgotado (≤ 0)
- [ ] Tooltip explicativo: "Valor disponível restante do contrato"

**Critérios de Done:**
- [ ] Saldo exibido no card com cor dinâmica
- [ ] Tooltip funcional

---

#### TASK-006 — [RN-003] Campos Realizado no formulário Via Contrato — Frontend

**Estimativa:** 2h  
**Arquivos envolvidos:**
- `apps/frontend/src/app/financeiro/` — formulário de receita

**Tarefas:**
- [ ] Renomear label: `"Quantidade do Período *"` → `"Quantidade do Período Previsto *"` (RN-002)
- [ ] Adicionar campo `quantidadeRealizada` (input numérico, opcional, sem asterisco)
- [ ] Adicionar campo `valorRealizado` (somente leitura, formatted como moeda)
- [ ] Lógica de cálculo automático no frontend (sincronizado com o input):
  ```typescript
  // onChange de quantidadeRealizada:
  const valorRealizado = qtdRealizada * linhaContratualSelecionada.valorUnitario;
  ```
- [ ] Exibir saldo disponível da linha contratual como referência no formulário
- [ ] Enviar `quantidadeRealizada` no payload do form (backend calcula e persiste `valorRealizado`)

**Critérios de Done:**
- [ ] Labels corretas no formulário
- [ ] Cálculo automático de valor realizado ao digitar quantidade
- [ ] Campo valor realizado somente leitura
- [ ] Saldo disponível exibido como informação contextual

---

### Prioridade 3 — Baixa

---

#### TASK-007 — [RN-002] Renomear label no formulário Via Contrato

> **Incluída na TASK-006** — sem tarefa separada necessária.

---

## Critérios de Done da Sprint (Definition of Done)

- [ ] Todos os bugs (BUG-001 ao BUG-004) corrigidos e verificados no browser
- [ ] Novas funcionalidades (RN-001, RN-002, RN-003) implementadas e funcionais
- [ ] Migrations aplicadas sem erros no ambiente Docker
- [ ] Suite de testes passando (≥ 234 testes)
- [ ] Sem regressões nas funcionalidades existentes
- [ ] Docker rebuild sem erros (`docker compose up -d --build`)
- [ ] Smoke test realizado para todos os fluxos impactados

---

## Fluxo de Desenvolvimento Recomendado

```
Dia 1 (manhã):
  → TASK-003 Backend (schema + migration + service + testes)
  → TASK-004 Backend (saldo contratual)

Dia 1 (tarde):
  → TASK-001 Backend + Frontend (custos relatórios)
  → TASK-002 Frontend (despesas)

Dia 2 (manhã):
  → TASK-006 Frontend (formulário realizado)
  → TASK-005 Frontend (card contrato)

Dia 2 (tarde):
  → Rebuild Docker
  → Smoke test completo
  → Documentação de encerramento da sprint
```

---

## Riscos e Observações

| Risco | Mitigação |
|-------|-----------|
| Migrations afetam dados existentes | Campos novos com `@default(0)` ou nullable — não há breaking change |
| Saldo negativo por dados legados | Trigger de inicialização no seed ou migration com UPDATE inicial |
| Transação de 3 tabelas (BUG→RN-003) pode falhar parcialmente | Usar `prisma.$transaction()` para garantir atomicidade |
| Frontend não recebe `valorUnitario` da linha no contexto do form | Garantir que o `GET /contratos/:id/linhas` retorna `valorUnitario` |

---

## Referências

- Bugs detalhados: [docs/BUGS_REGRAS_NEGOCIO_03_03_2026.md](docs/BUGS_REGRAS_NEGOCIO_03_03_2026.md)
- Schema atual: `apps/backend/prisma/schema.prisma`
- Relatório Sprint 10 (Go-Live): [docs/SPRINT_10_FINAL_REPORT.md](docs/SPRINT_10_FINAL_REPORT.md)
- Status Sprint 8 (Recálculos): [SPRINT_8_STATUS_FINAL.md](SPRINT_8_STATUS_FINAL.md)
