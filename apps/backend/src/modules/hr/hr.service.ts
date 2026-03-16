import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';
import { CreateJornadaDto, UpdateJornadaDto, BulkJornadaDto } from './dto/jornada.dto';
import { CreateFeriasDto, UpdateFeriasDto } from './dto/ferias.dto';
import { CreateDesligamentoDto } from './dto/desligamento.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as xlsx from 'xlsx';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  // ===================== COLABORADORES =====================

  async findAll(filters: FilterColaboradorDto) {
    const {
      search,
      status,
      estado,
      cidade,
      cargo,
      sindicatoId,
      page = 1,
      limit = 20,
      orderBy = 'nome',
      order = 'asc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = { ativo: true };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { matricula: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (estado) where.estado = { contains: estado, mode: 'insensitive' };
    if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' };
    if (cargo) where.cargo = { contains: cargo, mode: 'insensitive' };
    if (sindicatoId) where.sindicatoId = sindicatoId;

    const allowedOrderBy = ['nome', 'matricula', 'cargo', 'dataAdmissao', 'taxaHora', 'createdAt'];
    const sortBy = allowedOrderBy.includes(orderBy) ? orderBy : 'nome';

    const [data, total] = await this.prisma.$transaction([
      this.prisma.colaborador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          sindicato: { select: { id: true, nome: true, regiao: true } },
          project: { select: { id: true, nome: true, codigo: true } },
          _count: { select: { jornadas: true, ferias: true, custos: true } },
        },
      }),
      this.prisma.colaborador.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const colaborador = await this.prisma.colaborador.findFirst({
      where: {
        OR: [{ id }, { matricula: id }],
        ativo: true,
      },
      include: {
        sindicato: true,
        project: { select: { id: true, nome: true, codigo: true } },
        jornadas: {
          orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
          take: 12,
        },
        ferias: {
          orderBy: { dataInicio: 'desc' },
          take: 5,
        },
        desligamento: true,
        custos: {
          orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
          take: 12,
        },
        _count: true,
      },
    });

    if (!colaborador) {
      throw new NotFoundException(`Colaborador '${id}' não encontrado`);
    }

    return colaborador;
  }

  async create(dto: CreateColaboradorDto) {
    const exists = await this.prisma.colaborador.findFirst({
      where: {
        OR: [
          { matricula: dto.matricula },
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      },
    });

    if (exists) {
      throw new ConflictException(
        exists.matricula === dto.matricula
          ? `Matrícula '${dto.matricula}' já cadastrada`
          : `Email '${dto.email}' já cadastrado`,
      );
    }

    if (dto.sindicatoId) {
      const sindicato = await this.prisma.sindicato.findUnique({
        where: { id: dto.sindicatoId },
      });
      if (!sindicato) {
        throw new NotFoundException(`Sindicato '${dto.sindicatoId}' não encontrado`);
      }
    }

    // RN-004: Validar vínculo com projeto
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Projeto '${dto.projectId}' não encontrado`);
      }
    }

    return this.prisma.colaborador.create({
      data: {
        ...dto,
        taxaHora: new Decimal(dto.taxaHora),
        dataAdmissao: new Date(dto.dataAdmissao),
        status: dto.status || UserStatus.ATIVO,
      },
      include: {
        sindicato: { select: { id: true, nome: true } },
        project: { select: { id: true, nome: true, codigo: true } },
      },
    });
  }

  async update(id: string, dto: UpdateColaboradorDto) {
    const colaborador = await this.findById(id);

    if (dto.sindicatoId) {
      const sindicato = await this.prisma.sindicato.findUnique({
        where: { id: dto.sindicatoId },
      });
      if (!sindicato) {
        throw new NotFoundException(`Sindicato '${dto.sindicatoId}' não encontrado`);
      }
    }

    // RN-004: Validar vínculo com projeto
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Projeto '${dto.projectId}' não encontrado`);
      }
    }

    const updateData: any = { ...dto };
    if (dto.taxaHora !== undefined) updateData.taxaHora = new Decimal(dto.taxaHora);

    return this.prisma.colaborador.update({
      where: { id: colaborador.id },
      data: updateData,
      include: {
        sindicato: { select: { id: true, nome: true } },
        project: { select: { id: true, nome: true, codigo: true } },
      },
    });
  }

  async delete(id: string) {
    const colaborador = await this.findById(id);
    return this.prisma.colaborador.update({
      where: { id: colaborador.id },
      data: { ativo: false, status: UserStatus.INATIVO },
    });
  }

  // ===================== TEMPLATE / IMPORTAÇÃO =====================

  gerarTemplateExcel(): Buffer {
    const headers = [
      'matricula', 'nome', 'email', 'cargo', 'classe',
      'taxaHora', 'cargaHoraria', 'cidade', 'estado',
      'sindicatoId', 'projectId', 'dataAdmissao', 'tipoContratacao',
    ];
    const exemplo = [
      '0001', 'João da Silva', 'joao@email.com', 'Analista', 'Pleno',
      '85.00', '168', 'Brasília', 'DF',
      '', 'ID_DO_PROJETO', '2025-01-15', 'CL',
    ];
    const ws = xlsx.utils.aoa_to_sheet([headers, exemplo]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Colaboradores');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  async importarExcel(fileBuffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException('Planilha inválida: nenhuma aba encontrada');
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    if (rows.length === 0) {
      throw new BadRequestException('Planilha vazia. Informe ao menos uma linha de colaborador.');
    }

    const normalizeKey = (key: string) =>
      String(key || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const toDecimalNumber = (value: unknown): number => {
      const raw = String(value ?? '').trim().replace(',', '.');
      return Number(raw);
    };

    const toIsoDate = (value: unknown): string => {
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      if (typeof value === 'number') {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + value * 86400000);
        return jsDate.toISOString().slice(0, 10);
      }
      const parsed = new Date(String(value || '').trim());
      if (isNaN(parsed.getTime())) return '';
      return parsed.toISOString().slice(0, 10);
    };

    const requiredFields = ['matricula', 'nome', 'cargo', 'taxahora', 'cargahoraria', 'cidade', 'estado', 'dataadmissao', 'projectid'];
    const firstRowKeys = Object.keys(rows[0] || {}).map(normalizeKey);
    for (const field of requiredFields) {
      if (!firstRowKeys.includes(field)) {
        throw new BadRequestException(`Campo obrigatório ausente na planilha: ${field}`);
      }
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const normalized: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        normalized[normalizeKey(k)] = v;
      }

      try {
        const dto: CreateColaboradorDto = {
          matricula: String(normalized['matricula'] || '').trim(),
          nome: String(normalized['nome'] || '').trim(),
          email: String(normalized['email'] || '').trim() || undefined,
          cargo: String(normalized['cargo'] || '').trim(),
          classe: String(normalized['classe'] || '').trim() || undefined,
          taxaHora: toDecimalNumber(normalized['taxahora']),
          cargaHoraria: Number(normalized['cargahoraria']),
          cidade: String(normalized['cidade'] || '').trim(),
          estado: String(normalized['estado'] || '').trim().toUpperCase(),
          sindicatoId: String(normalized['sindicatoid'] || '').trim() || undefined,
          projectId: String(normalized['projectid'] || '').trim(),
          dataAdmissao: toIsoDate(normalized['dataadmissao']),
          tipoContratacao: (String(normalized['tipocontratacao'] || '').trim().toUpperCase() as any) || undefined,
        };

        if (!dto.matricula || !dto.nome || !dto.cargo || !dto.projectId || !dto.dataAdmissao) {
          errors.push(`Linha ${i + 2}: campos obrigatórios ausentes`);
          continue;
        }

        if (!Number.isFinite(dto.taxaHora) || dto.taxaHora <= 0 || !Number.isFinite(dto.cargaHoraria) || dto.cargaHoraria <= 0) {
          errors.push(`Linha ${i + 2}: taxaHora/cargaHoraria inválidas`);
          continue;
        }

        const exists = await this.prisma.colaborador.findUnique({ where: { matricula: dto.matricula } });
        if (exists) {
          errors.push(`Linha ${i + 2}: matrícula '${dto.matricula}' já existe`);
          continue;
        }

        await this.create(dto);
        imported++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Linha ${i + 2}: ${msg}`);
      }
    }

    return { imported, errors };
  }

  async importarCSV(csvContent: string): Promise<{ imported: number; errors: string[] }> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException('CSV deve conter header e ao menos uma linha de dados');
    }

    const header = lines[0].split(';').map(h => h.trim().toLowerCase());
    const requiredFields = ['matricula', 'nome', 'cargo', 'taxahora', 'cargahoraria', 'cidade', 'estado', 'dataadmissao'];

    for (const field of requiredFields) {
      if (!header.includes(field)) {
        throw new BadRequestException(`Campo obrigatório ausente no CSV: ${field}`);
      }
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(';').map(v => v.trim());
      const row: Record<string, string> = {};
      header.forEach((h, idx) => (row[h] = values[idx] || ''));

      try {
        const dto: CreateColaboradorDto = {
          matricula: row['matricula'],
          nome: row['nome'],
          email: row['email'] || undefined,
          cargo: row['cargo'],
          classe: row['classe'] || undefined,
          taxaHora: parseFloat(row['taxahora'].replace(',', '.')),
          cargaHoraria: parseInt(row['cargahoraria'], 10),
          cidade: row['cidade'],
          estado: row['estado'],
          sindicatoId: row['sindicatoid'] || undefined,
          projectId: row['projectid'] || '',
          dataAdmissao: row['dataadmissao'],
        };

        const exists = await this.prisma.colaborador.findUnique({
          where: { matricula: dto.matricula },
        });

        if (exists) {
          errors.push(`Linha ${i + 1}: matrícula '${dto.matricula}' já existe`);
          continue;
        }

        await this.prisma.colaborador.create({
          data: {
            ...dto,
            taxaHora: new Decimal(dto.taxaHora),
            dataAdmissao: new Date(dto.dataAdmissao),
          },
        });
        imported++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Linha ${i + 1}: ${msg}`);
      }
    }

    return { imported, errors };
  }

  // ===================== JORNADAS =====================

  async findJornadas(colaboradorId: string, ano?: number) {
    const colaborador = await this.findById(colaboradorId);
    const where: any = { colaboradorId: colaborador.id };
    if (ano) where.ano = ano;

    return this.prisma.jornada.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });
  }

  async createJornada(colaboradorId: string, dto: CreateJornadaDto) {
    const colaborador = await this.findById(colaboradorId);

    const existing = await this.prisma.jornada.findUnique({
      where: {
        colaboradorId_mes_ano: {
          colaboradorId: colaborador.id,
          mes: dto.mes,
          ano: dto.ano,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Jornada para ${dto.mes}/${dto.ano} já existe`);
    }

    const horasRealizadas = dto.horasRealizadas ?? 0;
    const fte = this.calcularFTE(horasRealizadas, colaborador.cargaHoraria);

    return this.prisma.jornada.create({
      data: {
        colaboradorId: colaborador.id,
        mes: dto.mes,
        ano: dto.ano,
        horasPrevistas: new Decimal(dto.horasPrevistas),
        horasRealizadas: new Decimal(horasRealizadas),
        fte: new Decimal(fte),
      },
    });
  }

  async updateJornada(colaboradorId: string, jornadaId: string, dto: UpdateJornadaDto) {
    const colaborador = await this.findById(colaboradorId);

    const jornada = await this.prisma.jornada.findFirst({
      where: { id: jornadaId, colaboradorId: colaborador.id },
    });

    if (!jornada) {
      throw new NotFoundException(`Jornada '${jornadaId}' não encontrada`);
    }

    const updateData: any = {};
    if (dto.horasPrevistas !== undefined) updateData.horasPrevistas = new Decimal(dto.horasPrevistas);
    if (dto.horasRealizadas !== undefined) {
      updateData.horasRealizadas = new Decimal(dto.horasRealizadas);
      updateData.fte = new Decimal(this.calcularFTE(dto.horasRealizadas, colaborador.cargaHoraria));
    }

    return this.prisma.jornada.update({
      where: { id: jornadaId },
      data: updateData,
    });
  }

  async bulkCreateJornadas(dto: BulkJornadaDto) {
    const results: Array<{ colaboradorId: string; success: boolean; error?: string }> = [];

    for (const colaboradorId of dto.colaboradorIds) {
      try {
        const colaborador = await this.prisma.colaborador.findUnique({
          where: { id: colaboradorId },
        });

        if (!colaborador) {
          results.push({ colaboradorId, success: false, error: 'Colaborador não encontrado' });
          continue;
        }

        const fte = this.calcularFTE(dto.horasPrevistas, colaborador.cargaHoraria);

        await this.prisma.jornada.upsert({
          where: {
            colaboradorId_mes_ano: {
              colaboradorId,
              mes: dto.mes,
              ano: dto.ano,
            },
          },
          create: {
            colaboradorId,
            mes: dto.mes,
            ano: dto.ano,
            horasPrevistas: new Decimal(dto.horasPrevistas),
            horasRealizadas: new Decimal(0),
            fte: new Decimal(fte),
          },
          update: {
            horasPrevistas: new Decimal(dto.horasPrevistas),
            fte: new Decimal(fte),
          },
        });

        results.push({ colaboradorId, success: true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        results.push({ colaboradorId, success: false, error: msg });
      }
    }

    return results;
  }

  // ===================== FÉRIAS =====================

  async findFerias(colaboradorId: string) {
    const colaborador = await this.findById(colaboradorId);
    return this.prisma.ferias.findMany({
      where: { colaboradorId: colaborador.id },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async createFerias(colaboradorId: string, dto: CreateFeriasDto) {
    const colaborador = await this.findById(colaboradorId);

    const dataInicio = new Date(dto.dataInicio);
    const dataFim = new Date(dto.dataFim);

    if (dataFim <= dataInicio) {
      throw new BadRequestException('Data de fim deve ser posterior à data de início');
    }

    const dias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));

    return this.prisma.ferias.create({
      data: {
        colaboradorId: colaborador.id,
        dataInicio,
        dataFim,
        dias,
        aprovado: dto.aprovado ?? false,
      },
    });
  }

  async updateFerias(colaboradorId: string, feriasId: string, dto: UpdateFeriasDto) {
    const colaborador = await this.findById(colaboradorId);

    const ferias = await this.prisma.ferias.findFirst({
      where: { id: feriasId, colaboradorId: colaborador.id },
    });

    if (!ferias) {
      throw new NotFoundException(`Férias '${feriasId}' não encontradas`);
    }

    const updateData: any = {};
    if (dto.dataInicio) updateData.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) updateData.dataFim = new Date(dto.dataFim);
    if (dto.aprovado !== undefined) updateData.aprovado = dto.aprovado;

    const dataInicio = updateData.dataInicio || ferias.dataInicio;
    const dataFim = updateData.dataFim || ferias.dataFim;
    updateData.dias = Math.ceil(
      (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.prisma.ferias.update({
      where: { id: feriasId },
      data: updateData,
    });
  }

  // ===================== DESLIGAMENTO =====================

  async createDesligamento(colaboradorId: string, dto: CreateDesligamentoDto) {
    const colaborador = await this.findById(colaboradorId);

    if (colaborador.desligamento) {
      throw new ConflictException(`Colaborador '${colaborador.nome}' já possui desligamento registrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const desligamento = await tx.desligamento.create({
        data: {
          colaboradorId: colaborador.id,
          dataDesligamento: new Date(dto.dataDesligamento),
          motivo: dto.motivo,
          observacoes: dto.observacoes,
        },
      });

      await tx.colaborador.update({
        where: { id: colaborador.id },
        data: {
          status: UserStatus.DESLIGADO,
          dataDesligamento: new Date(dto.dataDesligamento),
        },
      });

      return desligamento;
    });
  }

  // ===================== CÁLCULO FTE E CUSTO =====================

  private calcularFTE(horasRealizadas: number, cargaHoraria: number): number {
    if (cargaHoraria <= 0) return 0;
    return Math.round((horasRealizadas / cargaHoraria) * 100) / 100;
  }

  async calcularCustoIndividual(colaboradorId: string, mes: number, ano: number) {
    const colaborador = await this.findById(colaboradorId);

    const jornada = await this.prisma.jornada.findUnique({
      where: {
        colaboradorId_mes_ano: { colaboradorId: colaborador.id, mes, ano },
      },
    });

    const horasRealizadas = jornada ? Number(jornada.horasRealizadas) : 0;
    const taxaHora = Number(colaborador.taxaHora);
    const custoFixo = taxaHora * colaborador.cargaHoraria;
    const custoVariavel = taxaHora * horasRealizadas;
    const fte = this.calcularFTE(horasRealizadas, colaborador.cargaHoraria);

    // Encargos sociais: INSS ~28%, FGTS ~8%, férias ~12,1%
    const percentualEncargos = 0.481;
    const custoTotal = custoVariavel * (1 + percentualEncargos);

    return {
      colaboradorId: colaborador.id,
      matricula: colaborador.matricula,
      nome: colaborador.nome,
      mes,
      ano,
      taxaHora,
      cargaHoraria: colaborador.cargaHoraria,
      horasPrevistas: jornada ? Number(jornada.horasPrevistas) : colaborador.cargaHoraria,
      horasRealizadas,
      fte,
      custoFixo: Math.round(custoFixo * 100) / 100,
      custoVariavel: Math.round(custoVariavel * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
      encargos: Math.round(custoVariavel * percentualEncargos * 100) / 100,
    };
  }

  async calcularCustoEquipe(mes: number, ano: number, projectId?: string) {
    const filter: any = { ativo: true, status: UserStatus.ATIVO };

    const colaboradores = await this.prisma.colaborador.findMany({
      where: filter,
      select: { id: true, matricula: true, nome: true, taxaHora: true, cargaHoraria: true },
    });

    const resultados = await Promise.all(
      colaboradores.map((c) => this.calcularCustoIndividual(c.id, mes, ano)),
    );

    const totais = resultados.reduce(
      (acc, r) => ({
        totalFTE: acc.totalFTE + r.fte,
        totalCustoFixo: acc.totalCustoFixo + r.custoFixo,
        totalCustoVariavel: acc.totalCustoVariavel + r.custoVariavel,
        totalCusto: acc.totalCusto + r.custoTotal,
      }),
      { totalFTE: 0, totalCustoFixo: 0, totalCustoVariavel: 0, totalCusto: 0 },
    );

    return {
      mes,
      ano,
      colaboradores: resultados,
      totais: {
        totalFTE: Math.round(totais.totalFTE * 100) / 100,
        totalCustoFixo: Math.round(totais.totalCustoFixo * 100) / 100,
        totalCustoVariavel: Math.round(totais.totalCustoVariavel * 100) / 100,
        totalCusto: Math.round(totais.totalCusto * 100) / 100,
      },
    };
  }

  async projetarCustosAnuais(colaboradorId: string, ano: number) {
    const colaborador = await this.findById(colaboradorId);

    const meses = Array.from({ length: 12 }, (_, i) => i + 1);
    const projecoes = await Promise.all(
      meses.map((mes) => this.calcularCustoIndividual(colaborador.id, mes, ano)),
    );

    const totalAnual = projecoes.reduce(
      (acc, p) => ({
        totalHoras: acc.totalHoras + p.horasRealizadas,
        totalCusto: acc.totalCusto + p.custoTotal,
        mediaFTE: acc.mediaFTE + p.fte / 12,
      }),
      { totalHoras: 0, totalCusto: 0, mediaFTE: 0 },
    );

    return {
      colaboradorId: colaborador.id,
      nome: colaborador.nome,
      ano,
      projecoesMensais: projecoes,
      totalAnual: {
        totalHoras: Math.round(totalAnual.totalHoras),
        totalCusto: Math.round(totalAnual.totalCusto * 100) / 100,
        mediaFTE: Math.round(totalAnual.mediaFTE * 100) / 100,
      },
    };
  }

  // ===================== BULK OPERATIONS =====================

  /**
   * Importa múltiplos colaboradores em lote com validação individual
   */
  async importarColaboradoresEmLote(
    colaboradores: any[],
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

    for (const item of colaboradores) {
      const resultado: { matricula: string; status: string; mensagem: string; entityId?: string } = {
        matricula: item.matricula || 'SEM_MATRICULA',
        status: 'sucesso',
        mensagem: '',
        entityId: undefined,
      };

      try {
        // Validar campos obrigatórios
        if (!item.matricula?.trim()) {
          resultado.status = 'erro';
          resultado.mensagem = 'Matrícula é obrigatória';
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

        // Verificar duplicação de matrícula
        const existing = await this.prisma.colaborador.findFirst({
          where: { matricula: item.matricula.trim(), ativo: true },
        });

        if (existing) {
          resultado.status = 'aviso';
          resultado.mensagem = `Colaborador com matrícula '${item.matricula}' já existe (ID: ${existing.id})`;
          resultado.entityId = existing.id;
          avisos++;
          detalhes.push(resultado);
          continue;
        }

        // Criar colaborador
        const colaborador = await this.prisma.colaborador.create({
          data: {
            matricula: item.matricula.trim(),
            nome: item.nome,
            email: item.email || undefined,
            cargo: item.cargo,
            classe: item.classe || undefined,
            taxaHora: new Decimal(item.taxaHora),
            cargaHoraria: item.cargaHoraria,
            cidade: item.cidade,
            estado: item.estado,
            sindicatoId: item.sindicatoId || undefined,
            status: item.status || UserStatus.ATIVO,
            dataAdmissao: new Date(item.dataAdmissao),
            dataDesligamento: item.dataDesligamento ? new Date(item.dataDesligamento) : null,
            ativo: true,
          },
        });

        resultado.mensagem = 'Colaborador importado com sucesso';
        resultado.entityId = colaborador.id;
        sucessos++;
        detalhes.push(resultado);
      } catch (error) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros++;
        detalhes.push(resultado);
      }
    }

    return {
      totalProcessado: colaboradores.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  /**
   * Atualiza múltiplas jornadas em lote com recálculo de FTE
   */
  async atualizarJornadasEmLote(
    jornadas: any[],
    motivo: string,
    userId: string,
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

    for (const item of jornadas) {
      const identificador = `${item.colaboradorId}-${item.mes}/${item.ano}`;
      const resultado: { identificador: string; status: string; mensagem: string; entityId?: string } = {
        identificador,
        status: 'sucesso',
        mensagem: '',
        entityId: undefined,
      };

      try {
        // Validar colaborador
        const colab = await this.prisma.colaborador.findFirst({
          where: { id: item.colaboradorId, ativo: true },
        });
        if (!colab) {
          resultado.status = 'erro';
          resultado.mensagem = `Colaborador '${item.colaboradorId}' não encontrado`;
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Validar mês/ano
        if (item.mes < 1 || item.mes > 12) {
          resultado.status = 'erro';
          resultado.mensagem = 'Mês deve estar entre 1 e 12';
          erros++;
          detalhes.push(resultado);
          continue;
        }

        // Encontrar ou criar jornada
        const existing = await this.prisma.jornada.findFirst({
          where: {
            colaboradorId: item.colaboradorId,
            mes: item.mes,
            ano: item.ano,
          },
        });

        let jornada;
        if (existing) {
          // Atualizar
          jornada = await this.prisma.jornada.update({
            where: { id: existing.id },
            data: {
              horasPrevistas: new Decimal(item.horasPrevistas),
              fte: this._calcularFTE(item.horasPrevistas, colab.cargaHoraria),
            },
          });
          resultado.mensagem = 'Jornada atualizada com sucesso';
        } else {
          // Criar
          jornada = await this.prisma.jornada.create({
            data: {
              colaboradorId: item.colaboradorId,
              projectId: item.projectId || undefined,
              mes: item.mes,
              ano: item.ano,
              horasPrevistas: new Decimal(item.horasPrevistas),
              fte: this._calcularFTE(item.horasPrevistas, colab.cargaHoraria),
            },
          });
          resultado.mensagem = 'Jornada criada com sucesso';
        }

        resultado.entityId = jornada.id;
        sucessos++;
        detalhes.push(resultado);
      } catch (error) {
        resultado.status = 'erro';
        resultado.mensagem = `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros++;
        detalhes.push(resultado);
      }
    }

    return {
      totalProcessado: jornadas.length,
      sucessos,
      erros,
      avisos,
      detalhes,
    };
  }

  // ===================== PRIVATE HELPERS =====================

  private _calcularFTE(horas: number, cargaHoraria: number): Decimal {
    if (cargaHoraria === 0) return new Decimal(0);
    return new Decimal(horas / cargaHoraria);
  }}