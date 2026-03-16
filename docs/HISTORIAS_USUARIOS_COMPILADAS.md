0581
# 📚 Histórias de Usuários — Gestor Multiprojetos (PR_SEEC_2026)

**Projeto:** Gestor Multiprojetos  
**Status:** Backlog de Sprint 11+  
**Data de Compilação:** 05/03/2026

---

## 🎯 Histórias de Usuários Compiladas

### ÉPICO 1 — Gestão de Contratos e Projetos (9 US)

#### US-MP-001 — Cadastro Completo de Projetos
**Como** Gestor de Projeto  
**Quero** cadastrar e manter informações completas do projeto (código, cliente, unidade, status, tipo)  
**Para** centralizar dados e garantir rastreabilidade

**Critérios de Aceite:**
- Campos: código, cliente, unidade, status (ativo/inativo/encerrado), tipo (fixo/variável/híbrido)
- Validação de unicidade do código por cliente
- Histórico de mudanças de status com auditoria

---

#### US-MP-002 — Controle de Receitas Mensais e Anuais
**Como** Financeiro  
**Quero** registrar e acompanhar receitas mensais e consolidações anuais por projeto  
**Para** ter visibilidade do faturamento e comparar previsto vs. realizado

**Critérios de Aceite:**
- Lançamento de receita prevista (mensal)
- Registro de receita realizada (mensal)
- Consolidação automática por ano
- Visão comparativa (previsto vs. realizado)

---

#### US-MP-003 — Registro de Serviços e Tipos de Receita
**Como** PMO  
**Quero** definir serviços e tipos de receita por projeto  
**Para** detalhar fonte de faturamento e facilitar análises

**Critérios de Aceite:**
- CRUD de serviços
- Associação de tipos (desenvolvimento, consultoria, suporte, etc.)
- Possibilidade de marcar alguns como "principais"

---

#### US-MP-004 — Projeções Financeiras até 2030
**Como** Diretoria  
**Quero** visualizar projeções de receita e custos até 2030  
**Para** planejar estratégia financeira plurianual

**Critérios de Aceite:**
- Cálculo automático de FCST (forecast) com histórico de 3 anos
- Ajuste manual de cenários (otimista/realista/pessimista)
- Visualização em gráfico

---

#### US-MP-005 — Análise de Carteira por Período
**Como** PMO  
**Quero** analisar carteira consolidada por mês, ano e período acumulado  
**Para** identificar tendências e oportunidades

**Critérios de Aceite:**
- Agrupar por período (mensal, trimestral, anual)
- Mostrar total de receita, custos, margem
- Permitir filtro por cliente, unidade, tipo

---

#### US-MP-006 — Consolidação de Valores Previstos vs. Realizados
**Como** Gestor Financeiro  
**Quero** comparar valores planejados com realizados  
**Para** medir performance e identificar desvios

**Critérios de Aceite:**
- Coluna para previsto, coluna para realizado
- Cálculo automático de variação (%)
- Filtro para mostrar apenas desvios > X%

---

#### US-MP-007 — Evolução Temporal do Projeto
**Como** Analista  
**Quero** visualizar evolução de receita/custo/margem ao longo dos anos  
**Para** entender trajetória e sazonalidade

**Critérios de Aceite:**
- Gráfico de linha com série histórica (2023-2026)
- Sobreposição de múltiplos projetos
- Export para PDF/Excel

---

#### US-MP-008 — Cálculo Automático de Margens e Indicadores
**Como** CFO  
**Quero** que o sistema calcule automaticamente margens brutas, líquidas e indicadores (EBITDA, ROI)  
**Para** monitorar saúde financeira operacional

**Critérios de Aceite:**
- Margem bruta = (Receita - Custos Diretos) / Receita
- Margem líquida = (Receita - Custos Totais) / Receita
- ROI = Lucro / Investimento Inicial
- Atualização em tempo real

---

#### US-MP-009 — Visão Consolidada para Diretoria
**Como** Diretor Geral  
**Quero** um dashboard executivo com KPIs consolidados de todos os projetos  
**Para** tomar decisões estratégicas rapidamente

**Critérios de Aceite:**
- Total de receita (YTD)
- Total de custos (YTD)
- Margem consolidada
- Top 5 projetos por receita
- Indicadores de desempenho por status

---

### ÉPICO 2 — Recursos Humanos (11 US)

#### US-MP-010 — Cadastro Completo de Colaboradores
**Como** RH  
**Quero** manter base de dados de colaboradores com todos os dados (matrícula, nome, cargo, classe, taxa, CH, cidade, estado)  
**Para** ter fonte única de verdade sobre força de trabalho

**Critérios de Aceite:**
- Campos: matrícula, nome completo, email, telefone, CPF
- Cargo, classe, setor
- Cidade, estado, região
- Data de admissão
- Busca e filtro por todos os campos

---

#### US-MP-011 — Controle de Status (Ativo/Desligado)
**Como** RH  
**Quero** registrar status de colaborador e datas de admissão/desligamento  
**Para** excluir automaticamente desligados dos cálculos futuros

**Critérios de Aceite:**
- Status: Ativo, Férias, Licença, Desligado
- Data de transição de status
- Histórico de statuses anteriores

---

#### US-MP-012 — Registro por Função Operacional
**Como** Operações  
**Quero** categorizar colaboradores por função (scanner, higienização, QA, remontagem, etc.)  
**Para** alocar recursos conforme demanda de projeto

**Critérios de Aceite:**
- CRUD de funções
- Mapeamento de colaborador para múltiplas funções (% tempo)
- Visão de disponibilidade por função

---

#### US-MP-013 — Controle de Horas Mensais por Colaborador
**Como** Gestor de Projeto  
**Quero** lançar e acompanhar horas trabalhadas por colaborador por mês  
**Para** validar utilização e calcular custos

**Critérios de Aceite:**
- Lançamento de horas previstas vs. horas realizadas
- Carga horária padrão (44h, 40h, etc.)
- Acúmulo de horas extras
- Rastreabilidade de quem lançou e quando

---

#### US-MP-014 — Cálculo Automático de Custos Individuais
**Como** Financeiro  
**Quero** que o sistema calcule automaticamente custo individual por colaborador (salário + encargos)  
**Para** ter visibilidade de custo de recursos

**Critérios de Aceite:**
- Custo horário = (Salário + Encargos + Benefícios) / Horas anuais
- Custo mensal = Custo horário × Horas trabalhadas no mês
- Integração com tabela de taxas/salários

---

#### US-MP-015 — Cálculo Automático de FTE
**Como** PMO  
**Quero** que o sistema calcule FTE (Full-Time Equivalent) por colaborador e mês  
**Para** entender equivalência em tempo integral e planejar recursos

**Critérios de Aceite:**
- FTE = Horas trabalhadas / Horas padrão (40 ou 44)
- Consolidação por mês e ano
- Visualização de FTE por projeto/função

---

#### US-MP-016 — Controle de Férias e Desligamentos
**Como** RH  
**Quero** registrar períodos de férias e desligamentos de colaboradores  
**Para** excluir automaticamente dos cálculos de disponibilidade

**Critérios de Aceite:**
- Registro de data início/fim de férias
- Lançamento de data de desligamento
- Integração com cálculo de jornada (automático marca como feriado interno)

---

#### US-MP-017 — Ajustes Massivos de Horas
**Como** RH  
**Quero** aplicar ajustes em lote (contratação, férias em massa, demissão, etc.)  
**Para** não fazer ajuste individual de 50+ colaboradores

**Critérios de Aceite:**
- Importar CSV com ajustes
- Aplicar mesmo ajuste para grupo (por setor, função, etc.)
- Preview antes de confirmar
- Auditoria de quem fez o ajuste

---

#### US-MP-018 — Aplicação Automática de Jornada por Calendário Regional
**Como** RH  
**Quero** que o sistema aplique automaticamente jornadas/CH mensais conforme calendário do estado/cidade  
**Para** não precisar fazer ajuste manual por feriado de cada região

**Critérios de Aceite:**
- Identificar estado/cidade do colaborador
- Buscar feriados aplicáveis (nacionais + estaduais + municipais)
- Reduzir CH mensal conforme dias úteis
- Sincronizar com cálculo de FTE e custo

---

#### US-MP-019 — Sincronização de TAXA, CALENDÁRIO, HORAS, CUSTO, FTE
**Como** Sistema  
**Quero** que todas as tabelas (taxas, calendários, horas, custos, FTE) estejam sincronizadas  
**Para** evitar inconsistências e recálculos manuais

**Critérios de Aceite:**
- Alterar taxa de um colaborador → recalcula custo mensal, variação de budget
- Alterar calendário de estado → recalcula jornada, FTE, custo
- Alterar horas → recalcula custo e FTE
- Transações atômicas (tudo ou nada)

---

#### US-MP-020 — Projeção de Custos de Pessoal para 2026-2027
**Como** CFO  
**Quero** visualizar projeção de custo de pessoal para próximos 12-24 meses  
**Para** planejar budget e reajustes sindicais

**Critérios de Aceite:**
- Aplicar IPCA estimado aos salários
- Incluir dissídio sindical em datas previstas
- Mostrar cenários (0% aumento, IPCA, +5%, etc.)
- Separar por projeto e departamento

---

### ÉPICO 3 — Gestão Financeira (8 US)

#### US-MP-021 — Cálculo de Custos Fixos e Variáveis
**Como** Financeiro  
**Quero** separar custos fixos (aluguel, depreciação) de custos variáveis (horas, impostos)  
**Para** fazer análise de ponto de equilíbrio e cenários

**Critérios de Aceite:**
- Categoria de despesa marcada como fixa/variável
- Cálculo automático de total fixo e variável
- Visão de mix fixo/variável por projeto

---

#### US-MP-022 — Registro de Custos Mensais
**Como** Contabilidade  
**Quero** lançar e acompanhar custos diversos mensais (facilities, fornecedores, aluguel de equipamentos, endomarketing, amortizações, transferências)  
**Para** consolidar custo total do projeto

**Critérios de Aceite:**
- CRUD de despesa (data, descrição, valor, categoria, projeto)
- Lançamento recorrente (mensal automaticamente)
- Rateio de despesa entre múltiplos projetos
- Histórico e auditoria

---

#### US-MP-023 — Controle de Impostos Multivariados
**Como** Fiscal  
**Quero** registrar e calcular múltiplos impostos (INSS, ISS, PIS, COFINS, IRPJ, CSLL) com alíquotas por estado/regime  
**Para** ter base para aprovisionamento e conformidade

**Critérios de Aceite:**
- Cadastro de alíquota por estado, regime tributário, tipo de impostos
- Cálculo automático baseado em receita/custo
- Histórico de variação de alíquotas

---

#### US-MP-024 — Aplicação de Regime Tributário (CPRB, Híbrido, etc.)
**Como** Fiscal  
**Quero** definir regime tributário por projeto e aplicar automaticamente alíquotas corretas  
**Para** calcular e provisionar impostos com precisão

**Critérios de Aceite:**
- Regime: Lucro Real, Lucro Presumido, SPED, CPRB (Regime de Subcontratação em Limpeza)
- Alíquotas específicas por regime
- Simulação de mudança de regime (impacto financeiro)

---

#### US-MP-025 — Controle de Despesas e Rateios
**Como** Controller  
**Quero** lançar despesas e ratear entre múltiplos projetos conforme critério (receita, horas, % manual)  
**Para** alocar custo correto a cada projeto

**Critérios de Aceite:**
- Despesa pode ser 100% de um projeto ou rateada
- Critério: % manual, por receita, por horas, por FTE
- Visualização de rateio em gráfico
- Validação de total rateado = 100%

---

#### US-MP-025A — Importação de Despesas via Upload de Arquivo Excel
**Como** Gestor Financeiro  
**Quero** importar múltiplas despesas de uma vez via upload de arquivo Excel  
**Para** agilizar o lançamento mensal de despesas recorrentes e reduzir erros manuais

**Critérios de Aceite:**

**Funcional:**
- ✅ Sistema fornece template Excel padronizado para download
- ✅ Upload aceita arquivos .xlsx e .xls (máximo 5MB)
- ✅ Validação de estrutura do arquivo antes do processamento
- ✅ Validação de dados por linha (projectId válido, tipo, valor > 0, mês 1-12, ano válido)
- ✅ Importação em lote via endpoint `POST /financial/despesas/import/bulk`
- ✅ Processamento assíncrono para arquivos com mais de 100 linhas
- ✅ Relatório detalhado: total de linhas, sucessos, erros por linha
- ✅ Rollback automático se mais de 20% das linhas falharem
- ✅ Log de auditoria registra usuário, timestamp e descrição da operação

**Template Excel:**
- Colunas obrigatórias: projectId, tipo, descricao, valor, mes, ano
- Tipos válidos: facilities, fornecedor, aluguel, endomarketing, amortizacao, rateio, provisao, outros
- Validação de dados: lista suspensa para tipo e mês
- Formatação condicional para destacar erros
- Linha de exemplo preenchida
- Máximo 1000 linhas por arquivo

**Interface:**
- Botão "Baixar Template" na tela de despesas
- Área de drag-and-drop para upload
- Barra de progresso durante processamento
- Modal com resumo: X linhas processadas, Y sucessos, Z erros
- Lista de erros expandível com linha e motivo
- Opção de baixar relatório de erros em CSV
- Após sucesso, atualizar lista de despesas automaticamente

**Validações Técnicas:**
- projectId deve existir e estar ativo
- Tipo deve ser enum válido (case-sensitive)
- Valor deve ser número positivo com até 2 casas decimais
- Mês entre 1 e 12
- Ano entre 2020 e 2100
- Descrição não pode ser vazia (máx 255 caracteres)
- Duplicatas na mesma importação geram warning mas são aceitas

**Performance:**
- Processamento de até 100 linhas: síncrono (< 3s)
- Processamento de 101-1000 linhas: assíncrono com notificação
- Timeout de processamento: 60s
- Uso de transação única para garantir atomicidade

**Segurança:**
- Apenas usuários com permissão FINANCIAL_WRITE podem importar
- Arquivo é validado contra malware antes do processamento
- Dados sensíveis não devem ser logados
- Arquivo temporário é deletado após processamento

**Mensagens de Erro Comuns:**
- "Projeto não encontrado: {projectId}"
- "Tipo de despesa inválido: {tipo}. Use um dos valores: facilities, fornecedor..."
- "Valor deve ser maior que zero"
- "Mês deve estar entre 1 e 12"
- "Ano deve estar entre 2020 e 2100"
- "Descrição é obrigatória"
- "Arquivo excede o limite de 1000 linhas"

**Exemplo de Resposta da API:**
```json
{
  "totalLinhas": 150,
  "processadas": 150,
  "sucessos": 147,
  "erros": 3,
  "detalhesErros": [
    {
      "linha": 45,
      "motivo": "Projeto não encontrado: 550e8400-invalid-id"
    },
    {
      "linha": 78,
      "motivo": "Tipo de despesa inválido: 'facilitys'"
    },
    {
      "linha": 120,
      "motivo": "Valor deve ser maior que zero"
    }
  ],
  "operacaoId": "uuid-da-operacao",
  "timestamp": "2026-03-06T10:30:00Z"
}
```

**Definição de Pronto (DoD):**
- [ ] Template Excel criado e disponível para download
- [ ] Endpoint de importação implementado e testado
- [ ] Validações de arquivo e dados funcionando
- [ ] Relatório de erros detalhado
- [ ] Interface de upload com drag-and-drop
- [ ] Testes unitários (cobertura > 80%)
- [ ] Testes de integração com arquivos válidos e inválidos
- [ ] Documentação da API no Swagger
- [ ] Manual de usuário com prints e exemplos
- [ ] Log de auditoria registrando operações

---

#### US-MP-026 — Registro de Provisões Financeiras
**Como** Contabilidade  
**Quero** registrar provisões (férias, 13º, contingências)  
**Para** ter visão realista de custo total acumulado

**Critérios de Aceite:**
- Provisão de férias (1/12 do salário mensais)
- Provisão de 13º (12/12 ao fim do ano)
- Provisões customizadas (litígio, multa, etc.)
- Visualização de provisão acumulada

---

#### US-MP-027 — Impactos Tributários por Estado e Sindicato
**Como** Fiscal  
**Quero** visualizar impacto tributário diferenciado por estado de atuação e categoria sindical  
**Para** planejar operações considerando variações regionais

**Critérios de Aceite:**
- Mapa de alíquotas por estado (imposto estadual, municipal)
- Incidência de sindicato por região/categoria
- Simulação de mudança de estado (impacto)
- Comparativo entre estados

---

#### US-MP-028 — Consolidação de Custo Total Mensal/Anual
**Como** CFO  
**Quero** visualizar custo total consolidado do projeto (custos pessoal + impostos + despesas + provisões)  
**Para** calcular margem e rentabilidade real

**Critérios de Aceite:**
- Custo total = Σ(custo pessoal) + Σ(impostos) + Σ(despesas) + Σ(provisões)
- Visão mensal e acumulada pelo ano
- Comparação com budget inicial
- Indicadores: custo/receita, custo por FTE, etc.

---

### ÉPICO 4 — Calendário e Feriados (4 US)

#### US-MP-029 — Cadastro de Feriados Nacionais, Estaduais e Municipais
**Como** RH  
**Quero** manter base de dados de feriados em 3 níveis (nacional, estadual, municipal)  
**Para** aplicar jornada correta conforme localização do colaborador

**Critérios de Aceite:**
- Feriado nacional (todos os estados)
- Feriado estadual (específico por estado)
- Feriado municipal (específico por cidade)
- Data, nome do feriado, tipo

---

#### US-MP-030 — Identificação de Feriados por Cidade/Estado e Dia da Semana
**Como** RH  
**Quero** consultar se uma data é feriado para uma cidade/estado específica  
**Para** saber quantos dias úteis realmente tem no mês para aquela região

**Critérios de Aceite:**
- Query: é_feriado(data, estado, cidade) → sim/não
- Retornar dia da semana
- Indicar tipo de feriado (nacional/estadual/municipal)

---

#### US-MP-031 — Códigos e Flags Automatizados para Jornada
**Como** RH  
**Quero** que o sistema gere automaticamente códigos/flags de jornada (feriado, véspera, fim de semana, dia útil)  
**Para** usar em cálculos e relatórios

**Critérios de Aceite:**
- Flag: é_feriado, é_fim_de_semana, é_vespera_feriado, é_dia_util
- Código: texto descritivo ou numérico (0=dia_util, 1=feriado, etc.)
- Atualizar automaticamente conforme calendário

---

#### US-MP-032 — Integração de Feriados ao Cálculo de Horas Previstas, Custo, FTE
**Como** RH  
**Quero** que o sistema automatically reduza horas previstas, custo e FTE conforme feriados do estado  
**Para** não precisar fazer ajustamento manual

**Critérios de Aceite:**
- Horas previstas (mês) = CH × dias úteis do mês no estado
- Custo mensal auto-ajustado conforme dias úteis
- FTE auto-ajustado
- Recalcular conforme mudanças de feriado

---

### ÉPICO 5 — Premissas Contratuais e Sindicais (4 US)

#### US-MP-033 — Tabela de Sindicatos e Categorias
**Como** RH  
**Quero** manter base de sindicatos, categorias profissionais e respectivas regras  
**Para** aplicar dissídios e reajustes regionais corretamente

**Critérios de Aceite:**
- Nome do sindicato, Estado, Categoria (ex: Limpeza, Operacional, etc.)
- Data de negociação (dissídio)
- Alíquota sindical (%)
- Integração com colaboradores

---

#### US-MP-034 — Aplicação de Dissídio e Reajustes por Região
**Como** RH  
**Quero** aplicar dissídios sindicais ou reajustes de IPCA por região/categoria  
**Para** aumentar salários conforme acordos negociados

**Critérios de Aceite:**
- Dissídio aplicado em lote por sindicato/categoria
- Reajuste por IPCA ou índice específico
- Data de vigência
- Recalcula salário, custo, provisões

---

#### US-MP-035 — Registro de IPCA e Índices Financeiros
**Como** Financeiro  
**Quero** manter série histórica de IPCA e outros índices para projeções  
**Para** fazer forecast mais acurado de custos

**Critérios de Aceite:**
- Índice: IPCA, IGPM, TR, SELIC, etc.
- Data, valor
- Import via API do IBGE ou manual
- Usar para projeções

---

#### US-MP-036 — Percentuais de Categoria Sindical
**Como** Fiscal  
**Quero** definir alíquotas específicas (INSS, ISS, PIS, COFINS) por categoria sindical  
**Para** calcular carga tributária correta

**Critérios de Aceite:**
- Mapeamento: Categoria Sindical → Alíquotas
- Exemplo: Limpeza (INSS 12%) vs. Operacional (INSS 11%)
- Usar em cálculo automático de impostos

---

### ÉPICO 6 — Automação e Integração (5 US)

#### US-MP-037 — Engine de Regras para Consolidação de Dados Cruzados
**Como** Sistema  
**Quero** um engine de regras que sincronize automaticamente dados cruzados (HORAS × TAXA × CALENDÁRIO × CUSTO × FTE × IMPOSTOS)  
**Para** evitar inconsistências e recálculos manuais

**Critérios de Aceite:**
- Regra: Se taxa muda → recalcula custo determinístico
- Regra: Se horas mudam → recalcula FTE e custo
- Execução determinística (mesmos dados = mesmo resultado)
- Transações ACID

---

#### US-MP-038 — Cálculo Automático de FCST
**Como** Financeiro  
**Quero** que o sistema calcule automaticamente previsão (FCST) para meses futuros baseado em histórico  
**Para** ter previsão automática sem ajustes manuais

**Critérios de Aceite:**
- Algoritmo: Média móvel 3 meses ou regressão linear
- Ajuste manual de parâmetros (agressividade)
- Visualização em gráfico com intervalo de confiança
- Recalcular mensalmente

---

#### US-MP-039 — Exportação para BI e Relatórios
**Como** Analista  
**Quero** exportar dados em formatos padrão (CSV, Parquet, JSON) para ferramentas BI (Power BI, Tableau)  
**Para** fazer análises mais complexas fora do sistema

**Critérios de Aceite:**
- Export via UI (botão) ou API
- Formatos: CSV, Parquet, JSON, Excel
- Incluir metadata (data export, schema)
- Agendamento de exports recorrentes

---

#### US-MP-040 — API REST para Integração com Sistemas Externos
**Como** Desenvolvedor  
**Quero** consumir API REST para query/lançamento de dados  
**Para** integrar com sistemas legado (ERP, HRIS, etc.)

**Critérios de Aceite:**
- Endpoints: GET /projects, GET /employees, POST /expenses, etc.
- Autenticação OAuth2 ou API Key
- Rate limiting
- Documentação OpenAPI 3.0

---

#### US-MP-041 — Webhooks para Eventos Assíncronos
**Como** Sistema Integrado  
**Quero** receber notificações (webhooks) quando eventos ocorrem (projeto criado, expense lançado, recalcule acionado)  
**Para** sincronizar estado com sistema externo

**Critérios de Aceite:**
- Eventos: project.created, expense.created, calculation.triggered
- Retry mechanism (exponential backoff)
- Webhook management UI
- Log de deliveries

---

### ÉPICO 7 — Dashboards e Relatórios (2 US)

#### US-MP-042 — Dashboard Executivo Consolidado
**Como** CEO / Diretor  
**Quero** um dashboard que mostre KPIs consolidados (receita, custos, margem, FTE, EBITDA)  
**Para** tomar decisões estratégicas rapidamente

**Critérios de Aceite:**
- Total receita YTD
- Total custo YTD
- Margem consolidada (%)
- FTE total
- Top 5 projetos por receita
- Indicadores por status (pipeline, em andamento, encerrado)

---

#### US-MP-043 — Relatórios Detalhados por Período
**Como** Analista Financeiro  
**Quero** gerar relatórios detalhados de receita/custo/margem por projeto, período e departamento  
**Para** explicar variações e fazer análise causa-raiz

**Critérios de Aceite:**
- Filtro: Período, Projeto, Departamento, Categoria
- Colunas: Previsto, Realizado, Variação (%), Tendência
- Drill-down em detalhes (transações)
- Export para PDF/Excel com formatação

---

---

## 📊 Resumo Compilado

| Épico | Histórias | Status |
|-------|-----------|--------|
| EP1 — Contratos/Projetos | 9 | Backlog |
| EP2 — Recursos Humanos | 11 | Backlog |
| EP3 — Gestão Financeira | 8 | Backlog |
| EP4 — Calendário/Feriados | 4 | Backlog |
| EP5 — Sindicais/Premissas | 4 | Backlog |
| EP6 — Automação/Integração | 5 | Backlog |
| EP7 — Dashboards/Relatórios | 2 | Backlog |
| **TOTAL** | **43 US** | **100% Backlog** |

---

## ⏭️ Próximas Ações

1. **Refinamento** — Adicionar Story Points em Planning Poker
2. **Priorização** — Com PO, ordenar por valor/dependência
3. **Sequenciamento** — Agrupar por wave (MVP vs. Phase 2)
4. **Sprint 12** → Começar com EP1 (Projetos) como base

---

> **Backlog Compilado:** Gestor Multiprojetos (PR_SEEC_2026)  
> **Total: 43 Histórias estruturadas**  
> **Status: Pronto para Planning**
