# Sprint 8 - Recálculos em Cascata - Planejamento

**Data Início:** 03/03/2026  
**Duração Estimada:** 2.5 dias (20 horas)  
**Prioridade:** 🔥 CRÍTICA

---

## 🎯 Objetivo

Implementar **motor de recálculo automático em cascata** que propaga alterações de:
- **Impostos** → Custos → Margens → Indicadores
- **Calendário** → Jornadas → FTE → Custos → Indicadores
- **Taxas/Salários** → Custos → Margens → Indicadores
- **Horas/Jornadas** → FTE → Custos → Indicadores

---

## 📋 Escopo Detalhado

### 1. **Schema Prisma - Histórico de Recálculos**

```prisma
model HistoricoRecalculo {
  id              String    @id @default(cuid())
  tipo            TipoRecalculo  // IMPOSTO, CALENDARIO, TAXA, JORNADA
  entidadeId      String    // ID da entidade alterada
  entidadeTipo    String    // "Imposto", "Colaborador", "Calendario", etc
  
  usuarioId       String    // Quem iniciou o recálculo
  usuario         User      @relation(fields: [usuarioId], references: [id])
  
  dataInicio      DateTime  @default(now())
  dataFim         DateTime?
  status          StatusRecalculo  // INICIADO, PROCESSANDO, CONCLUIDO, FALHOU
  
  totalAfetados   Int       @default(0)
  processados     Int       @default(0)
  erros           Int       @default(0)
  
  detalhes        Json      // Array de objetos com detalhes das entidades recalculadas
  mensagemErro    String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("historico_recalculos")
  @@index([tipo, status])
  @@index([usuarioId])
  @@index([createdAt])
}

enum TipoRecalculo {
  IMPOSTO
  CALENDARIO
  TAXA_COLABORADOR
  JORNADA
  DISSIDIO
  BULK_UPDATE
}

enum StatusRecalculo {
  INICIADO
  PROCESSANDO
  CONCLUIDO
  FALHOU
  CANCELADO
}
```

### 2. **RecalculoService - Motor Principal**

```typescript
@Injectable()
export class RecalculoService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
    private hrService: HrService,
    private financialService: FinancialService,
    private calendarioService: CalendarioService,
  ) {}

  /**
   * Recalcula TUDO em cascata após alteração de imposto
   * Fluxo: Imposto alterado → Recalcula custos projetos → Recalcula margens
   */
  async recalcularPorAlteracaoImposto(
    impostoId: string,
    userId: string,
  ): Promise<RecalculoResult> {
    const historico = await this.iniciarHistorico({
      tipo: 'IMPOSTO',
      entidadeId: impostoId,
      entidadeTipo: 'Imposto',
      usuarioId: userId,
    });

    try {
      // 1. Buscar todos os projetos afetados
      const projetos = await this.prisma.projeto.findMany({ where: { ativo: true } });
      
      // 2. Recalcular custos de cada projeto
      const resultados = [];
      for (const projeto of projetos) {
        const resultado = await this.financialService.recalcularCustosProjeto(projeto.id);
        resultados.push({ projetoId: projeto.id, ...resultado });
      }

      // 3. Recalcular margens
      for (const projeto of projetos) {
        await this.projectsService.recalcularMargens(projeto.id);
      }

      // 4. Finalizar histórico
      await this.finalizarHistorico(historico.id, {
        status: 'CONCLUIDO',
        totalAfetados: projetos.length,
        processados: projetos.length,
        detalhes: resultados,
      });

      return { sucesso: true, totalAfetados: projetos.length, detalhes: resultados };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: 'FALHOU',
        mensagemErro: error.message,
      });
      throw error;
    }
  }

  /**
   * Recalcula cascata após alteração de calendário (feriados)
   * Fluxo: Calendário alterado → Recalcula jornadas colaboradores → Recalcula FTE → Recalcula custos
   */
  async recalcularPorAlteracaoCalendario(
    calendarioId: string,
    userId: string,
  ): Promise<RecalculoResult> {
    const historico = await this.iniciarHistorico({
      tipo: 'CALENDARIO',
      entidadeId: calendarioId,
      entidadeTipo: 'Calendario',
      usuarioId: userId,
    });

    try {
      const calendario = await this.calendarioService.findById(calendarioId);
      
      // 1. Buscar colaboradores afetados (mesmo estado/cidade)
      const colaboradores = await this.prisma.colaborador.findMany({
        where: {
          ativo: true,
          OR: [
            { estado: calendario.estado },
            { estado: null }, // Nacional
          ],
        },
      });

      // 2. Recalcular jornadas de cada colaborador
      const resultados = [];
      for (const colab of colaboradores) {
        const resultado = await this.hrService.recalcularJornadaMensal(colab.id, new Date().getMonth() + 1, new Date().getFullYear());
        resultados.push({ colaboradorId: colab.id, ...resultado });
      }

      // 3. Recalcular custos projetos que usam esses colaboradores
      const projetosAfetados = await this.identificarProjetosAfetados(colaboradores.map(c => c.id));
      for (const projeto of projetosAfetados) {
        await this.financialService.recalcularCustosProjeto(projeto.id);
        await this.projectsService.recalcularMargens(projeto.id);
      }

      await this.finalizarHistorico(historico.id, {
        status: 'CONCLUIDO',
        totalAfetados: colaboradores.length,
        processados: colaboradores.length,
        detalhes: resultados,
      });

      return { sucesso: true, totalAfetados: colaboradores.length, detalhes: resultados };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: 'FALHOU',
        mensagemErro: error.message,
      });
      throw error;
    }
  }

  /**
   * Recalcula cascata após alteração de taxa/salário de colaborador
   * Fluxo: Taxa alterada → Recalcula custos do colaborador → Recalcula custos projetos → Recalcula margens
   */
  async recalcularPorAlteracaoTaxa(
    colaboradorId: string,
    userId: string,
  ): Promise<RecalculoResult> {
    const historico = await this.iniciarHistorico({
      tipo: 'TAXA_COLABORADOR',
      entidadeId: colaboradorId,
      entidadeTipo: 'Colaborador',
      usuarioId: userId,
    });

    try {
      const colaborador = await this.hrService.findById(colaboradorId);

      // 1. Recalcular custo mensal do colaborador
      const custoAtualizado = await this.hrService.calcularCustoTotal(colaboradorId);

      // 2. Identificar projetos que usam este colaborador
      const alocacoes = await this.prisma.alocacao.findMany({
        where: { colaboradorId },
        include: { projeto: true },
      });

      // 3. Recalcular custos de cada projeto
      const resultados = [];
      for (const alocacao of alocacoes) {
        const resultado = await this.financialService.recalcularCustosProjeto(alocacao.projetoId);
        await this.projectsService.recalcularMargens(alocacao.projetoId);
        resultados.push({ projetoId: alocacao.projetoId, ...resultado });
      }

      await this.finalizarHistorico(historico.id, {
        status: 'CONCLUIDO',
        totalAfetados: alocacoes.length,
        processados: alocacoes.length,
        detalhes: resultados,
      });

      return { sucesso: true, totalAfetados: alocacoes.length, detalhes: resultados };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: 'FALHOU',
        mensagemErro: error.message,
      });
      throw error;
    }
  }

  /**
   * Recalcula cascata após aplicação de dissídio em sindicato
   * Fluxo: Dissídio → Atualiza taxas colaboradores → Recalcula custos → Recalcula margens
   */
  async recalcularPorDissidio(
    sindicatoId: string,
    userId: string,
  ): Promise<RecalculoResult> {
    const historico = await this.iniciarHistorico({
      tipo: 'DISSIDIO',
      entidadeId: sindicatoId,
      entidadeTipo: 'Sindicato',
      usuarioId: userId,
    });

    try {
      const sindicato = await this.prisma.sindicato.findUnique({
        where: { id: sindicatoId },
        include: { colaboradores: true },
      });

      // 1. Aplicar dissídio a todos os colaboradores do sindicato
      const percentualReajuste = sindicato.percentualDissidio.toNumber();
      const resultados = [];

      for (const colab of sindicato.colaboradores) {
        const taxaAntiga = colab.taxaHora.toNumber();
        const taxaNova = taxaAntiga * (1 + percentualReajuste);

        await this.prisma.colaborador.update({
          where: { id: colab.id },
          data: { taxaHora: new Decimal(taxaNova) },
        });

        // 2. Recalcular custos de projetos afetados
        await this.recalcularPorAlteracaoTaxa(colab.id, userId);

        resultados.push({
          colaboradorId: colab.id,
          matricula: colab.matricula,
          nome: colab.nome,
          taxaAntiga,
          taxaNova,
          percentualReajuste,
        });
      }

      await this.finalizarHistorico(historico.id, {
        status: 'CONCLUIDO',
        totalAfetados: sindicato.colaboradores.length,
        processados: sindicato.colaboradores.length,
        detalhes: resultados,
      });

      return { sucesso: true, totalAfetados: sindicato.colaboradores.length, detalhes: resultados };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: 'FALHOU',
        mensagemErro: error.message,
      });
      throw error;
    }
  }

  // ===================== MÉTODOS AUXILIARES =====================

  private async iniciarHistorico(data: CreateHistoricoDto) {
    return this.prisma.historicoRecalculo.create({
      data: {
        ...data,
        status: 'PROCESSANDO',
        dataInicio: new Date(),
      },
    });
  }

  private async finalizarHistorico(id: string, data: UpdateHistoricoDto) {
    return this.prisma.historicoRecalculo.update({
      where: { id },
      data: {
        ...data,
        dataFim: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  private async identificarProjetosAfetados(colaboradorIds: string[]) {
    const alocacoes = await this.prisma.alocacao.findMany({
      where: { colaboradorId: { in: colaboradorIds } },
      include: { projeto: true },
    });

    return Array.from(new Set(alocacoes.map(a => a.projeto)));
  }

  /**
   * Consulta histórico de recálculos com filtros
   */
  async consultarHistorico(filters: HistoricoFiltersDto) {
    const where: any = {};
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.status) where.status = filters.status;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.dataInicio) where.createdAt = { gte: new Date(filters.dataInicio) };
    if (filters.dataFim) where.createdAt = { ...where.createdAt, lte: new Date(filters.dataFim) };

    const [historicos, total] = await Promise.all([
      this.prisma.historicoRecalculo.findMany({
        where,
        include: { usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      this.prisma.historicoRecalculo.count({ where }),
    ]);

    return { historicos, total, pagina: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1 };
  }
}
```

### 3. **RecalculoController - Endpoints**

```typescript
@ApiTags('Recálculos')
@ApiBearerAuth()
@Controller('recalculos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RecalculoController {
  constructor(private readonly recalculoService: RecalculoService) {}

  @Post('imposto/:id')
  @ApiOperation({ summary: 'Recalcular após alteração de imposto' })
  @Permissions(Permission.FINANCIAL_UPDATE)
  @HttpCode(200)
  async recalcularImposto(@Param('id') id: string, @Request() req) {
    return this.recalculoService.recalcularPorAlteracaoImposto(id, req.user.userId);
  }

  @Post('calendario/:id')
  @ApiOperation({ summary: 'Recalcular após alteração de calendário/feriado' })
  @Permissions(Permission.CONFIG_INDICES)
  @HttpCode(200)
  async recalcularCalendario(@Param('id') id: string, @Request() req) {
    return this.recalculoService.recalcularPorAlteracaoCalendario(id, req.user.userId);
  }

  @Post('colaborador/:id/taxa')
  @ApiOperation({ summary: 'Recalcular após alteração de taxa/salário' })
  @Permissions(Permission.HR_UPDATE)
  @HttpCode(200)
  async recalcularTaxa(@Param('id') id: string, @Request() req) {
    return this.recalculoService.recalcularPorAlteracaoTaxa(id, req.user.userId);
  }

  @Post('sindicato/:id/dissidio')
  @ApiOperation({ summary: 'Recalcular após aplicação de dissídio' })
  @Permissions(Permission.HR_UPDATE)
  @HttpCode(200)
  async recalcularDissidio(@Param('id') id: string, @Request() req) {
    return this.recalculoService.recalcularPorDissidio(id, req.user.userId);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Consultar histórico de recálculos' })
  @Permissions(Permission.PROJECT_READ)
  async consultarHistorico(@Query() filters: HistoricoFiltersDto) {
    return this.recalculoService.consultarHistorico(filters);
  }

  @Get('historico/:id')
  @ApiOperation({ summary: 'Detalhes de um recálculo específico' })
  @Permissions(Permission.PROJECT_READ)
  async detalheRecalculo(@Param('id') id: string) {
    return this.recalculoService.detalheRecalculo(id);
  }
}
```

---

## 📝 Tasks da Sprint 8

### Fase 1: Schema & Infrastructure (4h)
- [ ] Criar models `HistoricoRecalculo`, `TipoRecalculo`, `StatusRecalculo`
- [ ] Executar migração Prisma
- [ ] Criar DTOs: `CreateHistoricoDto`, `UpdateHistoricoDto`, `HistoricoFiltersDto`, `RecalculoResult`
- [ ] Criar módulo `RecalculoModule`

### Fase 2: RecalculoService (8h)
- [ ] Implementar `recalcularPorAlteracaoImposto()`
- [ ] Implementar `recalcularPorAlteracaoCalendario()`
- [ ] Implementar `recalcularPorAlteracaoTaxa()`
- [ ] Implementar `recalcularPorDissidio()`
- [ ] Implementar métodos auxiliares (iniciarHistorico, finalizarHistorico, identificarProjetosAfetados)
- [ ] Implementar `consultarHistorico()` e `detalheRecalculo()`

### Fase 3: RecalculoController (2h)
- [ ] Criar endpoints POST `/recalculos/imposto/:id`
- [ ] Criar endpoints POST `/recalculos/calendario/:id`
- [ ] Criar endpoints POST `/recalculos/colaborador/:id/taxa`
- [ ] Criar endpoints POST `/recalculos/sindicato/:id/dissidio`
- [ ] Criar endpoints GET `/recalculos/historico`
- [ ] Criar endpoints GET `/recalculos/historico/:id`

### Fase 4: Integração com Services Existentes (3h)
- [ ] Adicionar `recalcularCustosProjeto()` em FinancialService
- [ ] Adicionar `recalcularMargens()` em ProjectsService
- [ ] Adicionar `recalcularJornadaMensal()` em HrService
- [ ] Adicionar `calcularCustoTotal()` em HrService

### Fase 5: Testes (3h)
- [ ] Testes unitários RecalculoService (8+ testes)
- [ ] Testes integração RecalculoController
- [ ] Testes de cenários cascata (imposto → custos → margens)
- [ ] Testes de histórico e auditoria

---

## 🎯 Critérios de Aceite

✅ Motor de recálculo cascata funcionando para 4 cenários:
  1. Alteração de imposto → recalcula custos e margens de todos os projetos
  2. Alteração de calendário → recalcula jornadas, FTE e custos de colaboradores afetados
  3. Alteração de taxa → recalcula custos de projetos que usam o colaborador
  4. Aplicação de dissídio → atualiza taxas e recalcula custos em cascata

✅ Histórico completo de recálculos com:
  - Tipo, entidade, usuário, data início/fim, status
  - Total afetados, processados, erros
  - Detalhes em JSON (array de resultados)

✅ 4 endpoints REST funcionando com autenticação e RBAC

✅ Mínimo 8 testes unitários passando

✅ Integração com services existentes (Financial, Projects, HR)

---

## 📊 Estimativas

| Fase | Horas | % |
|------|-------|---|
| Schema & Infrastructure | 4h | 20% |
| RecalculoService | 8h | 40% |
| RecalculoController | 2h | 10% |
| Integração Services | 3h | 15% |
| Testes | 3h | 15% |
| **Total** | **20h** | **100%** |

---

## 🚀 Próximos Passos Após Sprint 8

**Sprint 9: QA + Segurança**
- Testes E2E com Cypress
- Testes de carga (k6)
- Auditoria OWASP Top 10

**Sprint 10: Go-Live**
- Deploy em produção
- Treinamento de usuários
- Documentação final

---

**Criado:** 03/03/2026  
**Prioridade:** 🔥 CRÍTICA  
**Status:** 📋 Planejamento Concluído
