# PLANO DE AÇÃO - PRÓXIMAS SPRINTS

**Data:** 01 de Março de 2026  
**Status:** SPRINTS 3-4 COMPLETAS | SPRINT 5+ EM PLANEJAMENTO

---

## 🎯 Próxima Ação - Sprint 5 (Financeiro)

### Escopo
Implementar bulk operations para módulo financeiro com validações de impostos e despesas.

### Tarefas Específicas

#### 1. DTOs de Bulk Operations Financeiro (30 min)
- [ ] Criar `bulk-operations.dto.ts` em `/financial/dto/`
- [ ] `BulkDespesaItemDto`
- [ ] `BulkImpostoItemDto`  
- [ ] `BulkImportDespesaDto`
- [ ] `BulkUpdateImpostoDto`

#### 2. Métodos no Service (1 hora)
- [ ] `importarDespesasEmLote(despesas[], userId, motivo?)`
- [ ] `atualizarImpostosEmLote(impostos[], motivo, userId)`
  - Validação de tipo de imposto (INSS, ISS, PIS, COFINS, IRPJ, CSLL)
  - Validação de alíquota (0-100%)
  - Cálculo automático de valor = base × alíquota

#### 3. Endpoints no Controller (30 min)
- [ ] `POST /financial/despesas/import/bulk`
  - Permissão: FINANCE_CREATE
  - Resposta: BulkOperationResultDto
  
- [ ] `POST /financial/impostos/bulk-update`
  - Permissão: FINANCE_MANAGE_IMPOSTOS
  - Resposta: BulkOperationResultDto

#### 4. Testes Unitários (1 hora)
- [ ] Deve importar múltiplas despesas com sucesso
- [ ] Deve detectar erro ao faltar tipo de despesa
- [ ] Deve detectar erro ao faltar valor
- [ ] Deve atualizar múltiplos impostos com sucesso
- [ ] Deve validar alíquota entre 0-100%
- [ ] Deve detectar erro ao referenciar projeto inexistente

#### 5. Validação (30 min)
- [ ] Executar testes: `npm test -- financial 2>&1`
- [ ] Validar cobertura de casos de sucesso/erro
- [ ] Documentar endpoints

---

## 🎯 Sprint 6 (Calendários & Sindicatos)

### Tarefas de Alto Nível

1. **Modelos & Seed de Dados** (1 dia)
   - [ ] Seed de feriados nacionais 2026-2027
   - [ ] Seed de sindicatos por região
   - [ ] Índices financeiros (IPCA)

2. **Motor de Cálculo Jornada** (1 dia)
   - [ ] Engine que considera calendário regional
   - [ ] Integração automática: Calendário → Horas → Custo → FTE
   - [ ] Recálculo ao atualizar feriado

3. **Endpoints** (0.5 dias)
   - [ ] CRUD Calendários
   - [ ] CRUD Sindicatos
   - [ ] Engine de cálculo jornada

4. **Testes + Validação** (0.5 dias)
   - [ ] Casos de sucesso/erro
   - [ ] Integração sem quebra

---

## 🎯 Sprint 8 (Recálculos Cascata)

### Funcionalidade Crítica

**Motor de Recálculo Automático**
- Quando: Taxa de hora, Calendário, Horas ou Custo mudam
- Então: Recalcular em cascata:
  - TAXA × CALENDÁRIO → HORAS PREVISTAS
  - HORAS × CARGA HORÁRIA → FTE
  - FTE × TAXA → CUSTO
  - CUSTO × ALÍQUOTA → IMPOSTOS

### Implementação
- [ ] Serviço `RecalculationEngineService`
- [ ] Triggers em endpoints de update
- [ ] Auditoria completa em `historicoCalculo`
- [ ] Snapshots antes/depois
- [ ] Rollback em caso de erro

---

## 🎯 Sprint 9 (E2E & Segurança)

### Testes E2E (Cypress)
- [ ] Login → Dashboard → Exportar CSV
- [ ] Criar Projeto → Adicionar Receitas → Visualizar Margens
- [ ] Importar Colaboradores → Visualizar Jornadas
- [ ] Atualizar Impostos → Ver impacto em Custos

### Testes Performance (k6)
- [ ] 100 usuários simultâneos no dashboard
- [ ] Importação de 1000 projetos
- [ ] Recálculo em cascata de 500 colaboradores

### Segurança
- [ ] OWASP Top 10 scan
- [ ] Revelação de dados sensíveis
- [ ] Injection attacks
- [ ] Authorization failures

---

## 🎯 Sprint 10 (Go-Live)

### Checklist
- [ ] Migração de dados da planilha
- [ ] Treinamentos executivos
- [ ] Deploy em produção
- [ ] Monitoramento ativo
- [ ] Termo de aceite

---

## 📊 Estimativa Consolidada

| Sprint | Conteúdo | Dias | Status |
|--------|----------|------|--------|
| 3 | Bulk Import Projetos | 0.5 | ✅ DONE |
| 4 | Bulk Import RH | 1 | ✅ DONE |
| 5 | Bulk Import Financeiro | 1.5 | ⏳ TODO |
| 6 | Calendários + Sindicatos | 2.5 | ⏳ TODO |
| 8 | Recálculos Cascata | 2.5 | ⏳ TODO |
| 9 | E2E + Segurança | 2.5 | ⏳ TODO |
| 10 | Go-Live | 1 | ⏳ TODO |
| **TOTAL** | | **11.5 dias** | |

---

## 🔄 Padrão Reutilizável Estabelecido

Todos os módulos de bulk operations seguem:

```typescript
// 1. DTO com class-validator
export class BulkXxxItemDto { ... }
export class BulkImportXxxDto { ... }

// 2. Service method
async importarXxxEmLote(items[], userId, motivo?): Promise<BulkOperationResultDto> {
  const detalhes = [];
  for (const item of items) {
    const resultado = { identificador, status, mensagem, entityId };
    // validações
    // create/update
    // auditoria em historicoCalculo
  }
  return { totalProcessado, sucessos, erros, avisos, detalhes };
}

// 3. Endpoint
@Post('import/bulk')
@Permissions(Permission.XXX_CREATE)
@HttpCode(HttpStatus.CREATED)
importarEmLote(@Body() dto: BulkImportXxxDto, @Request() req) {
  return this.xxxService.importarXxxEmLote(dto.xxxs, req.user.id, dto.descricaoOperacao);
}

// 4. Testes
describe('Bulk Operations', () => {
  it('deve importar X com sucesso', ...);
  it('deve detectar erro ao faltar campo Y', ...);
  it('deve detectar aviso ao encontrar duplicação', ...);
});
```

---

## ✅ Código Pronto para Copiar/Adaptar

### Arquivo: bulk-operations.service.ts
```typescript
async importarXxxEmLote(
  items: any[],
  userId: string,
  descricaoOperacao?: string,
): Promise<BulkOperationResultDto> {
  const detalhes: any[] = [];
  let sucessos = 0, erros = 0, avisos = 0;

  for (const item of items) {
    const resultado: any = {
      identificador: item.codigo || item.id || 'SEM_ID',
      status: 'sucesso',
      mensagem: '',
      entityId: undefined,
    };

    try {
      // Validação 1: Campos obrigatórios
      if (!item.campo_obrigatorio?.trim()) {
        resultado.status = 'erro';
        resultado.mensagem = 'Campo obrigatório é obrigatório';
        erros++;
        detalhes.push(resultado);
        continue;
      }

      // Validação 2: Verificação de duplicação
      const existing = await this.prisma.xxx.findFirst({
        where: { codigo: item.codigo, ativo: true },
      });

      if (existing) {
        resultado.status = 'aviso';
        resultado.mensagem = `Já existe com código '${item.codigo}'`;
        resultado.entityId = existing.id;
        avisos++;
        detalhes.push(resultado);
        continue;
      }

      // Validação 3: Verificação de integridade referencial
      const parent = await this.prisma.parent.findUnique({ where: { id: item.parentId } });
      if (!parent) {
        resultado.status = 'erro';
        resultado.mensagem = `Parent não encontrado`;
        erros++;
        detalhes.push(resultado);
        continue;
      }

      // Criação
      const entity = await this.prisma.xxx.create({
        data: { ...item, criadoPor: userId },
      });

      // Auditoria
      await this.prisma.historicoCalculo.create({
        data: {
          xxx: entity.id, // ou projectId dependente
          tipo: 'IMPORTACAO_LOTE',
          criadoPor: userId,
          dadosAntes: JSON.stringify({}),
          dadosDepois: JSON.stringify({ descricao: descricaoOperacao }),
        },
      });

      resultado.mensagem = 'Importado com sucesso';
      resultado.entityId = entity.id;
      sucessos++;
      detalhes.push(resultado);
    } catch (error) {
      resultado.status = 'erro';
      resultado.mensagem = `Erro: ${error.message}`;
      erros++;
      detalhes.push(resultado);
    }
  }

  return { totalProcessado: items.length, sucessos, erros, avisos, detalhes };
}
```

---

## 🚀 Como Proceder

1. **Hoje:** Implementar Sprint 5 seguindo o template acima
2. **Amanhã:** Sprint 6 (Calendários)
3. **Próximos 3 dias:** Sprint 8 (Recálculos)
4. **Próximos 2 dias:** Sprint 9 (E2E)
5. **Último dia:** Sprint 10 (Go-Live)

---

## 📞 Pontos de Contato

- **Testes:** npm test
- **Build:** npm run build
- **Docker:** docker compose up -d --build
- **Documentação:** Swagger em /api/docs

