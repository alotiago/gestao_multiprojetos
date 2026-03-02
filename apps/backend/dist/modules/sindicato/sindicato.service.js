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
exports.SindicatoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
// Encargos trabalhistas padrão (percentuais sobre salário base)
const ENCARGOS_TRABALHISTAS = {
    INSS_PATRONAL: 0.20, // 20% patronal
    RAT: 0.03, // 3% Risco de Acidente de Trabalho
    FGTS: 0.08, // 8% FGTS
    FERIAS: 0.1111, // 1/9 (férias + 1/3)
    DECIMO_TERCEIRO: 0.0833, // 1/12 (13º salário)
    PROVISAO_RESCISAO: 0.04, // ~4% provisão
};
let SindicatoService = class SindicatoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===================== CRUD =====================
    async findAll(filters) {
        const where = {};
        if (filters.regiao)
            where.regiao = filters.regiao;
        if (filters.ativo !== undefined)
            where.ativo = filters.ativo;
        return this.prisma.sindicato.findMany({
            where,
            include: {
                _count: { select: { colaboradores: true } },
            },
            orderBy: { nome: 'asc' },
        });
    }
    async findById(id) {
        const sindicato = await this.prisma.sindicato.findUnique({
            where: { id },
            include: {
                colaboradores: {
                    select: { id: true, matricula: true, nome: true, cargo: true, taxaHora: true },
                    where: { ativo: true },
                },
            },
        });
        if (!sindicato)
            throw new common_1.NotFoundException(`Sindicato '${id}' não encontrado`);
        return sindicato;
    }
    async create(dto) {
        const exists = await this.prisma.sindicato.findUnique({
            where: { nome: dto.nome },
        });
        if (exists)
            throw new common_1.ConflictException(`Sindicato '${dto.nome}' já cadastrado`);
        return this.prisma.sindicato.create({
            data: {
                nome: dto.nome,
                regiao: dto.regiao,
                percentualDissidio: dto.percentualDissidio
                    ? new library_1.Decimal(dto.percentualDissidio)
                    : new library_1.Decimal(0),
                dataDissidio: dto.dataDissidio ? new Date(dto.dataDissidio) : null,
                regimeTributario: dto.regimeTributario,
                descricao: dto.descricao,
            },
        });
    }
    async update(id, dto) {
        await this.findById(id);
        const updateData = {};
        if (dto.nome !== undefined)
            updateData.nome = dto.nome;
        if (dto.regiao !== undefined)
            updateData.regiao = dto.regiao;
        if (dto.percentualDissidio !== undefined)
            updateData.percentualDissidio = new library_1.Decimal(dto.percentualDissidio);
        if (dto.dataDissidio !== undefined)
            updateData.dataDissidio = new Date(dto.dataDissidio);
        if (dto.regimeTributario !== undefined)
            updateData.regimeTributario = dto.regimeTributario;
        if (dto.descricao !== undefined)
            updateData.descricao = dto.descricao;
        if (dto.ativo !== undefined)
            updateData.ativo = dto.ativo;
        return this.prisma.sindicato.update({ where: { id }, data: updateData });
    }
    async delete(id) {
        const sindicato = await this.findById(id);
        // Verificar se há colaboradores vinculados
        const count = await this.prisma.colaborador.count({
            where: { sindicatoId: id, ativo: true },
        });
        if (count > 0) {
            throw new common_1.ConflictException(`Não é possível excluir sindicato com ${count} colaboradores vinculados ativos`);
        }
        return this.prisma.sindicato.delete({ where: { id } });
    }
    // ===================== APLICAÇÃO DE DISSÍDIO =====================
    async aplicarDissidio(dto) {
        const sindicato = await this.findById(dto.sindicatoId);
        const { percentualReajuste } = dto;
        // Buscar todos colaboradores ativos do sindicato
        const colaboradores = await this.prisma.colaborador.findMany({
            where: { sindicatoId: dto.sindicatoId, ativo: true },
        });
        if (colaboradores.length === 0) {
            return {
                sindicatoId: dto.sindicatoId,
                totalColaboradores: 0,
                percentualReajuste,
                mensagem: 'Nenhum colaborador ativo vinculado a este sindicato',
                detalhes: [],
            };
        }
        const detalhes = [];
        // Aplicar reajuste em todas as taxas dos colaboradores
        for (const colab of colaboradores) {
            const taxaAnterior = Number(colab.taxaHora);
            const taxaNova = Math.round(taxaAnterior * (1 + percentualReajuste) * 100) / 100;
            await this.prisma.colaborador.update({
                where: { id: colab.id },
                data: { taxaHora: new library_1.Decimal(taxaNova) },
            });
            detalhes.push({
                colaboradorId: colab.id,
                matricula: colab.matricula,
                nome: colab.nome,
                taxaAnterior,
                taxaNova,
            });
        }
        // Atualizar data de dissídio e percentual no sindicato
        await this.prisma.sindicato.update({
            where: { id: dto.sindicatoId },
            data: {
                percentualDissidio: new library_1.Decimal(percentualReajuste),
                dataDissidio: dto.dataBase ? new Date(dto.dataBase) : new Date(),
            },
        });
        return {
            sindicatoId: dto.sindicatoId,
            sindicatoNome: sindicato.nome,
            totalColaboradores: colaboradores.length,
            percentualReajuste,
            dataBase: dto.dataBase || new Date().toISOString().split('T')[0],
            detalhes,
        };
    }
    // ===================== SIMULAÇÃO TRABALHISTA =====================
    async simularImpactoFinanceiro(dto) {
        const sindicato = await this.findById(dto.sindicatoId);
        const { salarioBase } = dto;
        const cargaHoraria = dto.cargaHorariaMensal || 176; // 8h × 22 dias
        // Calcular encargos
        const encargos = [];
        let totalEncargos = 0;
        for (const [tipo, percentual] of Object.entries(ENCARGOS_TRABALHISTAS)) {
            const valor = Math.round(salarioBase * percentual * 100) / 100;
            encargos.push({ tipo, percentual, valor });
            totalEncargos += valor;
        }
        // Aplicar dissídio se houver
        const percentualDissidio = Number(sindicato.percentualDissidio);
        const salarioComDissidio = percentualDissidio > 0
            ? Math.round(salarioBase * (1 + percentualDissidio) * 100) / 100
            : salarioBase;
        const custoTotalMensal = salarioComDissidio + totalEncargos;
        const custoHora = Math.round((custoTotalMensal / cargaHoraria) * 100) / 100;
        const custoAnual = Math.round(custoTotalMensal * 12 * 100) / 100;
        return {
            sindicato: {
                id: sindicato.id,
                nome: sindicato.nome,
                regiao: sindicato.regiao,
                regimeTributario: sindicato.regimeTributario,
                percentualDissidio,
            },
            simulacao: {
                salarioBase,
                salarioComDissidio,
                cargaHoraria,
                encargos,
                totalEncargos: Math.round(totalEncargos * 100) / 100,
                custoTotalMensal: Math.round(custoTotalMensal * 100) / 100,
                custoHora,
                custoAnual,
                percentualEncargos: Math.round((totalEncargos / salarioBase) * 10000) / 100,
            },
        };
    }
    // ===================== RELATÓRIO POR REGIÃO =====================
    async relatorioPorRegiao() {
        const sindicatos = await this.prisma.sindicato.findMany({
            where: { ativo: true },
            include: {
                _count: { select: { colaboradores: true } },
            },
        });
        const regioes = sindicatos.reduce((acc, s) => {
            const regiao = s.regiao;
            if (!acc[regiao]) {
                acc[regiao] = { sindicatos: 0, colaboradores: 0, mediaDissidio: 0 };
            }
            acc[regiao].sindicatos++;
            acc[regiao].colaboradores += s._count.colaboradores;
            acc[regiao].mediaDissidio += Number(s.percentualDissidio);
            return acc;
        }, {});
        // Calcular média de dissídio por região
        for (const regiao of Object.keys(regioes)) {
            if (regioes[regiao].sindicatos > 0) {
                regioes[regiao].mediaDissidio = Math.round((regioes[regiao].mediaDissidio / regioes[regiao].sindicatos) * 10000) / 10000;
            }
        }
        return {
            totalSindicatos: sindicatos.length,
            regioes,
        };
    }
};
exports.SindicatoService = SindicatoService;
exports.SindicatoService = SindicatoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SindicatoService);
//# sourceMappingURL=sindicato.service.js.map