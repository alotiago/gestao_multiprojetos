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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ConfigService = class ConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // =============================================================
    // CALENDÁRIO
    // =============================================================
    async findCalendarios(filters) {
        const where = {};
        if (filters.tipoFeriado) {
            where.tipoFeriado = filters.tipoFeriado;
        }
        if (filters.estado) {
            where.OR = [{ estado: filters.estado }, { nacional: true }];
        }
        if (filters.cidade) {
            where.cidade = filters.cidade;
        }
        if (filters.ano) {
            const inicio = new Date(`${filters.ano}-01-01T00:00:00.000Z`);
            const fim = new Date(`${filters.ano}-12-31T23:59:59.999Z`);
            where.data = { gte: inicio, lte: fim };
        }
        if (filters.mes && filters.ano) {
            const inicio = new Date(`${filters.ano}-${String(filters.mes).padStart(2, '0')}-01T00:00:00.000Z`);
            const fim = new Date(filters.ano, filters.mes, 0, 23, 59, 59, 999);
            where.data = { gte: inicio, lte: fim };
        }
        return this.prisma.calendario.findMany({
            where,
            orderBy: { data: 'asc' },
        });
    }
    async findCalendarioById(id) {
        const calendario = await this.prisma.calendario.findUnique({ where: { id } });
        if (!calendario)
            throw new common_1.NotFoundException(`Calendário ${id} não encontrado`);
        return calendario;
    }
    async createCalendario(dto) {
        const data = new Date(dto.data);
        const diaSemana = data.getDay(); // 0=Dom, 1=Seg ... 6=Sab
        return this.prisma.calendario.create({
            data: {
                data,
                tipoFeriado: dto.tipoFeriado,
                descricao: dto.descricao,
                cidade: dto.cidade,
                estado: dto.estado,
                nacional: dto.nacional ?? false,
                diaSemana,
            },
        });
    }
    async updateCalendario(id, dto) {
        await this.findCalendarioById(id);
        const updateData = { ...dto };
        if (dto.data) {
            const data = new Date(dto.data);
            updateData.data = data;
            updateData.diaSemana = data.getDay();
        }
        return this.prisma.calendario.update({ where: { id }, data: updateData });
    }
    async deleteCalendario(id) {
        await this.findCalendarioById(id);
        return this.prisma.calendario.delete({ where: { id } });
    }
    /**
     * Calcula horas previstas de trabalho para um estado/mês/ano
     * Horas previstas = dias úteis * 8 (descontando feriados nacionais + estaduais do estado)
     */
    async calcularHorasPrevistas(estado, mes, ano) {
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 0); // último dia do mês
        // Busca feriados nacionais + estaduais do estado
        const feriados = await this.prisma.calendario.findMany({
            where: {
                data: { gte: inicio, lte: fim },
                OR: [{ nacional: true }, { estado }],
            },
        });
        // Conta dias úteis (seg-sex) no mês
        let diasUteis = 0;
        const feriadosDates = new Set(feriados.map((f) => new Date(f.data).toISOString().split('T')[0]));
        const cursor = new Date(inicio);
        while (cursor <= fim) {
            const dayOfWeek = cursor.getDay();
            const dateStr = cursor.toISOString().split('T')[0];
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !feriadosDates.has(dateStr)) {
                diasUteis++;
            }
            cursor.setDate(cursor.getDate() + 1);
        }
        const horasPrevistas = diasUteis * 8;
        return {
            estado,
            mes,
            ano,
            diasUteis,
            horasPrevistas,
            feriados: feriados.length,
            feriadosDetalhe: feriados.map((f) => ({
                data: f.data,
                descricao: f.descricao,
                tipo: f.tipoFeriado,
            })),
        };
    }
    // =============================================================
    // SINDICATOS
    // =============================================================
    async findSindicatos(ativo) {
        return this.prisma.sindicato.findMany({
            where: ativo !== undefined ? { ativo } : {},
            orderBy: { nome: 'asc' },
        });
    }
    async findSindicatoById(id) {
        const sindicato = await this.prisma.sindicato.findUnique({
            where: { id },
            include: { colaboradores: { where: { ativo: true }, select: { id: true, nome: true, cargo: true } } },
        });
        if (!sindicato)
            throw new common_1.NotFoundException(`Sindicato ${id} não encontrado`);
        return sindicato;
    }
    async createSindicato(dto) {
        const exists = await this.prisma.sindicato.findUnique({ where: { nome: dto.nome } });
        if (exists)
            throw new common_1.ConflictException(`Sindicato '${dto.nome}' já existe`);
        return this.prisma.sindicato.create({
            data: {
                nome: dto.nome,
                regiao: dto.regiao,
                percentualDissidio: dto.percentualDissidio,
                dataDissidio: dto.dataDissidio ? new Date(dto.dataDissidio) : null,
                regimeTributario: dto.regimeTributario,
                descricao: dto.descricao,
                ativo: dto.ativo ?? true,
            },
        });
    }
    async updateSindicato(id, dto) {
        await this.findSindicatoById(id);
        const updateData = { ...dto };
        if (dto.dataDissidio) {
            updateData.dataDissidio = new Date(dto.dataDissidio);
        }
        return this.prisma.sindicato.update({ where: { id }, data: updateData });
    }
    async deleteSindicato(id) {
        await this.findSindicatoById(id);
        return this.prisma.sindicato.update({ where: { id }, data: { ativo: false } });
    }
    /**
     * Simula custo trabalhista com base nas regras do sindicato
     */
    async simularCustoTrabalhista(dto) {
        const sindicato = await this.prisma.sindicato.findUnique({ where: { id: dto.sindicatoId } });
        if (!sindicato)
            throw new common_1.NotFoundException(`Sindicato ${dto.sindicatoId} não encontrado`);
        const dissidio = Number(sindicato.percentualDissidio) / 100;
        const salarioComDissidio = dto.salarioBase * (1 + dissidio);
        const horasExtrasValor = dto.horasExtras ? dto.horasExtras * (dto.salarioBase / 220) * 1.5 : 0;
        const adicionalNoturnoValor = dto.adicionalNoturno ? dto.adicionalNoturno * (dto.salarioBase / 220) * 0.2 : 0;
        const salarioBruto = salarioComDissidio + horasExtrasValor + adicionalNoturnoValor;
        // Encargos sociais estimados
        const encargosSociais = salarioBruto * 0.481;
        const custoTotal = salarioBruto + encargosSociais;
        return {
            sindicato: { id: sindicato.id, nome: sindicato.nome, regiao: sindicato.regiao },
            mes: dto.mes,
            ano: dto.ano,
            salarioBase: dto.salarioBase,
            percentualDissidio: Number(sindicato.percentualDissidio),
            salarioComDissidio: Number(salarioComDissidio.toFixed(2)),
            horasExtrasValor: Number(horasExtrasValor.toFixed(2)),
            adicionalNoturnoValor: Number(adicionalNoturnoValor.toFixed(2)),
            salarioBruto: Number(salarioBruto.toFixed(2)),
            encargosSociais: Number(encargosSociais.toFixed(2)),
            custoTotal: Number(custoTotal.toFixed(2)),
        };
    }
    // =============================================================
    // ÍNDICES FINANCEIROS (acesso rápido de configuração)
    // =============================================================
    async findIndices(tipo, ano) {
        return this.prisma.indiceFinanceiro.findMany({
            where: {
                ...(tipo && { tipo }),
                ...(ano && { anoReferencia: ano }),
            },
            orderBy: [{ tipo: 'asc' }, { anoReferencia: 'asc' }, { mesReferencia: 'asc' }],
        });
    }
    async createIndice(tipo, valor, mesReferencia, anoReferencia) {
        return this.prisma.indiceFinanceiro.upsert({
            where: { tipo_mesReferencia_anoReferencia: { tipo, mesReferencia, anoReferencia } },
            create: { tipo, valor, mesReferencia, anoReferencia },
            update: { valor },
        });
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map