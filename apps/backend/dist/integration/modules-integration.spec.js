"use strict";
/**
 * Testes de Integração entre Módulos
 *
 * Validam que os módulos se comunicam corretamente:
 * - Calendário → Operations (recálculo cascata usa dias úteis)
 * - Sindicato → Financial (impacto tributário)
 * - Financial → Projects (custo total completo)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const calendario_service_1 = require("../modules/calendario/calendario.service");
const operations_service_1 = require("../modules/operations/operations.service");
const financial_service_1 = require("../modules/financial/financial.service");
const prisma_service_1 = require("../prisma/prisma.service");
/* ── Helper para criar mock Prisma com $transaction funcional ── */
function createMockPrisma() {
    const mock = {
        project: { findUnique: jest.fn().mockResolvedValue({ id: 'proj-1', codigoProjeto: 'PRJ-001' }) },
        colaborador: { findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn(), update: jest.fn() },
        jornada: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), upsert: jest.fn().mockResolvedValue({ id: 'j-1' }) },
        custoMensal: { findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn().mockResolvedValue({ id: 'cm-1' }) },
        calendario: { findMany: jest.fn().mockResolvedValue([]) },
        sindicato: { findUnique: jest.fn(), findMany: jest.fn() },
        historicoCalculo: { create: jest.fn().mockResolvedValue({ id: 'h-1' }), findMany: jest.fn() },
        provisao: { findMany: jest.fn().mockResolvedValue([]) },
        despesa: { findMany: jest.fn().mockResolvedValue([]) },
        imposto: { findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn() },
        indiceFinanceiro: { findFirst: jest.fn(), findUnique: jest.fn() },
        $queryRaw: jest.fn(),
    };
    // $transaction: se receber função, passa o próprio mock; se array, resolve tudo
    mock.$transaction = jest.fn((arg) => {
        if (typeof arg === 'function')
            return arg(mock);
        return Promise.all(arg);
    });
    return mock;
}
/* ═══════════════════════════════════════════════════════════════════
   1. Calendário → Operations (Recálculo Cascata)
   ═══════════════════════════════════════════════════════════════════ */
describe('Integração: Calendário → Operations', () => {
    let calendarioService;
    let operationsService;
    let mockPrisma;
    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma = createMockPrisma();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                calendario_service_1.CalendarioService,
                operations_service_1.OperationsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        calendarioService = module.get(calendario_service_1.CalendarioService);
        operationsService = module.get(operations_service_1.OperationsService);
    });
    const mockDiasUteis = {
        mes: 3, ano: 2026, estado: 'SP', cidade: null,
        totalDias: 31, diasUteis: 23, feriados: 1,
        feriadosEmDiaUtil: 1, diasUteisLiquidos: 22, horasUteis: 176,
    };
    const colaboradorJoao = {
        id: 'col-1', nome: 'João', matricula: '001',
        taxaHora: 50, cargaHoraria: 176, cidade: 'São Paulo', estado: 'SP',
    };
    function setupCascataMocks(colabs = [colaboradorJoao]) {
        jest.spyOn(calendarioService, 'calcularDiasUteis').mockResolvedValue(mockDiasUteis);
        mockPrisma.project.findUnique.mockResolvedValue({ id: 'proj-1', codigoProjeto: 'PRJ-001' });
        mockPrisma.colaborador.findMany.mockResolvedValue(colabs);
        mockPrisma.jornada.findMany.mockResolvedValue([]);
        mockPrisma.custoMensal.findMany.mockResolvedValue([]);
        mockPrisma.jornada.upsert.mockResolvedValue({ id: 'j-1' });
        mockPrisma.custoMensal.upsert.mockResolvedValue({ id: 'cm-1' });
        mockPrisma.historicoCalculo.create.mockResolvedValue({ id: 'h-1' });
    }
    it('recálculo cascata deve chamar calcularDiasUteis do CalendarioService', async () => {
        setupCascataMocks();
        const result = await operationsService.recalculoCascata({
            projectId: 'proj-1', mes: 3, ano: 2026, motivo: 'Teste integração',
        });
        expect(calendarioService.calcularDiasUteis).toHaveBeenCalledWith(expect.objectContaining({ mes: 3, ano: 2026, estado: 'SP' }));
        expect(result.success).toBe(true);
        expect(result.detalhes).toHaveLength(1);
        expect(result.detalhes[0].diasUteis).toBe(22);
        expect(result.detalhes[0].custoVariavel).toBeGreaterThan(0);
    });
    it('recálculo cascata range deve iterar meses usando calendário', async () => {
        setupCascataMocks([
            { ...colaboradorJoao, cidade: 'Rio de Janeiro', estado: 'RJ' },
        ]);
        const result = await operationsService.recalculoCascataRange({
            projectId: 'proj-1', mesInicio: 1, mesFim: 3, ano: 2026,
            motivo: 'Range integration test',
        });
        expect(result.totalMeses).toBe(3);
        expect(result.resultados).toHaveLength(3);
        expect(calendarioService.calcularDiasUteis).toHaveBeenCalledTimes(3);
    });
});
/* ═══════════════════════════════════════════════════════════════════
   2. Sindicato → Financial (Impacto Tributário)
   ═══════════════════════════════════════════════════════════════════ */
describe('Integração: Sindicato → Financial', () => {
    let financialService;
    let mockPrisma;
    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma = createMockPrisma();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                financial_service_1.FinancialService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        financialService = module.get(financial_service_1.FinancialService);
    });
    it('deve calcular impacto tributário usando dados do sindicato', async () => {
        mockPrisma.sindicato.findUnique.mockResolvedValue({
            id: 'sind-1', nome: 'SINDPD-SP', pisoSalarial: 3000,
            percentualDissidio: 6.5, regimeTributario: 'CPRB', regiao: 'Sudeste',
        });
        mockPrisma.custoMensal.findMany.mockResolvedValue([
            { custoFixo: 5000, custoVariavel: 3000 },
        ]);
        mockPrisma.indiceFinanceiro.findUnique.mockResolvedValue(null);
        const result = await financialService.calcularImpactoTributarioSindicato({
            sindicatoId: 'sind-1', projectId: 'proj-1',
            receitaBruta: 100000, mes: 3, ano: 2026,
        });
        expect(result).toBeDefined();
        expect(result.sindicato?.percentualDissidio).toBe(6.5);
        expect(result.impactoDissidio).toBeGreaterThan(0);
        expect(result.cargaTributaria).toBeGreaterThan(0);
    });
    it('sem sindicato deve retornar apenas cálculo tributário base', async () => {
        const result = await financialService.calcularImpactoTributarioSindicato({
            projectId: 'proj-1', receitaBruta: 100000, mes: 3, ano: 2026,
        });
        expect(result.sindicato).toBeNull();
        expect(result.impactoDissidio).toBe(0);
        expect(result.totalImpostos).toBeGreaterThan(0);
    });
});
/* ═══════════════════════════════════════════════════════════════════
   3. Financial → Projects (Custo Total Completo)
   ═══════════════════════════════════════════════════════════════════ */
describe('Integração: Financial → Projects', () => {
    let financialService;
    let mockPrisma;
    beforeEach(async () => {
        jest.clearAllMocks();
        mockPrisma = createMockPrisma();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                financial_service_1.FinancialService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        financialService = module.get(financial_service_1.FinancialService);
    });
    it('custo total completo deve incluir provisões no cálculo', async () => {
        mockPrisma.despesa.findMany.mockResolvedValue([{ valor: 1000, categoria: 'FACILITIES' }]);
        mockPrisma.imposto.findMany.mockResolvedValue([{ tipo: 'ISS', valor: 500 }, { tipo: 'PIS', valor: 200 }]);
        mockPrisma.custoMensal.findMany.mockResolvedValue([
            { custoFixo: 5000, custoVariavel: 3000 },
            { custoFixo: 4000, custoVariavel: 2500 },
        ]);
        mockPrisma.provisao.findMany.mockResolvedValue([
            { tipo: 'DECIMO_TERCEIRO', valor: 800 },
            { tipo: 'FERIAS', valor: 600 },
        ]);
        const result = await financialService.calcularCustoTotalCompleto('proj-1', 3, 2026);
        expect(result).toBeDefined();
        expect(result.provisoesPorTipo).toBeDefined();
        expect(result.totalProvisoes).toBe(1400);
        expect(result.totalDespesas).toBe(1000);
        expect(result.totalImpostos).toBe(700);
        expect(result.totalCustosPessoal).toBe(14500);
        expect(result.custoTotal).toBe(1000 + 700 + 14500 + 1400);
    });
    it('deve retornar zeros quando não há dados', async () => {
        const result = await financialService.calcularCustoTotalCompleto('proj-1', 1, 2026);
        expect(result.totalDespesas).toBe(0);
        expect(result.totalImpostos).toBe(0);
        expect(result.totalCustosPessoal).toBe(0);
        expect(result.totalProvisoes).toBe(0);
        expect(result.custoTotal).toBe(0);
    });
});
//# sourceMappingURL=modules-integration.spec.js.map