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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
// ─── Service ──────────────────────────────────────────────────────────────────
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CRUD DE PROJETOS
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Lista projetos com paginação, filtros e ordenação
     */
    async findAll(filters = {}) {
        const { status, search, unitId, tipo, page = 1, limit = 20, orderBy = 'createdAt', order = 'desc', } = filters;
        const where = { ativo: true };
        if (status)
            where.status = status;
        if (unitId)
            where.unitId = unitId;
        if (tipo)
            where.tipo = { contains: tipo, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { nome: { contains: search, mode: 'insensitive' } },
                { codigo: { contains: search, mode: 'insensitive' } },
                { cliente: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                include: {
                    unit: { select: { id: true, name: true, code: true } },
                    contrato: { select: { id: true, nomeContrato: true, numeroContrato: true, cliente: true } },
                    _count: { select: { users: true, receitas: true } },
                },
                orderBy: { [orderBy]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.project.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    /**
     * Busca projeto por ID ou código
     */
    async findById(id) {
        const project = await this.prisma.project.findFirst({
            where: { OR: [{ id }, { codigo: id }], ativo: true },
            include: {
                unit: { select: { id: true, name: true, code: true } },
                users: {
                    include: {
                        user: { select: { id: true, email: true, name: true, role: true } },
                    },
                },
                receitas: { orderBy: [{ ano: 'asc' }, { mes: 'asc' }] },
                _count: { select: { receitas: true, custos: true, despesas: true, impostos: true } },
            },
        });
        if (!project)
            throw new common_1.NotFoundException(`Projeto '${id}' não encontrado`);
        return project;
    }
    /**
     * Cria novo projeto
     */
    async create(dto, userId) {
        const existing = await this.prisma.project.findUnique({ where: { codigo: dto.codigo } });
        if (existing)
            throw new common_1.ConflictException(`Código de projeto '${dto.codigo}' já existe`);
        const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
        if (!unit)
            throw new common_1.NotFoundException(`Unidade '${dto.unitId}' não encontrada`);
        // Validar contrato obrigatório
        if (!dto.contratoId)
            throw new common_1.BadRequestException('contratoId é obrigatório');
        const contrato = await this.prisma.contrato.findUnique({ where: { id: dto.contratoId } });
        if (!contrato)
            throw new common_1.NotFoundException(`Contrato '${dto.contratoId}' não encontrado`);
        return this.prisma.project.create({
            data: {
                codigo: dto.codigo.toUpperCase(),
                nome: dto.nome,
                cliente: dto.cliente,
                unitId: dto.unitId,
                contratoId: dto.contratoId,
                status: dto.status ?? client_1.ProjectStatus.ATIVO,
                tipo: dto.tipo,
                dataInicio: new Date(dto.dataInicio),
                dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
                descricao: dto.descricao,
                criadoPor: userId,
            },
            include: { unit: { select: { id: true, name: true, code: true } }, contrato: { select: { id: true, nomeContrato: true } } },
        });
    }
    /**
     * Atualiza projeto
     */
    async update(id, dto) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project || !project.ativo)
            throw new common_1.NotFoundException(`Projeto '${id}' não encontrado`);
        if (dto.unitId) {
            const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId } });
            if (!unit)
                throw new common_1.NotFoundException(`Unidade '${dto.unitId}' não encontrada`);
        }
        return this.prisma.project.update({
            where: { id },
            data: {
                ...dto,
                dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
                dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
            },
            include: { unit: { select: { id: true, name: true, code: true } } },
        });
    }
    /**
     * Soft delete de projeto
     */
    async delete(id) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project || !project.ativo)
            throw new common_1.NotFoundException(`Projeto '${id}' não encontrado`);
        const updated = await this.prisma.project.update({
            where: { id },
            data: { ativo: false, status: client_1.ProjectStatus.ENCERRADO },
        });
        return { message: 'Projeto removido com sucesso', project: updated };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // RECEITAS MENSAIS
    // ─────────────────────────────────────────────────────────────────────────────
    async findReceitas(projectId, ano) {
        await this._assertProjectExists(projectId);
        return this.prisma.receitaMensal.findMany({
            where: { projectId, ativo: true, ...(ano ? { ano } : {}) },
            orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
        });
    }
    async createReceita(projectId, dto) {
        await this._assertProjectExists(projectId);
        // Verificar duplicata: mesma tipoReceita sem linha contratual no mesmo mês/ano
        const existing = await this.prisma.receitaMensal.findFirst({
            where: {
                projectId,
                mes: dto.mes,
                ano: dto.ano,
                tipoReceita: dto.tipoReceita,
                linhaContratualId: null,
                ativo: true,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Já existe receita do tipo '${dto.tipoReceita}' para ${dto.mes}/${dto.ano} neste projeto`);
        }
        return this.prisma.receitaMensal.create({
            data: {
                projectId,
                mes: dto.mes,
                ano: dto.ano,
                tipoReceita: dto.tipoReceita,
                descricao: dto.descricao,
                valorPlanejado: new library_1.Decimal(dto.valorPrevisto),
                valorPrevisto: new library_1.Decimal(dto.valorPrevisto),
                valorRealizado: new library_1.Decimal(dto.valorRealizado ?? 0),
                ativo: true,
            },
        });
    }
    async updateReceita(projectId, receitaId, dto) {
        const receita = await this.prisma.receitaMensal.findFirst({
            where: { id: receitaId, projectId },
        });
        if (!receita)
            throw new common_1.NotFoundException(`Receita '${receitaId}' não encontrada no projeto`);
        return this.prisma.receitaMensal.update({
            where: { id: receitaId },
            data: {
                ...dto,
                valorPrevisto: dto.valorPrevisto !== undefined ? new library_1.Decimal(dto.valorPrevisto) : undefined,
                valorRealizado: dto.valorRealizado !== undefined ? new library_1.Decimal(dto.valorRealizado) : undefined,
            },
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // MOTOR FCST
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Gera projeção FCST baseada em regressão linear sobre o histórico
     */
    async calcularFcst(projectId, anoFim = 2030) {
        await this._assertProjectExists(projectId);
        const anoAtual = new Date().getFullYear();
        const mesAtual = new Date().getMonth() + 1;
        if (anoFim < anoAtual)
            throw new common_1.BadRequestException(`Ano final FCST deve ser >= ${anoAtual}`);
        if (anoFim > 2035)
            throw new common_1.BadRequestException('Ano final FCST não pode ultrapassar 2035');
        const receitas = await this.prisma.receitaMensal.findMany({
            where: { projectId, ativo: true },
            orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
        });
        const porMes = this._agruparReceitasPorMes(receitas);
        const tendencia = this._calcularTendenciaLinear(porMes);
        const resultado = [];
        for (let ano = anoAtual; ano <= anoFim; ano++) {
            for (let mes = 1; mes <= 12; mes++) {
                if (ano === anoAtual && mes < mesAtual)
                    continue;
                const chave = `${ano}-${String(mes).padStart(2, '0')}`;
                const realizado = porMes.get(chave);
                const idx = (ano - anoAtual) * 12 + (mes - mesAtual);
                const valorFcst = Math.max(0, tendencia.intercept + tendencia.slope * (porMes.size + idx));
                const previsto = realizado?.previsto ?? 0;
                const variacao = valorFcst - previsto;
                const variacaoPercent = previsto > 0 ? (variacao / previsto) * 100 : 0;
                resultado.push({
                    mes,
                    ano,
                    valorPrevisto: previsto,
                    valorFcst: Math.round(valorFcst * 100) / 100,
                    variacao: Math.round(variacao * 100) / 100,
                    variacaoPercent: Math.round(variacaoPercent * 100) / 100,
                });
            }
        }
        return resultado;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // MARGENS E INDICADORES
    // ─────────────────────────────────────────────────────────────────────────────
    async calcularMargens(projectId, ano, mes) {
        await this._assertProjectExists(projectId);
        const whereBase = { projectId, ano, ...(mes ? { mes } : {}) };
        const [receitas, custos, despesas, impostos] = await Promise.all([
            this.prisma.receitaMensal.findMany({ where: { ...whereBase, ativo: true } }),
            this.prisma.custoMensal.findMany({ where: whereBase }),
            this.prisma.despesa.findMany({ where: whereBase }),
            this.prisma.imposto.findMany({ where: whereBase }),
        ]);
        const receitaBruta = receitas.reduce((acc, r) => acc + Number(r.valorRealizado || r.valorPrevisto), 0);
        const custoTotal = custos.reduce((acc, c) => acc + Number(c.custoFixo) + Number(c.custoVariavel), 0);
        const despesaTotal = despesas.reduce((acc, d) => acc + Number(d.valor), 0);
        const impostoTotal = impostos.reduce((acc, i) => acc + Number(i.valor), 0);
        const margeBruta = receitaBruta - custoTotal;
        const margemOperacional = margeBruta - despesaTotal;
        const margemLiquida = margemOperacional - impostoTotal;
        const pct = (v) => receitaBruta > 0 ? Math.round((v / receitaBruta) * 10000) / 100 : 0;
        return {
            projectId,
            ano,
            mes,
            receitaBruta: Math.round(receitaBruta * 100) / 100,
            custoTotal: Math.round(custoTotal * 100) / 100,
            despesaTotal: Math.round(despesaTotal * 100) / 100,
            impostoTotal: Math.round(impostoTotal * 100) / 100,
            margeBruta: Math.round(margeBruta * 100) / 100,
            margemBrutaPercent: pct(margeBruta),
            margemOperacional: Math.round(margemOperacional * 100) / 100,
            margemOperacionalPercent: pct(margemOperacional),
            margemLiquida: Math.round(margemLiquida * 100) / 100,
            margemLiquidaPercent: pct(margemLiquida),
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CARTEIRA
    // ─────────────────────────────────────────────────────────────────────────────
    async analisarCarteira(ano, unitId) {
        const whereProject = { ativo: true };
        if (unitId)
            whereProject.unitId = unitId;
        const [projetos, receitas] = await Promise.all([
            this.prisma.project.findMany({
                where: whereProject,
                include: { unit: { select: { id: true, name: true } } },
            }),
            this.prisma.receitaMensal.findMany({
                where: { project: whereProject, ativo: true, ...(ano ? { ano } : {}) },
                include: { project: { select: { unitId: true } } },
            }),
        ]);
        const projetosAtivos = projetos.filter((p) => p.status === client_1.ProjectStatus.ATIVO).length;
        const projetosConcluidos = projetos.filter((p) => p.status === client_1.ProjectStatus.ENCERRADO).length;
        const receitaBrutaTotal = receitas.reduce((acc, r) => acc + Number(r.valorPrevisto), 0);
        const receitaRealizadaTotal = receitas.reduce((acc, r) => acc + Number(r.valorRealizado), 0);
        const porMesMap = new Map();
        for (const r of receitas) {
            const ch = `${r.ano}-${r.mes}`;
            const e = porMesMap.get(ch) ?? { mes: r.mes, ano: r.ano, previsto: 0, realizado: 0 };
            e.previsto += Number(r.valorPrevisto);
            e.realizado += Number(r.valorRealizado);
            porMesMap.set(ch, e);
        }
        const porUnidadeMap = new Map();
        for (const r of receitas) {
            const u = porUnidadeMap.get(r.project.unitId) ?? {
                unitId: r.project.unitId,
                nome: projetos.find((p) => p.unitId === r.project.unitId)?.unit?.name ?? r.project.unitId,
                totalPrevisto: 0,
            };
            u.totalPrevisto += Number(r.valorPrevisto);
            porUnidadeMap.set(r.project.unitId, u);
        }
        return {
            totalProjetos: projetos.length,
            projetosAtivos,
            projetosConcluidos,
            receitaBrutaTotal: Math.round(receitaBrutaTotal * 100) / 100,
            receitaRealizadaTotal: Math.round(receitaRealizadaTotal * 100) / 100,
            percentualRealizacao: receitaBrutaTotal > 0
                ? Math.round((receitaRealizadaTotal / receitaBrutaTotal) * 10000) / 100
                : 0,
            porMes: Array.from(porMesMap.values()).sort((a, b) => a.ano * 100 + a.mes - (b.ano * 100 + b.mes)),
            porUnidade: Array.from(porUnidadeMap.values()),
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CONSOLIDAÇÃO PREVISTO vs. REALIZADO
    // ─────────────────────────────────────────────────────────────────────────────
    async consolidar(projectId, ano) {
        await this._assertProjectExists(projectId);
        const receitas = await this.prisma.receitaMensal.findMany({
            where: { projectId, ano, ativo: true },
            orderBy: [{ mes: 'asc' }],
        });
        return Array.from({ length: 12 }, (_, i) => {
            const mes = i + 1;
            const rm = receitas.filter((r) => r.mes === mes);
            const previsto = rm.reduce((a, r) => a + Number(r.valorPrevisto), 0);
            const realizado = rm.reduce((a, r) => a + Number(r.valorRealizado), 0);
            const desvio = realizado - previsto;
            const desvioPercent = previsto > 0 ? (desvio / previsto) * 100 : 0;
            return {
                mes,
                ano,
                previsto: Math.round(previsto * 100) / 100,
                realizado: Math.round(realizado * 100) / 100,
                desvio: Math.round(desvio * 100) / 100,
                desvioPercent: Math.round(desvioPercent * 100) / 100,
                status: desvio >= 0 ? 'acima' : 'abaixo',
            };
        });
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // IMPORTAÇÃO EM LOTE
    // ─────────────────────────────────────────────────────────────────────────────
    /**
     * Importa múltiplos projetos em lote com validação individual
     */
    async importarEmLote(projetos, userId, descricaoOperacao) {
        const detalhes = [];
        let sucessos = 0;
        let erros = 0;
        let avisos = 0;
        for (const item of projetos) {
            const resultado = {
                codigo: item.codigo || 'SEM_CODIGO',
                status: 'sucesso',
                mensagem: '',
                projetoId: undefined,
            };
            try {
                // Validar campos obrigatórios
                if (!item.codigo?.trim()) {
                    resultado.status = 'erro';
                    resultado.mensagem = 'Código é obrigatório';
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
                if (!item.unitId?.trim()) {
                    resultado.status = 'erro';
                    resultado.mensagem = 'unitId é obrigatório';
                    erros++;
                    detalhes.push(resultado);
                    continue;
                }
                // Verificar se unidade existe
                const unit = await this.prisma.unit.findUnique({ where: { id: item.unitId } });
                if (!unit) {
                    resultado.status = 'erro';
                    resultado.mensagem = `Unidade '${item.unitId}' não encontrada`;
                    erros++;
                    detalhes.push(resultado);
                    continue;
                }
                // Verificar duplicação de código
                const existing = await this.prisma.project.findFirst({
                    where: { codigo: item.codigo.toUpperCase(), ativo: true },
                });
                if (existing) {
                    resultado.status = 'aviso';
                    resultado.mensagem = `Projeto com código '${item.codigo}' já existe (ID: ${existing.id})`;
                    resultado.projetoId = existing.id;
                    avisos++;
                    detalhes.push(resultado);
                    continue;
                }
                // Criar projeto
                const projeto = await this.prisma.project.create({
                    data: {
                        codigo: item.codigo.toUpperCase(),
                        nome: item.nome,
                        cliente: item.cliente,
                        unitId: item.unitId,
                        contratoId: item.contratoId,
                        status: item.status || client_1.ProjectStatus.ATIVO,
                        tipo: item.tipo || 'padrão',
                        dataInicio: new Date(item.dataInicio),
                        dataFim: item.dataFim ? new Date(item.dataFim) : null,
                        descricao: item.descricao || null,
                        criadoPor: userId,
                    },
                });
                resultado.mensagem = 'Projeto importado com sucesso';
                resultado.projetoId = projeto.id;
                sucessos++;
                detalhes.push(resultado);
                // Log de auditoria
                await this.prisma.historicoCalculo.create({
                    data: {
                        projectId: projeto.id,
                        tipo: 'IMPORTACAO_LOTE',
                        criadoPor: userId,
                        dadosAntes: JSON.stringify({}),
                        dadosDepois: JSON.stringify({
                            operacao: 'importacao',
                            descricao: descricaoOperacao,
                        }),
                    },
                });
            }
            catch (error) {
                resultado.status = 'erro';
                resultado.mensagem = `Erro ao processar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
                erros++;
                detalhes.push(resultado);
            }
        }
        return {
            totalProcessado: projetos.length,
            sucessos,
            erros,
            avisos,
            detalhes,
        };
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────────
    async _assertProjectExists(projectId) {
        const p = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!p || !p.ativo)
            throw new common_1.NotFoundException(`Projeto '${projectId}' não encontrado`);
    }
    _agruparReceitasPorMes(receitas) {
        const m = new Map();
        for (const r of receitas) {
            const ch = `${r.ano}-${String(r.mes).padStart(2, '0')}`;
            const e = m.get(ch) ?? { previsto: 0, realizado: 0 };
            e.previsto += Number(r.valorPrevisto);
            e.realizado += Number(r.valorRealizado);
            m.set(ch, e);
        }
        return m;
    }
    _calcularTendenciaLinear(porMes) {
        const vals = Array.from(porMes.values()).map((v) => v.realizado || v.previsto);
        const n = vals.length;
        if (n === 0)
            return { slope: 0, intercept: 0 };
        if (n === 1)
            return { slope: 0, intercept: vals[0] };
        const sumX = (n * (n - 1)) / 2;
        const sumY = vals.reduce((a, b) => a + b, 0);
        const sumXY = vals.reduce((acc, y, i) => acc + i * y, 0);
        const sumX2 = vals.reduce((acc, _, i) => acc + i * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map