import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  //  OBJETOS CONTRATUAIS
  // ═══════════════════════════════════════════

  async findAllObjetos(page = 1, limit = 10, projectId?: string) {
    const where: any = { ativo: true };
    if (projectId) where.projectId = projectId;

    const [data, total] = await Promise.all([
      this.prisma.objetoContratual.findMany({
        where,
        include: {
          project: { select: { id: true, codigo: true, nome: true } },
          _count: { select: { linhasContratuais: { where: { ativo: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.objetoContratual.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findObjetoById(id: string) {
    const obj = await this.prisma.objetoContratual.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, codigo: true, nome: true } },
        linhasContratuais: {
          where: { ativo: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');
    return obj;
  }

  async findObjetosByProject(projectId: string) {
    return this.prisma.objetoContratual.findMany({
      where: { projectId, ativo: true },
      include: {
        _count: { select: { linhasContratuais: { where: { ativo: true } } } },
      },
      orderBy: { numero: 'asc' },
    });
  }

  async createObjeto(data: {
    projectId: string;
    numero: string;
    descricao: string;
    dataInicio: string;
    dataFim?: string;
  }) {
    // Verificar unicidade
    const existing = await this.prisma.objetoContratual.findUnique({
      where: { projectId_numero: { projectId: data.projectId, numero: data.numero } },
    });
    if (existing && existing.ativo) {
      throw new ConflictException(`Objeto contratual ${data.numero} já existe neste projeto`);
    }
    if (existing && !existing.ativo) {
      return this.prisma.objetoContratual.update({
        where: { id: existing.id },
        data: {
          descricao: data.descricao,
          dataInicio: new Date(data.dataInicio),
          dataFim: data.dataFim ? new Date(data.dataFim) : null,
          ativo: true,
        },
        include: { project: { select: { id: true, codigo: true, nome: true } } },
      });
    }

    return this.prisma.objetoContratual.create({
      data: {
        projectId: data.projectId,
        numero: data.numero,
        descricao: data.descricao,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
      },
      include: { project: { select: { id: true, codigo: true, nome: true } } },
    });
  }

  async updateObjeto(
    id: string,
    data: { descricao?: string; dataInicio?: string; dataFim?: string },
  ) {
    const obj = await this.prisma.objetoContratual.findUnique({ where: { id } });
    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');

    const updateData: any = {};
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.dataInicio !== undefined) updateData.dataInicio = new Date(data.dataInicio);
    if (data.dataFim !== undefined) updateData.dataFim = data.dataFim ? new Date(data.dataFim) : null;

    return this.prisma.objetoContratual.update({
      where: { id },
      data: updateData,
      include: { project: { select: { id: true, codigo: true, nome: true } } },
    });
  }

  async deleteObjeto(id: string) {
    const obj = await this.prisma.objetoContratual.findUnique({ where: { id } });
    if (!obj) throw new NotFoundException('Objeto contratual não encontrado');
    await this.prisma.objetoContratual.update({
      where: { id },
      data: { ativo: false },
    });
  }

  // ═══════════════════════════════════════════
  //  LINHAS CONTRATUAIS
  // ═══════════════════════════════════════════

  async findLinhasByObjeto(objetoContratualId: string) {
    return this.prisma.linhaContratual.findMany({
      where: { objetoContratualId, ativo: true },
      include: {
        objetoContratual: {
          select: { id: true, numero: true, descricao: true, projectId: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findLinhaById(id: string) {
    const linha = await this.prisma.linhaContratual.findUnique({
      where: { id },
      include: {
        objetoContratual: {
          select: {
            id: true,
            numero: true,
            descricao: true,
            projectId: true,
            project: { select: { id: true, codigo: true, nome: true } },
          },
        },
      },
    });
    if (!linha) throw new NotFoundException('Linha contratual não encontrada');
    return linha;
  }

  async findLinhasByProject(projectId: string) {
    return this.prisma.linhaContratual.findMany({
      where: {
        ativo: true,
        objetoContratual: { projectId, ativo: true },
      },
      include: {
        objetoContratual: {
          select: { id: true, numero: true, descricao: true },
        },
      },
      orderBy: [
        { objetoContratual: { numero: 'asc' } },
        { descricaoItem: 'asc' },
      ],
    });
  }

  async createLinha(data: {
    objetoContratualId: string;
    descricaoItem: string;
    unidade: string;
    quantidadeAnualEstimada: number;
    valorUnitario: number;
  }) {
    const qtd = new Decimal(data.quantidadeAnualEstimada);
    const vUnit = new Decimal(data.valorUnitario);
    const valorTotalAnual = qtd.mul(vUnit);

    return this.prisma.linhaContratual.create({
      data: {
        objetoContratualId: data.objetoContratualId,
        descricaoItem: data.descricaoItem,
        unidade: data.unidade,
        quantidadeAnualEstimada: qtd,
        valorUnitario: vUnit,
        valorTotalAnual,
      },
      include: {
        objetoContratual: {
          select: { id: true, numero: true, descricao: true, projectId: true },
        },
      },
    });
  }

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
          select: { id: true, numero: true, descricao: true, projectId: true },
        },
      },
    });

    // US4: Atualização dinâmica — recalcular receitas futuras vinculadas
    if (data.quantidadeAnualEstimada !== undefined || data.valorUnitario !== undefined) {
      const now = new Date();
      const mesAtual = now.getMonth() + 1;
      const anoAtual = now.getFullYear();

      // Buscar receitas futuras desta linha
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

      // Recalcular cada receita com o novo valorUnitario
      for (const receita of receitasFuturas) {
        if (receita.quantidade) {
          const novoTotal = new Decimal(receita.quantidade.toString()).mul(
            new Decimal(vUnit.toString()),
          );
          await this.prisma.receitaMensal.update({
            where: { id: receita.id },
            data: {
              valorUnitario: vUnit,
              valorPrevisto: novoTotal,
            },
          });
        }
      }
    }

    return updated;
  }

  async deleteLinha(id: string) {
    const linha = await this.prisma.linhaContratual.findUnique({ where: { id } });
    if (!linha) throw new NotFoundException('Linha contratual não encontrada');
    await this.prisma.linhaContratual.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
