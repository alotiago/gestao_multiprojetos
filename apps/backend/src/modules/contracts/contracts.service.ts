import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { $Enums } from '@prisma/client';

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
}
