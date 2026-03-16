# Template de Importação de Despesas via Excel

**Versão:** 1.0  
**Data:** 06/03/2026  
**Aplicação:** Gestor Multiprojetos  
**Módulo:** Financeiro

---

## 📋 Especificação do Template

### Nome do Arquivo
`despesas_template.xlsx`

### Estrutura da Planilha

**Nome da Aba:** "Despesas"

| Coluna | Nome do Campo | Tipo de Dado | Obrigatório | Formato | Exemplo |
|--------|---------------|--------------|-------------|---------|---------|
| **A** | projectId | Texto (UUID) | ✅ Sim | 36 caracteres (UUID v4) | `550e8400-e29b-41d4-a716-446655440000` |
| **B** | tipo | Texto (Lista) | ✅ Sim | Enum (8 valores) | `facilities` |
| **C** | descricao | Texto | ✅ Sim | Máx. 255 caracteres | `Manutenção predial - Janeiro 2026` |
| **D** | valor | Número | ✅ Sim | Decimal (2 casas) | `15000.50` |
| **E** | mes | Inteiro | ✅ Sim | 1 a 12 | `3` |
| **F** | ano | Inteiro | ✅ Sim | 2020 a 2100 | `2026` |

---

## 📝 Dicionário de Dados

### Coluna A: projectId
- **Descrição:** Identificador único do projeto no sistema
- **Formato:** UUID versão 4 (formato: 8-4-4-4-12 caracteres hexadecimais)
- **Validação:** Deve existir no sistema e estar com status ATIVO
- **Como obter:** Menu Projetos > Copiar ID do Projeto
- **Exemplo válido:** `550e8400-e29b-41d4-a716-446655440000`
- **Exemplo inválido:** `123`, `projeto-abc`, `550e8400` (incompleto)

### Coluna B: tipo
- **Descrição:** Categoria da despesa para classificação contábil
- **Formato:** Texto em minúsculas (case-sensitive)
- **Valores aceitos:**

| Valor | Descrição | Uso Típico |
|-------|-----------|------------|
| `facilities` | Despesas com facilities | Limpeza, manutenção predial, segurança, recepção |
| `fornecedor` | Pagamento a fornecedores | Serviços terceirizados, consultoria externa |
| `aluguel` | Aluguel de equipamentos/espaços | Impressoras, servidores, salas de reunião |
| `endomarketing` | Ações de endomarketing | Eventos internos, brindes, confraternizações |
| `amortizacao` | Amortizações contábeis | Depreciação, amortização de ativos |
| `rateio` | Transferências/rateio entre projetos | Custos compartilhados, rateio de despesas |
| `provisao` | Provisões financeiras | Contingências, provisões trabalhistas |
| `outros` | Outras despesas não classificadas | Despesas eventuais não categorizadas |

- **Validação Excel:** Lista suspensa (Data Validation)
- **Erro comum:** `Facilitys` (com S), `FACILITIES` (maiúsculas)

### Coluna C: descricao
- **Descrição:** Descrição detalhada da despesa
- **Formato:** Texto livre
- **Tamanho:** Mínimo 1 caractere, máximo 255 caracteres
- **Boas práticas:**
  - Incluir período: "Janeiro 2026", "1º Trimestre"
  - Ser específico: "Manutenção ar-condicionado sala 301" em vez de "Manutenção"
  - Incluir nota fiscal quando relevante: "NF 12345"
- **Exemplo válido:** `Aluguel de impressoras Xerox - Contrato 2026/001`
- **Exemplo inválido:** ` ` (vazio), strings com mais de 255 caracteres

### Coluna D: valor
- **Descrição:** Valor monetário da despesa em reais (BRL)
- **Formato:** Número decimal com até 2 casas decimais
- **Separador decimal:** Ponto (`.`) - não usar vírgula
- **Validação:** Deve ser maior que zero
- **Formato Excel:** Número com 2 casas decimais (ex: `#,##0.00`)
- **Exemplo válido:** `15000.50`, `850.00`, `12500.75`
- **Exemplo inválido:** `-100` (negativo), `0` (zero), `15.000,50` (vírgula), `abc` (texto)

### Coluna E: mes
- **Descrição:** Mês de referência da despesa
- **Formato:** Número inteiro de 1 a 12
- **Mapeamento:**

| Valor | Mês |
|-------|-----|
| 1 | Janeiro |
| 2 | Fevereiro |
| 3 | Março |
| 4 | Abril |
| 5 | Maio |
| 6 | Junho |
| 7 | Julho |
| 8 | Agosto |
| 9 | Setembro |
| 10 | Outubro |
| 11 | Novembro |
| 12 | Dezembro |

- **Validação Excel:** Lista suspensa de 1 a 12
- **Exemplo válido:** `3` (Março)
- **Exemplo inválido:** `0`, `13`, `mar`, `03` (texto)

### Coluna F: ano
- **Descrição:** Ano de referência da despesa
- **Formato:** Número inteiro de 4 dígitos
- **Intervalo válido:** 2020 a 2100
- **Validação Excel:** Lista suspensa ou validação numérica
- **Exemplo válido:** `2026`, `2027`
- **Exemplo inválido:** `26` (2 dígitos), `2019` (fora do range), `abc`

---

## 📊 Exemplo de Preenchimento

### Cenário: Despesas de Março/2026 para 2 Projetos

| projectId | tipo | descricao | valor | mes | ano |
|-----------|------|-----------|-------|-----|-----|
| 550e8400-e29b-41d4-a716-446655440000 | facilities | Limpeza e manutenção predial - Março | 5000.00 | 3 | 2026 |
| 550e8400-e29b-41d4-a716-446655440000 | facilities | Segurança patrimonial - Março | 3200.50 | 3 | 2026 |
| 550e8400-e29b-41d4-a716-446655440000 | fornecedor | Licenças de software Microsoft 365 | 12500.75 | 3 | 2026 |
| 550e8400-e29b-41d4-a716-446655440000 | aluguel | Aluguel de impressoras Xerox (5 unidades) | 850.00 | 3 | 2026 |
| 660e9511-f39c-52e5-b827-557766551111 | endomarketing | Evento aniversário da empresa | 8500.00 | 3 | 2026 |
| 660e9511-f39c-52e5-b827-557766551111 | fornecedor | Consultoria jurídica trabalhista | 4200.00 | 3 | 2026 |
| 660e9511-f39c-52e5-b827-557766551111 | amortizacao | Amortização equipamentos TI | 2100.25 | 3 | 2026 |
| 660e9511-f39c-52e5-b827-557766551111 | outros | Despesa não classificada | 450.50 | 3 | 2026 |

**Total de linhas:** 8  
**Total de despesas:** R$ 36.801,50

---

## ⚙️ Configuração do Excel

### 1. Formatação de Cabeçalho
```
Linha 1 (Cabeçalho):
- Fonte: Calibri 11, Negrito
- Preenchimento: Cinza claro (#D9D9D9)
- Alinhamento: Centro
- Borda: Todas as bordas
```

### 2. Validação de Dados (Data Validation)

#### Coluna B (tipo):
```
Tipo: Lista
Origem: facilities,fornecedor,aluguel,endomarketing,amortizacao,rateio,provisao,outros
Mensagem de entrada: "Selecione o tipo de despesa"
Alerta de erro: "Valor inválido. Escolha um tipo da lista."
```

#### Coluna D (valor):
```
Tipo: Decimal
Mínimo: 0.01
Máximo: 99999999.99
Mensagem: "Digite um valor maior que zero"
```

#### Coluna E (mes):
```
Tipo: Lista
Origem: 1,2,3,4,5,6,7,8,9,10,11,12
Mensagem: "Selecione o mês (1=Jan, 12=Dez)"
```

#### Coluna F (ano):
```
Tipo: Inteiro
Mínimo: 2020
Máximo: 2100
Mensagem: "Digite um ano válido (2020-2100)"
```

### 3. Formatação Condicional

#### Destaque de Valores Zerados (Erro):
```
Regra: =D2<=0
Formato: Preenchimento vermelho claro, fonte vermelha
```

#### Destaque de Descrições Vazias (Erro):
```
Regra: =ISBLANK(C2)
Formato: Preenchimento vermelho claro
```

#### Destaque de Valores Altos (Atenção):
```
Regra: =D2>50000
Formato: Preenchimento amarelo
```

### 4. Largura das Colunas
- Coluna A (projectId): 40 caracteres
- Coluna B (tipo): 15 caracteres
- Coluna C (descricao): 50 caracteres
- Coluna D (valor): 12 caracteres
- Coluna E (mes): 6 caracteres
- Coluna F (ano): 6 caracteres

---

## 🔍 Validações do Sistema

### Validações de Estrutura (Pré-processamento)
1. ✅ Arquivo tem extensão .xlsx ou .xls
2. ✅ Arquivo não excede 5MB
3. ✅ Planilha "Despesas" existe
4. ✅ Colunas A a F estão presentes na linha 1
5. ✅ Número de linhas (excluindo cabeçalho) ≤ 1000
6. ✅ Nenhuma linha está completamente vazia

### Validações de Dados (Por Linha)
1. ✅ **projectId:** Formato UUID válido + projeto existe no DB + status ATIVO
2. ✅ **tipo:** Valor está na lista de enums aceitos (case-sensitive)
3. ✅ **descricao:** Não vazio + máx 255 caracteres
4. ✅ **valor:** Número > 0 + máx 2 casas decimais
5. ✅ **mes:** Inteiro entre 1 e 12
6. ✅ **ano:** Inteiro entre 2020 e 2100

### Regras de Negócio
- ⚠️ **Duplicatas:** Despesas idênticas (mesmo projeto, tipo, mês, ano, valor) na mesma importação geram WARNING mas são aceitas
- ❌ **Rollback:** Se > 20% das linhas falharem, toda a importação é cancelada
- ✅ **Transação:** Importação é atômica (tudo ou nada para cada batch)

---

## 📤 Processo de Importação

### Passo a Passo no Sistema

1. **Acessar Módulo Financeiro**
   - Menu: Financeiro > Despesas

2. **Baixar Template**
   - Botão: "Baixar Template Excel"
   - Arquivo baixado: `despesas_template.xlsx`

3. **Preencher Template**
   - Abrir arquivo no Excel
   - Preencher dados a partir da linha 2
   - Salvar arquivo

4. **Fazer Upload**
   - Botão: "Importar Despesas"
   - Arrastar arquivo ou clicar para selecionar
   - Aguardar validação inicial (1-2s)

5. **Processar Importação**
   - Até 100 linhas: Processamento imediato (< 3s)
   - 101-1000 linhas: Processamento assíncrono
   - Notificação: "Processamento iniciado..."

6. **Ver Resultado**
   - Modal com resumo:
     - Total de linhas: X
     - Sucessos: Y (verde)
     - Erros: Z (vermelho)
   - Lista de erros detalhada (linha + motivo)
   - Botão: "Baixar Relatório de Erros (CSV)"

7. **Confirmação**
   - Se sucesso total: Lista de despesas atualizada automaticamente
   - Se erros parciais: Opção de corrigir e reimportar
   - Se rollback: Nenhuma despesa foi criada

---

## ⚠️ Mensagens de Erro Comuns

| Código | Mensagem | Causa | Solução |
|--------|----------|-------|---------|
| E001 | Arquivo excede o tamanho máximo de 5MB | Arquivo muito grande | Dividir em múltiplos arquivos |
| E002 | Planilha "Despesas" não encontrada | Nome da aba incorreto | Renomear aba para "Despesas" |
| E003 | Arquivo excede o limite de 1000 linhas | Muitas linhas | Dividir em lotes de até 1000 |
| E004 | Projeto não encontrado: {projectId} | ID inválido ou projeto excluído | Verificar ID correto em Projetos |
| E005 | Tipo de despesa inválido: {tipo} | Tipo não está na lista | Usar valores exatos da lista |
| E006 | Valor deve ser maior que zero | Valor negativo ou zero | Corrigir valor |
| E007 | Mês deve estar entre 1 e 12 | Mês fora do range | Usar valores 1-12 |
| E008 | Ano deve estar entre 2020 e 2100 | Ano inválido | Usar ano válido |
| E009 | Descrição é obrigatória | Campo vazio | Preencher descrição |
| E010 | Rollback: mais de 20% das linhas falharam | Muitos erros | Revisar arquivo completo |

---

## 📊 Exemplo de Relatório de Sucesso

```json
{
  "status": "success",
  "totalLinhas": 150,
  "processadas": 150,
  "sucessos": 150,
  "erros": 0,
  "detalhesErros": [],
  "resumoFinanceiro": {
    "valorTotal": 245680.50,
    "porTipo": {
      "facilities": 85000.00,
      "fornecedor": 120500.50,
      "aluguel": 12300.00,
      "endomarketing": 18500.00,
      "outros": 9380.00
    }
  },
  "operacaoId": "op-2026-03-06-10h30m15s",
  "usuario": "admin@sistema.com",
  "timestamp": "2026-03-06T10:30:15Z",
  "duracaoSegundos": 2.5
}
```

## 📊 Exemplo de Relatório com Erros

```json
{
  "status": "partial_success",
  "totalLinhas": 150,
  "processadas": 150,
  "sucessos": 147,
  "erros": 3,
  "detalhesErros": [
    {
      "linha": 45,
      "coluna": "projectId",
      "valor": "550e8400-invalid-id",
      "motivo": "Projeto não encontrado",
      "codigo": "E004"
    },
    {
      "linha": 78,
      "coluna": "tipo",
      "valor": "facilitys",
      "motivo": "Tipo de despesa inválido. Use: facilities, fornecedor, aluguel, endomarketing, amortizacao, rateio, provisao, outros",
      "codigo": "E005"
    },
    {
      "linha": 120,
      "coluna": "valor",
      "valor": -500.00,
      "motivo": "Valor deve ser maior que zero",
      "codigo": "E006"
    }
  ],
  "resumoFinanceiro": {
    "valorTotal": 242180.50,
    "valoresRejeitados": 3500.00
  },
  "avisos": [
    "3 linhas foram ignoradas devido a erros de validação"
  ],
  "operacaoId": "op-2026-03-06-11h15m30s",
  "usuario": "admin@sistema.com",
  "timestamp": "2026-03-06T11:15:30Z"
}
```

---

## 🔐 Segurança e Auditoria

### Permissões Necessárias
- **Leitura do template:** Qualquer usuário autenticado
- **Upload de arquivo:** Permissão `FINANCIAL_WRITE`
- **Processamento:** Permissão `FINANCIAL_WRITE`

### Log de Auditoria
Toda importação registra:
- ID da operação
- Usuário responsável
- Timestamp de início e fim
- Total de linhas processadas
- Sucessos e erros
- Hash SHA-256 do arquivo original
- IP de origem

### Exemplo de Log:
```
[2026-03-06 10:30:15] INFO: Importação iniciada
  Operação: op-2026-03-06-10h30m15s
  Usuário: admin@sistema.com (ID: user-123)
  IP: 192.168.1.100
  Arquivo: despesas_marco_2026.xlsx
  Hash: a3b5c7d9e1f2...
  Linhas: 150

[2026-03-06 10:30:18] INFO: Importação concluída
  Sucessos: 147
  Erros: 3
  Duração: 2.5s
```

---

## 💡 Dicas e Boas Práticas

### Para Usuários
1. ✅ **Sempre use o template oficial** - Baixe do sistema para garantir formato correto
2. ✅ **Valide os projectIds** - Copie IDs diretamente do sistema
3. ✅ **Use lista suspensa para tipo** - Evita erros de digitação
4. ✅ **Separe decimais com ponto** - Use `15000.50` em vez de `15.000,50`
5. ✅ **Preencha descrições úteis** - Seja específico para facilitar auditoria
6. ✅ **Teste com arquivo pequeno** - Importe 5-10 linhas primeiro
7. ✅ **Revise o resumo** - Verifique valores totais antes de confirmar
8. ✅ **Guarde o arquivo original** - Facilita reprocessamento se necessário

### Para Administradores
1. ✅ **Configure validações no Excel** - Reduz erros antes do upload
2. ✅ **Defina padrões de nomenclatura** - Ex: `despesas_PROJETO_MES_ANO.xlsx`
3. ✅ **Estabeleça ciclo de importação** - Ex: todo dia 5 do mês
4. ✅ **Monitore logs de importação** - Identifique padrões de erro
5. ✅ **Treine usuários** - Reduza erros com capacitação

---

## 📚 Arquivos Relacionados

- **Template Excel:** `/public/templates/despesas_template.xlsx`
- **Documentação da API:** `/api/docs#tag/financial/POST/financial/despesas/import/bulk`
- **História de Usuário:** `/docs/HISTORIAS_USUARIOS_COMPILADAS.md#US-MP-025A`
- **Código Backend:** `/apps/backend/src/modules/financial/financial.service.ts`
- **Código Frontend:** `/apps/frontend/src/app/financeiro/components/ImportDespesas.tsx`

---

**Versão:** 1.0  
**Última Atualização:** 06/03/2026  
**Responsável:** Time de Desenvolvimento - Gestor Multiprojetos
