import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkAjusteJornadaDto, BulkAjusteTaxaDto } from './dto/mass-update.dto';
import { RecalculoCascataDto, RecalculoRangeDto } from './dto/recalculo-cascata.dto';
import { CalendarioService } from '../calendario/calendario.service';

interface SnapshotPayload {
  tipo: string;
  motivo: string;
  jornadasAntes?: any[];
  jornadasDepois?: any[];
  colaboradoresAntes?: any[];
  colaboradoresDepois?: any[];
  custosAntes?: any[];
  custosDepois?: any[];
}

@Injectable()
export class OperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarioService: CalendarioService,
  ) {}

  async ajusteMassivoJornada(dto: BulkAjusteJornadaDto) {
    if (dto.horasRealizadas === undefined && dto.percentualAjuste === undefined) {
      throw new BadRequestException('Informe horasRealizadas ou percentualAjuste');
    }

    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Projeto '${dto.projectId}' não encontrado`);
    }

    const jornadas = await this.prisma.jornada.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        ...(dto.colaboradorIds?.length ? { colaboradorId: { in: dto.colaboradorIds } } : {}),
      },
      include: {
        colaborador: {
          select: { id: true, nome: true, taxaHora: true, cargaHoraria: true, ativo: true },
        },
      },
    });

    if (!jornadas.length) {
      throw new NotFoundException('Nenhuma jornada encontrada para os filtros informados');
    }

    const jornadasAntes = jornadas.map((j) => ({
      id: j.id,
      horasRealizadas: Number(j.horasRealizadas),
      fte: Number(j.fte),
      colaboradorId: j.colaboradorId,
      projectId: j.projectId,
      mes: j.mes,
      ano: j.ano,
    }));

    const custosAntes = await this.prisma.custoMensal.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: jornadas.map((j) => j.colaboradorId) },
      },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const jornada of jornadas) {
        const horasBase = Number(jornada.horasRealizadas);
        const horasAtualizadas = dto.horasRealizadas !== undefined
          ? dto.horasRealizadas
          : Math.max(0, horasBase * (1 + Number(dto.percentualAjuste) / 100));

        const fte = jornada.colaborador.cargaHoraria > 0
          ? horasAtualizadas / jornada.colaborador.cargaHoraria
          : 0;

        await tx.jornada.update({
          where: { id: jornada.id },
          data: {
            horasRealizadas: new Decimal(horasAtualizadas),
            fte: new Decimal(Number(fte.toFixed(2))),
          },
        });

        const custoVariavel = horasAtualizadas * Number(jornada.colaborador.taxaHora);
        await tx.custoMensal.upsert({
          where: {
            colaboradorId_projectId_mes_ano: {
              colaboradorId: jornada.colaboradorId,
              projectId: dto.projectId,
              mes: dto.mes,
              ano: dto.ano,
            },
          },
          create: {
            colaboradorId: jornada.colaboradorId,
            projectId: dto.projectId,
            mes: dto.mes,
            ano: dto.ano,
            custoFixo: new Decimal(0),
            custoVariavel: new Decimal(Number(custoVariavel.toFixed(2))),
          },
          update: {
            custoVariavel: new Decimal(Number(custoVariavel.toFixed(2))),
          },
        });
      }
    });

    const jornadasDepois = await this.prisma.jornada.findMany({
      where: { id: { in: jornadas.map((j) => j.id) } },
      select: {
        id: true,
        horasRealizadas: true,
        fte: true,
        colaboradorId: true,
        projectId: true,
        mes: true,
        ano: true,
      },
    });

    const custosDepois = await this.prisma.custoMensal.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: jornadas.map((j) => j.colaboradorId) },
      },
    });

    const snapshot = await this.registrarSnapshot(dto.projectId, {
      tipo: 'ajuste_massivo_jornada',
      motivo: dto.motivo,
      jornadasAntes,
      jornadasDepois,
      custosAntes,
      custosDepois,
    }, dto.criadoPor);

    return {
      success: true,
      processados: jornadas.length,
      historicoId: snapshot.id,
      message: 'Ajuste massivo de jornada aplicado com recálculo de custos',
    };
  }

  async ajusteMassivoTaxa(dto: BulkAjusteTaxaDto) {
    const colaboradores = await this.prisma.colaborador.findMany({
      where: {
        ativo: true,
        ...(dto.colaboradorIds?.length ? { id: { in: dto.colaboradorIds } } : {}),
      },
      select: {
        id: true,
        nome: true,
        taxaHora: true,
      },
    });

    if (!colaboradores.length) {
      throw new NotFoundException('Nenhum colaborador encontrado para ajuste de taxa');
    }

    const colaboradoresAntes = colaboradores.map((c) => ({
      id: c.id,
      nome: c.nome,
      taxaHora: Number(c.taxaHora),
    }));

    await this.prisma.$transaction(async (tx) => {
      for (const colaborador of colaboradores) {
        const novaTaxa = Number(colaborador.taxaHora) * (1 + dto.percentualAjuste / 100);
        await tx.colaborador.update({
          where: { id: colaborador.id },
          data: { taxaHora: new Decimal(Number(novaTaxa.toFixed(2))) },
        });

        if (dto.mes && dto.ano) {
          const jornadas = await tx.jornada.findMany({
            where: {
              colaboradorId: colaborador.id,
              mes: dto.mes,
              ano: dto.ano,
              projectId: { not: null },
            },
            select: { projectId: true, horasRealizadas: true },
          });

          for (const jornada of jornadas) {
            if (!jornada.projectId) continue;
            const custoVariavel = Number(jornada.horasRealizadas) * Number(novaTaxa.toFixed(2));
            await tx.custoMensal.upsert({
              where: {
                colaboradorId_projectId_mes_ano: {
                  colaboradorId: colaborador.id,
                  projectId: jornada.projectId,
                  mes: dto.mes,
                  ano: dto.ano,
                },
              },
              create: {
                colaboradorId: colaborador.id,
                projectId: jornada.projectId,
                mes: dto.mes,
                ano: dto.ano,
                custoFixo: new Decimal(0),
                custoVariavel: new Decimal(Number(custoVariavel.toFixed(2))),
              },
              update: {
                custoVariavel: new Decimal(Number(custoVariavel.toFixed(2))),
              },
            });
          }
        }
      }
    });

    const colaboradoresDepois = await this.prisma.colaborador.findMany({
      where: { id: { in: colaboradores.map((c) => c.id) } },
      select: { id: true, nome: true, taxaHora: true },
    });

    const projectId = dto.mes && dto.ano
      ? await this.descobrirProjetoParaHistorico(dto.colaboradorIds)
      : await this.descobrirProjetoParaHistorico(dto.colaboradorIds);

    const snapshot = await this.registrarSnapshot(projectId, {
      tipo: 'ajuste_massivo_taxa',
      motivo: dto.motivo,
      colaboradoresAntes,
      colaboradoresDepois,
    }, dto.criadoPor);

    return {
      success: true,
      processados: colaboradores.length,
      historicoId: snapshot.id,
      message: 'Ajuste massivo de taxa aplicado com recálculo em cascata',
    };
  }

  async listarHistorico(projectId?: string, limit = 20) {
    return this.prisma.historicoCalculo.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });
  }

  async rollbackMassivo(historicoId: string) {
    const historico = await this.prisma.historicoCalculo.findUnique({ where: { id: historicoId } });
    if (!historico) {
      throw new NotFoundException(`Histórico '${historicoId}' não encontrado`);
    }

    const dadosAntes = historico.dadosAntes as unknown as SnapshotPayload;

    await this.prisma.$transaction(async (tx) => {
      if (dadosAntes.jornadasAntes?.length) {
        for (const jornada of dadosAntes.jornadasAntes) {
          await tx.jornada.update({
            where: { id: jornada.id },
            data: {
              horasRealizadas: new Decimal(jornada.horasRealizadas),
              fte: new Decimal(jornada.fte),
            },
          });
        }
      }

      if (dadosAntes.colaboradoresAntes?.length) {
        for (const colaborador of dadosAntes.colaboradoresAntes) {
          await tx.colaborador.update({
            where: { id: colaborador.id },
            data: { taxaHora: new Decimal(colaborador.taxaHora) },
          });
        }
      }

      if (dadosAntes.custosAntes?.length) {
        for (const custo of dadosAntes.custosAntes) {
          await tx.custoMensal.upsert({
            where: {
              colaboradorId_projectId_mes_ano: {
                colaboradorId: custo.colaboradorId,
                projectId: custo.projectId,
                mes: custo.mes,
                ano: custo.ano,
              },
            },
            create: {
              colaboradorId: custo.colaboradorId,
              projectId: custo.projectId,
              mes: custo.mes,
              ano: custo.ano,
              custoFixo: new Decimal(Number(custo.custoFixo)),
              custoVariavel: new Decimal(Number(custo.custoVariavel)),
            },
            update: {
              custoFixo: new Decimal(Number(custo.custoFixo)),
              custoVariavel: new Decimal(Number(custo.custoVariavel)),
            },
          });
        }
      }
    });

    return {
      success: true,
      historicoId,
      message: 'Rollback aplicado com sucesso',
    };
  }

  private async registrarSnapshot(projectId: string, payload: SnapshotPayload, criadoPor?: string) {
    return this.prisma.historicoCalculo.create({
      data: {
        projectId,
        tipo: payload.tipo,
        criadoPor,
        dadosAntes: {
          tipo: payload.tipo,
          motivo: payload.motivo,
          jornadasAntes: payload.jornadasAntes,
          colaboradoresAntes: payload.colaboradoresAntes,
          custosAntes: payload.custosAntes,
        },
        dadosDepois: {
          tipo: payload.tipo,
          motivo: payload.motivo,
          jornadasDepois: payload.jornadasDepois,
          colaboradoresDepois: payload.colaboradoresDepois,
          custosDepois: payload.custosDepois,
        },
      },
    });
  }

  private async descobrirProjetoParaHistorico(colaboradorIds?: string[]) {
    const jornada = await this.prisma.jornada.findFirst({
      where: {
        projectId: { not: null },
        ...(colaboradorIds?.length ? { colaboradorId: { in: colaboradorIds } } : {}),
      },
      select: { projectId: true },
    });

    if (!jornada?.projectId) {
      throw new BadRequestException(
        'Não foi possível determinar projectId para histórico. Informe colaboradores alocados em projeto.',
      );
    }

    return jornada.projectId;
  }

  // ===================== RECÁLCULO EM CASCATA =====================
  // Engine: TAXA × CALENDÁRIO × HORAS × CUSTO × FTE

  async recalculoCascata(dto: RecalculoCascataDto) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException(`Projeto '${dto.projectId}' não encontrado`);

    // 1. Buscar colaboradores alocados no projeto
    const whereColaborador = dto.colaboradorIds?.length
      ? { id: { in: dto.colaboradorIds }, ativo: true }
      : { ativo: true };

    const colaboradores = await this.prisma.colaborador.findMany({
      where: whereColaborador,
      select: {
        id: true,
        matricula: true,
        nome: true,
        taxaHora: true,
        cargaHoraria: true,
        cidade: true,
        estado: true,
      },
    });

    if (!colaboradores.length) {
      throw new NotFoundException('Nenhum colaborador ativo encontrado para recálculo');
    }

    // 2. Snapshot ANTES
    const jornadasAntes = await this.prisma.jornada.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: colaboradores.map(c => c.id) },
      },
    });

    const custosAntes = await this.prisma.custoMensal.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: colaboradores.map(c => c.id) },
      },
    });

    const detalhes: Array<{
      colaboradorId: string;
      matricula: string;
      nome: string;
      diasUteis: number;
      horasPrevistas: number;
      taxaHora: number;
      custoVariavel: number;
      fte: number;
    }> = [];

    // 3. Para cada colaborador: CALENDÁRIO → HORAS → CUSTO → FTE
    await this.prisma.$transaction(async (tx) => {
      for (const colab of colaboradores) {
        // 3a. Buscar dias úteis pela região do colaborador
        const diasUteis = await this.calendarioService.calcularDiasUteis({
          mes: dto.mes,
          ano: dto.ano,
          estado: colab.estado,
          cidade: colab.cidade,
        });

        // 3b. Calcular horas previstas = dias úteis × jornada diária
        const jornadaDiaria = colab.cargaHoraria > 0
          ? colab.cargaHoraria / 22 // Aproximar jornada diária (cargaHoraria mensal / 22 dias base)
          : 8;
        const horasPrevistas = Math.round(diasUteis.diasUteisLiquidos * jornadaDiaria * 100) / 100;

        // 3c. Calcular custo = horas × taxa
        const taxaHora = Number(colab.taxaHora);
        const custoVariavel = Math.round(horasPrevistas * taxaHora * 100) / 100;

        // 3d. Calcular FTE = horas previstas / carga horária padrão
        const fte = colab.cargaHoraria > 0
          ? Math.round((horasPrevistas / colab.cargaHoraria) * 100) / 100
          : 0;

        // 3e. Atualizar jornada
        await tx.jornada.upsert({
          where: {
            colaboradorId_mes_ano: {
              colaboradorId: colab.id,
              mes: dto.mes,
              ano: dto.ano,
            },
          },
          create: {
            colaboradorId: colab.id,
            projectId: dto.projectId,
            mes: dto.mes,
            ano: dto.ano,
            horasPrevistas: new Decimal(horasPrevistas),
            horasRealizadas: new Decimal(0),
            fte: new Decimal(fte),
          },
          update: {
            horasPrevistas: new Decimal(horasPrevistas),
            fte: new Decimal(fte),
          },
        });

        // 3f. Atualizar custo mensal
        await tx.custoMensal.upsert({
          where: {
            colaboradorId_projectId_mes_ano: {
              colaboradorId: colab.id,
              projectId: dto.projectId,
              mes: dto.mes,
              ano: dto.ano,
            },
          },
          create: {
            colaboradorId: colab.id,
            projectId: dto.projectId,
            mes: dto.mes,
            ano: dto.ano,
            custoFixo: new Decimal(0),
            custoVariavel: new Decimal(custoVariavel),
          },
          update: {
            custoVariavel: new Decimal(custoVariavel),
          },
        });

        detalhes.push({
          colaboradorId: colab.id,
          matricula: colab.matricula,
          nome: colab.nome,
          diasUteis: diasUteis.diasUteisLiquidos,
          horasPrevistas,
          taxaHora,
          custoVariavel,
          fte,
        });
      }
    });

    // 4. Snapshot DEPOIS
    const jornadasDepois = await this.prisma.jornada.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: colaboradores.map(c => c.id) },
      },
    });

    const custosDepois = await this.prisma.custoMensal.findMany({
      where: {
        projectId: dto.projectId,
        mes: dto.mes,
        ano: dto.ano,
        colaboradorId: { in: colaboradores.map(c => c.id) },
      },
    });

    // 5. Registrar histórico com snapshot
    const snapshot = await this.registrarSnapshot(dto.projectId, {
      tipo: 'recalculo_cascata',
      motivo: dto.motivo,
      jornadasAntes: jornadasAntes.map(j => ({
        id: j.id,
        horasPrevistas: Number(j.horasPrevistas),
        horasRealizadas: Number(j.horasRealizadas),
        fte: Number(j.fte),
        colaboradorId: j.colaboradorId,
        projectId: j.projectId,
        mes: j.mes,
        ano: j.ano,
      })),
      jornadasDepois: jornadasDepois as any[],
      custosAntes: custosAntes.map(c => ({
        colaboradorId: c.colaboradorId,
        projectId: c.projectId,
        mes: c.mes,
        ano: c.ano,
        custoFixo: Number(c.custoFixo),
        custoVariavel: Number(c.custoVariavel),
      })),
      custosDepois: custosDepois as any[],
    }, dto.criadoPor);

    return {
      success: true,
      processados: colaboradores.length,
      historicoId: snapshot.id,
      mes: dto.mes,
      ano: dto.ano,
      detalhes,
      resumo: {
        totalHorasPrevistas: detalhes.reduce((s, d) => s + d.horasPrevistas, 0),
        totalCustoVariavel: Math.round(detalhes.reduce((s, d) => s + d.custoVariavel, 0) * 100) / 100,
        fteMedia: detalhes.length > 0
          ? Math.round((detalhes.reduce((s, d) => s + d.fte, 0) / detalhes.length) * 100) / 100
          : 0,
      },
      message: 'Recálculo em cascata (TAXA × CALENDÁRIO × HORAS × CUSTO × FTE) aplicado com sucesso',
    };
  }

  // ===================== RECÁLCULO EM RANGE DE MESES =====================

  async recalculoCascataRange(dto: RecalculoRangeDto) {
    const results: Record<string, any>[] = [];

    for (let mes = dto.mesInicio; mes <= dto.mesFim; mes++) {
      const resultado = await this.recalculoCascata({
        projectId: dto.projectId,
        mes,
        ano: dto.ano,
        motivo: dto.motivo,
        criadoPor: dto.criadoPor,
      });
      results.push({
        mes,
        processados: resultado.processados,
        historicoId: resultado.historicoId,
        resumo: resultado.resumo,
      });
    }

    return {
      success: true,
      projectId: dto.projectId,
      ano: dto.ano,
      mesInicio: dto.mesInicio,
      mesFim: dto.mesFim,
      totalMeses: results.length,
      resultados: results,
      message: `Recálculo em cascata aplicado para ${results.length} meses`,
    };
  }
}
