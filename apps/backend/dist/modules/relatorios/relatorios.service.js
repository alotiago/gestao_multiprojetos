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
exports.RelatoriosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RelatoriosService = class RelatoriosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardContratos(ano) {
        const anoAnterior = ano - 1;
        const contratos = await this.prisma.contrato.findMany({
            where: { ativo: true },
            include: {
                projetos: {
                    where: { ativo: true },
                    select: { id: true, nome: true },
                },
                objetos: {
                    where: { ativo: true },
                    select: { id: true, nome: true, descricao: true },
                },
            },
        });
        const resultados = [];
        for (const contrato of contratos) {
            const projectIds = contrato.projetos.map((p) => p.id);
            if (projectIds.length === 0)
                continue;
            const metricas = [];
            let totalReceita = 0;
            let totalCustoFixo = 0;
            let totalCustoVariavel = 0;
            let totalImposto = 0;
            // Dados do ano anterior para comparação
            const metricasAnterior = [];
            let totalReceitaAnterior = 0;
            let totalCustoTotalAnterior = 0;
            // Para cada mês do ano
            for (let mes = 1; mes <= 12; mes++) {
                // ═══════ ANO ATUAL ═══════
                // Receitas
                const receitas = await this.prisma.receitaMensal.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        mes,
                        ano,
                        ativo: true,
                    },
                    _sum: { valorRealizado: true },
                });
                const receita = Number(receitas._sum.valorRealizado || 0);
                // Custos Fixos
                const custosFixos = await this.prisma.despesa.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        mes,
                        ano,
                        tipo: 'FIXAS',
                    },
                    _sum: { valor: true },
                });
                const custoFixo = Number(custosFixos._sum.valor || 0);
                // Custos Variáveis
                const custosVariaveis = await this.prisma.despesa.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        mes,
                        ano,
                        tipo: 'OPEX',
                    },
                    _sum: { valor: true },
                });
                const custoVariavel = Number(custosVariaveis._sum.valor || 0);
                const imposto = receita * 0.05;
                const custoTotal = custoFixo + custoVariavel;
                const margemBruta = receita > 0 ? (receita - custoTotal) / receita : 0;
                const margemLiquida = receita > 0 ? (receita - custoTotal - imposto) / receita : 0;
                metricas.push({
                    mes,
                    receita,
                    custoFixo,
                    custoVariavel,
                    imposto,
                    custoTotal,
                    margemBruta,
                    margemLiquida,
                });
                totalReceita += receita;
                totalCustoFixo += custoFixo;
                totalCustoVariavel += custoVariavel;
                totalImposto += imposto;
                // ═══════ ANO ANTERIOR (para comparação) ═══════
                const receitasAnterior = await this.prisma.receitaMensal.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        mes,
                        ano: anoAnterior,
                        ativo: true,
                    },
                    _sum: { valorRealizado: true },
                });
                const receitaAnt = Number(receitasAnterior._sum.valorRealizado || 0);
                const custosTotaisAnterior = await this.prisma.despesa.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        mes,
                        ano: anoAnterior,
                    },
                    _sum: { valor: true },
                });
                const custoTotalAnt = Number(custosTotaisAnterior._sum.valor || 0);
                metricasAnterior.push({
                    mes,
                    receita: receitaAnt,
                    custoTotal: custoTotalAnt,
                    lucro: receitaAnt - custoTotalAnt,
                });
                totalReceitaAnterior += receitaAnt;
                totalCustoTotalAnterior += custoTotalAnt;
            }
            // Totais do ano
            const custoTotalAnual = totalCustoFixo + totalCustoVariavel;
            const margemBrutaAnual = totalReceita > 0 ? (totalReceita - custoTotalAnual) / totalReceita : 0;
            const margemLiquidaAnual = totalReceita > 0 ? (totalReceita - custoTotalAnual - totalImposto) / totalReceita : 0;
            // Variação vs ano anterior
            const variacaoReceita = totalReceitaAnterior > 0 ? ((totalReceita - totalReceitaAnterior) / totalReceitaAnterior) : 0;
            const custoTotalAnterior = totalCustoTotalAnterior;
            const variacaoCusto = custoTotalAnterior > 0 ? ((custoTotalAnual - custoTotalAnterior) / custoTotalAnterior) : 0;
            // Objetos Contratuais com valores agregados
            const objetosComValores = [];
            for (const objeto of contrato.objetos) {
                const receitas = await this.prisma.receitaMensal.aggregate({
                    where: {
                        objetoContratualId: objeto.id,
                        projectId: { in: projectIds },
                        ano,
                        ativo: true,
                    },
                    _sum: { valorRealizado: true },
                });
                const receitaObjeto = Number(receitas._sum.valorRealizado || 0);
                const despesas = await this.prisma.despesa.aggregate({
                    where: {
                        projectId: { in: projectIds },
                        ano,
                    },
                    _sum: { valor: true },
                });
                const custoObjeto = Number(despesas._sum.valor || 0);
                objetosComValores.push({
                    id: objeto.id,
                    nome: objeto.nome,
                    descricao: objeto.descricao,
                    receita: receitaObjeto,
                    custo: custoObjeto,
                    lucro: receitaObjeto - custoObjeto,
                    margem: receitaObjeto > 0 ? ((receitaObjeto - custoObjeto) / receitaObjeto) : 0,
                });
            }
            resultados.push({
                contratoId: contrato.id,
                contratoNome: contrato.nomeContrato,
                metricas,
                metricasAnterior,
                totais: {
                    receita: totalReceita,
                    custoFixo: totalCustoFixo,
                    custoVariavel: totalCustoVariavel,
                    custoTotal: custoTotalAnual,
                    imposto: totalImposto,
                    lucro: totalReceita - custoTotalAnual - totalImposto,
                    margemBruta: margemBrutaAnual,
                    margemLiquida: margemLiquidaAnual,
                },
                comparacao: {
                    receitaAnterior: totalReceitaAnterior,
                    custoAnterior: custoTotalAnterior,
                    variacaoReceita,
                    variacaoCusto,
                },
                objetos: objetosComValores,
            });
        }
        return resultados.sort((a, b) => a.contratoNome.localeCompare(b.contratoNome));
    }
};
exports.RelatoriosService = RelatoriosService;
exports.RelatoriosService = RelatoriosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelatoriosService);
//# sourceMappingURL=relatorios.service.js.map