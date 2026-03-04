import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { FinancialService } from '../financial/financial.service';
import { ProjectsService } from '../projects/projects.service';
import { HrService } from '../hr/hr.service';
import {
  CreateHistoricoDto,
  UpdateHistoricoDto,
  HistoricoFiltersDto,
  RecalculoResultDto,
  TipoRecalculo,
  StatusRecalculo,
} from './dto/recalculo.dto';

@Injectable()
export class RecalculoService {
  private queueChain: Promise<void> = Promise.resolve();
  private readonly filaStatus = new Map<
    string,
    {
      jobId: string;
      tipo: TipoRecalculo;
      entidadeId: string;
      usuarioId: string;
      status: StatusRecalculo;
      createdAt: string;
      startedAt?: string;
      finishedAt?: string;
      result?: RecalculoResultDto;
      erro?: string;
    }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly financialService: FinancialService,
    private readonly projectsService: ProjectsService,
    private readonly hrService: HrService,
  ) {}

  enfileirarRecalculoImposto(impostoId: string, userId: string) {
    return this.enfileirarJob(TipoRecalculo.IMPOSTO, impostoId, userId);
  }

  enfileirarRecalculoCalendario(calendarioId: string, userId: string) {
    return this.enfileirarJob(TipoRecalculo.CALENDARIO, calendarioId, userId);
  }

  enfileirarRecalculoTaxa(colaboradorId: string, userId: string) {
    return this.enfileirarJob(TipoRecalculo.TAXA_COLABORADOR, colaboradorId, userId);
  }

  enfileirarRecalculoDissidio(sindicatoId: string, userId: string) {
    return this.enfileirarJob(TipoRecalculo.DISSIDIO, sindicatoId, userId);
  }

  consultarStatusFila(jobId: string) {
    const job = this.filaStatus.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job '${jobId}' não encontrado na fila`);
    }

    return job;
  }

  /**
   * Recalcula TUDO em cascata após alteração de imposto
   * Fluxo: Imposto alterado → Recalcula custos projetos → Recalcula margens
   */
  async recalcularPorAlteracaoImposto(
    impostoId: string,
    userId: string,
  ): Promise<RecalculoResultDto> {
    const historico = await this.iniciarHistorico({
      tipo: TipoRecalculo.IMPOSTO,
      entidadeId: impostoId,
      entidadeTipo: 'Imposto',
      usuarioId: userId,
    });

    try {
      // Buscar imposto para validação
      const imposto = await this.prisma.imposto.findUnique({
        where: { id: impostoId },
      });

      if (!imposto) {
        throw new NotFoundException(`Imposto '${impostoId}' não encontrado`);
      }

      // Buscar todos os projetos ativos
      const projetos = await this.prisma.project.findMany({
        where: { ativo: true },
        select: { id: true, codigo: true, nome: true },
      });

      const resultados = [];
      for (const projeto of projetos) {
        const { mes, ano } = this.getMesAnoAtual();
        const custo = await this.financialService.calcularCustoTotalCompleto(projeto.id, mes, ano);
        const margem = await this.projectsService.calcularMargens(projeto.id, ano, mes);

        resultados.push({
          projetoId: projeto.id,
          codigo: projeto.codigo,
          nome: projeto.nome,
          custoTotal: custo.custoTotal,
          margemLiquidaPercent: margem.margemLiquidaPercent,
          status: 'recalculado',
          mensagem: `Custos e margens recalculados após alteração de imposto`,
        });
      }

      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: projetos.length,
        processados: projetos.length,
        detalhes: resultados,
      });

      return {
        sucesso: true,
        totalAfetados: projetos.length,
        detalhes: resultados,
      };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.FALHOU,
        mensagemErro: error instanceof Error ? error.message : String(error),
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
  ): Promise<RecalculoResultDto> {
    const historico = await this.iniciarHistorico({
      tipo: TipoRecalculo.CALENDARIO,
      entidadeId: calendarioId,
      entidadeTipo: 'Calendario',
      usuarioId: userId,
    });

    try {
      const calendario = await this.prisma.calendario.findUnique({
        where: { id: calendarioId },
      });

      if (!calendario) {
        throw new NotFoundException(`Calendário '${calendarioId}' não encontrado`);
      }

      // Buscar colaboradores afetados (mesmo estado/cidade ou nacional)
      const whereClause: any = { ativo: true };
      if (calendario.nacional) {
        // Afeta todos
      } else if (calendario.estado) {
        whereClause.OR = [
          { estado: calendario.estado },
          { estado: null }, // Também afeta nacionais
        ];
      }

      const colaboradores = await this.prisma.colaborador.findMany({
        where: whereClause,
        select: { id: true, matricula: true, nome: true, estado: true },
      });

      const resultados = [];
      for (const colab of colaboradores) {
        const { mes, ano } = this.getMesAnoAtual();
        const custo = await this.hrService.calcularCustoIndividual(colab.id, mes, ano);

        resultados.push({
          colaboradorId: colab.id,
          matricula: colab.matricula,
          nome: colab.nome,
          estado: colab.estado,
          fte: custo.fte,
          custoTotal: custo.custoTotal,
          status: 'recalculado',
          mensagem: `Jornadas e FTE recalculados após alteração de calendário`,
        });
      }

      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: colaboradores.length,
        processados: colaboradores.length,
        detalhes: resultados,
      });

      return {
        sucesso: true,
        totalAfetados: colaboradores.length,
        detalhes: resultados,
      };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.FALHOU,
        mensagemErro: error instanceof Error ? error.message : String(error),
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
  ): Promise<RecalculoResultDto> {
    const historico = await this.iniciarHistorico({
      tipo: TipoRecalculo.TAXA_COLABORADOR,
      entidadeId: colaboradorId,
      entidadeTipo: 'Colaborador',
      usuarioId: userId,
    });

    try {
      const colaborador = await this.prisma.colaborador.findUnique({
        where: { id: colaboradorId },
      });

      if (!colaborador) {
        throw new NotFoundException(`Colaborador '${colaboradorId}' não encontrado`);
      }

      // Buscar projetos que alocam este colaborador (através de jornadas)
      const jornadas = await this.prisma.jornada.findMany({
        where: {
          colaboradorId,
          projectId: { not: null },
        },
        select: { id: true, projectId: true },
      });

      // Buscar projetos ativos pelos IDs
      const projectIds = [...new Set(jornadas.map(j => j.projectId).filter(id => id !== null))] as string[];
      const projetosAfetados = projectIds.length > 0 
        ? await this.prisma.project.findMany({
            where: { id: { in: projectIds }, ativo: true },
            select: { id: true, codigo: true, nome: true },
          })
        : [];

      const resultados: any[] = [
        {
          colaboradorId: colaborador.id,
          matricula: colaborador.matricula,
          nome: colaborador.nome,
          taxaHora: colaborador.taxaHora.toNumber(),
          projetosAfetados: projetosAfetados.length,
          status: 'recalculado',
          mensagem: `Custos recalculados para ${projetosAfetados.length} projetos`,
        },
      ];

      const { mes, ano } = this.getMesAnoAtual();
      const custoColaborador = await this.hrService.calcularCustoIndividual(colaborador.id, mes, ano);
      resultados[0].fte = custoColaborador.fte;
      resultados[0].custoTotal = custoColaborador.custoTotal;

      projetosAfetados.forEach((projeto) => {
        resultados.push({
          projetoId: projeto.id,
          codigo: projeto.codigo,
          nome: projeto.nome,
          status: 'recalculado',
          mensagem: `Custos e margens recalculados`,
        });
      });

      for (const projeto of projetosAfetados) {
        const custo = await this.financialService.calcularCustoTotalCompleto(projeto.id, mes, ano);
        const margem = await this.projectsService.calcularMargens(projeto.id, ano, mes);
        const detalhe = resultados.find((item) => item.projetoId === projeto.id);
        if (detalhe) {
          detalhe.custoTotal = custo.custoTotal;
          detalhe.margemLiquidaPercent = margem.margemLiquidaPercent;
        }
      }

      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: projetosAfetados.length + 1,
        processados: projetosAfetados.length + 1,
        detalhes: resultados,
      });

      return {
        sucesso: true,
        totalAfetados: projetosAfetados.length + 1,
        detalhes: resultados,
      };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.FALHOU,
        mensagemErro: error instanceof Error ? error.message : String(error),
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
  ): Promise<RecalculoResultDto> {
    const historico = await this.iniciarHistorico({
      tipo: TipoRecalculo.DISSIDIO,
      entidadeId: sindicatoId,
      entidadeTipo: 'Sindicato',
      usuarioId: userId,
    });

    try {
      const sindicato = await this.prisma.sindicato.findUnique({
        where: { id: sindicatoId },
        include: {
          colaboradores: {
            where: { ativo: true },
            select: { id: true, matricula: true, nome: true, taxaHora: true },
          },
        },
      });

      if (!sindicato) {
        throw new NotFoundException(`Sindicato '${sindicatoId}' não encontrado`);
      }

      const percentualReajuste = sindicato.percentualDissidio.toNumber();
      const resultados = [];
      const projetosAfetados = new Set<string>();
      const { mes, ano } = this.getMesAnoAtual();

      // Aplicar dissídio a cada colaborador
      for (const colab of sindicato.colaboradores) {
        const taxaAntiga = colab.taxaHora.toNumber();
        const taxaNova = taxaAntiga * (1 + percentualReajuste);

        await this.prisma.colaborador.update({
          where: { id: colab.id },
          data: { taxaHora: new Decimal(taxaNova) },
        });

        const jornadas = await this.prisma.jornada.findMany({
          where: {
            colaboradorId: colab.id,
            projectId: { not: null },
          },
          select: { projectId: true },
        });
        jornadas.forEach((jornada) => {
          if (jornada.projectId) {
            projetosAfetados.add(jornada.projectId);
          }
        });

        const custo = await this.hrService.calcularCustoIndividual(colab.id, mes, ano);

        resultados.push({
          colaboradorId: colab.id,
          matricula: colab.matricula,
          nome: colab.nome,
          taxaAntiga,
          taxaNova,
          fte: custo.fte,
          custoTotal: custo.custoTotal,
          percentualReajuste: (percentualReajuste * 100).toFixed(2) + '%',
          status: 'atualizado',
        });
      }

      for (const projectId of projetosAfetados) {
        const projeto = await this.prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, codigo: true, nome: true },
        });
        if (!projeto) continue;

        const custo = await this.financialService.calcularCustoTotalCompleto(projectId, mes, ano);
        const margem = await this.projectsService.calcularMargens(projectId, ano, mes);

        resultados.push({
          projetoId: projeto.id,
          codigo: projeto.codigo,
          nome: projeto.nome,
          custoTotal: custo.custoTotal,
          margemLiquidaPercent: margem.margemLiquidaPercent,
          status: 'recalculado',
        });
      }

      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: resultados.length,
        processados: resultados.length,
        detalhes: resultados,
      });

      return {
        sucesso: true,
        totalAfetados: resultados.length,
        detalhes: resultados,
      };
    } catch (error) {
      await this.finalizarHistorico(historico.id, {
        status: StatusRecalculo.FALHOU,
        mensagemErro: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Consulta histórico de recálculos com filtros
   */
  async consultarHistorico(filters: HistoricoFiltersDto) {
    const where: any = {};
    if (filters.tipo) where.tipo = filters.tipo;
    if (filters.status) where.status = filters.status;
    if (filters.usuarioId) where.usuarioId = filters.usuarioId;

    if (filters.dataInicio || filters.dataFim) {
      where.createdAt = {};
      if (filters.dataInicio) where.createdAt.gte = new Date(filters.dataInicio);
      if (filters.dataFim) where.createdAt.lte = new Date(filters.dataFim);
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [historicos, total] = await Promise.all([
      this.prisma.historicoRecalculo.findMany({
        where,
        include: {
          usuario: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.historicoRecalculo.count({ where }),
    ]);

    return {
      historicos,
      total,
      pagina: Math.floor(offset / limit) + 1,
      totalPaginas: Math.ceil(total / limit),
      itensPorPagina: limit,
    };
  }

  /**
   * Busca detalhes de um recálculo específico
   */
  async detalheRecalculo(id: string) {
    const historico = await this.prisma.historicoRecalculo.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!historico) {
      throw new NotFoundException(`Histórico de recálculo '${id}' não encontrado`);
    }

    return historico;
  }

  // ===================== MÉTODOS AUXILIARES =====================

  private async iniciarHistorico(data: CreateHistoricoDto) {
    return this.prisma.historicoRecalculo.create({
      data: {
        ...data,
        status: StatusRecalculo.PROCESSANDO,
        dataInicio: new Date(),
        detalhes: Prisma.JsonNull,
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

  private getMesAnoAtual() {
    const now = new Date();
    return {
      mes: now.getMonth() + 1,
      ano: now.getFullYear(),
    };
  }

  private enfileirarJob(tipo: TipoRecalculo, entidadeId: string, userId: string) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    this.filaStatus.set(jobId, {
      jobId,
      tipo,
      entidadeId,
      usuarioId: userId,
      status: StatusRecalculo.INICIADO,
      createdAt: new Date().toISOString(),
    });

    this.queueChain = this.queueChain
      .then(async () => {
        const job = this.filaStatus.get(jobId);
        if (!job) return;

        job.status = StatusRecalculo.PROCESSANDO;
        job.startedAt = new Date().toISOString();

        try {
          let result: RecalculoResultDto;

          if (tipo === TipoRecalculo.IMPOSTO) {
            result = await this.recalcularPorAlteracaoImposto(entidadeId, userId);
          } else if (tipo === TipoRecalculo.CALENDARIO) {
            result = await this.recalcularPorAlteracaoCalendario(entidadeId, userId);
          } else if (tipo === TipoRecalculo.TAXA_COLABORADOR) {
            result = await this.recalcularPorAlteracaoTaxa(entidadeId, userId);
          } else {
            result = await this.recalcularPorDissidio(entidadeId, userId);
          }

          job.status = StatusRecalculo.CONCLUIDO;
          job.finishedAt = new Date().toISOString();
          job.result = result;
        } catch (error) {
          job.status = StatusRecalculo.FALHOU;
          job.finishedAt = new Date().toISOString();
          job.erro = error instanceof Error ? error.message : String(error);
        }
      })
      .catch(() => undefined);

    return {
      jobId,
      status: StatusRecalculo.INICIADO,
      mensagem: 'Recálculo enfileirado com sucesso',
    };
  }
}
