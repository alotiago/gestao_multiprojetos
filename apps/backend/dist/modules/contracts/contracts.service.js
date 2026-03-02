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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let ContractsService = class ContractsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ═══════════════════════════════════════════
    //  HELPERS — RECALCULAR TOTAIS
    // ═══════════════════════════════════════════
    /**
     * Recalcula o valorTotalContratado de um ObjetoContratual
     * como a soma dos valorTotalAnual de suas linhas ativas
     */
    async recalcularTotalObjeto(objetoContratualId) {
        const linhas = await this.prisma.linhaContratual.findMany({
            where: { objetoContratualId, ativo: true },
            select: { valorTotalAnual: true },
        });
        const total = linhas.reduce((s, l) => s + Number(l.valorTotalAnual), 0);
        await this.prisma.objetoContratual.update({
            where: { id: objetoContratualId },
            data: { valorTotalContratado: new library_1.Decimal(Math.round(total * 100) / 100) },
        });
    }
    // ═══════════════════════════════════════════
    //  OBJETOS CONTRATUAIS
    // ═══════════════════════════════════════════
    async findAllObjetos(page = 1, limit = 10, projectId) {
        const where = { ativo: true };
        if (projectId)
            where.projectId = projectId;
        const [data, total] = await Promise.all([
            this.prisma.objetoContratual.findMany({
                where,
                include: {
                    project: { select: { id: true, codigo: true, nome: true } },
                    _count: { select: { linhasContratuais: { where: { ativo: true } } } },
                    linhasContratuais: {
                        where: { ativo: true },
                        select: { valorTotalAnual: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.objetoContratual.count({ where }),
        ]);
        // Adicionar valorTotalCalculado a cada objeto
        const dataComTotais = data.map((obj) => {
            const valorTotalLinhas = obj.linhasContratuais.reduce((s, l) => s + Number(l.valorTotalAnual), 0);
            const { linhasContratuais, ...rest } = obj;
            return {
                ...rest,
                valorTotalContratado: Math.round(valorTotalLinhas * 100) / 100,
            };
        });
        return { data: dataComTotais, total, page, limit };
    }
    async findObjetoById(id) {
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
        if (!obj)
            throw new common_1.NotFoundException('Objeto contratual não encontrado');
        return obj;
    }
    async findObjetosByProject(projectId) {
        const objetos = await this.prisma.objetoContratual.findMany({
            where: { projectId, ativo: true },
            include: {
                _count: { select: { linhasContratuais: { where: { ativo: true } } } },
                linhasContratuais: {
                    where: { ativo: true },
                    select: { valorTotalAnual: true },
                },
            },
            orderBy: { numero: 'asc' },
        });
        return objetos.map((obj) => {
            const valorTotalLinhas = obj.linhasContratuais.reduce((s, l) => s + Number(l.valorTotalAnual), 0);
            const { linhasContratuais, ...rest } = obj;
            return {
                ...rest,
                valorTotalContratado: Math.round(valorTotalLinhas * 100) / 100,
            };
        });
    }
    /**
     * Resumo financeiro contratual do projeto
     * Total contratado = soma de todos os objetos contratuais
     */
    async getProjectContractSummary(projectId) {
        const objetos = await this.prisma.objetoContratual.findMany({
            where: { projectId, ativo: true },
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
                _count: { select: { receitas: { where: { ativo: true } } } },
            },
        });
        let totalContratadoProjeto = 0;
        const objetosResumo = objetos.map((obj) => {
            const valorTotal = obj.linhasContratuais.reduce((s, l) => s + Number(l.valorTotalAnual), 0);
            totalContratadoProjeto += valorTotal;
            return {
                id: obj.id,
                numero: obj.numero,
                descricao: obj.descricao,
                totalLinhas: obj.linhasContratuais.length,
                totalReceitas: obj._count.receitas,
                valorTotalContratado: Math.round(valorTotal * 100) / 100,
                linhas: obj.linhasContratuais,
            };
        });
        return {
            projectId,
            totalObjetos: objetos.length,
            totalContratadoProjeto: Math.round(totalContratadoProjeto * 100) / 100,
            objetos: objetosResumo,
        };
    }
    async createObjeto(data) {
        // Verificar unicidade
        const existing = await this.prisma.objetoContratual.findUnique({
            where: { projectId_numero: { projectId: data.projectId, numero: data.numero } },
        });
        if (existing && existing.ativo) {
            throw new common_1.ConflictException(`Objeto contratual ${data.numero} já existe neste projeto`);
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
    async updateObjeto(id, data) {
        const obj = await this.prisma.objetoContratual.findUnique({ where: { id } });
        if (!obj)
            throw new common_1.NotFoundException('Objeto contratual não encontrado');
        const updateData = {};
        if (data.descricao !== undefined)
            updateData.descricao = data.descricao;
        if (data.dataInicio !== undefined)
            updateData.dataInicio = new Date(data.dataInicio);
        if (data.dataFim !== undefined)
            updateData.dataFim = data.dataFim ? new Date(data.dataFim) : null;
        return this.prisma.objetoContratual.update({
            where: { id },
            data: updateData,
            include: { project: { select: { id: true, codigo: true, nome: true } } },
        });
    }
    async deleteObjeto(id) {
        const obj = await this.prisma.objetoContratual.findUnique({ where: { id } });
        if (!obj)
            throw new common_1.NotFoundException('Objeto contratual não encontrado');
        await this.prisma.objetoContratual.update({
            where: { id },
            data: { ativo: false },
        });
    }
    // ═══════════════════════════════════════════
    //  LINHAS CONTRATUAIS
    // ═══════════════════════════════════════════
    async findLinhasByObjeto(objetoContratualId) {
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
    async findLinhaById(id) {
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
        if (!linha)
            throw new common_1.NotFoundException('Linha contratual não encontrada');
        return linha;
    }
    async findLinhasByProject(projectId) {
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
    async createLinha(data) {
        const qtd = new library_1.Decimal(data.quantidadeAnualEstimada);
        const vUnit = new library_1.Decimal(data.valorUnitario);
        const valorTotalAnual = qtd.mul(vUnit);
        const created = await this.prisma.linhaContratual.create({
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
        // Recalcular total do objeto contratual
        await this.recalcularTotalObjeto(data.objetoContratualId);
        return created;
    }
    async updateLinha(id, data) {
        const linha = await this.prisma.linhaContratual.findUnique({ where: { id } });
        if (!linha)
            throw new common_1.NotFoundException('Linha contratual não encontrada');
        const updateData = {};
        if (data.descricaoItem !== undefined)
            updateData.descricaoItem = data.descricaoItem;
        if (data.unidade !== undefined)
            updateData.unidade = data.unidade;
        // Recalcular valor total se qtd ou valor mudar
        const qtd = data.quantidadeAnualEstimada !== undefined
            ? new library_1.Decimal(data.quantidadeAnualEstimada)
            : linha.quantidadeAnualEstimada;
        const vUnit = data.valorUnitario !== undefined
            ? new library_1.Decimal(data.valorUnitario)
            : linha.valorUnitario;
        updateData.quantidadeAnualEstimada = qtd;
        updateData.valorUnitario = vUnit;
        updateData.valorTotalAnual = new library_1.Decimal(qtd.toString()).mul(new library_1.Decimal(vUnit.toString()));
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
                    const novoTotal = new library_1.Decimal(receita.quantidade.toString()).mul(new library_1.Decimal(vUnit.toString()));
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
        // Recalcular total do objeto contratual
        await this.recalcularTotalObjeto(linha.objetoContratualId);
        return updated;
    }
    async deleteLinha(id) {
        const linha = await this.prisma.linhaContratual.findUnique({ where: { id } });
        if (!linha)
            throw new common_1.NotFoundException('Linha contratual não encontrada');
        await this.prisma.linhaContratual.update({
            where: { id },
            data: { ativo: false },
        });
        // Recalcular total do objeto contratual
        await this.recalcularTotalObjeto(linha.objetoContratualId);
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map