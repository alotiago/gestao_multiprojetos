# Commit Message - Sprint 8: Recálculos em Cascata

```
feat(backend): implementar sistema de recálculos em cascata (Sprint 8)

IMPLEMENTAÇÕES:

Schema & Infraestrutura:
- Criar modelo HistoricoRecalculo (13 campos + 3 índices)
- Adicionar enum TipoRecalculo (6 valores: IMPOSTO, CALENDARIO, TAXA_COLABORADOR, JORNADA, DISSIDIO, BULK_UPDATE)
- Adicionar enum StatusRecalculo (5 valores: INICIADO, PROCESSANDO, CONCLUIDO, FALHOU, CANCELADO)
- Adicionar relação User → historicoRecalculos

DTOs & Validação:
- Criar CreateHistoricoDto (4 campos obrigatórios)
- Criar UpdateHistoricoDto (5 campos opcionais)
- Criar HistoricoFiltersDto (6 filtros + paginação)
- Criar RecalculoResultDto (4 campos)
- Validações com class-validator (@IsEnum, @IsString, @IsInt, etc.)

RecalculoService (400 linhas):
- Implementar recalcularPorAlteracaoImposto(): Imposto → Projetos → Custos → Margens
- Implementar recalcularPorAlteracaoCalendario(): Feriado → Colaboradores → Jornadas → FTE
- Implementar recalcularPorAlteracaoTaxa(): Taxa → Colaborador → Projetos → Custos
- Implementar recalcularPorDissidio(): Sindicato → Colaboradores → Taxas atualiza
das
- Implementar consultarHistorico(): Filtros + paginação
- Implementar detalheRecalculo(): Detalhes completos
- Métodos auxiliares: iniciarHistorico(), finalizarHistorico()

RecalculoController (92 linhas):
- POST /recalculos/imposto/:id (FINANCIAL_UPDATE)
- POST /recalculos/calendario/:id (CONFIG_INDICES)
- POST /recalculos/colaborador/:id/taxa (RESOURCE_UPDATE)
- POST /recalculos/sindicato/:id/dissidio (RESOURCE_UPDATE)
- GET /recalculos/historico (PROJECT_READ) - com filtros
- GET /recalculos/historico/:id (PROJECT_READ) - detalhes

Segurança:
- JWT Auth obrigatório em todos os endpoints
- RBAC com permissões específicas por endpoint
- Auditoria completa: userId + timestamps + detalhes JSON

Testes (328 linhas):
- 14 testes unitários (100% cobertura de métodos públicos)
- Testes de happy path (sucesso)
- Testes de error handling (NotFoundException)
- Testes de filtros e paginação
- Mocks completos de PrismaService

Documentação:
- SPRINT_8_CONCLUSAO.md (800+ linhas)
- RESUMO_SESSAO_SPRINT8.md
- Swagger/OpenAPI completo em todos os endpoints

CORREÇÕES:

TypeScript:
- Corrigir uso de prisma.project (não prisma.projeto)
- Adicionar Prisma.JsonNull para campo detalhes obrigatório
- Type casting de errors: error instanceof Error ? error.message : String(error)
- Tipar array de detalhes como any[] (campo JSON flexível)

Schema:
- Buscar projetos de Jornada em 2 etapas (sem @relation)
- Deduplica projectIds antes de buscar projetos

Permissões:
- Usar RESOURCE_UPDATE em vez de HR_UPDATE

MÉTRICAS:

- Arquivos criados: 5
- Arquivos modificados: 2
- Linhas de código: 629
- Linhas de testes: 328
- Testes totais: 232 (218 anteriores + 14 novos)
- Taxa de sucesso: 100%
- Tempo de execução: 31.6s

BREAKING CHANGES:

Nenhuma. Sprint aditiva sem alterações em APIs existentes.

CLOSES: Sprint 8
```
