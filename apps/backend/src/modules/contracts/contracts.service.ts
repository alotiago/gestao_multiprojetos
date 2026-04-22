import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { $Enums } from '@prisma/client';
import * as xlsx from 'xlsx';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  //  CONTRATOS (US 1.1 - 1.4)
  // ═══════════════════════════════════════════

  /**
   * US 1.1: Listar contratos com paginação
   */
  async findAllContratos(page = 1, limit = 10, status?: string) {
    const where: any = { ativo: true };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.contrato.findMany({
        where,
        include: {
          _count: {
            select: {
              objetos: { where: { ativo: true } },
              projetos: { where: { ativo: true } },
            },
          },
          objetos: {
            where: { ativo: true },
            select: { id: true, nome: true, valorTotalContratado: true },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contrato.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  /**
   * US 1.2: Obter detalhe de contrato
   */
  async findContratoById(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: {
        objetos: {
          where: { ativo: true },
          include: {
            linhasContratuais: { where: { ativo: true } },
            _count: { select: { linhasContratuais: { where: { ativo: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
        projetos: {
          where: { ativo: true },
          select: { id: true, codigo: true, nome: true },
        },
        _count: {
          select: {
            objetos: { where: { ativo: true } },
            projetos: { where: { ativo: true } },
          },
        },
      },
    });

    if (!contrato) throw new NotFoundException('Contrato não encontrado');

    // Calcular totalizações
    let totalContratado = 0;
    const objetosComTotais = contrato.objetos.map((obj: any) => {
      const total = obj.linhasContratuais.reduce((s: number, l: any) => s + Number(l.valorTotalAnual), 0);
      totalContratado += total;
      return {
        ...obj,
        valorTotalContratado: new Decimal(Math.round(total * 100) / 100),
      };
    });

    return {
      ...contrato,
      objetos: objetosComTotais,
      valorTotalContratado: new Decimal(Math.round(totalContratado * 100) / 100),
      saldoContratual: Number(contrato.saldoContratual || 0),
    };
  }

  /**
   * US 1.3: Criar contrato
   */
  async createContrato(data: {
    nomeContrato: string;
    cliente: string;
    numeroContrato: string;
    dataInicio: string;
    dataFim?: string;
    status?: string;
    observacoes?: string;
  }) {
    // Validar unicidade de numeroContrato
    const exists = await this.prisma.contrato.findFirst({
      where: { numeroContrato: data.numeroContrato, ativo: true },
    });

    if (exists) {
      throw new ConflictException(`Contrato com número ${data.numeroContrato} já existe`);
    }

    return this.prisma.contrato.create({
      data: {
        nomeContrato: data.nomeContrato,
        cliente: data.cliente,
        numeroContrato: data.numeroContrato,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        status: data.status || 'RASCUNHO',
        observacoes: data.observacoes,
        ativo: true,
      },
      include: {
        _count: { select: { objetos: true, projetos: true } },
      },
    });
  }

  /**
   * US 1.4: Atualizar contrato
   */
  async updateContrato(
    id: string,
    data: {
      nomeContrato?: string;
      cliente?: string;
      numeroContrato?: string;
      dataInicio?: string;
      dataFim?: string;
      status?: string;
      observacoes?: string;
    },
  ) {
    const contrato = await this.prisma.contrato.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');

    // Se mudou numero, verificar unicidade
    if (data.numeroContrato && data.numeroContrato !== contrato.numeroContrato) {
      const exists = await this.prisma.contrato.findFirst({
        where: {
          numeroContrato: data.numeroContrato,
          ativo: true,
          id: { not: id },
        },
      });
      if (exists) {
        throw new ConflictException(`Contrato com número ${data.numeroContrato} já existe`);
      }
    }

    const updateData: any = {};
    if (data.nomeContrato !== undefined) updateData.nomeContrato = data.nomeContrato;
    if (data.cliente !== undefined) updateData.cliente = data.cliente;
    if (data.numeroContrato !== undefined) updateData.numeroContrato = data.numeroContrato;
    if (data.dataInicio !== undefined) updateData.dataInicio = new Date(data.dataInicio);
    if (data.dataFim !== undefined) updateData.dataFim = data.dataFim ? new Date(data.dataFim) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    return this.prisma.contrato.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { objetos: true, projetos: true } } },
    });
  }

  /**
   * US 1.5: Deletar contrato (soft delete)
   */
  async deleteContrato(id: string) {
    const contrato = await this.prisma.contrato.findUnique({
      where: { id },
      include: { projetos: { where: { ativo: true } } },
    });

    if (!contrato) throw new NotFoundException('Contrato não encontrado');

    // Não permitir deletar se há projetos ativos
    if (contrato.projetos.length > 0) {
      throw new BadRequestException(
        'Não é possível deletar contrato com projetos ativos. Remova os projetos primeiro.',
      );
    }

    return this.prisma.contrato.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // ═══════════════════════════════════════════
  //  CLONE CONTRATO (US 5.1)
  // ═══════════════════════════════════════════

  /**
   * US 5.1: Clonar contrato com estrutura completa
   * Copia: Contrato + Objetos + Linhas
   * NÃO copia: Quantidades planejadas/realizadas, Receitas
   */
  async cloneContrato(
    contratoId: string,
    novoNome: string,
    novoNumero: string,
  ) {
    const contratoOriginal = await this.findContratoById(contratoId);
    if (!contratoOriginal) throw new NotFoundException('Contrato original não encontrado');

    // Validar novo número
    const exists = await this.prisma.contrato.findFirst({
      where: { numeroContrato: novoNumero, ativo: true },
    });
    if (exists) {
      throw new ConflictException(`Contrato com número ${novoNumero} já existe`);
    }

    // Criar novo contrato
    const novoContrato = await this.prisma.contrato.create({
      data: {
        nomeContrato: novoNome,
        cliente: contratoOriginal.cliente,
        numeroContrato: novoNumero,
        dataInicio: new Date(contratoOriginal.dataInicio),
        dataFim: contratoOriginal.dataFim,
        status: 'RASCUNHO' as any,
        observacoes: `[CLONADO] ${contratoOriginal.observacoes || 'Clone de ' + contratoOriginal.nomeContrato}`,
        ativo: true,
      },
    });

    // Clonar cada objeto e suas linhas
    for (const objeto of contratoOriginal.objetos) {
      const novoObjeto = await this.prisma.objetoContratual.create({
        data: {
          contratoId: novoContrato.id,
          nome: objeto.nome,
          descricao: objeto.descricao,
          dataInicio: new Date(objeto.dataInicio),
          dataFim: objeto.dataFim,
          observacoes: objeto.observacoes,
          ativo: true,
        },
      });

      // Clonar linhas (sem quantidades planejadas/realizadas)
      for (const linha of objeto.linhas) {
        await this.prisma.linhaContratual.create({
          data: {
            objetoContratualId: novoObjeto.id,
            descricaoItem: linha.descricaoItem,
            unidade: linha.unidade,
            quantidadeAnualEstimada: linha.quantidadeAnualEstimada,
            valorUnitario: linha.valorUnitario,
            valorTotalAnual: linha.valorTotalAnual,
            ativo: true,
          },
        });
      }

      // Recalcular total do novo objeto
      await this.recalcularTotalObjeto(novoObjeto.id);
    }

    return this.findContratoById(novoContrato.id);
  }

  // ═══════════════════════════════════════════
  //  OBJETOS CONTRATUAIS (US 2.1 - 2.3)
  // ═══════════════════════════════════════════

  /**
   * Helper: Recalcula valorTotalContratado de um objeto
   */
  private async recalcularTotalObjeto(objetoContratualId: string) {
    const linhas = await this.prisma.linhaContratual.findMany({
      where: { objetoContratualId, ativo: true },
      select: { valorTotalAnual: true },
    });

    const total = linhas.reduce((s, l) => s + Number(l.valorTotalAnual), 0);
    await this.prisma.objetoContratual.update({
      where: { id: objetoContratualId },
      data: { valorTotalContratado: new Decimal(Math.round(total * 100) / 100) },
    });
  }

  /**
   * Helper RN-001: Recalcula saldoContratual de um contrato
   * Saldo = soma de todos os saldoValor de todas as linhas contratuais ativas do contrato
   */
  private async recalcularSaldoContratual(contratoId: string) {
    const objetos = await this.prisma.objetoContratual.findMany({
      where: { contratoId, ativo: true },
      include: {
        linhasContratuais: {
          where: { ativo: true },
          select: { saldoValor: true },
        },
      },
    });

    let totalSaldo = 0;
    for (const obj of objetos) {
      const saldoObjeto = obj.linhasContratuais.reduce((s, l) => s + Number(l.saldoValor), 0);
      totalSaldo += saldoObjeto;
    }

    await this.prisma.contrato.update({
      where: { id: contratoId },
      data: { saldoContratual: new Decimal(Math.round(totalSaldo * 100) / 100) },
    });
  }

  /**
   * US 2.1: Criar objeto contratual
   */
  async createObjeto(data: {
    contratoId: string;
    nome: string;
    descricao: string;
    dataInicio: string;
    dataFim?: string;
    observacoes?: string;
  }) {
    // Validar contrato existe
    const contrato = await this.prisma.contrato.findUnique({
      where: { id: data.contratoId },
    });
    if (!contrato) throw new NotFoundException('Contrato não encontrado');

    // Validar unicidade de nome dentro do contrato
    const exists = await this.prisma.objetoContratual.findFirst({
      where: {
        contratoId: data.contratoId,
        nome: data.nome,
        ativo: true,
      },
    });

    if (exists) {
      throw new ConflictException(
        `Objeto contratual "${data.nome}" já existe neste contrato`,
      );
    }

    return this.prisma.objetoContratual.create({
      data: {
        contratoId: data.contratoId,
        nome: data.nome,
        descricao: data.descricao,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        observacoes: data.observacoes,
        ativo: true,
      },
      include: {
        contrato: { select: { id: true, nomeContrato: true } },
        _count: { select: { linhasContratuais: true } },
      },
    });
  }

  /**
   * US 2.2: Atualizar objeto contratual
   */
  async updateObjeto(
    id: string,
    data: {
      nome?: string;
      descricao?: string;
      dataInicio?: string;
      dataFim?: string;
      observacoes?: string;
    },
  ) {
    const obj = await this.prisma.objetoContratual.findUnique({ where: { id } });
    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');

    // Se mudou nome, validar unicidade
    if (data.nome && data.nome !== obj.nome) {
      const exists = await this.prisma.objetoContratual.findFirst({
        where: {
          contratoId: obj.contratoId,
          nome: data.nome,
          ativo: true,
          id: { not: id },
        },
      });
      if (exists) {
        throw new ConflictException(`Objeto "${data.nome}" já existe neste contrato`);
      }
    }

    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.dataInicio !== undefined) updateData.dataInicio = new Date(data.dataInicio);
    if (data.dataFim !== undefined) updateData.dataFim = data.dataFim ? new Date(data.dataFim) : null;
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

    return this.prisma.objetoContratual.update({
      where: { id },
      data: updateData,
      include: {
        contrato: { select: { id: true, nomeContrato: true } },
      },
    });
  }

  /**
   * US 2.3: Deletar objeto contratual (soft delete)
   */
  async deleteObjeto(id: string) {
    const obj = await this.prisma.objetoContratual.findUnique({
      where: { id },
      include: { linhasContratuais: { where: { ativo: true } } },
    });

    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');

    // Deletar também suas linhas (soft delete em cascata)
    if (obj.linhasContratuais.length > 0) {
      await this.prisma.linhaContratual.updateMany({
        where: { objetoContratualId: id, ativo: true },
        data: { ativo: false },
      });
    }

    return this.prisma.objetoContratual.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // ═══════════════════════════════════════════
  //  LINHAS CONTRATUAIS (US 3.1 - 3.3)
  // ═══════════════════════════════════════════

  /**
   * US 3.1: Criar linha contratual
   */
  async createLinha(data: {
    objetoContratualId: string;
    descricaoItem: string;
    unidade: string;
    quantidadeAnualEstimada: number;
    valorUnitario: number;
  }) {
    const obj = await this.prisma.objetoContratual.findUnique({
      where: { id: data.objetoContratualId },
    });
    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');

    const qtd = new Decimal(data.quantidadeAnualEstimada);
    const vUnit = new Decimal(data.valorUnitario);
    const valorTotalAnual = qtd.mul(vUnit);

    const created = await this.prisma.linhaContratual.create({
      data: {
        objetoContratualId: data.objetoContratualId,
        descricaoItem: data.descricaoItem,
        unidade: data.unidade,
        quantidadeAnualEstimada: qtd,
        valorUnitario: vUnit,
        valorTotalAnual,
        // RN-003: Inicializar saldos com valores totais
        saldoQuantidade: qtd,
        saldoValor: valorTotalAnual,
        ativo: true,
      },
      include: {
        objetoContratual: {
          select: { id: true, nome: true, contratoId: true },
        },
      },
    });

    // Recalcular total do objeto
    await this.recalcularTotalObjeto(data.objetoContratualId);

    // RN-001: Recalcular saldo contratual do contrato
    await this.recalcularSaldoContratual(created.objetoContratual.contratoId);

    return created;
  }

  /**
   * US 3.2: Atualizar linha contratual
   */
  async updateLinha(
    id: string,
    data: {
      descricaoItem?: string;
      unidade?: string;
      quantidadeAnualEstimada?: number;
      valorUnitario?: number;
    },
  ) {
    const linha = await this.prisma.linhaContratual.findUnique({ where: { id } });
    if (!linha) throw new NotFoundException('Linha contratual não encontrada');

    const updateData: any = {};
    if (data.descricaoItem !== undefined) updateData.descricaoItem = data.descricaoItem;
    if (data.unidade !== undefined) updateData.unidade = data.unidade;

    // Recalcular valor total se qtd ou valor mudar
    const qtd =
      data.quantidadeAnualEstimada !== undefined
        ? new Decimal(data.quantidadeAnualEstimada)
        : linha.quantidadeAnualEstimada;
    const vUnit =
      data.valorUnitario !== undefined
        ? new Decimal(data.valorUnitario)
        : linha.valorUnitario;

    updateData.quantidadeAnualEstimada = qtd;
    updateData.valorUnitario = vUnit;
    updateData.valorTotalAnual = new Decimal(qtd.toString()).mul(new Decimal(vUnit.toString()));

    const updated = await this.prisma.linhaContratual.update({
      where: { id },
      data: updateData,
      include: {
        objetoContratual: {
          select: { id: true, nome: true, contratoId: true },
        },
      },
    });

    // Recalcular total do objeto
    await this.recalcularTotalObjeto(linha.objetoContratualId);

    // RN-001: Recalcular saldo contratual do contrato
    await this.recalcularSaldoContratual(updated.objetoContratual.contratoId);

    // US 4.2: Se mudou valor unitário, recalcular receitas futuras
    if (data.valorUnitario !== undefined) {
      const now = new Date();
      const mesAtual = now.getMonth() + 1;
      const anoAtual = now.getFullYear();

      const receitasFuturas = await this.prisma.receitaMensal.findMany({
        where: {
          linhaContratualId: id,
          ativo: true,
          OR: [
            { ano: { gt: anoAtual } },
            { ano: anoAtual, mes: { gte: mesAtual } },
          ],
        },
      });

      for (const receita of receitasFuturas) {
        if (receita.quantidadePlanejada) {
          const novoTotal = new Decimal(receita.quantidadePlanejada.toString()).mul(vUnit);
          await this.prisma.receitaMensal.update({
            where: { id: receita.id },
            data: {
              valorUnitarioPlanejado: vUnit,
              valorPlanejado: novoTotal,
            },
          });
        }
      }
    }

    return updated;
  }

  /**
   * US 3.3: Deletar linha contratual (soft delete)
   */
  async deleteLinha(id: string) {
    const linha = await this.prisma.linhaContratual.findUnique({ where: { id } });
    if (!linha) throw new NotFoundException('Linha contratual não encontrada');

    await this.prisma.linhaContratual.update({
      where: { id },
      data: { ativo: false },
    });

    // Recalcular total do objeto
    await this.recalcularTotalObjeto(linha.objetoContratualId);
  }

  // ═══════════════════════════════════════════
  //  HELPERS PARA PROJETOS
  // ═══════════════════════════════════════════

  /**
   * Listar objetos contratuais do contrato vinculado a um projeto
   */
  async findObjetosByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { contratoId: true },
    });
    if (!project?.contratoId) return [];

    return this.prisma.objetoContratual.findMany({
      where: { contratoId: project.contratoId, ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        dataInicio: true,
        dataFim: true,
        valorTotalContratado: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Listar linhas contratuais de um objeto contratual
   */
  async findLinhasByObjeto(objetoId: string) {
    return this.prisma.linhaContratual.findMany({
      where: { objetoContratualId: objetoId, ativo: true },
      select: {
        id: true,
        descricaoItem: true,
        unidade: true,
        quantidadeAnualEstimada: true,
        valorUnitario: true,
        valorTotalAnual: true,
        saldoQuantidade: true,
        saldoValor: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Obter contratos disponíveis para novo projeto
   */
  async findContratosDisponíveis() {
    return this.prisma.contrato.findMany({
      where: {
        ativo: true,
        status: { in: ['VIGENTE', 'RASCUNHO'] },
      },
      select: {
        id: true,
        nomeContrato: true,
        cliente: true,
        numeroContrato: true,
        dataInicio: true,
        dataFim: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resumo contratual por projeto
   */
  async getProjectContractSummary(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        contrato: {
          include: {
            objetos: {
              where: { ativo: true },
              include: {
                linhasContratuais: {
                  where: { ativo: true },
                  select: {
                    id: true,
                    descricaoItem: true,
                    unidade: true,
                    quantidadeAnualEstimada: true,
                    valorUnitario: true,
                    valorTotalAnual: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project?.contrato) {
      return {
        projectId,
        contratoId: null,
        totalObjetos: 0,
        totalLinhas: 0,
        valorTotalContratado: 0,
        objetos: [],
      };
    }

    let totalContratado = 0;
    const objetos = project.contrato.objetos.map((obj: any) => {
      const objTotal = obj.linhasContratuais.reduce((s: number, l: any) => s + Number(l.valorTotalAnual), 0);
      totalContratado += objTotal;
      return {
        id: obj.id,
        nome: obj.nome,
        totalLinhas: obj.linhas.length,
        valorTotal: objTotal,
        linhas: obj.linhas,
      };
    });

    return {
      projectId,
      contratoId: project.contrato.id,
      nomeContrato: project.contrato.nomeContrato,
      numeroContrato: project.contrato.numeroContrato,
      totalObjetos: objetos.length,
      totalLinhas: objetos.reduce((s, o) => s + o.totalLinhas, 0),
      valorTotalContratado: totalContratado,
      objetos,
    };
  }

  // ═══════════════════════════════════════════
  //  IMPORTAÇÃO EXCEL (US-044)
  // ═══════════════════════════════════════════

  /**
   * US-044: Gerar template Excel com 3 abas + exemplos
   */
  gerarTemplateExcel(): Buffer {
    const wb = xlsx.utils.book_new();

    const wsContratos = xlsx.utils.json_to_sheet([
      {
        numeroContrato: 'CTR-2026-001',
        nomeContrato: 'Contrato Exemplo',
        cliente: 'Cliente S.A.',
        dataInicio: '01/01/2026',
        dataFim: '31/12/2026',
        observacoes: '',
      },
    ]);
    xlsx.utils.book_append_sheet(wb, wsContratos, 'Contratos');

    const wsObjetos = xlsx.utils.json_to_sheet([
      {
        numeroContrato: 'CTR-2026-001',
        nomeObjeto: 'Objeto 1',
        descricao: 'Primeiro lote de entregas',
        dataInicio: '01/01/2026',
        dataFim: '30/06/2026',
        observacoes: '',
      },
    ]);
    xlsx.utils.book_append_sheet(wb, wsObjetos, 'Objetos');

    const wsLinhas = xlsx.utils.json_to_sheet([
      {
        numeroContrato: 'CTR-2026-001',
        nomeObjeto: 'Objeto 1',
        descricaoItem: 'Horas de consultoria',
        unidade: 'HORA',
        quantidadeAnualEstimada: 1000,
        valorUnitario: 150.0,
      },
    ]);
    xlsx.utils.book_append_sheet(wb, wsLinhas, 'Linhas');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * US-044: Importar contratos completos via Excel
   * Planilha com 3 abas: Contratos, Objetos, Linhas
   */
  async importarExcel(
    buffer: Buffer,
  ): Promise<{ imported: number; skipped: number; totalObjetos: number; totalLinhas: number; errors: string[]; warnings: string[] }> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // RN-EP1-044.2: Validar abas obrigatórias
    const abaContratos = workbook.Sheets['Contratos'];
    const abaObjetos = workbook.Sheets['Objetos'];
    const abaLinhas = workbook.Sheets['Linhas'];

    if (!abaContratos || !abaObjetos || !abaLinhas) {
      throw new BadRequestException(
        'Planilha deve conter as 3 abas obrigatórias: Contratos, Objetos, Linhas',
      );
    }

    // Parse + normalizar headers (case-insensitive)
    const parseSheet = (sheet: xlsx.WorkSheet) => {
      const raw: Record<string, any>[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });
      return raw.map((row) => {
        const normalized: Record<string, any> = {};
        for (const key of Object.keys(row)) {
          normalized[key.trim().toLowerCase()] = row[key];
        }
        return normalized;
      });
    };

    const contratos = parseSheet(abaContratos);
    const objetos = parseSheet(abaObjetos);
    const linhas = parseSheet(abaLinhas);

    // RN-EP1-044.3: Validar headers obrigatórios
    if (contratos.length === 0) {
      throw new BadRequestException('Aba Contratos está vazia');
    }

    const UNIDADES_VALIDAS = [
      'BIRÔ/MÊS', 'CAIXA-20KG', 'CONSULTA/MÊS', 'DIÁRIA', 'DOCUMENTO',
      'GB/MÊS', 'HORA', 'HORA DE ASSESSORIA', 'IMAGEM',
      'KM (LIMITADO A 500 CAIXAS)', 'LICENÇA MENSAL', 'MÊS', 'MES',
      'METRO LINEAR', 'PACOTE', 'PESSOA', 'PROJETO', 'SERVIÇO',
      'UND', 'UNIDADE', 'UNIDADE DOCUMENTAL (UP)',
      'UNIDADES DE ARQUIVAMENTO (UA)', 'USUÁRIO POR MÊS', 'OUTRO',
    ];

    const normalizarUnidade = (value: string): string => {
      let unidade = value.trim().toUpperCase();

      // Colapsa espaços e padroniza espaço antes de "(SIGLA)".
      unidade = unidade.replace(/\s+/g, ' ');
      unidade = unidade.replace(/\s*\(/g, ' (').replace(/\s*\)/g, ')').trim();

      const aliases: Record<string, string> = {
        MES: 'MÊS',
        'UNIDADE DOCUMENTAL(UP)': 'UNIDADE DOCUMENTAL (UP)',
        'UNIDADES DE ARQUIVAMENTO(UA)': 'UNIDADES DE ARQUIVAMENTO (UA)',
      };

      return aliases[unidade] ?? unidade;
    };

    let imported = 0;
    let skipped = 0;
    let totalObjetos = 0;
    let totalLinhas = 0;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Debug: informar quantas linhas foram lidas em cada aba
    if (objetos.length === 0) {
      warnings.push('⚠ Aba "Objetos" está vazia — nenhum objeto será importado');
    }
    if (linhas.length === 0) {
      warnings.push('⚠ Aba "Linhas" está vazia — nenhuma linha contratual será importada');
    } else {
      // Verificar se headers esperados existem na aba Linhas
      const primeiraLinha = linhas[0];
      const keysLinhas = Object.keys(primeiraLinha);
      const headersEsperados = ['numerocontrato', 'nomeobjeto', 'descricaoitem', 'unidade', 'quantidadeanualestimada', 'valorunitario'];
      const headersFaltando = headersEsperados.filter(h => !keysLinhas.includes(h));
      if (headersFaltando.length > 0) {
        warnings.push(`⚠ Aba "Linhas": colunas não encontradas: ${headersFaltando.join(', ')}. Colunas existentes: ${keysLinhas.join(', ')}`);
      }
    }

    // RN-EP1-044.11: Processamento transacional por contrato
    for (let i = 0; i < contratos.length; i++) {
      const row = contratos[i];
      const rowNum = i + 2; // Linha na planilha (1-indexed + header)
      const numContrato = String(row['numerocontrato'] || '').trim();

      if (!numContrato) {
        skipped++;
        errors.push(`Contratos linha ${rowNum}: campo 'numeroContrato' vazio`);
        continue;
      }

      const nomeContrato = String(row['nomecontrato'] || '').trim();
      const cliente = String(row['cliente'] || '').trim();
      const dataInicioRaw = row['datainicio'];

      if (!nomeContrato || !cliente || !dataInicioRaw) {
        skipped++;
        errors.push(
          `Contratos linha ${rowNum} (${numContrato}): campos obrigatórios faltando (nomeContrato, cliente, dataInicio)`,
        );
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          // RN-EP1-044.5: Verificar duplicidade
          const exists = await tx.contrato.findFirst({
            where: { numeroContrato: numContrato, ativo: true },
          });
          if (exists) {
            throw new ConflictException(
              `Contrato '${numContrato}' já existe`,
            );
          }

          const dataInicio = this.parseExcelDate(dataInicioRaw);
          const dataFimRaw = row['datafim'];
          const dataFim = dataFimRaw ? this.parseExcelDate(dataFimRaw) : null;
          const obs = String(row['observacoes'] || '').substring(0, 500) || null;

          // RN-EP1-044.10: Status sempre RASCUNHO
          const contrato = await tx.contrato.create({
            data: {
              nomeContrato,
              cliente,
              numeroContrato: numContrato,
              dataInicio,
              dataFim,
              observacoes: obs,
              status: 'RASCUNHO',
              ativo: true,
            },
          });

          // Objetos deste contrato
          const objetosDoContrato = objetos.filter(
            (o) => String(o['numerocontrato'] || '').trim() === numContrato,
          );

          for (let j = 0; j < objetosDoContrato.length; j++) {
            const objRow = objetosDoContrato[j];
            const nomeObjeto = String(objRow['nomeobjeto'] || '').trim();
            const descricao = String(objRow['descricao'] || '').trim();

            if (!nomeObjeto || !descricao) {
              throw new BadRequestException(
                `Objeto '${nomeObjeto || '(vazio)'}': campos obrigatórios faltando (nomeObjeto, descricao)`,
              );
            }

            // RN-EP1-044.7: Nome duplicado dentro do contrato
            const objDup = await tx.objetoContratual.findFirst({
              where: { contratoId: contrato.id, nome: nomeObjeto, ativo: true },
            });
            if (objDup) {
              throw new ConflictException(
                `Objeto '${nomeObjeto}' duplicado no contrato '${numContrato}'`,
              );
            }

            const objDataInicio = objRow['datainicio']
              ? this.parseExcelDate(objRow['datainicio'])
              : null;
            const objDataFim = objRow['datafim']
              ? this.parseExcelDate(objRow['datafim'])
              : null;

            const objeto = await tx.objetoContratual.create({
              data: {
                contratoId: contrato.id,
                nome: nomeObjeto,
                descricao,
                dataInicio: objDataInicio,
                dataFim: objDataFim,
                observacoes: String(objRow['observacoes'] || '') || null,
                ativo: true,
              },
            });

            totalObjetos++;

            // Linhas deste objeto
            const linhasDoObjeto = linhas.filter(
              (l) =>
                String(l['numerocontrato'] || '').trim().toLowerCase() === numContrato.toLowerCase() &&
                String(l['nomeobjeto'] || '').trim().toLowerCase() === nomeObjeto.toLowerCase(),
            );

            if (linhasDoObjeto.length === 0 && linhas.length > 0) {
              warnings.push(
                `⚠ Objeto '${nomeObjeto}' (contrato '${numContrato}'): nenhuma linha encontrada na aba Linhas`,
              );
            }

            for (let k = 0; k < linhasDoObjeto.length; k++) {
              const linRow = linhasDoObjeto[k];
              const descItem = String(linRow['descricaoitem'] || '').trim();
              const unidadeRaw = String(linRow['unidade'] || '').trim();
              const qtdRaw = Number(linRow['quantidadeanualestimada']);
              const valUnitRaw = Number(linRow['valorunitario']);

              if (!descItem) {
                throw new BadRequestException(
                  `Linha do objeto '${nomeObjeto}': campo 'descricaoItem' vazio`,
                );
              }

              // RN-EP1-044.9: Validar unidade
              const unidade = normalizarUnidade(unidadeRaw);
              if (!UNIDADES_VALIDAS.includes(unidade)) {
                throw new BadRequestException(
                  `Linha '${descItem}': unidade inválida '${unidadeRaw}'. Valores: ${UNIDADES_VALIDAS.join(', ')}`,
                );
              }

              if (!qtdRaw || qtdRaw <= 0) {
                throw new BadRequestException(
                  `Linha '${descItem}': quantidadeAnualEstimada deve ser > 0`,
                );
              }
              if (isNaN(valUnitRaw) || valUnitRaw < 0) {
                throw new BadRequestException(
                  `Linha '${descItem}': valorUnitario inválido`,
                );
              }

              // RN-EP1-044.8: Cálculo automático
              const qtd = new Decimal(qtdRaw);
              const valUnit = new Decimal(valUnitRaw);
              const valorTotal = qtd.mul(valUnit);

              await tx.linhaContratual.create({
                data: {
                  objetoContratualId: objeto.id,
                  descricaoItem: descItem,
                  unidade,
                  quantidadeAnualEstimada: qtd,
                  valorUnitario: valUnit,
                  valorTotalAnual: valorTotal,
                  saldoQuantidade: qtd,
                  saldoValor: valorTotal,
                  ativo: true,
                },
              });
              totalLinhas++;
            }

            // Recalcular total do objeto
            const linhasObj = await tx.linhaContratual.findMany({
              where: { objetoContratualId: objeto.id, ativo: true },
              select: { valorTotalAnual: true },
            });
            const totalObj = linhasObj.reduce(
              (s, l) => s + Number(l.valorTotalAnual),
              0,
            );
            await tx.objetoContratual.update({
              where: { id: objeto.id },
              data: {
                valorTotalContratado: new Decimal(
                  Math.round(totalObj * 100) / 100,
                ),
              },
            });
          }

          // RN-EP1-044.8: Recalcular saldo do contrato
          const todosObjetos = await tx.objetoContratual.findMany({
            where: { contratoId: contrato.id, ativo: true },
            include: {
              linhasContratuais: {
                where: { ativo: true },
                select: { saldoValor: true },
              },
            },
          });
          let totalSaldo = 0;
          for (const obj of todosObjetos) {
            totalSaldo += obj.linhasContratuais.reduce(
              (s, l) => s + Number(l.saldoValor),
              0,
            );
          }
          await tx.contrato.update({
            where: { id: contrato.id },
            data: {
              saldoContratual: new Decimal(
                Math.round(totalSaldo * 100) / 100,
              ),
            },
          });
        });

        imported++;
      } catch (err: any) {
        skipped++;
        errors.push(
          `Contratos linha ${rowNum} (${numContrato}): ${err.message || String(err)}`,
        );
      }
    }

    return { imported, skipped, totalObjetos, totalLinhas, errors, warnings };
  }

  /**
   * Helper: Parse data do Excel (DD/MM/AAAA, ISO, ou serial number)
   */
  private parseExcelDate(value: any): Date {
    if (value instanceof Date) return value;

    if (typeof value === 'number') {
      // Excel serial number
      const epoch = new Date(1899, 11, 30);
      return new Date(epoch.getTime() + value * 86400000);
    }

    const str = String(value).trim();

    // DD/MM/AAAA
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      return new Date(
        Number(brMatch[3]),
        Number(brMatch[2]) - 1,
        Number(brMatch[1]),
      );
    }

    // ISO or other parseable format
    const parsed = new Date(str);
    if (isNaN(parsed.getTime())) {
      throw new BadRequestException(`Data inválida: '${str}'`);
    }
    return parsed;
  }
}
