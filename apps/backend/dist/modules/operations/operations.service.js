"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../../prisma/prisma.service");
const calendario_service_1 = require("../calendario/calendario.service");
let OperationsService = class OperationsService {
    constructor(prisma, calendarioService) {
        this.prisma = prisma;
        this.calendarioService = calendarioService;
    }
    async ajusteMassivoJornada(dto) {
        if (dto.horasRealizadas === undefined && dto.percentualAjuste === undefined) {
            throw new common_1.BadRequestException('Informe horasRealizadas ou percentualAjuste');
        }
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project) {
            throw new common_1.NotFoundException(`Projeto '${dto.projectId}' não encontrado`);
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
            throw new common_1.NotFoundException('Nenhuma jornada encontrada para os filtros informados');
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
                        horasRealizadas: new library_1.Decimal(horasAtualizadas),
                        fte: new library_1.Decimal(Number(fte.toFixed(2))),
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
                        custoFixo: new library_1.Decimal(0),
                        custoVariavel: new library_1.Decimal(Number(custoVariavel.toFixed(2))),
                    },
                    update: {
                        custoVariavel: new library_1.Decimal(Number(custoVariavel.toFixed(2))),
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
    async ajusteMassivoTaxa(dto) {
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
            throw new common_1.NotFoundException('Nenhum colaborador encontrado para ajuste de taxa');
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
                    data: { taxaHora: new library_1.Decimal(Number(novaTaxa.toFixed(2))) },
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
                        if (!jornada.projectId)
                            continue;
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
                                custoFixo: new library_1.Decimal(0),
                                custoVariavel: new library_1.Decimal(Number(custoVariavel.toFixed(2))),
                            },
                            update: {
                                custoVariavel: new library_1.Decimal(Number(custoVariavel.toFixed(2))),
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
    async listarHistorico(projectId, limit = 20) {
        return this.prisma.historicoCalculo.findMany({
            where: projectId ? { projectId } : {},
            orderBy: { createdAt: 'desc' },
            take: Math.min(limit, 100),
        });
    }
    async rollbackMassivo(historicoId) {
        const historico = await this.prisma.historicoCalculo.findUnique({ where: { id: historicoId } });
        if (!historico) {
            throw new common_1.NotFoundException(`Histórico '${historicoId}' não encontrado`);
        }
        const dadosAntes = historico.dadosAntes;
        await this.prisma.$transaction(async (tx) => {
            if (dadosAntes.jornadasAntes?.length) {
                for (const jornada of dadosAntes.jornadasAntes) {
                    await tx.jornada.update({
                        where: { id: jornada.id },
                        data: {
                            horasRealizadas: new library_1.Decimal(jornada.horasRealizadas),
                            fte: new library_1.Decimal(jornada.fte),
                        },
                    });
                }
            }
            if (dadosAntes.colaboradoresAntes?.length) {
                for (const colaborador of dadosAntes.colaboradoresAntes) {
                    await tx.colaborador.update({
                        where: { id: colaborador.id },
                        data: { taxaHora: new library_1.Decimal(colaborador.taxaHora) },
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
                            custoFixo: new library_1.Decimal(Number(custo.custoFixo)),
                            custoVariavel: new library_1.Decimal(Number(custo.custoVariavel)),
                        },
                        update: {
                            custoFixo: new library_1.Decimal(Number(custo.custoFixo)),
                            custoVariavel: new library_1.Decimal(Number(custo.custoVariavel)),
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
    async registrarSnapshot(projectId, payload, criadoPor) {
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
    async descobrirProjetoParaHistorico(colaboradorIds) {
        const jornada = await this.prisma.jornada.findFirst({
            where: {
                projectId: { not: null },
                ...(colaboradorIds?.length ? { colaboradorId: { in: colaboradorIds } } : {}),
            },
            select: { projectId: true },
        });
        if (!jornada?.projectId) {
            throw new common_1.BadRequestException('Não foi possível determinar projectId para histórico. Informe colaboradores alocados em projeto.');
        }
        return jornada.projectId;
    }
    // ===================== RECÁLCULO EM CASCATA =====================
    // Engine: TAXA × CALENDÁRIO × HORAS × CUSTO × FTE
    async recalculoCascata(dto) {
        const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
        if (!project)
            throw new common_1.NotFoundException(`Projeto '${dto.projectId}' não encontrado`);
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
            throw new common_1.NotFoundException('Nenhum colaborador ativo encontrado para recálculo');
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
        const detalhes = [];
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
                        horasPrevistas: new library_1.Decimal(horasPrevistas),
                        horasRealizadas: new library_1.Decimal(0),
                        fte: new library_1.Decimal(fte),
                    },
                    update: {
                        horasPrevistas: new library_1.Decimal(horasPrevistas),
                        fte: new library_1.Decimal(fte),
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
                        custoFixo: new library_1.Decimal(0),
                        custoVariavel: new library_1.Decimal(custoVariavel),
                    },
                    update: {
                        custoVariavel: new library_1.Decimal(custoVariavel),
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
            jornadasDepois: jornadasDepois,
            custosAntes: custosAntes.map(c => ({
                colaboradorId: c.colaboradorId,
                projectId: c.projectId,
                mes: c.mes,
                ano: c.ano,
                custoFixo: Number(c.custoFixo),
                custoVariavel: Number(c.custoVariavel),
            })),
            custosDepois: custosDepois,
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
    async recalculoCascataRange(dto) {
        const results = [];
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
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        calendario_service_1.CalendarioService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map