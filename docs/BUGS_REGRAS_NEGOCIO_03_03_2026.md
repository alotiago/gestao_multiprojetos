# Bugs e Regras de Negócio — Achados de Teste (03/03/2026)

**Data:** 03 de Março de 2026  
**Origem:** Testes manuais pós Go-Live (dados zerados, ambiente Docker local)  
**Status:** 🔴 Pendente de correção  
**Responsável:** Equipe de Desenvolvimento

---

## Sumário Executivo

Durante sessão de testes funcionais realizada em 03/03/2026, após limpeza completa dos dados (fresh start), foram identificados **8 defeitos/requisitos** distribuídos em 4 módulos: **Relatórios**, **Contratos**, **Financeiro** e **Recursos Humanos**.

| # | Módulo | Tipo | Severidade | Status |
|---|--------|------|------------|--------|
| BUG-001 | Relatórios | Bug de exibição | Alta | 🔴 Aberto |
| BUG-002 | Relatórios | Bug de exibição | Alta | 🔴 Aberto |
| BUG-003 | Relatórios | Bug de exibição | Alta | 🔴 Aberto |
| RN-001 | Contratos | Nova funcionalidade | Média | 🔴 Pendente |
| BUG-004 | Financeiro | Bug de carregamento | Alta | 🔴 Aberto |
| RN-002 | Financeiro | Ajuste de nomenclatura | Baixa | 🔴 Pendente |
| RN-003 | Financeiro | Nova funcionalidade | Alta | 🔴 Pendente |
| RN-004 | Recursos Humanos | Nova funcionalidade | Alta | 🔴 Pendente |

---

## Módulo: Relatórios

### BUG-001 — Custos Totais não carregam no módulo Relatórios

**Tipo:** Bug de exibição  
**Severidade:** Alta  
**Módulo/Tela:** Relatórios → Visão Geral

**Descrição:**  
Ao acessar o módulo de Relatórios, o painel de **Custos Totais** não exibe nenhum valor. O campo aparece zerado ou vazio independentemente de haver receitas ou despesas cadastradas.

**Comportamento esperado:**  
O campo Custos Totais deve consolidar e exibir os custos de RH, despesas operacionais e custos indiretos registrados no período selecionado.

**Causa provável:**  
- A query de aggregation de custos não está sendo chamada corretamente, ou
- O campo de custo não está sendo mapeado do retorno da API para o componente de exibição, ou
- O endpoint `/financial/relatorio` não está retornando o campo `custoTotal` populado.

**Critérios de Aceite:**
- [ ] O painel exibe a soma de todos os custos (RH + despesas + indiretos) do período filtrado
- [ ] Ao alterar o filtro de período, o valor atualiza corretamente
- [ ] Valor zero exibe "R$ 0,00" e não campo vazio/undefined

---

### BUG-002 — Gráfico "Receita vs Custo" não carrega custos totais

**Tipo:** Bug de exibição  
**Severidade:** Alta  
**Módulo/Tela:** Relatórios → Gráfico Receita vs Custo

**Descrição:**  
No gráfico de barras "Receita vs Custo", a série de **Custo** aparece zerada ou ausente em todos os meses. A série de Receita exibe normalmente.

**Comportamento esperado:**  
Ambas as séries (Receita e Custo) devem ser plotadas lado a lado por mês, permitindo comparativo visual.

**Causa provável:**  
- Mesma origem do BUG-001: o dado `custoMensal` não está sendo retornado ou mapeado para a série do gráfico (Recharts), ou
- O campo de custo no dataset do gráfico está com nome diferente do esperado pelo componente.

**Critérios de Aceite:**
- [ ] A série "Custo" exibe barras proporcionais ao custo real do mês
- [ ] Tooltip ao passar o mouse sobre as barras de custo exibe valor correto
- [ ] Legenda do gráfico distingue "Receita" e "Custo"

---

### BUG-003 — Detalhamento Mensal não carrega nenhum dado de custo

**Tipo:** Bug de exibição  
**Severidade:** Alta  
**Módulo/Tela:** Relatórios → Detalhamento Mensal

**Descrição:**  
Na tabela/seção de Detalhamento Mensal, todas as colunas referentes a custo (custo RH, custo operacional, custo total, margem, etc.) aparecem vazias ou zeradas.

**Comportamento esperado:**  
O detalhamento mensal deve exibir, mês a mês, a composição dos custos: pessoal, despesas operacionais, impostos aplicados e custo total calculado.

**Causa provável:**  
- O endpoint que popula o detalhamento mensal provavelmente consulta `custos_mensais` ou `historicos_calculo`, e essas tabelas podem não estar sendo alimentadas no fluxo de cadastro de receitas, ou
- O JOIN entre `receitas_mensais` e `custos_mensais` por `mesAno` pode não estar retornando registros correspondentes.

**Critérios de Aceite:**
- [ ] Cada linha mensal exibe valores de: custo pessoal, despesas, impostos e custo total
- [ ] A margem é calculada automaticamente como `receita - custo`
- [ ] Meses sem movimento exibem "R$ 0,00" em todos os campos de custo

---

## Módulo: Contratos

### RN-001 — Incluir campo Saldo Contratual com dedução automática pelas Receitas

**Tipo:** Nova funcionalidade / Regra de Negócio  
**Severidade:** Média  
**Módulo/Tela:** Contratos → Formulário de Contrato / Card de Contrato

**Descrição:**  
O contrato deve possuir um campo de **Saldo Contratual** — representando o valor disponível restante do contrato — que é deduzido automaticamente conforme as **receitas** associadas a esse contrato são registradas.

**Regra de Negócio:**
```
Saldo Contratual = Valor Total do Contrato − Σ(Receitas registradas para o contrato)
```

**Detalhamento:**
1. Ao criar um contrato, `saldoContratual` é inicializado com o `valorTotal` do contrato.
2. A cada nova receita associada ao contrato (via `LinhaContratual`), o `saldoContratual` é recalculado subtraindo o `valorReceita`.
3. O saldo não pode ser negativo — deve-se exibir alerta/validação caso a receita a lançar exceda o saldo disponível.
4. Exibir o saldo contratual no card/painel do contrato com destaque visual (verde se positivo, vermelho se esgotado/negativo).

**Impacto nos Modelos (Prisma):**
```prisma
model Contrato {
  // ... campos existentes ...
  saldoContratual  Decimal  @default(0) @map("saldo_contratual")
}
```

**Impacto nos Endpoints:**
- `POST /contratos` → inicializa `saldoContratual = valorTotal`
- `POST /financial/receitas` → ao salvar receita com `contratoId`, atualiza `saldoContratual` do contrato
- `GET /contratos/:id` → retorna `saldoContratual` no DTO de resposta

**Critérios de Aceite:**
- [ ] Campo `saldoContratual` exibido no formulário e card do contrato (somente leitura)
- [ ] Ao cadastrar receita associada a contrato, saldo é deduzido automaticamente
- [ ] Alerta ao tentar lançar receita que ultrapasse o saldo disponível
- [ ] Saldo com cor verde (> 20% do valor total), amarelo (1–20%), vermelho (esgotado)

---

## Módulo: Recursos Humanos

### RN-004 — Vincular colaborador a um projeto ao cadastrar (combobox obrigatória)

**Tipo:** Nova funcionalidade / Regra de Negócio  
**Severidade:** Alta  
**Módulo/Tela:** Recursos Humanos → Cadastro de Colaborador

**Descrição:**  
Ao incluir um novo colaborador no módulo de Recursos Humanos, o formulário deve exigir a vinculação a um **projeto** por meio de uma combobox (select). Isso garante que o custo do colaborador seja automaticamente alocado ao projeto selecionado.

**Regra de Negócio:**
```
Colaborador.projectId = Projeto selecionado na combobox (obrigatório)
→ Custo do colaborador é alocado ao projeto vinculado
```

**Detalhamento:**
1. O formulário de cadastro de colaborador deve exibir uma **combobox** com a lista de projetos ativos.
2. O campo `Projeto *` deve ser **obrigatório** — o formulário não pode ser salvo sem a seleção de um projeto.
3. A combobox deve carregar os projetos via endpoint `GET /projects` (somente projetos com status ativo).
4. Ao salvar o colaborador, o `projectId` selecionado é persistido no registro do colaborador.
5. O custo do colaborador (salário, encargos, benefícios) passa a ser contabilizado no projeto vinculado para fins de relatórios e cálculo de margem.

**Impacto nos Modelos (Prisma):**
```prisma
model Colaborador {
  // ... campos existentes ...
  projectId  String   @map("project_id")
  project    Project  @relation(fields: [projectId], references: [id])
}
```

**Impacto nos Endpoints:**
- `POST /hr/colaboradores` → campo `projectId` obrigatório no DTO de criação
- `PUT /hr/colaboradores/:id` → permite alterar o projeto vinculado
- `GET /hr/colaboradores` → retorna `projectId` e dados resumidos do projeto no DTO de resposta

**UI — Layout do Formulário:**
```
┌─────────────────────────────────────────────────────────┐
│ Nome *                    [____________________]         │
│ Cargo *                   [____________________]         │
│ Projeto *                 [▼ Selecione um projeto]       │
│                           (combobox obrigatória)         │
│ Salário *                 [____]                         │
│ Data Admissão *           [__/__/____]                   │
└─────────────────────────────────────────────────────────┘
```

**Critérios de Aceite:**
- [ ] Combobox "Projeto *" exibida no formulário de cadastro de colaborador (obrigatória)
- [ ] Combobox carrega apenas projetos com status ativo
- [ ] Formulário não permite salvar sem projeto selecionado (validação frontend + backend)
- [ ] Custo do colaborador é contabilizado no projeto vinculado nos relatórios
- [ ] Ao editar colaborador, permite trocar o projeto vinculado
- [ ] Na listagem de colaboradores, exibe o nome do projeto vinculado

---

## Módulo: Financeiro

### BUG-004 — Botão "Despesa" não carrega nenhuma despesa

**Tipo:** Bug de carregamento  
**Severidade:** Alta  
**Módulo/Tela:** Financeiro → Seção Despesas

**Descrição:**  
Ao clicar no botão/aba **Despesa** dentro do módulo Financeiro, a listagem de despesas permanece vazia mesmo quando há despesas cadastradas no sistema (verificado via banco de dados).

**Comportamento esperado:**  
Ao clicar em "Despesa", deve ser carregada a lista de despesas associadas ao período/projeto selecionado.

**Causa provável:**  
- O endpoint `GET /financial/despesas` pode não estar sendo chamado corretamente (parâmetros de query ausentes ou incorretos), ou
- O componente de listagem está filtrando por `projectId` que pode estar `undefined` no contexto, ou
- Erro silencioso na chamada de API (sem tratamento de erro visível ao usuário).

**Passos para Reproduzir:**
1. Acessar módulo Financeiro
2. Selecionar um projeto
3. Clicar no botão/aba "Despesa"
4. Observar que a lista não carrega

**Critérios de Aceite:**
- [ ] Lista de despesas carrega ao clicar no botão "Despesa"
- [ ] Despesas são filtradas pelo projeto selecionado
- [ ] Mensagem "Nenhuma despesa cadastrada" exibida quando lista vazia
- [ ] Spinner de carregamento exibido durante a requisição

---

### RN-002 — Renomear label "Quantidade do Período" para "Quantidade do Período Previsto"

**Tipo:** Ajuste de nomenclatura (UX)  
**Severidade:** Baixa  
**Módulo/Tela:** Financeiro → Receitas → Modo Via Contrato

**Descrição:**  
No formulário de lançamento de receita no **modo Via Contrato**, o campo atualmente rotulado como **"Quantidade do Período \*"** deve ser renomeado para **"Quantidade do Período Previsto \*"**, para distinguir claramente do novo campo de quantidade realizada (RN-003).

**Campo afetado:**
- Label atual: `Quantidade do Período *`  
- Label nova: `Quantidade do Período Previsto *`
- Comportamento: **sem alteração** — permanece obrigatório e com a mesma lógica de cálculo atual

**Critérios de Aceite:**
- [ ] Label exibida como "Quantidade do Período Previsto *" no formulário
- [ ] Campo permanece obrigatório
- [ ] Nenhuma alteração na lógica de cálculo existente

---

### RN-003 — Incluir campo "Quantidade do Período Realizado" e cálculo automático de "Valor Realizado (Contrato)"

**Tipo:** Nova funcionalidade / Regra de Negócio  
**Severidade:** Alta  
**Módulo/Tela:** Financeiro → Receitas → Modo Via Contrato

**Descrição:**  
No formulário de lançamento de receita no **modo Via Contrato**, devem ser adicionados dois novos campos para registro do **realizado** em contraposição ao **previsto**:

| Campo | Obrigatório | Cálculo |
|-------|-------------|---------|
| Quantidade do Período Realizado | ❌ Não | Informado manualmente pelo usuário |
| Valor Realizado (Contrato) | ❌ Não | Automático: `Qtd. Realizada × Valor Unitário da Linha Contratual` |

**Regras de Negócio:**

#### Regra RN-003.A — Cálculo automático do Valor Realizado
```
Valor Realizado (Contrato) = Quantidade do Período Realizado × Valor Unitário da Linha Contratual
```
- O campo "Valor Realizado (Contrato)" deve ser **calculado automaticamente** ao digitar a quantidade realizada.
- O campo deve ser **somente leitura** (calculado, não editável diretamente).

#### Regra RN-003.B — Dedução do Saldo da Linha Contratual (Quantidade)
```
Saldo Quantidade da Linha Contratual -= Quantidade do Período Realizado
```
- Ao salvar a receita, o `saldoQuantidade` da `LinhaContratual` deve ser decrementado pelo valor de `quantidadeRealizada`.
- A operação deve ser atômica (transação DB).
- Validação: a `quantidadeRealizada` não pode exceder o `saldoQuantidade` disponível na linha contratual.

#### Regra RN-003.C — Dedução do Saldo da Linha Contratual (Valor)
```
Saldo Valor da Linha Contratual -= Valor Realizado (Contrato)
```
- Ao salvar a receita, o `saldoValor` da `LinhaContratual` deve ser decrementado pelo `valorRealizado`.
- A operação deve ser atômica (mesma transação da RN-003.B).
- Validação: o `valorRealizado` não pode exceder o `saldoValor` disponível na linha contratual.

**Impacto nos Modelos (Prisma):**

```prisma
model LinhaContratual {
  // ... campos existentes ...
  saldoQuantidade  Decimal  @default(0) @map("saldo_quantidade")
  saldoValor       Decimal  @default(0) @map("saldo_valor")
}

model ReceitaMensal {
  // ... campos existentes ...
  quantidadeRealizada  Decimal?  @map("quantidade_realizada")
  valorRealizado       Decimal?  @map("valor_realizado")
}
```

**Impacto nos Endpoints:**
- `POST /financial/receitas` → ao salvar com `quantidadeRealizada`:
  1. Calcula `valorRealizado = quantidadeRealizada × linhaContratual.valorUnitario`
  2. Em transação: decrementa `LinhaContratual.saldoQuantidade` e `LinhaContratual.saldoValor`
  3. Decrementa `Contrato.saldoContratual` (integração com RN-001)
- `GET /financial/receitas` → retorna `quantidadeRealizada` e `valorRealizado` no DTO

**UI — Layout do Formulário (Via Contrato):**
```
┌─────────────────────────────────────────────────────────┐
│ Linha Contratual *          [Select...]                  │
│ Quantidade do Período Previsto *  [____]  (obrigatório)  │
│ Quantidade do Período Realizado   [____]  (opcional)     │
│ Valor Realizado (Contrato)        [R$ calculado auto]    │
│                                   (somente leitura)      │
└─────────────────────────────────────────────────────────┘
```

**Critérios de Aceite:**
- [ ] Campo "Quantidade do Período Realizado" exibido após o campo previsto (não obrigatório)
- [ ] Campo "Valor Realizado (Contrato)" exibido abaixo, somente leitura, calculado automaticamente ao digitar quantidade
- [ ] Ao salvar receita com quantidade realizada > 0: saldo da linha contratual é decrementado (quantidade e valor)
- [ ] Validação: exibe erro ao tentar salvar quantidade realizada maior que o saldo disponível
- [ ] Ao editar/excluir receita: saldo da linha contratual é restaurado corretamente
- [ ] Ambos os campos exibem "—" quando não preenchidos na listagem de receitas

---

## Impacto Consolidado nos Modelos de Dados

```prisma
// Alterações necessárias no schema.prisma

model Contrato {
  // NOVO:
  saldoContratual  Decimal  @default(0) @map("saldo_contratual")
}

model LinhaContratual {
  // NOVO:
  saldoQuantidade  Decimal  @default(0) @map("saldo_quantidade")
  saldoValor       Decimal  @default(0) @map("saldo_valor")
}

model ReceitaMensal {
  // NOVO:
  quantidadeRealizada  Decimal?  @map("quantidade_realizada")
  valorRealizado       Decimal?  @map("valor_realizado")
}
```

---

## Estimativa de Esforço (Sprint Corretiva)

| Item | Componentes | Estimativa |
|------|-------------|------------|
| BUG-001/002/003 — Relatórios custos | Backend query + Frontend mapping | 4h |
| RN-001 — Saldo Contratual | Migration + Service + Frontend card | 3h |
| BUG-004 — Despesas não carregam | Frontend debug (filtro/API call) | 2h |
| RN-002 — Renomear label | Frontend (1 linha de código) | 0.5h |
| RN-003 — Qtd/Valor Realizado | Migration + Service (transação) + Frontend | 6h |
| RN-004 — Colaborador vinculado a Projeto | DTO + Service + Frontend combobox | 2h |
| Testes unitários/integração | Backend specs atualizados | 3.5h |
| **Total estimado** | | **~21h** |

---

## Dependências e Ordem de Implementação

```
1. Migrations DB (saldoContratual, saldoQuantidade, saldoValor, quantidadeRealizada, valorRealizado)
   ↓
2. DTOs atualizados (Contrato, LinhaContratual, ReceitaMensal)
   ↓
3. Serviços (lógica de dedução em transação atômica)
   ↓
4. Endpoints atualizados
   ↓
5. Frontend — Formulário Via Contrato (RN-002, RN-003)
   ↓
6. Frontend — Card Contrato (Saldo Contratual — RN-001)
   ↓
7. Frontend — Relatórios (BUG-001, BUG-002, BUG-003)
   ↓
8. Frontend — RH Cadastro Colaborador com combobox Projeto (RN-004)
   ↓
9. BUG-004 — Debug despesas (pode ser paralelo a partir do passo 6)
```

---

## Referências

- Schema atual: `apps/backend/prisma/schema.prisma`
- Service financeiro: `apps/backend/src/modules/financial/financial.service.ts`
- Controller financeiro: `apps/backend/src/modules/financial/financial.controller.ts`
- Página relatórios (frontend): `apps/frontend/src/app/relatorios/`
- Página contratos (frontend): `apps/frontend/src/app/contratos/`
- Página financeiro (frontend): `apps/frontend/src/app/financeiro/`
- Service RH: `apps/backend/src/modules/hr/hr.service.ts`
- Controller RH: `apps/backend/src/modules/hr/hr.controller.ts`
- Página RH (frontend): `apps/frontend/src/app/rh/`
