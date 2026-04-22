import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, NaturezaCusto as PrismaNaturezaCusto } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreateDespesaDto,
  UpdateDespesaDto,
  FilterDespesaDto,
  NaturezaCusto,
} from './dto/despesa.dto';
import {
  CreateImpostoDto,
  UpdateImpostoDto,
  CalcularImpostosDto,
  RegimeTributario,
  CreateIndiceFinanceiroDto,
} from './dto/imposto.dto';
import { CreateCustoMensalDto, UpdateCustoMensalDto } from './dto/custo-mensal.dto';
import {
  CreateProvisaoDto,
  UpdateProvisaoDto,
  FilterProvisaoDto,
} from './dto/provisao.dto';
import {
  BulkImportDespesaDto,
  BulkImportProvisaoDto,
  BulkUpdateImpostoDto,
  CalculoTributarioSindicatoDto,
} from './dto/bulk-operations.dto';
import { ExcelParser } from './utils/excel-parser';
import { ExcelReceitasParser } from './utils/excel-receitas-parser';
import { CreateAliquotaRegimeDto, UpdateAliquotaRegimeDto } from './dto/aliquota-regime.dto';
import { CreateTipoDespesaDto, UpdateTipoDespesaDto } from './dto/tipo-despesa.dto';
import { CreateFornecedorDto, UpdateFornecedorDto } from './dto/fornecedor.dto';

// Alíquotas FALLBACK (usadas apenas se não houver registros no BD)
const ALIQUOTAS_FALLBACK: Record<string, Record<string, number>> = {
  LUCRO_REAL: { PIS: 0.0165, COFINS: 0.076, IRPJ: 0.15, CSLL: 0.09, ISS: 0.05 },
  LUCRO_PRESUMIDO: { PIS: 0.0065, COFINS: 0.03, IRPJ: 0.048, CSLL: 0.0288, ISS: 0.05 },
  SIMPLES_NACIONAL: { SIMPLES: 0.155 },
  CPRB: { CPRB: 0.045, ISS: 0.05, COFINS: 0.03, PIS: 0.0065 },
};

@Injectable()
export class FinancialService implements OnModuleInit {
  private readonly logger = new Logger(FinancialService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureAliquotasRegimeSeeded();
  }

  private async ensureAliquotasRegimeSeeded() {
    const totalAtivas = await this.prisma.aliquotaRegime.count({ where: { ativo: true } });
    if (totalAtivas > 0) return;

    const { criados } = await this.seedAliquotasRegime();
    this.logger.log(`Tabela de alíquotas estava vazia. Seed automático executado com ${criados} registro(s).`);
  }

  private normalizeMesesAdicionais(value?: number) {
    const parsed = Number(value ?? 0);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.floor(parsed);
  }

  private buildCompetencias(mes: number, ano: number, mesesAdicionais?: number) {
    const totalMeses = this.normalizeMesesAdicionais(mesesAdicionais) + 1;

    return Array.from({ length: totalMeses }, (_, index) => {
      const competenciaBase = ano * 12 + (mes - 1) + index;
      return {
        ano: Math.floor(competenciaBase / 12),
        mes: (competenciaBase % 12) + 1,
      };
    });
  }

  private formatCompetencia({ mes, ano }: { mes: number; ano: number }) {
    return `${String(mes).padStart(2, '0')}/${ano}`;
  }

  private formatDespesaResponse(despesa: any) {
    return {
      ...despesa,
      valor: Number(despesa.valor),
    };
  }

  private formatReplicacaoResponse(items: any[], competencias: Array<{ mes: number; ano: number }>) {
    const primeira = competencias[0];
    const ultima = competencias[competencias.length - 1];

    return {
      items,
      totalCriados: items.length,
      competenciaInicial: this.formatCompetencia(primeira),
      competenciaFinal: this.formatCompetencia(ultima),
    };
  }

  private appendSaldoWarnings(response: any, warnings: string[]) {
    if (!warnings.length) return response;
    return {
      ...response,
      saldoInsuficiente: true,
      alertasSaldo: warnings,
    };
  }

  private resolveContratoDataFim(project: any): Date | null {
    return project?.contrato?.dataFim ?? project?.dataFim ?? null;
  }

  private getCompetenciaIndice(mes: number, ano: number): number {
    return ano * 12 + (mes - 1);
  }

  private calcularMesesAteFimContrato(
    project: any,
    mesInicio: number,
    anoInicio: number,
    contexto: string,
  ): number {
    const dataFim = this.resolveContratoDataFim(project);
    if (!dataFim) {
      throw new BadRequestException(
        `Não é possível replicar até o fim da vigência em ${contexto} porque o contrato/projeto não possui data final.`,
      );
    }

    const inicioIdx = this.getCompetenciaIndice(mesInicio, anoInicio);
    const fimIdx = this.getCompetenciaIndice(dataFim.getUTCMonth() + 1, dataFim.getUTCFullYear());

    if (inicioIdx > fimIdx) {
      throw new BadRequestException(
        `Competência ${this.formatCompetencia({ mes: mesInicio, ano: anoInicio })} está após a vigência final do contrato (${this.formatCompetencia({ mes: dataFim.getUTCMonth() + 1, ano: dataFim.getUTCFullYear() })}) em ${contexto}.`,
      );
    }

    return Math.max(0, fimIdx - inicioIdx);
  }

  private assertCompetenciasDentroDaVigencia(
    project: any,
    competencias: Array<{ mes: number; ano: number }>,
    contexto: string,
  ) {
    const dataFim = this.resolveContratoDataFim(project);
    if (!dataFim || competencias.length === 0) {
      return;
    }

    const fimIdx = this.getCompetenciaIndice(dataFim.getUTCMonth() + 1, dataFim.getUTCFullYear());
    const foraDaVigencia = competencias.find(
      (competencia) => this.getCompetenciaIndice(competencia.mes, competencia.ano) > fimIdx,
    );

    if (foraDaVigencia) {
      throw new BadRequestException(
        `${contexto} não pode ser lançado além da vigência final do contrato (${this.formatCompetencia({ mes: dataFim.getUTCMonth() + 1, ano: dataFim.getUTCFullYear() })}). Competência inválida: ${this.formatCompetencia(foraDaVigencia)}.`,
      );
    }
  }

  private normalizeJustificativa(value?: string | null): string | null {
    const texto = String(value ?? '').trim();
    return texto ? texto : null;
  }

  private validateJustificativaReceita(
    valorPrevisto: number,
    valorRealizado: number,
    justificativa?: string | null,
  ) {
    if (!Number.isFinite(valorRealizado) || valorRealizado <= 0) {
      return;
    }

    const diferenca = Math.abs(valorRealizado - valorPrevisto);
    if (diferenca < 0.01) {
      return;
    }

    if (!this.normalizeJustificativa(justificativa)) {
      throw new BadRequestException(
        'Justificativa é obrigatória quando o valor realizado for diferente do valor planejado (exceto quando valor realizado for 0 ou vazio).',
      );
    }
  }

  private async ensureReceitaNaoDuplicada(
    projectId: string,
    whereBase: Record<string, unknown>,
    competencias: Array<{ mes: number; ano: number }>,
    mensagemBuilder: (periodos: string) => string,
  ) {
    const duplicidades: string[] = [];

    for (const competencia of competencias) {
      const existing = await this.prisma.receitaMensal.findFirst({
        where: {
          projectId,
          ...whereBase,
          mes: competencia.mes,
          ano: competencia.ano,
          ativo: true,
        },
      });

      if (existing) {
        duplicidades.push(this.formatCompetencia(competencia));
      }
    }

    if (duplicidades.length > 0) {
      throw new ConflictException(mensagemBuilder(duplicidades.join(', ')));
    }
  }

  // ===================== DESPESAS =====================

  async findDespesas(filters: FilterDespesaDto) {
    const where: any = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.mes) where.mes = Number(filters.mes);
    if (filters.ano) where.ano = Number(filters.ano);

    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 50;

    const [despesas, total] = await Promise.all([
      this.prisma.despesa.findMany({
        where,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          project: { select: { id: true, codigo: true, nome: true } },
          fornecedor: { select: { id: true, razaoSocial: true, cnpj: true } },
        },
      }),
      this.prisma.despesa.count({ where }),
    ]);

    // Converte Decimal para número para o frontend
    return {
      data: despesas.map((d) => ({
        ...d,
        valor: Number(d.valor),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDespesaById(id: string) {
    const despesa = await this.prisma.despesa.findUnique({ where: { id } });
    if (!despesa) throw new NotFoundException(`Despesa '${id}' não encontrada`);
    // Converte Decimal para número para o frontend
    return {
      ...despesa,
      valor: Number(despesa.valor),
    };
  }

  async createDespesa(dto: CreateDespesaDto) {
    const project = await this.validateProject(dto.projectId);
    const naturezaCusto = dto.naturezaCusto ?? NaturezaCusto.VARIAVEL;

    const mesesAdicionaisEfetivos =
      dto.replicarAteFimContrato && naturezaCusto === NaturezaCusto.FIXO
        ? this.calcularMesesAteFimContrato(project, dto.mes, dto.ano, 'despesa')
        : dto.mesesAdicionais;

    const competencias = this.buildCompetencias(dto.mes, dto.ano, mesesAdicionaisEfetivos);
    this.assertCompetenciasDentroDaVigencia(project, competencias, 'Despesa');

    if (competencias.length === 1) {
      const data: Prisma.DespesaUncheckedCreateInput = {
        projectId: dto.projectId,
        tipo: dto.tipo,
        naturezaCusto: naturezaCusto as PrismaNaturezaCusto,
        descricao: dto.descricao,
        valor: new Decimal(dto.valor),
        mes: dto.mes,
        ano: dto.ano,
        fornecedorId: dto.fornecedorId || undefined,
        dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
        anexoUrl: dto.anexoUrl || undefined,
      };

      const despesa = await this.prisma.despesa.create({
        data,
      });

      return this.formatDespesaResponse(despesa);
    }

    const despesas = await this.prisma.$transaction(
      competencias.map((competencia) =>
        this.prisma.despesa.create({
          data: {
            projectId: dto.projectId,
            tipo: dto.tipo,
            naturezaCusto: naturezaCusto as PrismaNaturezaCusto,
            descricao: dto.descricao,
            valor: new Decimal(dto.valor),
            mes: competencia.mes,
            ano: competencia.ano,
            fornecedorId: dto.fornecedorId || undefined,
            dataVencimento: dto.dataVencimento ? new Date(dto.dataVencimento) : undefined,
            anexoUrl: dto.anexoUrl || undefined,
          } satisfies Prisma.DespesaUncheckedCreateInput,
        }),
      ),
    );

    return this.formatReplicacaoResponse(
      despesas.map((despesa) => this.formatDespesaResponse(despesa)),
      competencias,
    );
  }

  async updateDespesa(id: string, dto: UpdateDespesaDto) {
    const despesaAtual = await this.findDespesaById(id);

    const updateData: any = {};
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.descricao !== undefined) updateData.descricao = dto.descricao;
    if (dto.valor !== undefined) updateData.valor = new Decimal(dto.valor);
    if (dto.mes !== undefined) updateData.mes = dto.mes;
    if (dto.ano !== undefined) updateData.ano = dto.ano;
    if (dto.naturezaCusto !== undefined) updateData.naturezaCusto = dto.naturezaCusto;
    if (dto.fornecedorId !== undefined) updateData.fornecedorId = dto.fornecedorId || null;
    if (dto.dataVencimento !== undefined) updateData.dataVencimento = dto.dataVencimento ? new Date(dto.dataVencimento) : null;
    if (dto.anexoUrl !== undefined) updateData.anexoUrl = dto.anexoUrl || null;

    const mesFinal = dto.mes ?? despesaAtual.mes;
    const anoFinal = dto.ano ?? despesaAtual.ano;
    const project = await this.validateProject(despesaAtual.projectId);
    this.assertCompetenciasDentroDaVigencia(project, [{ mes: mesFinal, ano: anoFinal }], 'Despesa');

    const despesa = await this.prisma.despesa.update({ where: { id }, data: updateData });

    // Converte Decimal para número para o frontend
    return {
      ...despesa,
      valor: Number(despesa.valor),
    };
  }

  async deleteDespesa(id: string) {
    await this.findDespesaById(id);
    return this.prisma.despesa.delete({ where: { id } });
  }

  // ===================== IMPOSTOS =====================

  async findImpostos(projectId: string, ano?: number) {
    await this.validateProject(projectId);
    const where: any = { projectId };
    if (ano) where.ano = ano;

    return this.prisma.imposto.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });
  }

  async createImposto(dto: CreateImpostoDto) {
    await this.validateProject(dto.projectId);

    return this.prisma.imposto.create({
      data: {
        projectId: dto.projectId,
        tipo: dto.tipo,
        aliquota: new Decimal(dto.aliquota),
        valor: new Decimal(dto.valor),
        mes: dto.mes,
        ano: dto.ano,
      },
    });
  }

  async updateImposto(id: string, dto: UpdateImpostoDto) {
    const imposto = await this.prisma.imposto.findUnique({ where: { id } });
    if (!imposto) throw new NotFoundException(`Imposto '${id}' não encontrado`);

    const updateData: any = {};
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.aliquota !== undefined) updateData.aliquota = new Decimal(dto.aliquota);
    if (dto.valor !== undefined) updateData.valor = new Decimal(dto.valor);

    return this.prisma.imposto.update({ where: { id }, data: updateData });
  }

  async deleteImposto(id: string) {
    const imposto = await this.prisma.imposto.findUnique({ where: { id } });
    if (!imposto) throw new NotFoundException(`Imposto '${id}' não encontrado`);
    return this.prisma.imposto.delete({ where: { id } });
  }

  // ===================== ENGINE TRIBUTÁRIA =====================

  // Busca alíquotas do BD para um regime; cai no fallback hardcoded se BD vazio
  private async getAliquotasForRegime(regime: string): Promise<Record<string, number>> {
    const rows = await this.prisma.aliquotaRegime.findMany({
      where: { regime, ativo: true },
    });
    if (rows.length > 0) {
      const map: Record<string, number> = {};
      for (const r of rows) map[r.tipo] = Number(r.aliquota);
      return map;
    }
    return ALIQUOTAS_FALLBACK[regime] || ALIQUOTAS_FALLBACK['LUCRO_PRESUMIDO'];
  }

  async calcularImpostos(dto: CalcularImpostosDto) {
    const project = await this.validateProject(dto.projectId);

    // Usa o regime do projeto (BD) se o DTO não trouxer um regime explícito
    const regimeEfetivo = dto.regime || (project as any).regimeTributario || 'LUCRO_PRESUMIDO';
    const aliquotas = await this.getAliquotasForRegime(regimeEfetivo);
    const { receitaBruta } = dto;

    const impostos: Array<{ tipo: string; aliquota: number; valor: number }> = [];
    let totalImpostos = 0;

    for (const [tipo, aliquota] of Object.entries(aliquotas)) {
      const valor = Math.round(receitaBruta * aliquota * 100) / 100;
      impostos.push({ tipo, aliquota, valor });
      totalImpostos += valor;
    }

    // Ajuste ISS por estado (simplificado - alguns estados/municípios têm ISS reduzido)
    if (dto.estado && ['SP', 'RJ', 'MG'].includes(dto.estado)) {
      const iss = impostos.find((i) => i.tipo === 'ISS');
      if (iss) {
        iss.aliquota = 0.02;
        iss.valor = Math.round(receitaBruta * 0.02 * 100) / 100;
        totalImpostos = impostos.reduce((s, i) => s + i.valor, 0);
      }
    }

    return {
      projectId: dto.projectId,
      mes: dto.mes,
      ano: dto.ano,
      regime: regimeEfetivo,
      receitaBruta,
      impostos,
      totalImpostos: Math.round(totalImpostos * 100) / 100,
      cargaTributaria: receitaBruta > 0 ? Math.round((totalImpostos / receitaBruta) * 10000) / 100 : 0,
    };
  }

  async gravarImpostosCalculados(dto: CalcularImpostosDto) {
    const calculo = await this.calcularImpostos(dto);

    const operacoes = calculo.impostos.map((imposto) =>
      this.prisma.imposto.upsert({
        where: {
          id: `${dto.projectId}-${imposto.tipo}-${dto.mes}-${dto.ano}`,
        },
        create: {
          projectId: dto.projectId,
          tipo: imposto.tipo,
          aliquota: new Decimal(imposto.aliquota),
          valor: new Decimal(imposto.valor),
          mes: dto.mes,
          ano: dto.ano,
        },
        update: {
          aliquota: new Decimal(imposto.aliquota),
          valor: new Decimal(imposto.valor),
        },
      }),
    );

    await this.prisma.$transaction(operacoes as any);
    return calculo;
  }

  // ===================== CUSTOS MENSAIS DE PESSOAL =====================

  async findCustosMensais(projectId: string, ano?: number) {
    await this.validateProject(projectId);
    const where: any = { projectId };
    if (ano) where.ano = ano;

    return this.prisma.custoMensal.findMany({
      where,
      include: {
        colaborador: { select: { id: true, matricula: true, nome: true, cargo: true } },
      },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });
  }

  async upsertCustoMensal(dto: CreateCustoMensalDto) {
    const project = await this.validateProject(dto.projectId);
    this.assertCompetenciasDentroDaVigencia(
      project,
      [{ mes: dto.mes, ano: dto.ano }],
      'Custo mensal de recursos humanos',
    );

    const colaborador = await this.prisma.colaborador.findUnique({
      where: { id: dto.colaboradorId },
    });
    if (!colaborador) throw new NotFoundException(`Colaborador '${dto.colaboradorId}' não encontrado`);

    return this.prisma.custoMensal.upsert({
      where: {
        colaboradorId_projectId_mes_ano: {
          colaboradorId: dto.colaboradorId,
          projectId: dto.projectId,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
      create: {
        colaboradorId: dto.colaboradorId,
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        custoFixo: new Decimal(dto.custoFixo ?? 0),
        custoVariavel: new Decimal(dto.custoVariavel ?? 0),
      },
      update: {
        custoFixo: dto.custoFixo !== undefined ? new Decimal(dto.custoFixo) : undefined,
        custoVariavel: dto.custoVariavel !== undefined ? new Decimal(dto.custoVariavel) : undefined,
      },
    });
  }

  // ===================== ÍNDICES FINANCEIROS =====================

  async findIndices(tipo?: string, ano?: number) {
    const where: any = {};
    if (tipo) where.tipo = tipo;
    if (ano) where.anoReferencia = ano;

    return this.prisma.indiceFinanceiro.findMany({
      where,
      orderBy: [{ anoReferencia: 'desc' }, { mesReferencia: 'desc' }],
    });
  }

  async createIndice(dto: CreateIndiceFinanceiroDto) {
    const exists = await this.prisma.indiceFinanceiro.findUnique({
      where: {
        tipo_mesReferencia_anoReferencia: {
          tipo: dto.tipo,
          mesReferencia: dto.mesReferencia,
          anoReferencia: dto.anoReferencia,
        },
      },
    });

    if (exists) throw new ConflictException(`Índice ${dto.tipo} para ${dto.mesReferencia}/${dto.anoReferencia} já cadastrado`);

    return this.prisma.indiceFinanceiro.create({
      data: {
        tipo: dto.tipo,
        valor: new Decimal(dto.valor),
        mesReferencia: dto.mesReferencia,
        anoReferencia: dto.anoReferencia,
      },
    });
  }

  // ===================== CUSTO TOTAL DO PROJETO =====================

  async calcularCustoTotal(projectId: string, mes: number, ano: number) {
    await this.validateProject(projectId);

    const [despesas, impostos, custosPessoal] = await this.prisma.$transaction([
      this.prisma.despesa.findMany({ where: { projectId, mes, ano } }),
      this.prisma.imposto.findMany({ where: { projectId, mes, ano } }),
      this.prisma.custoMensal.findMany({ where: { projectId, mes, ano } }),
    ]);

    const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);
    const totalImpostos = impostos.reduce((s, i) => s + Number(i.valor), 0);
    const totalCustosPessoal = custosPessoal.reduce(
      (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
      0,
    );
    const custoTotal = totalDespesas + totalImpostos + totalCustosPessoal;

    // Agrupamento de despesas por tipo
    const despesasPorTipo = despesas.reduce<Record<string, number>>((acc, d) => {
      acc[d.tipo] = (acc[d.tipo] || 0) + Number(d.valor);
      return acc;
    }, {});

    const impostosPorTipo = impostos.reduce<Record<string, number>>((acc, i) => {
      acc[i.tipo] = (acc[i.tipo] || 0) + Number(i.valor);
      return acc;
    }, {});

    return {
      projectId,
      mes,
      ano,
      totalDespesas: Math.round(totalDespesas * 100) / 100,
      despesasPorTipo,
      totalImpostos: Math.round(totalImpostos * 100) / 100,
      impostosPorTipo,
      totalCustosPessoal: Math.round(totalCustosPessoal * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
    };
  }

  async calcularCustoAnual(projectId: string, ano: number) {
    await this.validateProject(projectId);

    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const mensais = await Promise.all(
      meses.map((mes) => this.calcularCustoTotal(projectId, mes, ano)),
    );

    const totalAnual = mensais.reduce(
      (acc, m) => ({
        totalDespesas: acc.totalDespesas + m.totalDespesas,
        totalImpostos: acc.totalImpostos + m.totalImpostos,
        totalCustosPessoal: acc.totalCustosPessoal + m.totalCustosPessoal,
        custoTotal: acc.custoTotal + m.custoTotal,
      }),
      { totalDespesas: 0, totalImpostos: 0, totalCustosPessoal: 0, custoTotal: 0 },
    );

    return {
      projectId,
      ano,
      mensais,
      totalAnual: {
        totalDespesas: Math.round(totalAnual.totalDespesas * 100) / 100,
        totalImpostos: Math.round(totalAnual.totalImpostos * 100) / 100,
        totalCustosPessoal: Math.round(totalAnual.totalCustosPessoal * 100) / 100,
        custoTotal: Math.round(totalAnual.custoTotal * 100) / 100,
      },
    };
  }

  // ===================== ALÍQUOTAS POR REGIME (CONFIGURÁVEIS) =====================

  async findAliquotasRegime(regime?: string) {
    const where: any = {};
    if (regime) where.regime = regime;
    return this.prisma.aliquotaRegime.findMany({
      where,
      orderBy: [{ regime: 'asc' }, { tipo: 'asc' }],
    });
  }

  async createAliquotaRegime(dto: CreateAliquotaRegimeDto) {
    const existing = await this.prisma.aliquotaRegime.findUnique({
      where: { regime_tipo: { regime: dto.regime, tipo: dto.tipo } },
    });
    if (existing) throw new ConflictException(`Alíquota ${dto.tipo} já existe para regime ${dto.regime}`);
    return this.prisma.aliquotaRegime.create({
      data: {
        regime: dto.regime,
        tipo: dto.tipo,
        aliquota: new Decimal(dto.aliquota),
      },
    });
  }

  async updateAliquotaRegime(id: string, dto: UpdateAliquotaRegimeDto) {
    const record = await this.prisma.aliquotaRegime.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Alíquota '${id}' não encontrada`);
    const data: any = {};
    if (dto.aliquota !== undefined) data.aliquota = new Decimal(dto.aliquota);
    if (dto.ativo !== undefined) data.ativo = dto.ativo;
    return this.prisma.aliquotaRegime.update({ where: { id }, data });
  }

  async deleteAliquotaRegime(id: string) {
    const record = await this.prisma.aliquotaRegime.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Alíquota '${id}' não encontrada`);
    return this.prisma.aliquotaRegime.delete({ where: { id } });
  }

  /** Popula tabela aliquotas_regime com valores padrão (idempotente) */
  async seedAliquotasRegime() {
    let criados = 0;
    for (const [regime, impostos] of Object.entries(ALIQUOTAS_FALLBACK)) {
      for (const [tipo, aliquota] of Object.entries(impostos)) {
        const existing = await this.prisma.aliquotaRegime.findUnique({
          where: { regime_tipo: { regime, tipo } },
        });
        if (!existing) {
          await this.prisma.aliquotaRegime.create({
            data: { regime, tipo, aliquota: new Decimal(aliquota) },
          });
          criados++;
        }
      }
    }
    return { message: `Seed concluído: ${criados} alíquotas criadas`, criados };
  }

  // ===================== HELPERS =====================

  private async validateProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        contrato: {
          select: {
            id: true,
            dataFim: true,
          },
        },
      },
    });
    if (!project) throw new NotFoundException(`Projeto '${projectId}' não encontrado`);
    return project;
  }

  // ===================== PROVISÕES FINANCEIRAS =====================

  async findProvisoes(filters: FilterProvisaoDto) {
    const where: any = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.ano) where.ano = filters.ano;
    where.ativo = true;

    return this.prisma.provisao.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });
  }

  async findProvisaoById(id: string) {
    const provisao = await this.prisma.provisao.findUnique({ where: { id } });
    if (!provisao) throw new NotFoundException(`Provisão '${id}' não encontrada`);
    return provisao;
  }

  async createProvisao(dto: CreateProvisaoDto) {
    await this.validateProject(dto.projectId);

    // Verificar se já existe provisão para este projeto/tipo/mês/ano
    const existing = await this.prisma.provisao.findUnique({
      where: {
        projectId_tipo_mes_ano: {
          projectId: dto.projectId,
          tipo: dto.tipo,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Provisão tipo '${dto.tipo}' já existe para projeto no mês ${dto.mes}/${dto.ano}`,
      );
    }

    return this.prisma.provisao.create({
      data: {
        projectId: dto.projectId,
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: new Decimal(dto.valor),
        mes: dto.mes,
        ano: dto.ano,
      },
    });
  }

  async updateProvisao(id: string, dto: UpdateProvisaoDto) {
    await this.findProvisaoById(id);

    const updateData: any = {};
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.descricao !== undefined) updateData.descricao = dto.descricao;
    if (dto.valor !== undefined) updateData.valor = new Decimal(dto.valor);
    if (dto.mes !== undefined) updateData.mes = dto.mes;
    if (dto.ano !== undefined) updateData.ano = dto.ano;
    if (dto.ativo !== undefined) updateData.ativo = dto.ativo;

    return this.prisma.provisao.update({ where: { id }, data: updateData });
  }

  async deleteProvisao(id: string) {
    await this.findProvisaoById(id);
    return this.prisma.provisao.delete({ where: { id } });
  }

  // ===================== BULK IMPORT DESPESAS =====================

  async importarDespesasEmLote(dto: BulkImportDespesaDto, userId?: string) {
    const detalhes: Array<{
      indice: number;
      status: string;
      mensagem: string;
      entityId?: string;
    }> = [];
    let sucessos = 0;
    let erros = 0;
    let avisos = 0;

    // Cache de projetos validados
    const projetosValidados = new Map<string, string | null>();

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const resultado: { indice: number; status: string; mensagem: string; entityId?: string } = {
        indice: i + 1,
        status: 'sucesso',
        mensagem: '',
      };

      try {
        // Validar campos obrigatórios
        if (!item.projectId || !item.tipo || !item.descricao || !item.valor) {
          resultado.status = 'erro';
          resultado.mensagem = 'Campos obrigatórios faltando: projectId, tipo, descricao, valor';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Validar projeto (com cache)
        const projectRef = item.projectId.trim();

        if (!projetosValidados.has(projectRef)) {
          const project = await this.prisma.project.findUnique({
            where: { id: projectRef },
            select: { id: true },
          });

          if (project) {
            projetosValidados.set(projectRef, project.id);
          } else {
            const projectByCode = await this.prisma.project.findUnique({
              where: { codigo: projectRef },
              select: { id: true },
            });
            projetosValidados.set(projectRef, projectByCode?.id ?? null);
          }
        }

        const resolvedProjectId = projetosValidados.get(projectRef);
        if (!resolvedProjectId) {
          resultado.status = 'erro';
          resultado.mensagem = `Projeto '${projectRef}' não encontrado (ID ou código)`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        const created = await this.createDespesa({
          projectId: resolvedProjectId,
          tipo: item.tipo,
          descricao: item.descricao,
          valor: item.valor,
          mes: item.mes,
          ano: item.ano,
          naturezaCusto: item.naturezaCusto ?? NaturezaCusto.VARIAVEL,
          replicarAteFimContrato: item.replicarAteFimContrato,
        });

        if (Array.isArray((created as any)?.items)) {
          const totalCriados = Number((created as any).totalCriados ?? (created as any).items.length);
          resultado.entityId = (created as any).items[0]?.id;
          resultado.mensagem = `${totalCriados} despesa(s) criada(s) com sucesso`;
          sucessos += totalCriados;
        } else {
          resultado.entityId = (created as any)?.id;
          resultado.mensagem = `Despesa tipo '${item.tipo}' criada com sucesso`;
          sucessos++;
        }
      } catch (error: any) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao criar despesa: ${error.message}`;
        erros++;
      }

      detalhes.push(resultado);
    }

    // Log de auditoria
    if (userId) {
      try {
        await this.prisma.historicoCalculo.create({
          data: {
            projectId: dto.items[0]?.projectId || 'bulk',
            tipo: 'bulk_import_despesas',
            dadosAntes: {},
            dadosDepois: {
              totalProcessado: dto.items.length,
              sucessos,
              erros,
              avisos,
              descricao: dto.descricaoOperacao || 'Importação em lote de despesas',
            },
            criadoPor: userId,
          },
        });
      } catch {
        // Log silencioso - não impede a operação
      }
    }

    return {
      totalProcessado: dto.items.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  // ===================== BULK IMPORT PROVISÕES =====================

  async importarProvisoesEmLote(dto: BulkImportProvisaoDto, userId?: string) {
    const detalhes: Array<{
      indice: number;
      status: string;
      mensagem: string;
      entityId?: string;
    }> = [];
    let sucessos = 0;
    let erros = 0;
    let avisos = 0;

    const projetosValidados = new Map<string, boolean>();

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const resultado: { indice: number; status: string; mensagem: string; entityId?: string } = {
        indice: i + 1,
        status: 'sucesso',
        mensagem: '',
      };

      try {
        if (!item.projectId || !item.tipo || !item.valor) {
          resultado.status = 'erro';
          resultado.mensagem = 'Campos obrigatórios faltando: projectId, tipo, valor';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Validar projeto
        if (!projetosValidados.has(item.projectId)) {
          const project = await this.prisma.project.findUnique({
            where: { id: item.projectId },
          });
          projetosValidados.set(item.projectId, !!project);
        }

        if (!projetosValidados.get(item.projectId)) {
          resultado.status = 'erro';
          resultado.mensagem = `Projeto '${item.projectId}' não encontrado`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Upsert provisão (criar ou atualizar se já existe)
        const provisao = await this.prisma.provisao.upsert({
          where: {
            projectId_tipo_mes_ano: {
              projectId: item.projectId,
              tipo: item.tipo,
              mes: item.mes,
              ano: item.ano,
            },
          },
          create: {
            projectId: item.projectId,
            tipo: item.tipo,
            descricao: item.descricao,
            valor: new Decimal(item.valor),
            mes: item.mes,
            ano: item.ano,
          },
          update: {
            valor: new Decimal(item.valor),
            descricao: item.descricao,
          },
        });

        // Se já existia, registrar como aviso
        const isUpdate = provisao.updatedAt > provisao.createdAt;
        if (isUpdate) {
          resultado.status = 'aviso';
          resultado.mensagem = `Provisão '${item.tipo}' atualizada (já existia para ${item.mes}/${item.ano})`;
          avisos++;
        } else {
          resultado.mensagem = `Provisão '${item.tipo}' criada com sucesso`;
          sucessos++;
        }
        resultado.entityId = provisao.id;
      } catch (error: any) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao processar provisão: ${error.message}`;
        erros++;
      }

      detalhes.push(resultado);
    }

    // Log de auditoria
    if (userId) {
      try {
        await this.prisma.historicoCalculo.create({
          data: {
            projectId: dto.items[0]?.projectId || 'bulk',
            tipo: 'bulk_import_provisoes',
            dadosAntes: {},
            dadosDepois: {
              totalProcessado: dto.items.length,
              sucessos,
              erros,
              avisos,
              descricao: dto.descricaoOperacao || 'Importação em lote de provisões',
            },
            criadoPor: userId,
          },
        });
      } catch {
        // Log silencioso
      }
    }

    return {
      totalProcessado: dto.items.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  // ===================== BULK UPDATE IMPOSTOS =====================

  async atualizarImpostosEmLote(dto: BulkUpdateImpostoDto, userId?: string) {
    const detalhes: Array<{
      indice: number;
      status: string;
      mensagem: string;
      entityId?: string;
    }> = [];
    let sucessos = 0;
    let erros = 0;
    let avisos = 0;

    // Cache de projetos validados
    const projetosValidados = new Map<string, boolean>();

    for (let i = 0; i < dto.items.length; i++) {
      const item = dto.items[i];
      const resultado: { indice: number; status: string; mensagem: string; entityId?: string } = {
        indice: i + 1,
        status: 'sucesso',
        mensagem: '',
      };

      try {
        // Validações de campos obrigatórios
        if (!item.projectId || !item.tipo || item.aliquota === undefined || item.aliquota === null) {
          resultado.status = 'erro';
          resultado.mensagem = 'Campos obrigatórios faltando: projectId, tipo, aliquota';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Validar alíquota entre 0-100%
        if (item.aliquota < 0 || item.aliquota > 100) {
          resultado.status = 'erro';
          resultado.mensagem = `Alíquota fora do intervalo: ${item.aliquota}%. Use valor entre 0-100`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Validar projeto (com cache)
        if (!projetosValidados.has(item.projectId)) {
          const project = await this.prisma.project.findUnique({
            where: { id: item.projectId },
          });
          projetosValidados.set(item.projectId, !!project);
        }

        if (!projetosValidados.get(item.projectId)) {
          resultado.status = 'erro';
          resultado.mensagem = `Projeto '${item.projectId}' não encontrado`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Verificar se imposto existe
        const impostoExistente = await this.prisma.imposto.findFirst({
          where: {
            projectId: item.projectId,
            tipo: item.tipo,
            mes: item.mes,
            ano: item.ano,
          },
        });

        if (!impostoExistente) {
          // Se não existe, criar novo
          const valor = new Decimal(item.aliquota); // Usar alíquota como valor base (pode ser calculado posteriormente)
          const imposto = await this.prisma.imposto.create({
            data: {
              projectId: item.projectId,
              tipo: item.tipo,
              aliquota: new Decimal(item.aliquota),
              valor,
              mes: item.mes,
              ano: item.ano,
            },
          });

          resultado.status = 'aviso';
          resultado.mensagem = `Imposto criado (não existia): ${item.tipo} - ${item.aliquota}%`;
          resultado.entityId = imposto.id;
          avisos++;
        } else {
          // Atualizar imposto existente
          const valor = new Decimal(item.aliquota);
          const imposto = await this.prisma.imposto.update({
            where: { id: impostoExistente.id },
            data: {
              aliquota: new Decimal(item.aliquota),
              valor,
            },
          });

          resultado.status = 'sucesso';
          resultado.mensagem = `Imposto ${item.tipo} atualizado: alíquota=${item.aliquota}%`;
          resultado.entityId = imposto.id;
          sucessos++;
        }
      } catch (error: any) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao atualizar imposto: ${error.message}`;
        erros++;
      }

      detalhes.push(resultado);
    }

    // Log de auditoria
    if (userId) {
      try {
        await this.prisma.historicoCalculo.create({
          data: {
            projectId: dto.items[0]?.projectId || 'bulk',
            tipo: 'bulk_update_impostos',
            dadosAntes: { motivo: dto.motivo },
            dadosDepois: {
              totalProcessado: dto.items.length,
              sucessos,
              erros,
              avisos,
              descricao: dto.descricaoOperacao || 'Atualização em lote de impostos',
            },
            criadoPor: userId,
          },
        });
      } catch {
        // Log silencioso - não impede a operação
      }
    }

    return {
      totalProcessado: dto.items.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  // ===================== IMPACTO TRIBUTÁRIO POR SINDICATO =====================

  async calcularImpactoTributarioSindicato(dto: CalculoTributarioSindicatoDto) {
    await this.validateProject(dto.projectId);

    let sindicato: any = null;
    let regimeTributario = RegimeTributario.LUCRO_PRESUMIDO;

    // Buscar sindicato se informado
    if (dto.sindicatoId) {
      sindicato = await this.prisma.sindicato.findUnique({
        where: { id: dto.sindicatoId },
      });
      if (!sindicato) {
        throw new NotFoundException(`Sindicato '${dto.sindicatoId}' não encontrado`);
      }
      // Mapear regime do sindicato
      if (sindicato.regimeTributario) {
        const regimeMap: Record<string, RegimeTributario> = {
          LUCRO_REAL: RegimeTributario.LUCRO_REAL,
          LUCRO_PRESUMIDO: RegimeTributario.LUCRO_PRESUMIDO,
          SIMPLES_NACIONAL: RegimeTributario.SIMPLES_NACIONAL,
          CPRB: RegimeTributario.CPRB,
        };
        regimeTributario = regimeMap[sindicato.regimeTributario] || RegimeTributario.LUCRO_PRESUMIDO;
      }
    }

    // Calcular impostos base
    const calculoBase = await this.calcularImpostos({
      projectId: dto.projectId,
      regime: regimeTributario,
      receitaBruta: dto.receitaBruta,
      mes: dto.mes,
      ano: dto.ano,
      estado: dto.estado,
    });

    // Incluir impacto do dissídio se sindicato informado
    let impactoDissidio = 0;
    let percentualDissidio = 0;

    if (sindicato && Number(sindicato.percentualDissidio) > 0) {
      percentualDissidio = Number(sindicato.percentualDissidio);
      // Buscar custos de pessoal do projeto para calcular impacto
      const custosPessoal = await this.prisma.custoMensal.findMany({
        where: { projectId: dto.projectId, mes: dto.mes, ano: dto.ano },
      });
      const totalCustosPessoal = custosPessoal.reduce(
        (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
        0,
      );
      impactoDissidio = Math.round(totalCustosPessoal * percentualDissidio * 100) / 100;
    }

    // Buscar índice IPCA para reajuste
    let ipca = 0;
    try {
      const indice = await this.prisma.indiceFinanceiro.findUnique({
        where: {
          tipo_mesReferencia_anoReferencia: {
            tipo: 'IPCA',
            mesReferencia: dto.mes,
            anoReferencia: dto.ano,
          },
        },
      });
      if (indice) ipca = Number(indice.valor);
    } catch {
      // IPCA não encontrado - prossegue sem
    }

    return {
      ...calculoBase,
      sindicato: sindicato
        ? {
            id: sindicato.id,
            nome: sindicato.nome,
            regiao: sindicato.regiao,
            percentualDissidio,
          }
        : null,
      impactoDissidio,
      ipca,
      custoTotalComImpacto:
        Math.round((calculoBase.totalImpostos + impactoDissidio) * 100) / 100,
    };
  }

  // ===================== CUSTO TOTAL COM PROVISÕES =====================

  async calcularCustoTotalCompleto(projectId: string, mes: number, ano: number) {
    await this.validateProject(projectId);

    const [despesas, impostos, custosPessoal, provisoes] = await this.prisma.$transaction([
      this.prisma.despesa.findMany({ where: { projectId, mes, ano } }),
      this.prisma.imposto.findMany({ where: { projectId, mes, ano } }),
      this.prisma.custoMensal.findMany({ where: { projectId, mes, ano } }),
      this.prisma.provisao.findMany({ where: { projectId, mes, ano, ativo: true } }),
    ]);

    const totalDespesas = despesas.reduce((s, d) => s + Number(d.valor), 0);
    const totalImpostos = impostos.reduce((s, i) => s + Number(i.valor), 0);
    const totalCustosPessoal = custosPessoal.reduce(
      (s, c) => s + Number(c.custoFixo) + Number(c.custoVariavel),
      0,
    );
    const totalProvisoes = provisoes.reduce((s, p) => s + Number(p.valor), 0);
    const custoTotal = totalDespesas + totalImpostos + totalCustosPessoal + totalProvisoes;

    const despesasPorTipo = despesas.reduce<Record<string, number>>((acc, d) => {
      acc[d.tipo] = (acc[d.tipo] || 0) + Number(d.valor);
      return acc;
    }, {});

    const impostosPorTipo = impostos.reduce<Record<string, number>>((acc, i) => {
      acc[i.tipo] = (acc[i.tipo] || 0) + Number(i.valor);
      return acc;
    }, {});

    const provisoesPorTipo = provisoes.reduce<Record<string, number>>((acc, p) => {
      acc[p.tipo] = (acc[p.tipo] || 0) + Number(p.valor);
      return acc;
    }, {});

    return {
      projectId,
      mes,
      ano,
      totalDespesas: Math.round(totalDespesas * 100) / 100,
      despesasPorTipo,
      totalImpostos: Math.round(totalImpostos * 100) / 100,
      impostosPorTipo,
      totalCustosPessoal: Math.round(totalCustosPessoal * 100) / 100,
      totalProvisoes: Math.round(totalProvisoes * 100) / 100,
      provisoesPorTipo,
      custoTotal: Math.round(custoTotal * 100) / 100,
    };
  }

  /* ────────────── RECEITAS ────────────── */

  private readonly receitaInclude = {
    project: { select: { id: true, nome: true, codigo: true } },
    objetoContratual: { select: { id: true, nome: true, descricao: true } },
    linhaContratual: {
      select: {
        id: true,
        descricaoItem: true,
        unidade: true,
        valorUnitario: true,
        quantidadeAnualEstimada: true,
        valorTotalAnual: true,
        saldoQuantidade: true,
        saldoValor: true,
      },
    },
  };

  async findAllReceitas(page: number = 1, limit: number = 10, ano?: number, mes?: number, projectId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { ativo: true };
    if (ano) where.ano = ano;
    if (mes) where.mes = mes;
    if (projectId) where.projectId = projectId;

    const [receitas, total] = await Promise.all([
      this.prisma.receitaMensal.findMany({
        where,
        include: this.receitaInclude,
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.receitaMensal.count({ where }),
    ]);

    return { data: receitas, total, page, limit };
  }

  async findReceitasById(projectId: string, ano?: number) {
    const where: any = { projectId, ativo: true };
    if (ano) where.ano = ano;
    return this.prisma.receitaMensal.findMany({
      where,
      include: this.receitaInclude,
      orderBy: [{ ano: 'desc' }, { mes: 'asc' }],
    });
  }

  /**
   * Buscar receitas agregadas por Objeto Contratual
   * US3 — Receita agregada ao objeto contratual
   */
  async findReceitasByObjeto(objetoContratualId: string, ano?: number) {
    const where: any = { objetoContratualId, ativo: true };
    if (ano) where.ano = ano;

    const receitas = await this.prisma.receitaMensal.findMany({
      where,
      include: this.receitaInclude,
      orderBy: [{ ano: 'desc' }, { mes: 'asc' }],
    });

    const totalPrevisto = receitas.reduce((s, r) => s + Number(r.valorPrevisto), 0);
    const totalRealizado = receitas.reduce((s, r) => s + Number(r.valorRealizado), 0);

    return {
      objetoContratualId,
      receitas,
      totais: {
        totalPrevisto: Math.round(totalPrevisto * 100) / 100,
        totalRealizado: Math.round(totalRealizado * 100) / 100,
        totalReceitas: receitas.length,
      },
    };
  }

  /**
   * Criar receita — suporta dois modos:
   * 1. Via Contrato: linhaContratualId + quantidade → auto-calcula valor
   * 2. Manual: valorPrevisto direto
   *
   * Fluxo Via Contrato (US1 + US2):
   * - Busca linha contratual automaticamente
   * - Auto-preenche: descrição, unidade, valorUnitário
   * - Calcula: valorPrevisto = quantidade × valorUnitário
   * - Vincula ao projeto, objeto e linha (US3)
   */
  async createReceita(data: any) {
    const project = await this.validateProject(data.projectId);

    const competencias = this.buildCompetencias(data.mes, data.ano, data.mesesAdicionais);
    this.assertCompetenciasDentroDaVigencia(project, competencias, 'Receita');

    // ═══════════ MODO CONTRATO ═══════════
    if (data.linhaContratualId) {
      const linha = await this.prisma.linhaContratual.findUnique({
        where: { id: data.linhaContratualId },
        include: {
          objetoContratual: {
            select: { id: true, contratoId: true, nome: true, descricao: true },
          },
        },
      });
      if (!linha) throw new NotFoundException('Linha contratual não encontrada');
      if (!linha.ativo) throw new NotFoundException('Linha contratual está inativa');

      const hasQuantidade =
        data.quantidade !== undefined && data.quantidade !== null && data.quantidade !== '';
      const quantidade = hasQuantidade ? Number(data.quantidade) : 0;
      const valorUnitario = Number(linha.valorUnitario);
      const valorTotal = Math.round(quantidade * valorUnitario * 100) / 100;
      const hasQuantidadeRealizada =
        data.quantidadeRealizada !== undefined &&
        data.quantidadeRealizada !== null &&
        data.quantidadeRealizada !== '';
      const quantidadeRealizada = hasQuantidadeRealizada ? Number(data.quantidadeRealizada) : 0;
      const valorRealizadoUnitario = Math.round(quantidadeRealizada * valorUnitario * 100) / 100;
      const valorRealizadoInformado = Math.round(Number(data.valorRealizado || 0) * 100) / 100;
      const valorRealizadoCompetencia =
        quantidadeRealizada > 0 ? valorRealizadoUnitario : valorRealizadoInformado;
      const quantidadeRealizadaTotal = quantidadeRealizada * competencias.length;
      const valorRealizadoTotal = Math.round(valorRealizadoCompetencia * competencias.length * 100) / 100;
      const justificativa = this.normalizeJustificativa(data.justificativa);

      this.validateJustificativaReceita(valorTotal, valorRealizadoCompetencia, justificativa);

      const alertasSaldo: string[] = [];

      // RN-003: Permite exceder saldo, porém alerta o usuário.
      if (quantidadeRealizada > 0) {
        const saldoQtd = Number(linha.saldoQuantidade);

        if (quantidadeRealizadaTotal > saldoQtd) {
          alertasSaldo.push(
            `Quantidade realizada total (${quantidadeRealizadaTotal}) excede o saldo disponível (${saldoQtd}) da linha contratual. A receita foi lançada mesmo assim.`
          );
        }
        const saldoVl = Number(linha.saldoValor);

        if (valorRealizadoTotal > saldoVl) {
          alertasSaldo.push(
            `Valor realizado total (${valorRealizadoTotal}) excede o saldo disponível (${saldoVl}) da linha contratual. A receita foi lançada mesmo assim.`
          );
        }
      }

      // Auto-preencher campos a partir da linha contratual (US1)
      const objetoContratualId = data.objetoContratualId || linha.objetoContratualId;
      const projectId = data.projectId;
      if (!projectId) throw new NotFoundException('Projeto não encontrado para esta linha contratual');
      const tipoReceita = data.tipoReceita || linha.descricaoItem;
      const descricao = data.descricao || `${linha.descricaoItem} (${linha.objetoContratual.nome})`;

      await this.ensureReceitaNaoDuplicada(
        projectId,
        { linhaContratualId: data.linhaContratualId },
        competencias,
        (periodos) => `Já existe receita para esta linha contratual nos períodos: ${periodos}`,
      );

      const receitas = await this.prisma.$transaction(async (tx) => {
        const resultados: any[] = [];

        for (const competencia of competencias) {
          const inactive = await tx.receitaMensal.findFirst({
            where: {
              projectId,
              linhaContratualId: data.linhaContratualId,
              mes: competencia.mes,
              ano: competencia.ano,
              ativo: false,
            },
          });

          const receitaData = {
            projectId,
            objetoContratualId,
            linhaContratualId: data.linhaContratualId,
            mes: competencia.mes,
            ano: competencia.ano,
            tipoReceita,
            descricao,
            unidade: linha.unidade,
            quantidadePlanejada: new Decimal(quantidade),
            valorUnitarioPlanejado: new Decimal(valorUnitario),
            valorPlanejado: new Decimal(valorTotal),
            quantidade: new Decimal(quantidade),
            valorUnitario: new Decimal(valorUnitario),
            valorPrevisto: new Decimal(valorTotal),
            quantidadeRealizada: quantidadeRealizada > 0 ? new Decimal(quantidadeRealizada) : null,
            valorUnitarioRealizado: quantidadeRealizada > 0 ? new Decimal(valorUnitario) : null,
            valorRealizado: new Decimal(valorRealizadoCompetencia),
            justificativa,
            ativo: true,
          };

          if (inactive) {
            resultados.push(
              await tx.receitaMensal.update({
                where: { id: inactive.id },
                data: receitaData,
                include: this.receitaInclude,
              }),
            );
            continue;
          }

          resultados.push(
            await tx.receitaMensal.create({
              data: receitaData,
              include: this.receitaInclude,
            }),
          );
        }

        if (quantidadeRealizada > 0) {
          await tx.linhaContratual.update({
            where: { id: data.linhaContratualId },
            data: {
              saldoQuantidade: { decrement: new Decimal(quantidadeRealizadaTotal) },
              saldoValor: { decrement: new Decimal(valorRealizadoTotal) },
            },
          });

          if (linha.objetoContratual?.contratoId) {
            await tx.contrato.update({
              where: { id: linha.objetoContratual.contratoId },
              data: {
                saldoContratual: { decrement: new Decimal(valorRealizadoTotal) },
              },
            });
          }
        }

        return resultados;
      });

      const response = receitas.length === 1
        ? receitas[0]
        : this.formatReplicacaoResponse(receitas, competencias);

      return this.appendSaldoWarnings(response, alertasSaldo);
    }

    // ═══════════ MODO MANUAL ═══════════
    if (!data.valorPrevisto && data.valorPrevisto !== 0) {
      throw new ConflictException('Informe valorPrevisto para receita manual ou linhaContratualId para receita via contrato');
    }

    const tipoReceita = data.tipoReceita || 'Manual';
    const valorPrevistoManual = Number(data.valorPrevisto);
    const valorRealizadoManual = Number(data.valorRealizado || 0);
    const justificativa = this.normalizeJustificativa(data.justificativa);

    this.validateJustificativaReceita(valorPrevistoManual, valorRealizadoManual, justificativa);

    await this.ensureReceitaNaoDuplicada(
      data.projectId,
      { tipoReceita, linhaContratualId: null },
      competencias,
      (periodos) => `Receita de tipo '${tipoReceita}' já existe para este projeto nos períodos: ${periodos}`,
    );

    const receitas = await this.prisma.$transaction(async (tx) => {
      const resultados: any[] = [];

      for (const competencia of competencias) {
        const inactive = await tx.receitaMensal.findFirst({
          where: {
            projectId: data.projectId,
            tipoReceita,
            mes: competencia.mes,
            ano: competencia.ano,
            linhaContratualId: null,
            ativo: false,
          },
        });

        const receitaData = {
          projectId: data.projectId,
          tipoReceita,
          descricao: data.descricao,
          mes: competencia.mes,
          ano: competencia.ano,
          valorPlanejado: new Decimal(valorPrevistoManual),
          valorPrevisto: new Decimal(valorPrevistoManual),
          valorRealizado: new Decimal(valorRealizadoManual),
          justificativa,
          ativo: true,
        };

        if (inactive) {
          resultados.push(
            await tx.receitaMensal.update({
              where: { id: inactive.id },
              data: receitaData,
              include: this.receitaInclude,
            }),
          );
          continue;
        }

        resultados.push(
          await tx.receitaMensal.create({
            data: receitaData,
            include: this.receitaInclude,
          }),
        );
      }

      return resultados;
    });

    return receitas.length === 1
      ? receitas[0]
      : this.formatReplicacaoResponse(receitas, competencias);
  }

  /**
   * Atualizar receita — US4: Atualização Dinâmica
   * Se quantidade é alterada e há linha contratual → recalcula valorPrevisto
   */
  async updateReceita(id: string, data: any) {
    const receita = await this.prisma.receitaMensal.findUnique({
      where: { id },
      include: {
        linhaContratual: {
          include: {
            objetoContratual: {
              select: { contratoId: true },
            },
          },
        },
      },
    });
    if (!receita) throw new NotFoundException(`Receita ${id} não encontrada`);

    const updateData: any = {};

    // Se é receita vinculada a contrato
    if (receita.linhaContratualId && receita.linhaContratual) {
      if (data.quantidade !== undefined) {
        const novaQtd = Number(data.quantidade);
        const valorUnit = Number(receita.linhaContratual.valorUnitario);
        updateData.quantidade = new Decimal(novaQtd);
        updateData.valorPrevisto = new Decimal(Math.round(novaQtd * valorUnit * 100) / 100);
        updateData.valorUnitario = new Decimal(valorUnit);
      }
      if (data.quantidadeRealizada !== undefined) {
        const novaQtdReal = Number(data.quantidadeRealizada);
        const valorUnit = Number(receita.linhaContratual.valorUnitario);
        updateData.quantidadeRealizada = new Decimal(novaQtdReal);
        updateData.valorRealizado = new Decimal(Math.round(novaQtdReal * valorUnit * 100) / 100);
      } else if (data.valorRealizado !== undefined) {
        updateData.valorRealizado = new Decimal(data.valorRealizado);
      }
      if (data.descricao !== undefined) {
        updateData.descricao = data.descricao;
      }
    } else {
      if (data.valorPrevisto !== undefined) updateData.valorPrevisto = new Decimal(data.valorPrevisto);
      if (data.valorRealizado !== undefined) updateData.valorRealizado = new Decimal(data.valorRealizado);
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.tipoReceita !== undefined) updateData.tipoReceita = data.tipoReceita;

      if (data.linhaContratualId) {
        const linha = await this.prisma.linhaContratual.findUnique({
          where: { id: data.linhaContratualId },
          include: { objetoContratual: true },
        });
        if (linha) {
          const hasQuantidade =
            data.quantidade !== undefined && data.quantidade !== null && data.quantidade !== '';
          const qtd = hasQuantidade ? Number(data.quantidade) : 0;
          const vUnit = Number(linha.valorUnitario);
          updateData.linhaContratualId = data.linhaContratualId;
          updateData.objetoContratualId = data.objetoContratualId || linha.objetoContratualId;
          updateData.unidade = linha.unidade;
          updateData.valorUnitario = new Decimal(vUnit);
          updateData.quantidade = new Decimal(qtd);
          updateData.valorPrevisto = new Decimal(Math.round(qtd * vUnit * 100) / 100);
        }
      }
    }

    const valorPrevistoFinal = Number(updateData.valorPrevisto ?? receita.valorPrevisto ?? 0);
    const valorRealizadoFinal = Number(updateData.valorRealizado ?? receita.valorRealizado ?? 0);

    if (data.justificativa !== undefined) {
      updateData.justificativa = this.normalizeJustificativa(data.justificativa);
    }

    const justificativaFinal =
      updateData.justificativa !== undefined
        ? updateData.justificativa
        : this.normalizeJustificativa((receita as any).justificativa);

    this.validateJustificativaReceita(valorPrevistoFinal, valorRealizadoFinal, justificativaFinal);

    // Ajuste incremental de saldo: aplica apenas a diferença entre o valor/qtd realizado anterior e o novo.
    if (receita.linhaContratualId && receita.linhaContratual) {
      const linhaId = receita.linhaContratualId;
      const linhaContratual = receita.linhaContratual;
      const qtdRealAnterior = Number(receita.quantidadeRealizada || 0);
      const qtdRealNova = Number(updateData.quantidadeRealizada ?? receita.quantidadeRealizada ?? 0);
      const valorRealAnterior = Number(receita.valorRealizado || 0);
      const valorRealNovo = Number(updateData.valorRealizado ?? receita.valorRealizado ?? 0);

      const deltaQtd = Math.round((qtdRealNova - qtdRealAnterior) * 100) / 100;
      const deltaValor = Math.round((valorRealNovo - valorRealAnterior) * 100) / 100;

      const alertasSaldo: string[] = [];

      if (deltaQtd > 0) {
        const saldoQtdAtual = Number(receita.linhaContratual.saldoQuantidade || 0);
        if (deltaQtd > saldoQtdAtual) {
          alertasSaldo.push(
            `Quantidade realizada adicional (${deltaQtd}) excede o saldo disponível (${saldoQtdAtual}) da linha contratual. A receita foi atualizada mesmo assim.`,
          );
        }
      }

      if (deltaValor > 0) {
        const saldoValorAtual = Number(receita.linhaContratual.saldoValor || 0);
        if (deltaValor > saldoValorAtual) {
          alertasSaldo.push(
            `Valor realizado adicional (${deltaValor}) excede o saldo disponível (${saldoValorAtual}) da linha contratual. A receita foi atualizada mesmo assim.`,
          );
        }
      }

      const receitaAtualizada = await this.prisma.$transaction(async (tx) => {
        const receitaAtualizada = await tx.receitaMensal.update({
          where: { id },
          data: updateData,
          include: this.receitaInclude,
        });

        if (deltaQtd !== 0 || deltaValor !== 0) {
          const linhaData: any = {};
          if (deltaQtd > 0) linhaData.saldoQuantidade = { decrement: new Decimal(deltaQtd) };
          if (deltaQtd < 0) linhaData.saldoQuantidade = { increment: new Decimal(Math.abs(deltaQtd)) };
          if (deltaValor > 0) linhaData.saldoValor = { decrement: new Decimal(deltaValor) };
          if (deltaValor < 0) linhaData.saldoValor = { increment: new Decimal(Math.abs(deltaValor)) };

          await tx.linhaContratual.update({
            where: { id: linhaId },
            data: linhaData,
          });

          const contratoId = linhaContratual.objetoContratual?.contratoId;
          if (contratoId && deltaValor !== 0) {
            await tx.contrato.update({
              where: { id: contratoId },
              data: {
                saldoContratual:
                  deltaValor > 0
                    ? { decrement: new Decimal(deltaValor) }
                    : { increment: new Decimal(Math.abs(deltaValor)) },
              },
            });
          }
        }

        return receitaAtualizada;
      });

      return this.appendSaldoWarnings(receitaAtualizada, alertasSaldo);
    }

    return this.prisma.receitaMensal.update({
      where: { id },
      data: updateData,
      include: this.receitaInclude,
    });
  }

  async deleteReceita(id: string) {
    const receita = await this.prisma.receitaMensal.findUnique({
      where: { id },
      include: {
        linhaContratual: {
          include: {
            objetoContratual: {
              select: { contratoId: true },
            },
          },
        },
      },
    });
    if (!receita) throw new NotFoundException(`Receita ${id} não encontrada`);

    if (!receita.ativo) {
      return receita;
    }

    return this.prisma.$transaction(async (tx) => {
      const receitaInativada = await tx.receitaMensal.update({
        where: { id },
        data: { ativo: false },
      });

      if (receita.linhaContratualId && receita.linhaContratual) {
        const linhaId = receita.linhaContratualId;
        const linhaContratual = receita.linhaContratual;
        const qtdRealizada = Number(receita.quantidadeRealizada || 0);
        const valorRealizado = Number(receita.valorRealizado || 0);

        if (qtdRealizada > 0 || valorRealizado > 0) {
          await tx.linhaContratual.update({
            where: { id: linhaId },
            data: {
              ...(qtdRealizada > 0 ? { saldoQuantidade: { increment: new Decimal(qtdRealizada) } } : {}),
              ...(valorRealizado > 0 ? { saldoValor: { increment: new Decimal(valorRealizado) } } : {}),
            },
          });

          const contratoId = linhaContratual.objetoContratual?.contratoId;
          if (contratoId && valorRealizado > 0) {
            await tx.contrato.update({
              where: { id: contratoId },
              data: {
                saldoContratual: { increment: new Decimal(valorRealizado) },
              },
            });
          }
        }
      }

      return receitaInativada;
    });
  }

  // ===================== IMPORTAÇÃO VIA EXCEL =====================

  /**
   * Gera template Excel para importação de despesas
   * @returns Buffer do arquivo Excel com headers e exemplos
   */
  gerarTemplateDespesas(): Buffer {
    return ExcelParser.generateTemplate();
  }

  /**
   * Gera template Excel para importação de receitas
   * @returns Buffer do arquivo Excel com headers e exemplos
   */
  async gerarTemplateReceitas(projectId?: string): Promise<Buffer> {
    if (!projectId) {
      return ExcelReceitasParser.generateTemplate();
    }

    const projeto = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        codigo: true,
        nome: true,
        contrato: {
          select: {
            objetos: {
              where: { ativo: true },
              select: {
                id: true,
                nome: true,
                linhasContratuais: {
                  where: { ativo: true },
                  select: {
                    id: true,
                    descricaoItem: true,
                    unidade: true,
                    valorUnitario: true,
                  },
                  orderBy: { descricaoItem: 'asc' },
                },
              },
              orderBy: { nome: 'asc' },
            },
          },
        },
      },
    });

    if (!projeto) {
      throw new NotFoundException(`Projeto '${projectId}' não encontrado`);
    }

    const linhasTemplate = projeto.contrato.objetos.flatMap((objeto) =>
      objeto.linhasContratuais.map((linha) => ({
        objetoContratualId: objeto.id,
        objetoNome: objeto.nome,
        linhaContratualId: linha.id,
        linhaDescricao: linha.descricaoItem,
        unidade: linha.unidade,
        valorUnitario: Number(linha.valorUnitario || 0),
      })),
    );

    return ExcelReceitasParser.generateTemplate({
      projectId: projeto.id,
      projectCodigo: projeto.codigo,
      projectNome: projeto.nome,
      ano: new Date().getFullYear(),
      linhas: linhasTemplate,
    });
  }

  /**
   * Importa despesas via arquivo Excel (upload)
   * @param buffer - Buffer do arquivo Excel uploadado
   * @param filename - Nome do arquivo original
   * @param userId - ID do usuário que está realizando a importação
   * @returns Resultado da importação com sucessos, erros e avisos
   */
  async importarDespesasViaExcel(
    buffer: Buffer,
    filename: string,
    userId?: string,
  ) {
    // 1. Parse do arquivo Excel com validações
    const parseResult = ExcelParser.parseExcel(buffer, filename);

    // 2. Verifica se há itens para processar
    if (parseResult.items.length === 0 && parseResult.errors.length > 0) {
      throw new BadRequestException({
        codigo: 'E010',
        mensagem: 'Nenhuma linha válida encontrada no arquivo Excel',
        detalhes: parseResult.errors,
      });
    }

    // 3. Calcula taxa de erro para auditoria/alerta (não aborta se houver linhas válidas)
    const totalLinhas = parseResult.items.length + parseResult.errors.length;
    const taxaErro = parseResult.errors.length / totalLinhas;

    // 4. Se houver linhas válidas, processar usando a importação bulk existente
    let importResult: any = {
      totalProcessado: 0,
      totalSucesso: 0,
      totalErros: 0,
      totalAvisos: 0,
      detalhes: [],
    };

    if (parseResult.items.length > 0) {
      importResult = await this.importarDespesasEmLote(
        {
          items: parseResult.items,
          descricaoOperacao: `Importação via Excel: ${filename}`,
        },
        userId,
      );
    }

    // 5. Merge dos resultados: erros do parse + erros da importação
    return {
      arquivo: filename,
      totalLinhasArquivo: totalLinhas,
      totalLinhasValidas: parseResult.items.length,
      totalLinhasInvalidas: parseResult.errors.length,
      importacao: {
        totalProcessado: importResult.totalProcessado,
        totalSucesso: importResult.sucessos ?? importResult.totalSucesso ?? 0,
        totalErros: importResult.erros ?? importResult.totalErros ?? 0,
        totalAvisos: importResult.avisos ?? importResult.totalAvisos ?? 0,
        detalhes: importResult.detalhes,
      },
      errosValidacao: parseResult.errors,
      avisos: parseResult.warnings,
      mensagem:
        parseResult.errors.length === 0
          ? 'Importação concluída com sucesso'
          : `Importação parcial: ${parseResult.errors.length} linha(s) ignorada(s) por erro de validação`,
      diagnostico: {
        totalLinhas,
        linhasComErro: parseResult.errors.length,
        taxaErro: `${(taxaErro * 100).toFixed(1)}%`,
      },
    };
  }

  /**
   * Importa receitas (manuais e via contrato) via arquivo Excel (upload)
   * @param buffer - Buffer do arquivo Excel uploadado
   * @param filename - Nome do arquivo original
   * @param userId - ID do usuário que está realizando a importação
   * @returns Resultado da importação com sucessos, erros e avisos
   */
  async importarReceitasViaExcel(
    buffer: Buffer,
    filename: string,
    userId?: string,
  ) {
    const parseResult = ExcelReceitasParser.parseExcel(buffer, filename);

    if (parseResult.items.length === 0 && parseResult.errors.length > 0) {
      throw new BadRequestException({
        codigo: 'E010',
        mensagem: 'Nenhuma linha válida encontrada no arquivo Excel',
        detalhes: parseResult.errors,
      });
    }

    const totalLinhas = parseResult.items.length + parseResult.errors.length;
    const taxaErro = totalLinhas > 0 ? parseResult.errors.length / totalLinhas : 0;

    const projetosValidados = new Map<string, string | null>();
    const detalhes: Array<{
      indice: number;
      status: string;
      mensagem: string;
      entityId?: string;
    }> = [];
    const receitasCriadas: any[] = [];
    let sucessos = 0;
    let erros = 0;

    for (const item of parseResult.items) {
      const resultado: { indice: number; status: string; mensagem: string; entityId?: string } = {
        indice: item.linha,
        status: 'SUCESSO',
        mensagem: '',
      };

      try {
        const projectRef = item.projectId.trim();

        if (!projetosValidados.has(projectRef)) {
          const projectById = await this.prisma.project.findUnique({
            where: { id: projectRef },
            select: { id: true },
          });

          if (projectById) {
            projetosValidados.set(projectRef, projectById.id);
          } else {
            const projectByCode = await this.prisma.project.findUnique({
              where: { codigo: projectRef },
              select: { id: true },
            });
            projetosValidados.set(projectRef, projectByCode?.id ?? null);
          }
        }

        const resolvedProjectId = projetosValidados.get(projectRef);
        if (!resolvedProjectId) {
          resultado.status = 'ERRO';
          resultado.mensagem = `Projeto '${projectRef}' não encontrado (ID ou código)`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        const payload: any = {
          projectId: resolvedProjectId,
          tipoReceita: item.tipoReceita,
          descricao: item.descricao,
          valorRealizado: item.valorRealizado,
          justificativa: item.justificativa,
          mes: item.mes,
          ano: item.ano,
          mesesAdicionais: item.mesesAdicionais,
        };

        if (item.modo === 'manual') {
          payload.valorPrevisto = item.valorPrevisto;
        }

        if (item.modo === 'contrato') {
          payload.objetoContratualId = item.objetoContratualId;
          payload.linhaContratualId = item.linhaContratualId;
          payload.quantidade = item.quantidade;
          if (item.quantidadeRealizada !== undefined) {
            payload.quantidadeRealizada = item.quantidadeRealizada;
          }
        }

        const created = await this.createReceita(payload);

        if (Array.isArray(created?.items)) {
          receitasCriadas.push(...created.items);
          resultado.entityId = created.items[0]?.id;
          resultado.mensagem = `${created.items.length} receita(s) criada(s) com sucesso`;
        } else {
          receitasCriadas.push(created);
          resultado.entityId = created?.id;
          resultado.mensagem = 'Receita criada com sucesso';
        }

        sucessos++;
      } catch (error: any) {
        resultado.status = 'ERRO';
        resultado.mensagem = `Erro ao importar linha: ${error?.message || 'Erro inesperado'}`;
        erros++;
      }

      detalhes.push(resultado);
    }

    if (userId) {
      try {
        await this.prisma.historicoCalculo.create({
          data: {
            projectId: parseResult.items[0]?.projectId || 'bulk',
            tipo: 'bulk_import_receitas_excel',
            dadosAntes: {},
            dadosDepois: {
              totalProcessado: parseResult.items.length,
              sucessos,
              erros,
              descricao: `Importação de receitas via Excel: ${filename}`,
            },
            criadoPor: userId,
          },
        });
      } catch {
        // Log silencioso - não impede a operação
      }
    }

    return {
      arquivo: filename,
      totalLinhasArquivo: totalLinhas,
      totalLinhasValidas: parseResult.items.length,
      totalLinhasInvalidas: parseResult.errors.length,
      importacao: {
        totalProcessado: parseResult.items.length,
        totalSucesso: sucessos,
        totalErros: erros,
        totalAvisos: parseResult.warnings.length,
        detalhes,
      },
      receitasCriadas,
      errosValidacao: parseResult.errors,
      avisos: parseResult.warnings,
      mensagem:
        parseResult.errors.length === 0 && erros === 0
          ? 'Importação de receitas concluída com sucesso'
          : 'Importação parcial: verifique os erros de validação/processamento',
      diagnostico: {
        totalLinhas,
        linhasComErro: parseResult.errors.length + erros,
        taxaErro: `${(taxaErro * 100).toFixed(1)}%`,
      },
    };
  }

  // ===================== TIPO DE DESPESA =====================

  async findTiposDespesa(apenasAtivos?: boolean) {
    const where = apenasAtivos ? { ativo: true } : {};
    return this.prisma.tipoDespesa.findMany({ where, orderBy: { nome: 'asc' } });
  }

  async createTipoDespesa(dto: CreateTipoDespesaDto) {
    const exists = await this.prisma.tipoDespesa.findUnique({ where: { nome: dto.nome } });
    if (exists) throw new ConflictException(`Tipo de despesa "${dto.nome}" já existe.`);
    return this.prisma.tipoDespesa.create({ data: dto });
  }

  async updateTipoDespesa(id: string, dto: UpdateTipoDespesaDto) {
    const tipo = await this.prisma.tipoDespesa.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de despesa não encontrado.');
    if (dto.nome && dto.nome !== tipo.nome) {
      const dup = await this.prisma.tipoDespesa.findUnique({ where: { nome: dto.nome } });
      if (dup) throw new ConflictException(`Tipo de despesa "${dto.nome}" já existe.`);
    }
    return this.prisma.tipoDespesa.update({ where: { id }, data: dto });
  }

  async deleteTipoDespesa(id: string) {
    const tipo = await this.prisma.tipoDespesa.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de despesa não encontrado.');
    return this.prisma.tipoDespesa.delete({ where: { id } });
  }

  // ===================== FORNECEDOR =====================

  async findFornecedores(search?: string) {
    const where: Prisma.FornecedorWhereInput = {};
    if (search) {
      where.OR = [
        { cnpj: { contains: search } },
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { nomeFantasia: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.fornecedor.findMany({ where, orderBy: { razaoSocial: 'asc' } });
  }

  async findFornecedorById(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({ where: { id } });
    if (!fornecedor) throw new NotFoundException('Fornecedor não encontrado.');
    return fornecedor;
  }

  async createFornecedor(dto: CreateFornecedorDto) {
    const exists = await this.prisma.fornecedor.findUnique({ where: { cnpj: dto.cnpj } });
    if (exists) throw new ConflictException(`CNPJ ${dto.cnpj} já cadastrado.`);
    return this.prisma.fornecedor.create({ data: dto });
  }

  async updateFornecedor(id: string, dto: UpdateFornecedorDto) {
    const fornecedor = await this.prisma.fornecedor.findUnique({ where: { id } });
    if (!fornecedor) throw new NotFoundException('Fornecedor não encontrado.');
    return this.prisma.fornecedor.update({ where: { id }, data: dto });
  }

  async deleteFornecedor(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({ where: { id } });
    if (!fornecedor) throw new NotFoundException('Fornecedor não encontrado.');
    return this.prisma.fornecedor.delete({ where: { id } });
  }
}

