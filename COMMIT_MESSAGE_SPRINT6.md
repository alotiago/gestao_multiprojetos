# Commit Message - Sprint 6

## feat(sprint6): Expandir Calendário e Sindicato com novos campos

### Mudanças Principais

#### Schema Prisma
- **Calendario**: +7 campos (nome, ehFeriado, ehRecuperavel, percentualDesc, observacoes, criadoPor, ativo, updatedAt)
- **Sindicato**: +5 campos (sigla, contacto, telefone, email, observacoes, criadoPor, updatedAt)
- Migração aplicada com `db push` (sem conflitos)

#### DTOs
- Atualizado `CreateCalendarioDto`, `UpdateCalendarioDto`, `BulkFeriadoItemDto`
- Atualizado `CreateSindicatoDto`, `UpdateSindicatoDto`
- Validações: `@IsString()`, `@IsBoolean()`, `@IsNumber() @Min(0) @Max(100)` para percentualDesc
- Campo `nome` é obrigatório em Calendario

#### Services
- **CalendarioService**:
  - `create()`: Aceita todos os novos campos com defaults (ehFeriado=true, ehRecuperavel=false, percentualDesc=100)
  - `update()`: Permite atualização parcial de novos campos
  - `importarFeriadosEmLote()`: Validação atualizada (requer nome)
  - `seedFeriadosNacionais()`: Inclui novos campos nos 12 feriados nacionais

- **SindicatoService**:
  - `create()`: Aceita sigla, contacto, telefone, email, observacoes, criadoPor
  - `update()`: Permite atualização parcial de novos campos

#### Testes
- +8 novos testes (210 → 218 testes)
- **Calendario**: 5 testes (nome obrigatório, ehFeriado=false, percentualDesc=50, defaults, update)
- **Sindicato**: 3 testes (campos completos, update contato, campos opcionais)
- 100% dos testes passando (218/218)

#### Seed Data
- Criado `prisma/seeds/feriados-2026-2027.seed.ts`
- **32 feriados** completos:
  - 14 nacionais 2026 (incluindo Consciência Negra)
  - 14 nacionais 2027
  - 2 estaduais SP (Revolução Constitucionalista)
  - 2 municipais SP Capital (Aniversário de São Paulo)
- Novos campos populados: ehFeriado, ehRecuperavel, percentualDesc, observacoes
- Comando: `npm run db:seed:feriados`

#### Controllers
- Nenhuma alteração necessária (usam DTOs atualizados automaticamente)

### Casos de Uso Implementados

1. **Feriados tradicionais**: ehFeriado=true, percentualDesc=100
2. **Pontos facultativos**: ehFeriado=false, ehRecuperavel=true, percentualDesc=50
3. **Feriados recuperáveis**: ehRecuperavel=true (Black Friday, eventos especiais)
4. **Contato sindicato**: sigla, contacto, telefone, email para comunicação

### Arquivos Modificados

```
✅ backend/prisma/schema.prisma
✅ backend/src/modules/calendario/dto/calendario.dto.ts
✅ backend/src/modules/calendario/calendario.service.ts
✅ backend/src/modules/calendario/calendario.service.spec.ts
✅ backend/src/modules/sindicato/dto/sindicato.dto.ts
✅ backend/src/modules/sindicato/sindicato.service.ts
✅ backend/src/modules/sindicato/sindicato.service.spec.ts
✅ backend/package.json (novo script db:seed:feriados)
```

### Arquivos Criados

```
✅ backend/prisma/seeds/feriados-2026-2027.seed.ts
✅ docs/SPRINT_6_CONCLUSAO.md
```

### Métricas

- **Testes**: 218/218 passing (+8 novos)
- **Cobertura**: 100% mantida
- **Feriados**: 32 seedados (2026-2027)
- **Campos**: +12 (7 Calendario + 5 Sindicato)
- **Tempo**: ~2 horas de desenvolvimento

### Breaking Changes

- ❌ Nenhum breaking change
- ✅ Todos os campos novos são opcionais (exceto `nome` em Calendario, que sempre foi lógico mas não estava no schema)
- ✅ Compatibilidade retroativa mantida

### Validação

```bash
✅ npm test                   # 218/218 passing
✅ npm run db:seed:feriados   # 32 feriados criados
✅ npx prisma generate        # Prisma Client atualizado
✅ docker-compose up -d       # Infraestrutura OK
```

### Próxima Sprint

**Sprint 8**: Recálculos em Cascata & Integridade Referencial
- Engine de recálculo automático
- Propagação de alterações em cascata
- Histórico de recálculos
- Validação de integridade

---

**Desenvolvido**: 03/03/2026  
**Status**: Sprint 6 - 100% Completa ✅
