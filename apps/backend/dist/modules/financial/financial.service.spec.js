"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const financial_service_1 = require("./financial.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const imposto_dto_1 = require("./dto/imposto.dto");
const despesa_dto_1 = require("./dto/despesa.dto");
const provisao_dto_1 = require("./dto/provisao.dto");
const mockPrisma = {
    project: { findUnique: jest.fn() },
    despesa: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    imposto: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
    },
    custoMensal: {
        findMany: jest.fn(),
        upsert: jest.fn(),
    },
    colaborador: { findUnique: jest.fn() },
    indiceFinanceiro: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    provisao: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
    },
    historicoCalculo: {
        create: jest.fn(),
    },
    sindicato: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
};
const mockProject = {
    id: 'proj-001',
    codigo: 'PROJ-001',
    nome: 'Projeto Teste',
    ativo: true,
};
const mockDespesa = {
    id: 'desp-001',
    projectId: 'proj-001',
    tipo: despesa_dto_1.TipoDespesa.FACILITIES,
    descricao: 'Aluguel escritório',
    valor: 5000,
    mes: 1,
    ano: 2026,
};
const mockImposto = {
    id: 'imp-001',
    projectId: 'proj-001',
    tipo: imposto_dto_1.TipoImposto.ISS,
    aliquota: 0.05,
    valor: 2500,
    mes: 1,
    ano: 2026,
};
describe('FinancialService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                financial_service_1.FinancialService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(financial_service_1.FinancialService);
        jest.clearAllMocks();
    });
    // ===================== DESPESAS =====================
    describe('createDespesa', () => {
        it('deve criar despesa com sucesso', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.despesa.create.mockResolvedValue(mockDespesa);
            const result = await service.createDespesa({
                projectId: 'proj-001',
                tipo: despesa_dto_1.TipoDespesa.FACILITIES,
                descricao: 'Aluguel escritório',
                valor: 5000,
                mes: 1,
                ano: 2026,
            });
            expect(result.tipo).toBe(despesa_dto_1.TipoDespesa.FACILITIES);
            expect(result.valor).toBe(5000);
        });
        it('deve lançar NotFoundException para projeto inexistente', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            await expect(service.createDespesa({
                projectId: 'nao-existe',
                tipo: despesa_dto_1.TipoDespesa.FACILITIES,
                descricao: 'Teste',
                valor: 100,
                mes: 1,
                ano: 2026,
            })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('updateDespesa', () => {
        it('deve atualizar despesa', async () => {
            mockPrisma.despesa.findUnique.mockResolvedValue(mockDespesa);
            mockPrisma.despesa.update.mockResolvedValue({ ...mockDespesa, valor: 6000 });
            const result = await service.updateDespesa('desp-001', { valor: 6000 });
            expect(result.valor).toBe(6000);
        });
        it('deve lançar NotFoundException se despesa não existe', async () => {
            mockPrisma.despesa.findUnique.mockResolvedValue(null);
            await expect(service.updateDespesa('nao-existe', { valor: 100 })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('deleteDespesa', () => {
        it('deve deletar despesa', async () => {
            mockPrisma.despesa.findUnique.mockResolvedValue(mockDespesa);
            mockPrisma.despesa.delete.mockResolvedValue(mockDespesa);
            const result = await service.deleteDespesa('desp-001');
            expect(result).toEqual(mockDespesa);
        });
    });
    // ===================== ENGINE TRIBUTÁRIA =====================
    describe('calcularImpostos', () => {
        it('deve calcular impostos para Lucro Presumido', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await service.calcularImpostos({
                projectId: 'proj-001',
                regime: imposto_dto_1.RegimeTributario.LUCRO_PRESUMIDO,
                receitaBruta: 100000,
                mes: 1,
                ano: 2026,
            });
            expect(result.totalImpostos).toBeGreaterThan(0);
            expect(result.cargaTributaria).toBeGreaterThan(0);
            expect(result.impostos.length).toBeGreaterThan(0);
        });
        it('deve calcular impostos para Lucro Real', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await service.calcularImpostos({
                projectId: 'proj-001',
                regime: imposto_dto_1.RegimeTributario.LUCRO_REAL,
                receitaBruta: 200000,
                mes: 3,
                ano: 2026,
            });
            // Lucro Real tem alíquotas maiores
            expect(result.impostos.find(i => i.tipo === 'PIS')?.aliquota).toBe(0.0165);
        });
        it('deve aplicar ISS reduzido para SP', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await service.calcularImpostos({
                projectId: 'proj-001',
                regime: imposto_dto_1.RegimeTributario.LUCRO_PRESUMIDO,
                receitaBruta: 100000,
                mes: 1,
                ano: 2026,
                estado: 'SP',
            });
            const iss = result.impostos.find(i => i.tipo === 'ISS');
            expect(iss?.aliquota).toBe(0.02); // ISS reduzido em SP
        });
        it('deve calcular CPRB para regime CPRB', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const result = await service.calcularImpostos({
                projectId: 'proj-001',
                regime: imposto_dto_1.RegimeTributario.CPRB,
                receitaBruta: 50000,
                mes: 2,
                ano: 2026,
            });
            expect(result.impostos.find(i => i.tipo === 'CPRB')).toBeDefined();
        });
    });
    // ===================== ÍNDICES FINANCEIROS =====================
    describe('createIndice', () => {
        it('deve criar índice IPCA', async () => {
            mockPrisma.indiceFinanceiro.findUnique.mockResolvedValue(null);
            mockPrisma.indiceFinanceiro.create.mockResolvedValue({
                id: 'ind-001',
                tipo: 'IPCA',
                valor: 0.04,
                mesReferencia: 1,
                anoReferencia: 2026,
            });
            const result = await service.createIndice({
                tipo: 'IPCA',
                valor: 0.04,
                mesReferencia: 1,
                anoReferencia: 2026,
            });
            expect(result.tipo).toBe('IPCA');
        });
        it('deve lançar ConflictException se índice já existe', async () => {
            mockPrisma.indiceFinanceiro.findUnique.mockResolvedValue({ id: 'ind-001' });
            await expect(service.createIndice({
                tipo: 'IPCA',
                valor: 0.04,
                mesReferencia: 1,
                anoReferencia: 2026,
            })).rejects.toThrow(common_1.ConflictException);
        });
    });
    // ===================== CUSTO TOTAL =====================
    describe('calcularCustoTotal', () => {
        it('deve calcular custo total por mês', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.$transaction.mockResolvedValue([
                [{ valor: 5000 }, { valor: 3000 }], // despesas
                [{ valor: 2500 }], // impostos
                [{ custoFixo: 10000, custoVariavel: 8000 }], // custos pessoal
            ]);
            const result = await service.calcularCustoTotal('proj-001', 1, 2026);
            expect(result.totalDespesas).toBe(8000);
            expect(result.totalImpostos).toBe(2500);
            expect(result.totalCustosPessoal).toBe(18000);
            expect(result.custoTotal).toBe(28500);
        });
        it('deve retornar zero para projeto sem dados', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.$transaction.mockResolvedValue([[], [], []]);
            const result = await service.calcularCustoTotal('proj-001', 6, 2026);
            expect(result.custoTotal).toBe(0);
            expect(result.totalDespesas).toBe(0);
        });
    });
    describe('calcularCustoAnual', () => {
        it('deve calcular custo anual consolidando 12 meses', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            // Mock para todos os 12 meses
            mockPrisma.$transaction.mockResolvedValue([
                [{ valor: 1000 }], // despesas
                [{ valor: 500 }], // impostos
                [{ custoFixo: 3000, custoVariavel: 2000 }], // pessoal
            ]);
            const result = await service.calcularCustoAnual('proj-001', 2026);
            expect(result.mensais).toHaveLength(12);
            expect(result.totalAnual.custoTotal).toBe(12 * 6500); // 1000+500+5000 × 12
        });
    });
    // ===================== PROVISÕES =====================
    describe('createProvisao', () => {
        it('deve criar provisão com sucesso', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.provisao.findUnique.mockResolvedValue(null);
            mockPrisma.provisao.create.mockResolvedValue({
                id: 'prov-001',
                projectId: 'proj-001',
                tipo: provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO,
                valor: 15000,
                mes: 1,
                ano: 2026,
            });
            const result = await service.createProvisao({
                projectId: 'proj-001',
                tipo: provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO,
                valor: 15000,
                mes: 1,
                ano: 2026,
            });
            expect(result.tipo).toBe(provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO);
            expect(result.valor).toBe(15000);
        });
        it('deve lançar ConflictException se provisão já existe', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.provisao.findUnique.mockResolvedValue({ id: 'prov-exist' });
            await expect(service.createProvisao({
                projectId: 'proj-001',
                tipo: provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO,
                valor: 15000,
                mes: 1,
                ano: 2026,
            })).rejects.toThrow(common_1.ConflictException);
        });
        it('deve lançar NotFoundException para projeto inexistente', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            await expect(service.createProvisao({
                projectId: 'nao-existe',
                tipo: provisao_dto_1.TipoProvisao.FERIAS,
                valor: 5000,
                mes: 1,
                ano: 2026,
            })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('updateProvisao', () => {
        it('deve atualizar provisão', async () => {
            mockPrisma.provisao.findUnique.mockResolvedValue({ id: 'prov-001', valor: 15000 });
            mockPrisma.provisao.update.mockResolvedValue({ id: 'prov-001', valor: 20000 });
            const result = await service.updateProvisao('prov-001', { valor: 20000 });
            expect(result.valor).toBe(20000);
        });
    });
    // ===================== BULK IMPORT DESPESAS =====================
    describe('importarDespesasEmLote', () => {
        it('deve importar despesas com sucesso', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.despesa.create.mockResolvedValue({ id: 'desp-new', tipo: despesa_dto_1.TipoDespesa.FACILITIES });
            mockPrisma.historicoCalculo.create.mockResolvedValue({});
            const result = await service.importarDespesasEmLote({
                items: [
                    {
                        projectId: 'proj-001',
                        tipo: despesa_dto_1.TipoDespesa.FACILITIES,
                        descricao: 'Aluguel',
                        valor: 5000,
                        mes: 1,
                        ano: 2026,
                    },
                    {
                        projectId: 'proj-001',
                        tipo: despesa_dto_1.TipoDespesa.FORNECEDOR,
                        descricao: 'Material',
                        valor: 3000,
                        mes: 1,
                        ano: 2026,
                    },
                ],
            }, 'user-001');
            expect(result.totalProcessado).toBe(2);
            expect(result.sucessos).toBe(2);
            expect(result.erros).toBe(0);
        });
        it('deve reportar erro para projeto inexistente', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            const result = await service.importarDespesasEmLote({
                items: [
                    {
                        projectId: 'nao-existe',
                        tipo: despesa_dto_1.TipoDespesa.FACILITIES,
                        descricao: 'Teste',
                        valor: 100,
                        mes: 1,
                        ano: 2026,
                    },
                ],
            });
            expect(result.erros).toBe(1);
            expect(result.detalhes[0].status).toBe('erro');
        });
        it('deve reportar erro para campos obrigatórios faltando', async () => {
            const result = await service.importarDespesasEmLote({
                items: [
                    {
                        projectId: '',
                        tipo: despesa_dto_1.TipoDespesa.FACILITIES,
                        descricao: '',
                        valor: 0,
                        mes: 1,
                        ano: 2026,
                    },
                ],
            });
            expect(result.erros).toBe(1);
            expect(result.detalhes[0].mensagem).toContain('obrigatórios');
        });
    });
    // ===================== BULK IMPORT PROVISÕES =====================
    describe('importarProvisoesEmLote', () => {
        it('deve importar provisões com upsert', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            const now = new Date();
            mockPrisma.provisao.upsert.mockResolvedValue({
                id: 'prov-new',
                tipo: provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO,
                createdAt: now,
                updatedAt: now,
            });
            mockPrisma.historicoCalculo.create.mockResolvedValue({});
            const result = await service.importarProvisoesEmLote({
                items: [
                    {
                        projectId: 'proj-001',
                        tipo: provisao_dto_1.TipoProvisao.DECIMO_TERCEIRO,
                        valor: 15000,
                        mes: 1,
                        ano: 2026,
                    },
                ],
            }, 'user-001');
            expect(result.totalProcessado).toBe(1);
            expect(result.sucessos + result.avisos).toBeGreaterThanOrEqual(1);
        });
        it('deve reportar erro para projeto inexistente', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            const result = await service.importarProvisoesEmLote({
                items: [
                    {
                        projectId: 'nao-existe',
                        tipo: provisao_dto_1.TipoProvisao.FERIAS,
                        valor: 5000,
                        mes: 1,
                        ano: 2026,
                    },
                ],
            });
            expect(result.erros).toBe(1);
        });
    });
    // ===================== IMPACTO TRIBUTÁRIO SINDICATO =====================
    describe('calcularImpactoTributarioSindicato', () => {
        it('deve calcular impacto com sindicato', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.sindicato.findUnique.mockResolvedValue({
                id: 'sind-001',
                nome: 'Sindicato SP',
                regiao: 'SP',
                percentualDissidio: 0.05,
                regimeTributario: 'LUCRO_PRESUMIDO',
            });
            mockPrisma.custoMensal.findMany.mockResolvedValue([
                { custoFixo: 10000, custoVariavel: 5000 },
            ]);
            mockPrisma.indiceFinanceiro.findUnique.mockResolvedValue({
                tipo: 'IPCA',
                valor: 0.04,
            });
            const result = await service.calcularImpactoTributarioSindicato({
                projectId: 'proj-001',
                receitaBruta: 100000,
                sindicatoId: 'sind-001',
                estado: 'SP',
                mes: 1,
                ano: 2026,
            });
            expect(result.sindicato).toBeDefined();
            expect(result.sindicato?.nome).toBe('Sindicato SP');
            expect(result.impactoDissidio).toBeGreaterThan(0);
            expect(result.ipca).toBe(0.04);
            expect(result.custoTotalComImpacto).toBeGreaterThan(0);
        });
        it('deve calcular sem sindicato (padrão)', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.indiceFinanceiro.findUnique.mockResolvedValue(null);
            const result = await service.calcularImpactoTributarioSindicato({
                projectId: 'proj-001',
                receitaBruta: 100000,
                mes: 1,
                ano: 2026,
            });
            expect(result.sindicato).toBeNull();
            expect(result.impactoDissidio).toBe(0);
            expect(result.totalImpostos).toBeGreaterThan(0);
        });
    });
    // ===================== CUSTO TOTAL COMPLETO =====================
    describe('calcularCustoTotalCompleto', () => {
        it('deve incluir provisões no cálculo total', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(mockProject);
            mockPrisma.$transaction.mockResolvedValue([
                [{ valor: 5000 }], // despesas
                [{ valor: 2500 }], // impostos
                [{ custoFixo: 10000, custoVariavel: 8000 }], // pessoal
                [{ valor: 3000, tipo: '13_salario' }], // provisões
            ]);
            const result = await service.calcularCustoTotalCompleto('proj-001', 1, 2026);
            expect(result.totalDespesas).toBe(5000);
            expect(result.totalImpostos).toBe(2500);
            expect(result.totalCustosPessoal).toBe(18000);
            expect(result.totalProvisoes).toBe(3000);
            expect(result.custoTotal).toBe(28500); // 5000+2500+18000+3000
            expect(result.provisoesPorTipo).toBeDefined();
        });
    });
});
//# sourceMappingURL=financial.service.spec.js.map