import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { ProjectStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MargemIndicadores {
  projectId: string;
  ano: number;
  mes?: number;
  receitaBruta: number;
  custoTotal: number;
  despesaTotal: number;
  impostoTotal: number;
  margeBruta: number;
  margemBrutaPercent: number;
  margemOperacional: number;
  margemOperacionalPercent: number;
  margemLiquida: number;
  margemLiquidaPercent: number;
}

export interface FcstPoint {
  mes: number;
  ano: number;
  valorPrevisto: number;
  valorFcst: number;
  variacao: number;
  variacaoPercent: number;
}

export interface CarteiraAnalise {
  totalProjetos: number;
  projetosAtivos: number;
  projetosConcluidos: number;
  receitaBrutaTotal: number;
  receitaRealizadaTotal: number;
  percentualRealizacao: number;
  porMes: { mes: number; ano: number; previsto: number; realizado: number }[];
  porUnidade: { unitId: string; nome: string; totalPrevisto: number }[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD DE PROJETOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Lista projetos com paginação, filtros e ordenação
   */
  async findAll(filters: FilterProjectDto = {}): Promise<PaginatedResult<any>> {
    const {
      status,
      search,
      unitId,
      tipo,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'desc',
    } = filters;

    const where: Prisma.ProjectWhereInput = { ativo: true };

    if (status) where.status = status;
    if (unitId) where.unitId = unitId;
    if (tipo) where.tipo = { contains: tipo, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { cliente: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          unit: { select: { id: true, name: true, code: true } },
          _count: { select: { users: true, receitas: true } },
        },
        orderBy: { [orderBy]: order } as Prisma.ProjectOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Busca projeto por ID ou código
   */
  async findById(id: string): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id }, { codigo: id }], ativo: true },
      include: {
        unit: { select: { id: true, name: true, code: true } },
        users: {
          include: {
            user: { select: { id: true, email: true, name: true, role: true } },
          },
        },
        receitas: { orderBy: [{ ano: 'asc' as const }, { mes: 'asc' as const }] },
        _count: { select: { receitas: true, custos: true, despesas: true, impostos: true } },
      },
    });

    if (!project) throw new NotFoundException(`Projeto '${id}' não encontrado`);
    return project;
  }

  /**
   * Cria novo projeto
   */
  async create(dto: CreateProjectDto, userId: string): Promise<any> {
    const existing = await this.prisma.project.findUnique({ where: { codigo: dto.codigo } });
    if (existing) throw new ConflictException(`Código de projeto '${dto.codigo}' já existe`);

    const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
    if (!unit) throw new NotFoundException(`Unidade '${dto.unitId}' não encontrada`);

    return this.prisma.project.create({
      data: {
        codigo: dto.codigo.toUpperCase(),
        nome: dto.nome,
        cliente: dto.cliente,
        unitId: dto.unitId,
        status: dto.status ?? ProjectStatus.ATIVO,
        tipo: dto.tipo,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        descricao: dto.descricao,
        criadoPor: userId,
      },
      include: { unit: { select: { id: true, name: true, code: true } } },
    });
  }

  /**
   * Atualiza projeto
   */
  async update(id: string, dto: UpdateProjectDto): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project || !project.ativo) throw new NotFoundException(`Projeto '${id}' não encontrado`);

    if (dto.unitId) {
      const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
      if (!unit) throw new NotFoundException(`Unidade '${dto.unitId}' não encontrada`);
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      },
      include: { unit: { select: { id: true, name: true, code: true } } },
    });
  }

  /**
   * Soft delete de projeto
   */
  async delete(id: string): Promise<{ message: string; project: any }> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project || !project.ativo) throw new NotFoundException(`Projeto '${id}' não encontrado`);

    const updated = await this.prisma.project.update({
      where: { id },
      data: { ativo: false, status: ProjectStatus.ENCERRADO },
    });

    return { message: 'Projeto removido com sucesso', project: updated };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECEITAS MENSAIS
  // ─────────────────────────────────────────────────────────────────────────────

  async findReceitas(projectId: string, ano?: number): Promise<any[]> {
    await this._assertProjectExists(projectId);
    return this.prisma.receitaMensal.findMany({
      where: { projectId, ativo: true, ...(ano ? { ano } : {}) },
      orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
    });
  }

  async createReceita(projectId: string, dto: CreateReceitaDto): Promise<any> {
    await this._assertProjectExists(projectId);

    const existing = await this.prisma.receitaMensal.findUnique({
      where: {
        projectId_mes_ano_tipoReceita: {
          projectId,
          mes: dto.mes,
          ano: dto.ano,
          tipoReceita: dto.tipoReceita,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Já existe receita do tipo '${dto.tipoReceita}' para ${dto.mes}/${dto.ano} neste projeto`,
      );
    }

    return this.prisma.receitaMensal.create({
      data: {
        projectId,
        mes: dto.mes,
        ano: dto.ano,
        tipoReceita: dto.tipoReceita,
        descricao: dto.descricao,
        valorPrevisto: new Decimal(dto.valorPrevisto),
        valorRealizado: new Decimal(dto.valorRealizado ?? 0),
      },
    });
  }

  async updateReceita(projectId: string, receitaId: string, dto: UpdateReceitaDto): Promise<any> {
    const receita = await this.prisma.receitaMensal.findFirst({
      where: { id: receitaId, projectId },
    });
    if (!receita) throw new NotFoundException(`Receita '${receitaId}' não encontrada no projeto`);

    return this.prisma.receitaMensal.update({
      where: { id: receitaId },
      data: {
        ...dto,
        valorPrevisto: dto.valorPrevisto !== undefined ? new Decimal(dto.valorPrevisto) : undefined,
        valorRealizado:
          dto.valorRealizado !== undefined ? new Decimal(dto.valorRealizado) : undefined,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MOTOR FCST
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Gera projeção FCST baseada em regressão linear sobre o histórico
   */
  async calcularFcst(projectId: string, anoFim = 2030): Promise<FcstPoint[]> {
    await this._assertProjectExists(projectId);

    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;

    if (anoFim < anoAtual) throw new BadRequestException(`Ano final FCST deve ser >= ${anoAtual}`);
    if (anoFim > 2035) throw new BadRequestException('Ano final FCST não pode ultrapassar 2035');

    const receitas = await this.prisma.receitaMensal.findMany({
      where: { projectId, ativo: true },
      orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
    });

    const porMes = this._agruparReceitasPorMes(receitas);
    const tendencia = this._calcularTendenciaLinear(porMes);

    const resultado: FcstPoint[] = [];

    for (let ano = anoAtual; ano <= anoFim; ano++) {
      for (let mes = 1; mes <= 12; mes++) {
        if (ano === anoAtual && mes < mesAtual) continue;

        const chave = `${ano}-${String(mes).padStart(2, '0')}`;
        const realizado = porMes.get(chave);
        const idx = (ano - anoAtual) * 12 + (mes - mesAtual);
        const valorFcst = Math.max(
          0,
          tendencia.intercept + tendencia.slope * (porMes.size + idx),
        );

        const previsto = realizado?.previsto ?? 0;
        const variacao = valorFcst - previsto;
        const variacaoPercent = previsto > 0 ? (variacao / previsto) * 100 : 0;

        resultado.push({
          mes,
          ano,
          valorPrevisto: previsto,
          valorFcst: Math.round(valorFcst * 100) / 100,
          variacao: Math.round(variacao * 100) / 100,
          variacaoPercent: Math.round(variacaoPercent * 100) / 100,
        });
      }
    }

    return resultado;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MARGENS E INDICADORES
  // ─────────────────────────────────────────────────────────────────────────────

  async calcularMargens(
    projectId: string,
    ano: number,
    mes?: number,
  ): Promise<MargemIndicadores> {
    await this._assertProjectExists(projectId);

    const whereBase = { projectId, ano, ...(mes ? { mes } : {}) };

    const [receitas, custos, despesas, impostos] = await Promise.all([
      this.prisma.receitaMensal.findMany({ where: { ...whereBase, ativo: true } }),
      this.prisma.custoMensal.findMany({ where: whereBase }),
      this.prisma.despesa.findMany({ where: whereBase }),
      this.prisma.imposto.findMany({ where: whereBase }),
    ]);

    const receitaBruta = receitas.reduce(
      (acc, r) => acc + Number(r.valorRealizado || r.valorPrevisto),
      0,
    );
    const custoTotal = custos.reduce(
      (acc, c) => acc + Number(c.custoFixo) + Number(c.custoVariavel),
      0,
    );
    const despesaTotal = despesas.reduce((acc, d) => acc + Number(d.valor), 0);
    const impostoTotal = impostos.reduce((acc, i) => acc + Number(i.valor), 0);

    const margeBruta = receitaBruta - custoTotal;
    const margemOperacional = margeBruta - despesaTotal;
    const margemLiquida = margemOperacional - impostoTotal;
    const pct = (v: number) =>
      receitaBruta > 0 ? Math.round((v / receitaBruta) * 10000) / 100 : 0;

    return {
      projectId,
      ano,
      mes,
      receitaBruta: Math.round(receitaBruta * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
      despesaTotal: Math.round(despesaTotal * 100) / 100,
      impostoTotal: Math.round(impostoTotal * 100) / 100,
      margeBruta: Math.round(margeBruta * 100) / 100,
      margemBrutaPercent: pct(margeBruta),
      margemOperacional: Math.round(margemOperacional * 100) / 100,
      margemOperacionalPercent: pct(margemOperacional),
      margemLiquida: Math.round(margemLiquida * 100) / 100,
      margemLiquidaPercent: pct(margemLiquida),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CARTEIRA
  // ─────────────────────────────────────────────────────────────────────────────

  async analisarCarteira(ano?: number, unitId?: string): Promise<CarteiraAnalise> {
    const whereProject: Prisma.ProjectWhereInput = { ativo: true };
    if (unitId) whereProject.unitId = unitId;

    const [projetos, receitas] = await Promise.all([
      this.prisma.project.findMany({
        where: whereProject,
        include: { unit: { select: { id: true, name: true } } },
      }),
      this.prisma.receitaMensal.findMany({
        where: { project: whereProject, ativo: true, ...(ano ? { ano } : {}) },
        include: { project: { select: { unitId: true } } },
      }),
    ]);

    const projetosAtivos = projetos.filter((p) => p.status === ProjectStatus.ATIVO).length;
    const projetosConcluidos = projetos.filter((p) => p.status === ProjectStatus.ENCERRADO).length;
    const receitaBrutaTotal = receitas.reduce((acc, r) => acc + Number(r.valorPrevisto), 0);
    const receitaRealizadaTotal = receitas.reduce((acc, r) => acc + Number(r.valorRealizado), 0);

    const porMesMap = new Map<string, { mes: number; ano: number; previsto: number; realizado: number }>();
    for (const r of receitas) {
      const ch = `${r.ano}-${r.mes}`;
      const e = porMesMap.get(ch) ?? { mes: r.mes, ano: r.ano, previsto: 0, realizado: 0 };
      e.previsto += Number(r.valorPrevisto);
      e.realizado += Number(r.valorRealizado);
      porMesMap.set(ch, e);
    }

    const porUnidadeMap = new Map<string, { unitId: string; nome: string; totalPrevisto: number }>();
    for (const r of receitas) {
      const u = porUnidadeMap.get(r.project.unitId) ?? {
        unitId: r.project.unitId,
        nome: projetos.find((p) => p.unitId === r.project.unitId)?.unit?.name ?? r.project.unitId,
        totalPrevisto: 0,
      };
      u.totalPrevisto += Number(r.valorPrevisto);
      porUnidadeMap.set(r.project.unitId, u);
    }

    return {
      totalProjetos: projetos.length,
      projetosAtivos,
      projetosConcluidos,
      receitaBrutaTotal: Math.round(receitaBrutaTotal * 100) / 100,
      receitaRealizadaTotal: Math.round(receitaRealizadaTotal * 100) / 100,
      percentualRealizacao:
        receitaBrutaTotal > 0
          ? Math.round((receitaRealizadaTotal / receitaBrutaTotal) * 10000) / 100
          : 0,
      porMes: Array.from(porMesMap.values()).sort(
        (a, b) => a.ano * 100 + a.mes - (b.ano * 100 + b.mes),
      ),
      porUnidade: Array.from(porUnidadeMap.values()),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSOLIDAÇÃO PREVISTO vs. REALIZADO
  // ─────────────────────────────────────────────────────────────────────────────

  async consolidar(projectId: string, ano: number): Promise<any[]> {
    await this._assertProjectExists(projectId);

    const receitas = await this.prisma.receitaMensal.findMany({
      where: { projectId, ano, ativo: true },
      orderBy: [{ mes: 'asc' }],
    });

    return Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const rm = receitas.filter((r) => r.mes === mes);
      const previsto = rm.reduce((a, r) => a + Number(r.valorPrevisto), 0);
      const realizado = rm.reduce((a, r) => a + Number(r.valorRealizado), 0);
      const desvio = realizado - previsto;
      const desvioPercent = previsto > 0 ? (desvio / previsto) * 100 : 0;
      return {
        mes,
        ano,
        previsto: Math.round(previsto * 100) / 100,
        realizado: Math.round(realizado * 100) / 100,
        desvio: Math.round(desvio * 100) / 100,
        desvioPercent: Math.round(desvioPercent * 100) / 100,
        status: desvio >= 0 ? 'acima' : 'abaixo',
      };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // IMPORTAÇÃO EM LOTE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Importa múltiplos projetos em lote com validação individual
   */
  async importarEmLote(
    projetos: any[],
    userId: string,
    descricaoOperacao?: string,
  ): Promise<{
    totalProcessado: number;
    sucessos: number;
    erros: number;
    avisos: number;
    detalhes: any[];
  }> {
    const detalhes: any[] = [];
    let sucessos = 0;
    let erros = 0;
    let avisos = 0;

    for (const item of projetos) {
      const resultado: { codigo: string; status: string; mensagem: string; projetoId?: string } = {
        codigo: item.codigo || 'SEM_CODIGO',
        status: 'sucesso',
        mensagem: '',
        projetoId: undefined,
      };

      try {
        // Validar campos obrigatórios
        if (!item.codigo?.trim()) {
          resultado.status = 'erro';
          resultado.mensagem = 'Código é obrigatório';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        if (!item.nome?.trim()) {
          resultado.status = 'erro';
          resultado.mensagem = 'Nome é obrigatório';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        if (!item.unitId?.trim()) {
          resultado.status = 'erro';
          resultado.mensagem = 'unitId é obrigatório';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Verificar se unidade existe
        const unit = await this.prisma.unit.findUnique({ where: { id: item.unitId } });
        if (!unit) {
          resultado.status = 'erro';
          resultado.mensagem = `Unidade '${item.unitId}' não encontrada`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Verificar duplicação de código
        const existing = await this.prisma.project.findFirst({
          where: { codigo: item.codigo.toUpperCase(), ativo: true },
        });

        if (existing) {
          resultado.status = 'aviso';
          resultado.mensagem = `Projeto com código '${item.codigo}' já existe (ID: ${existing.id})`;
          resultado.projetoId = existing.id;
          avisos++;
          detalhes.push(resultado);
          continue;
        }

        // Criar projeto
        const projeto = await this.prisma.project.create({
          data: {
            codigo: item.codigo.toUpperCase(),
            nome: item.nome,
            cliente: item.cliente,
            unitId: item.unitId,
            status: item.status || ProjectStatus.ATIVO,
            tipo: item.tipo || 'padrão',
            dataInicio: new Date(item.dataInicio),
            dataFim: item.dataFim ? new Date(item.dataFim) : null,
            descricao: item.descricao || null,
            criadoPor: userId,
          },
        });

        resultado.mensagem = 'Projeto importado com sucesso';
        resultado.projetoId = projeto.id;
        sucessos++;
        detalhes.push(resultado);

        // Log de auditoria
        await this.prisma.historicoCalculo.create({
          data: {
            projectId: projeto.id,
            tipo: 'IMPORTACAO_LOTE',
            criadoPor: userId,
            dadosAntes: JSON.stringify({}),
            dadosDepois: JSON.stringify({
              operacao: 'importacao',
              descricao: descricaoOperacao,
            }),
          },
        });
      } catch (error) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros++;
        detalhes.push(resultado);
      }
    }

    return {
      totalProcessado: projetos.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private async _assertProjectExists(projectId: string): Promise<void> {
    const p = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!p || !p.ativo) throw new NotFoundException(`Projeto '${projectId}' não encontrado`);
  }

  private _agruparReceitasPorMes(
    receitas: any[],
  ): Map<string, { previsto: number; realizado: number }> {
    const m = new Map<string, { previsto: number; realizado: number }>();
    for (const r of receitas) {
      const ch = `${r.ano}-${String(r.mes).padStart(2, '0')}`;
      const e = m.get(ch) ?? { previsto: 0, realizado: 0 };
      e.previsto += Number(r.valorPrevisto);
      e.realizado += Number(r.valorRealizado);
      m.set(ch, e);
    }
    return m;
  }

  private _calcularTendenciaLinear(
    porMes: Map<string, { previsto: number; realizado: number }>,
  ): { slope: number; intercept: number } {
    const vals = Array.from(porMes.values()).map((v) => v.realizado || v.previsto);
    const n = vals.length;
    if (n === 0) return { slope: 0, intercept: 0 };
    if (n === 1) return { slope: 0, intercept: vals[0] };

    const sumX = (n * (n - 1)) / 2;
    const sumY = vals.reduce((a, b) => a + b, 0);
    const sumXY = vals.reduce((acc, y, i) => acc + i * y, 0);
    const sumX2 = vals.reduce((acc, _, i) => acc + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
  }
}
