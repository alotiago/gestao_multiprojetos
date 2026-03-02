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
exports.HrService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
let HrService = class HrService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===================== COLABORADORES =====================
    async findAll(filters) {
        const { search, status, estado, cidade, cargo, sindicatoId, page = 1, limit = 20, orderBy = 'nome', order = 'asc', } = filters;
        const skip = (page - 1) * limit;
        const where = { ativo: true };
        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { matricula: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cargo: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (estado)
            where.estado = { contains: estado, mode: 'insensitive' };
        if (cidade)
            where.cidade = { contains: cidade, mode: 'insensitive' };
        if (cargo)
            where.cargo = { contains: cargo, mode: 'insensitive' };
        if (sindicatoId)
            where.sindicatoId = sindicatoId;
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
    async findById(id) {
        const colaborador = await this.prisma.colaborador.findFirst({
            where: {
                OR: [{ id }, { matricula: id }],
                ativo: true,
            },
            include: {
                sindicato: true,
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
            throw new common_1.NotFoundException(`Colaborador '${id}' não encontrado`);
        }
        return colaborador;
    }
    async create(dto) {
        const exists = await this.prisma.colaborador.findFirst({
            where: {
                OR: [
                    { matricula: dto.matricula },
                    ...(dto.email ? [{ email: dto.email }] : []),
                ],
            },
        });
        if (exists) {
            throw new common_1.ConflictException(exists.matricula === dto.matricula
                ? `Matrícula '${dto.matricula}' já cadastrada`
                : `Email '${dto.email}' já cadastrado`);
        }
        if (dto.sindicatoId) {
            const sindicato = await this.prisma.sindicato.findUnique({
                where: { id: dto.sindicatoId },
            });
            if (!sindicato) {
                throw new common_1.NotFoundException(`Sindicato '${dto.sindicatoId}' não encontrado`);
            }
        }
        return this.prisma.colaborador.create({
            data: {
                ...dto,
                taxaHora: new library_1.Decimal(dto.taxaHora),
                dataAdmissao: new Date(dto.dataAdmissao),
                status: dto.status || client_1.UserStatus.ATIVO,
            },
            include: {
                sindicato: { select: { id: true, nome: true } },
            },
        });
    }
    async update(id, dto) {
        const colaborador = await this.findById(id);
        if (dto.sindicatoId) {
            const sindicato = await this.prisma.sindicato.findUnique({
                where: { id: dto.sindicatoId },
            });
            if (!sindicato) {
                throw new common_1.NotFoundException(`Sindicato '${dto.sindicatoId}' não encontrado`);
            }
        }
        const updateData = { ...dto };
        if (dto.taxaHora !== undefined)
            updateData.taxaHora = new library_1.Decimal(dto.taxaHora);
        return this.prisma.colaborador.update({
            where: { id: colaborador.id },
            data: updateData,
            include: {
                sindicato: { select: { id: true, nome: true } },
            },
        });
    }
    async delete(id) {
        const colaborador = await this.findById(id);
        return this.prisma.colaborador.update({
            where: { id: colaborador.id },
            data: { ativo: false, status: client_1.UserStatus.INATIVO },
        });
    }
    // ===================== IMPORTAÇÃO CSV =====================
    async importarCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new common_1.BadRequestException('CSV deve conter header e ao menos uma linha de dados');
        }
        const header = lines[0].split(';').map(h => h.trim().toLowerCase());
        const requiredFields = ['matricula', 'nome', 'cargo', 'taxahora', 'cargahoraria', 'cidade', 'estado', 'dataadmissao'];
        for (const field of requiredFields) {
            if (!header.includes(field)) {
                throw new common_1.BadRequestException(`Campo obrigatório ausente no CSV: ${field}`);
            }
        }
        let imported = 0;
        const errors = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line)
                continue;
            const values = line.split(';').map(v => v.trim());
            const row = {};
            header.forEach((h, idx) => (row[h] = values[idx] || ''));
            try {
                const dto = {
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
                        taxaHora: new library_1.Decimal(dto.taxaHora),
                        dataAdmissao: new Date(dto.dataAdmissao),
                    },
                });
                imported++;
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                errors.push(`Linha ${i + 1}: ${msg}`);
            }
        }
        return { imported, errors };
    }
    // ===================== JORNADAS =====================
    async findJornadas(colaboradorId, ano) {
        const colaborador = await this.findById(colaboradorId);
        const where = { colaboradorId: colaborador.id };
        if (ano)
            where.ano = ano;
        return this.prisma.jornada.findMany({
            where,
            orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        });
    }
    async createJornada(colaboradorId, dto) {
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
            throw new common_1.ConflictException(`Jornada para ${dto.mes}/${dto.ano} já existe`);
        }
        const horasRealizadas = dto.horasRealizadas ?? 0;
        const fte = this.calcularFTE(horasRealizadas, colaborador.cargaHoraria);
        return this.prisma.jornada.create({
            data: {
                colaboradorId: colaborador.id,
                mes: dto.mes,
                ano: dto.ano,
                horasPrevistas: new library_1.Decimal(dto.horasPrevistas),
                horasRealizadas: new library_1.Decimal(horasRealizadas),
                fte: new library_1.Decimal(fte),
            },
        });
    }
    async updateJornada(colaboradorId, jornadaId, dto) {
        const colaborador = await this.findById(colaboradorId);
        const jornada = await this.prisma.jornada.findFirst({
            where: { id: jornadaId, colaboradorId: colaborador.id },
        });
        if (!jornada) {
            throw new common_1.NotFoundException(`Jornada '${jornadaId}' não encontrada`);
        }
        const updateData = {};
        if (dto.horasPrevistas !== undefined)
            updateData.horasPrevistas = new library_1.Decimal(dto.horasPrevistas);
        if (dto.horasRealizadas !== undefined) {
            updateData.horasRealizadas = new library_1.Decimal(dto.horasRealizadas);
            updateData.fte = new library_1.Decimal(this.calcularFTE(dto.horasRealizadas, colaborador.cargaHoraria));
        }
        return this.prisma.jornada.update({
            where: { id: jornadaId },
            data: updateData,
        });
    }
    async bulkCreateJornadas(dto) {
        const results = [];
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
                        horasPrevistas: new library_1.Decimal(dto.horasPrevistas),
                        horasRealizadas: new library_1.Decimal(0),
                        fte: new library_1.Decimal(fte),
                    },
                    update: {
                        horasPrevistas: new library_1.Decimal(dto.horasPrevistas),
                        fte: new library_1.Decimal(fte),
                    },
                });
                results.push({ colaboradorId, success: true });
            }
            catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                results.push({ colaboradorId, success: false, error: msg });
            }
        }
        return results;
    }
    // ===================== FÉRIAS =====================
    async findFerias(colaboradorId) {
        const colaborador = await this.findById(colaboradorId);
        return this.prisma.ferias.findMany({
            where: { colaboradorId: colaborador.id },
            orderBy: { dataInicio: 'desc' },
        });
    }
    async createFerias(colaboradorId, dto) {
        const colaborador = await this.findById(colaboradorId);
        const dataInicio = new Date(dto.dataInicio);
        const dataFim = new Date(dto.dataFim);
        if (dataFim <= dataInicio) {
            throw new common_1.BadRequestException('Data de fim deve ser posterior à data de início');
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
    async updateFerias(colaboradorId, feriasId, dto) {
        const colaborador = await this.findById(colaboradorId);
        const ferias = await this.prisma.ferias.findFirst({
            where: { id: feriasId, colaboradorId: colaborador.id },
        });
        if (!ferias) {
            throw new common_1.NotFoundException(`Férias '${feriasId}' não encontradas`);
        }
        const updateData = {};
        if (dto.dataInicio)
            updateData.dataInicio = new Date(dto.dataInicio);
        if (dto.dataFim)
            updateData.dataFim = new Date(dto.dataFim);
        if (dto.aprovado !== undefined)
            updateData.aprovado = dto.aprovado;
        const dataInicio = updateData.dataInicio || ferias.dataInicio;
        const dataFim = updateData.dataFim || ferias.dataFim;
        updateData.dias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
        return this.prisma.ferias.update({
            where: { id: feriasId },
            data: updateData,
        });
    }
    // ===================== DESLIGAMENTO =====================
    async createDesligamento(colaboradorId, dto) {
        const colaborador = await this.findById(colaboradorId);
        if (colaborador.desligamento) {
            throw new common_1.ConflictException(`Colaborador '${colaborador.nome}' já possui desligamento registrado`);
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
                    status: client_1.UserStatus.DESLIGADO,
                    dataDesligamento: new Date(dto.dataDesligamento),
                },
            });
            return desligamento;
        });
    }
    // ===================== CÁLCULO FTE E CUSTO =====================
    calcularFTE(horasRealizadas, cargaHoraria) {
        if (cargaHoraria <= 0)
            return 0;
        return Math.round((horasRealizadas / cargaHoraria) * 100) / 100;
    }
    async calcularCustoIndividual(colaboradorId, mes, ano) {
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
    async calcularCustoEquipe(mes, ano, projectId) {
        const filter = { ativo: true, status: client_1.UserStatus.ATIVO };
        const colaboradores = await this.prisma.colaborador.findMany({
            where: filter,
            select: { id: true, matricula: true, nome: true, taxaHora: true, cargaHoraria: true },
        });
        const resultados = await Promise.all(colaboradores.map((c) => this.calcularCustoIndividual(c.id, mes, ano)));
        const totais = resultados.reduce((acc, r) => ({
            totalFTE: acc.totalFTE + r.fte,
            totalCustoFixo: acc.totalCustoFixo + r.custoFixo,
            totalCustoVariavel: acc.totalCustoVariavel + r.custoVariavel,
            totalCusto: acc.totalCusto + r.custoTotal,
        }), { totalFTE: 0, totalCustoFixo: 0, totalCustoVariavel: 0, totalCusto: 0 });
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
    async projetarCustosAnuais(colaboradorId, ano) {
        const colaborador = await this.findById(colaboradorId);
        const meses = Array.from({ length: 12 }, (_, i) => i + 1);
        const projecoes = await Promise.all(meses.map((mes) => this.calcularCustoIndividual(colaborador.id, mes, ano)));
        const totalAnual = projecoes.reduce((acc, p) => ({
            totalHoras: acc.totalHoras + p.horasRealizadas,
            totalCusto: acc.totalCusto + p.custoTotal,
            mediaFTE: acc.mediaFTE + p.fte / 12,
        }), { totalHoras: 0, totalCusto: 0, mediaFTE: 0 });
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
    async importarColaboradoresEmLote(colaboradores, userId, descricaoOperacao) {
        const detalhes = [];
        let sucessos = 0;
        let erros = 0;
        let avisos = 0;
        for (const item of colaboradores) {
            const resultado = {
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
                        taxaHora: new library_1.Decimal(item.taxaHora),
                        cargaHoraria: item.cargaHoraria,
                        cidade: item.cidade,
                        estado: item.estado,
                        sindicatoId: item.sindicatoId || undefined,
                        status: item.status || client_1.UserStatus.ATIVO,
                        dataAdmissao: new Date(item.dataAdmissao),
                        dataDesligamento: item.dataDesligamento ? new Date(item.dataDesligamento) : null,
                        ativo: true,
                    },
                });
                resultado.mensagem = 'Colaborador importado com sucesso';
                resultado.entityId = colaborador.id;
                sucessos++;
                detalhes.push(resultado);
            }
            catch (error) {
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
    async atualizarJornadasEmLote(jornadas, motivo, userId) {
        const detalhes = [];
        let sucessos = 0;
        let erros = 0;
        let avisos = 0;
        for (const item of jornadas) {
            const identificador = `${item.colaboradorId}-${item.mes}/${item.ano}`;
            const resultado = {
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
                            horasPrevistas: new library_1.Decimal(item.horasPrevistas),
                            fte: this._calcularFTE(item.horasPrevistas, colab.cargaHoraria),
                        },
                    });
                    resultado.mensagem = 'Jornada atualizada com sucesso';
                }
                else {
                    // Criar
                    jornada = await this.prisma.jornada.create({
                        data: {
                            colaboradorId: item.colaboradorId,
                            projectId: item.projectId || undefined,
                            mes: item.mes,
                            ano: item.ano,
                            horasPrevistas: new library_1.Decimal(item.horasPrevistas),
                            fte: this._calcularFTE(item.horasPrevistas, colab.cargaHoraria),
                        },
                    });
                    resultado.mensagem = 'Jornada criada com sucesso';
                }
                resultado.entityId = jornada.id;
                sucessos++;
                detalhes.push(resultado);
            }
            catch (error) {
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
    _calcularFTE(horas, cargaHoraria) {
        if (cargaHoraria === 0)
            return new library_1.Decimal(0);
        return new library_1.Decimal(horas / cargaHoraria);
    }
};
exports.HrService = HrService;
exports.HrService = HrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HrService);
//# sourceMappingURL=hr.service.js.map