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
exports.CalendarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const calendario_dto_1 = require("./dto/calendario.dto");
let CalendarioService = class CalendarioService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ===================== CRUD =====================
    async findAll(filters) {
        const where = {};
        if (filters.ano) {
            const inicio = new Date(filters.ano, 0, 1);
            const fim = new Date(filters.ano, 11, 31, 23, 59, 59);
            where.data = { gte: inicio, lte: fim };
        }
        if (filters.estado)
            where.estado = filters.estado;
        if (filters.cidade)
            where.cidade = filters.cidade;
        if (filters.tipoFeriado)
            where.tipoFeriado = filters.tipoFeriado;
        return this.prisma.calendario.findMany({
            where,
            orderBy: { data: 'asc' },
        });
    }
    async findById(id) {
        const calendario = await this.prisma.calendario.findUnique({ where: { id } });
        if (!calendario)
            throw new common_1.NotFoundException(`Feriado '${id}' não encontrado`);
        return calendario;
    }
    async create(dto) {
        const data = new Date(dto.data);
        return this.prisma.calendario.create({
            data: {
                data,
                tipoFeriado: dto.tipoFeriado,
                descricao: dto.descricao,
                cidade: dto.cidade,
                estado: dto.estado,
                diaSemana: dto.diaSemana,
                nacional: dto.nacional ?? (dto.tipoFeriado === calendario_dto_1.TipoFeriado.NACIONAL),
            },
        });
    }
    async update(id, dto) {
        await this.findById(id);
        const updateData = {};
        if (dto.descricao !== undefined)
            updateData.descricao = dto.descricao;
        if (dto.tipoFeriado !== undefined)
            updateData.tipoFeriado = dto.tipoFeriado;
        if (dto.cidade !== undefined)
            updateData.cidade = dto.cidade;
        if (dto.estado !== undefined)
            updateData.estado = dto.estado;
        return this.prisma.calendario.update({ where: { id }, data: updateData });
    }
    async delete(id) {
        await this.findById(id);
        return this.prisma.calendario.delete({ where: { id } });
    }
    // ===================== ENGINE CÁLCULO DIAS ÚTEIS =====================
    async calcularDiasUteis(dto) {
        const { mes, ano, estado, cidade } = dto;
        // Total de dias no mês
        const totalDias = new Date(ano, mes, 0).getDate();
        // Contar dias úteis (excluir sábado=5 e domingo=6)
        let diasUteis = 0;
        const diasSemana = [];
        for (let dia = 1; dia <= totalDias; dia++) {
            const date = new Date(ano, mes - 1, dia);
            const dow = date.getDay(); // 0=domingo, 6=sábado
            if (dow !== 0 && dow !== 6) {
                diasUteis++;
            }
            diasSemana.push(dow);
        }
        // Buscar feriados do mês
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes - 1, totalDias, 23, 59, 59);
        const whereConditions = [
            { data: { gte: inicio, lte: fim }, tipoFeriado: 'NACIONAL' },
        ];
        if (estado) {
            whereConditions.push({
                data: { gte: inicio, lte: fim },
                tipoFeriado: 'ESTADUAL',
                estado,
            });
        }
        if (cidade) {
            whereConditions.push({
                data: { gte: inicio, lte: fim },
                tipoFeriado: 'MUNICIPAL',
                cidade,
                estado,
            });
        }
        const feriados = await this.prisma.calendario.findMany({
            where: { OR: whereConditions },
        });
        // Descontar feriados que caem em dia útil
        let feriadosDescontados = 0;
        for (const feriado of feriados) {
            // Usar campo diaSemana armazenado no banco (0=dom, 6=sáb) para evitar problemas de timezone
            const dow = feriado.diaSemana;
            if (dow !== 0 && dow !== 6) {
                feriadosDescontados++;
            }
        }
        const diasUteisLiquidos = diasUteis - feriadosDescontados;
        return {
            mes,
            ano,
            estado: estado || null,
            cidade: cidade || null,
            totalDias,
            diasUteis,
            feriados: feriados.length,
            feriadosEmDiaUtil: feriadosDescontados,
            diasUteisLiquidos,
            horasUteis: diasUteisLiquidos * 8, // padrão 8h/dia
        };
    }
    // ===================== CÁLCULO POR REGIÃO =====================
    async calcularJornadaPorRegiao(estado, ano, cidade) {
        const meses = Array.from({ length: 12 }, (_, i) => i + 1);
        const resultado = await Promise.all(meses.map((mes) => this.calcularDiasUteis({ mes, ano, estado, cidade })));
        const totalAnual = resultado.reduce((acc, m) => ({
            diasUteis: acc.diasUteis + m.diasUteisLiquidos,
            horasUteis: acc.horasUteis + m.horasUteis,
            feriados: acc.feriados + m.feriados,
        }), { diasUteis: 0, horasUteis: 0, feriados: 0 });
        return {
            estado,
            cidade: cidade || null,
            ano,
            mensal: resultado,
            totalAnual,
        };
    }
    // ===================== BULK IMPORT =====================
    async importarFeriadosEmLote(dto) {
        const detalhes = [];
        let sucessos = 0;
        let erros = 0;
        let avisos = 0;
        for (let i = 0; i < dto.items.length; i++) {
            const item = dto.items[i];
            const resultado = {
                indice: i + 1,
                status: 'sucesso',
                mensagem: '',
            };
            try {
                if (!item.data || !item.descricao || !item.tipoFeriado) {
                    resultado.status = 'erro';
                    resultado.mensagem = 'Campos obrigatórios: data, descricao, tipoFeriado';
                    erros++;
                    detalhes.push(resultado);
                    continue;
                }
                const data = new Date(item.data);
                const feriado = await this.prisma.calendario.create({
                    data: {
                        data,
                        tipoFeriado: item.tipoFeriado,
                        descricao: item.descricao,
                        cidade: item.cidade,
                        estado: item.estado,
                        diaSemana: item.diaSemana,
                        nacional: item.nacional ?? (item.tipoFeriado === calendario_dto_1.TipoFeriado.NACIONAL),
                    },
                });
                resultado.mensagem = `Feriado '${item.descricao}' criado para ${item.data}`;
                resultado.entityId = feriado.id;
                sucessos++;
            }
            catch (error) {
                if (error.code === 'P2002') {
                    resultado.status = 'aviso';
                    resultado.mensagem = `Feriado já cadastrado para ${item.data} (${item.tipoFeriado})`;
                    avisos++;
                }
                else {
                    resultado.status = 'erro';
                    resultado.mensagem = `Erro: ${error.message}`;
                    erros++;
                }
            }
            detalhes.push(resultado);
        }
        return {
            totalProcessado: dto.items.length,
            sucessos,
            erros,
            avisos,
            detalhes,
        };
    }
    // ===================== SEED FERIADOS NACIONAIS =====================
    async seedFeriadosNacionais(ano) {
        const feriadosNacionais = [
            { mes: 1, dia: 1, descricao: 'Confraternização Universal' },
            { mes: 2, dia: 28, descricao: 'Carnaval' }, // Aproximado
            { mes: 3, dia: 1, descricao: 'Carnaval (terça)' },
            { mes: 4, dia: 18, descricao: 'Sexta-feira Santa' }, // Aproximado para 2026
            { mes: 4, dia: 21, descricao: 'Tiradentes' },
            { mes: 5, dia: 1, descricao: 'Dia do Trabalho' },
            { mes: 6, dia: 4, descricao: 'Corpus Christi' }, // Aproximado para 2026
            { mes: 9, dia: 7, descricao: 'Independência do Brasil' },
            { mes: 10, dia: 12, descricao: 'Nossa Sra. Aparecida' },
            { mes: 11, dia: 2, descricao: 'Finados' },
            { mes: 11, dia: 15, descricao: 'Proclamação da República' },
            { mes: 12, dia: 25, descricao: 'Natal' },
        ];
        let criados = 0;
        let existentes = 0;
        for (const feriado of feriadosNacionais) {
            const data = new Date(ano, feriado.mes - 1, feriado.dia);
            const diaSemana = data.getDay();
            try {
                await this.prisma.calendario.create({
                    data: {
                        data,
                        tipoFeriado: 'NACIONAL',
                        descricao: feriado.descricao,
                        diaSemana,
                        nacional: true,
                    },
                });
                criados++;
            }
            catch (error) {
                if (error.code === 'P2002') {
                    existentes++;
                }
            }
        }
        return {
            ano,
            totalFeriados: feriadosNacionais.length,
            criados,
            existentes,
            mensagem: `Seed de feriados nacionais para ${ano}: ${criados} criados, ${existentes} já existiam`,
        };
    }
};
exports.CalendarioService = CalendarioService;
exports.CalendarioService = CalendarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarioService);
//# sourceMappingURL=calendario.service.js.map