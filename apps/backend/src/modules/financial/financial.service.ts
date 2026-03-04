import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateDespesaDto, UpdateDespesaDto, FilterDespesaDto } from './dto/despesa.dto';
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

// Alíquotas padrão por regime tributário (percentuais sobre receita bruta)
const ALIQUOTAS: Record<RegimeTributario, Record<string, number>> = {
  [RegimeTributario.LUCRO_REAL]: {
    PIS: 0.0165,
    COFINS: 0.076,
    IRPJ: 0.15,
    CSLL: 0.09,
    ISS: 0.05,
  },
  [RegimeTributario.LUCRO_PRESUMIDO]: {
    PIS: 0.0065,
    COFINS: 0.03,
    IRPJ: 0.048, // 4.8% = 8% presumido × 15% IRPJ (serviços)
    CSLL: 0.0288, // 2.88% = 32% presumido × 9% CSLL
    ISS: 0.05,
  },
  [RegimeTributario.SIMPLES_NACIONAL]: {
    // Anexo V – serviços profissionais (faixa 1 – até R$180k/ano)
    SIMPLES: 0.155,
  },
  [RegimeTributario.CPRB]: {
    CPRB: 0.045, // CPRB para TI: 4,5% sobre receita
    ISS: 0.05,
    COFINS: 0.03,
    PIS: 0.0065,
  },
};

@Injectable()
export class FinancialService {
  constructor(private readonly prisma: PrismaService) {}

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
    await this.validateProject(dto.projectId);

    const despesa = await this.prisma.despesa.create({
      data: {
        projectId: dto.projectId,
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: new Decimal(dto.valor),
        mes: dto.mes,
        ano: dto.ano,
      },
    });

    // Converte Decimal para número para o frontend
    return {
      ...despesa,
      valor: Number(despesa.valor),
    };
  }

  async updateDespesa(id: string, dto: UpdateDespesaDto) {
    await this.findDespesaById(id);

    const updateData: any = {};
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.descricao !== undefined) updateData.descricao = dto.descricao;
    if (dto.valor !== undefined) updateData.valor = new Decimal(dto.valor);
    if (dto.mes !== undefined) updateData.mes = dto.mes;
    if (dto.ano !== undefined) updateData.ano = dto.ano;

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

  async calcularImpostos(dto: CalcularImpostosDto) {
    await this.validateProject(dto.projectId);

    const aliquotas = ALIQUOTAS[dto.regime] || ALIQUOTAS[RegimeTributario.LUCRO_PRESUMIDO];
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
        // ISS pode variar de 2% a 5% dependendo do município
        iss.aliquota = 0.02;
        iss.valor = Math.round(receitaBruta * 0.02 * 100) / 100;
        totalImpostos = impostos.reduce((s, i) => s + i.valor, 0);
      }
    }

    return {
      projectId: dto.projectId,
      mes: dto.mes,
      ano: dto.ano,
      regime: dto.regime,
      receitaBruta,
      impostos,
      totalImpostos: Math.round(totalImpostos * 100) / 100,
      cargaTributaria: Math.round((totalImpostos / receitaBruta) * 10000) / 100, // %
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
    await this.validateProject(dto.projectId);

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

  // ===================== HELPERS =====================

  private async validateProject(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
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
    const projetosValidados = new Map<string, boolean>();

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

        // Criar despesa
        const despesa = await this.prisma.despesa.create({
          data: {
            projectId: item.projectId,
            tipo: item.tipo,
            descricao: item.descricao,
            valor: new Decimal(item.valor),
            mes: item.mes,
            ano: item.ano,
          },
        });

        resultado.mensagem = `Despesa tipo '${item.tipo}' criada com sucesso`;
        resultado.entityId = despesa.id;
        sucessos++;
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

      const quantidade = data.quantidade ? Number(data.quantidade) : 0;
      const valorUnitario = Number(linha.valorUnitario);
      const valorTotal = Math.round(quantidade * valorUnitario * 100) / 100;

      // Auto-preencher campos a partir da linha contratual (US1)
      const objetoContratualId = data.objetoContratualId || linha.objetoContratualId;
      const projectId = data.projectId;
      if (!projectId) throw new NotFoundException('Projeto não encontrado para esta linha contratual');
      const tipoReceita = data.tipoReceita || linha.descricaoItem;
      const descricao = data.descricao || `${linha.descricaoItem} (${linha.objetoContratual.nome})`;

      // Verificar duplicata: mesma linha no mesmo mês/ano
      const existing = await this.prisma.receitaMensal.findFirst({
        where: {
          projectId,
          linhaContratualId: data.linhaContratualId,
          mes: data.mes,
          ano: data.ano,
          ativo: true,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe receita para esta linha contratual em ${String(data.mes).padStart(2, '0')}/${data.ano}`,
        );
      }

      // Verificar se há receita inativa para reativar
      const inactive = await this.prisma.receitaMensal.findFirst({
        where: {
          projectId,
          linhaContratualId: data.linhaContratualId,
          mes: data.mes,
          ano: data.ano,
          ativo: false,
        },
      });

      if (inactive) {
        return this.prisma.receitaMensal.update({
          where: { id: inactive.id },
          data: {
            objetoContratualId,
            tipoReceita,
            descricao,
            unidade: linha.unidade,
            quantidade: new Decimal(quantidade),
            valorUnitario: new Decimal(valorUnitario),
            valorPrevisto: new Decimal(valorTotal),
            valorRealizado: data.valorRealizado ? new Decimal(data.valorRealizado) : new Decimal(0),
            ativo: true,
          },
          include: this.receitaInclude,
        });
      }

      return this.prisma.$transaction(async (tx) => {
        const receita = await tx.receitaMensal.create({
          data: {
            projectId,
            objetoContratualId,
            linhaContratualId: data.linhaContratualId,
            mes: data.mes,
            ano: data.ano,
            tipoReceita,
            descricao,
            unidade: linha.unidade,
            quantidadePlanejada: new Decimal(quantidade),
            valorUnitarioPlanejado: new Decimal(valorUnitario),
            valorPlanejado: new Decimal(valorTotal),
            quantidade: new Decimal(quantidade),
            valorUnitario: new Decimal(valorUnitario),
            valorPrevisto: new Decimal(valorTotal),
            // RN-003: Quantidade e Valor Realizado
            quantidadeRealizada: data.quantidadeRealizada ? new Decimal(data.quantidadeRealizada) : null,
            valorUnitarioRealizado: data.quantidadeRealizada ? new Decimal(valorUnitario) : null,
            valorRealizado: data.quantidadeRealizada
              ? new Decimal(Math.round(Number(data.quantidadeRealizada) * valorUnitario * 100) / 100)
              : new Decimal(data.valorRealizado || 0),
            ativo: true,
          },
          include: this.receitaInclude,
        });

        // RN-003.B/C: Deduzir saldo da linha contratual
        if (data.quantidadeRealizada && Number(data.quantidadeRealizada) > 0) {
          const qtdReal = Number(data.quantidadeRealizada);
          const vlReal = Math.round(qtdReal * valorUnitario * 100) / 100;
          await tx.linhaContratual.update({
            where: { id: data.linhaContratualId },
            data: {
              saldoQuantidade: { decrement: new Decimal(qtdReal) },
              saldoValor: { decrement: new Decimal(vlReal) },
            },
          });

          // RN-001: Deduzir saldo contratual do contrato
          if (linha.objetoContratual?.contratoId) {
            await tx.contrato.update({
              where: { id: linha.objetoContratual.contratoId },
              data: {
                saldoContratual: { decrement: new Decimal(vlReal) },
              },
            });
          }
        }

        return receita;
      });
    }

    // ═══════════ MODO MANUAL ═══════════
    if (!data.valorPrevisto && data.valorPrevisto !== 0) {
      throw new ConflictException('Informe valorPrevisto para receita manual ou linhaContratualId para receita via contrato');
    }

    const tipoReceita = data.tipoReceita || 'Manual';

    // Validar duplicata para receita manual
    const existing = await this.prisma.receitaMensal.findFirst({
      where: {
        projectId: data.projectId,
        tipoReceita,
        mes: data.mes,
        ano: data.ano,
        linhaContratualId: null,
        ativo: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Receita de tipo '${tipoReceita}' já existe para este projeto em ${String(data.mes).padStart(2, '0')}/${data.ano}`,
      );
    }

    // Buscar receita inativa para reativar
    const inactive = await this.prisma.receitaMensal.findFirst({
      where: {
        projectId: data.projectId,
        tipoReceita,
        mes: data.mes,
        ano: data.ano,
        linhaContratualId: null,
        ativo: false,
      },
    });

    if (inactive) {
      return this.prisma.receitaMensal.update({
        where: { id: inactive.id },
        data: {
          descricao: data.descricao,
          valorPrevisto: new Decimal(data.valorPrevisto),
          valorRealizado: data.valorRealizado ? new Decimal(data.valorRealizado) : new Decimal(0),
          ativo: true,
        },
        include: this.receitaInclude,
      });
    }

    return this.prisma.receitaMensal.create({
      data: {
        projectId: data.projectId,
        tipoReceita,
        descricao: data.descricao,
        mes: data.mes,
        ano: data.ano,
        valorPlanejado: new Decimal(data.valorPrevisto),
        valorPrevisto: new Decimal(data.valorPrevisto),
        valorRealizado: data.valorRealizado ? new Decimal(data.valorRealizado) : new Decimal(0),
        ativo: true,
      },
      include: this.receitaInclude,
    });
  }

  /**
   * Atualizar receita — US4: Atualização Dinâmica
   * Se quantidade é alterada e há linha contratual → recalcula valorPrevisto
   */
  async updateReceita(id: string, data: any) {
    const receita = await this.prisma.receitaMensal.findUnique({
      where: { id },
      include: { linhaContratual: true },
    });
    if (!receita) throw new NotFoundException(`Receita ${id} não encontrada`);

    const updateData: any = {};

    // Se é receita vinculada a contrato
    if (receita.linhaContratualId && receita.linhaContratual) {
      // Só permite alterar quantidade e valorRealizado (valores vêm do contrato)
      if (data.quantidade !== undefined) {
        const novaQtd = Number(data.quantidade);
        const valorUnit = Number(receita.linhaContratual.valorUnitario);
        updateData.quantidade = new Decimal(novaQtd);
        updateData.valorPrevisto = new Decimal(Math.round(novaQtd * valorUnit * 100) / 100);
        updateData.valorUnitario = new Decimal(valorUnit);
      }
      if (data.valorRealizado !== undefined) {
        updateData.valorRealizado = new Decimal(data.valorRealizado);
      }
      if (data.descricao !== undefined) {
        updateData.descricao = data.descricao;
      }
    } else {
      // Receita manual — permite alterar todos os campos
      if (data.valorPrevisto !== undefined) updateData.valorPrevisto = new Decimal(data.valorPrevisto);
      if (data.valorRealizado !== undefined) updateData.valorRealizado = new Decimal(data.valorRealizado);
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.tipoReceita !== undefined) updateData.tipoReceita = data.tipoReceita;

      // Se mudando para via contrato (vinculando a uma linha)
      if (data.linhaContratualId) {
        const linha = await this.prisma.linhaContratual.findUnique({
          where: { id: data.linhaContratualId },
          include: { objetoContratual: true },
        });
        if (linha) {
          const qtd = data.quantidade ? Number(data.quantidade) : 0;
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

    return this.prisma.receitaMensal.update({
      where: { id },
      data: updateData,
      include: this.receitaInclude,
    });
  }

  async deleteReceita(id: string) {
    const receita = await this.prisma.receitaMensal.findUnique({ where: { id } });
    if (!receita) throw new NotFoundException(`Receita ${id} não encontrada`);
    return this.prisma.receitaMensal.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
