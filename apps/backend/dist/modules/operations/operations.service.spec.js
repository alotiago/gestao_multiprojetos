"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const operations_service_1 = require("./operations.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const calendario_service_1 = require("../calendario/calendario.service");
const mockCalendarioService = {
    calcularDiasUteis: jest.fn(),
};
const mockPrisma = {
    project: {
        findUnique: jest.fn(),
    },
    jornada: {
        findMany: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findFirst: jest.fn(),
    },
    custoMensal: {
        findMany: jest.fn(),
        upsert: jest.fn(),
    },
    colaborador: {
        findMany: jest.fn(),
        update: jest.fn(),
    },
    historicoCalculo: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
};
describe('OperationsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                operations_service_1.OperationsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
                { provide: calendario_service_1.CalendarioService, useValue: mockCalendarioService },
            ],
        }).compile();
        service = module.get(operations_service_1.OperationsService);
        jest.clearAllMocks();
        mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
    });
    describe('ajusteMassivoJornada', () => {
        it('deve rejeitar quando não informado horasRealizadas nem percentualAjuste', async () => {
            await expect(service.ajusteMassivoJornada({
                projectId: 'p1',
                mes: 1,
                ano: 2026,
                motivo: 'teste',
            })).rejects.toThrow(common_1.BadRequestException);
        });
        it('deve aplicar ajuste e registrar histórico', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1' });
            mockPrisma.jornada.findMany
                .mockResolvedValueOnce([
                {
                    id: 'j1',
                    colaboradorId: 'c1',
                    projectId: 'p1',
                    mes: 1,
                    ano: 2026,
                    horasRealizadas: 160,
                    fte: 1,
                    colaborador: { id: 'c1', nome: 'A', taxaHora: 100, cargaHoraria: 160, ativo: true },
                },
            ])
                .mockResolvedValueOnce([
                {
                    id: 'j1',
                    colaboradorId: 'c1',
                    projectId: 'p1',
                    mes: 1,
                    ano: 2026,
                    horasRealizadas: 176,
                    fte: 1.1,
                },
            ]);
            mockPrisma.custoMensal.findMany
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([
                {
                    colaboradorId: 'c1',
                    projectId: 'p1',
                    mes: 1,
                    ano: 2026,
                    custoFixo: 0,
                    custoVariavel: 17600,
                },
            ]);
            mockPrisma.historicoCalculo.create.mockResolvedValue({ id: 'h1' });
            const result = await service.ajusteMassivoJornada({
                projectId: 'p1',
                mes: 1,
                ano: 2026,
                percentualAjuste: 10,
                motivo: 'aumento de demanda',
            });
            expect(result.success).toBe(true);
            expect(result.historicoId).toBe('h1');
            expect(mockPrisma.jornada.update).toHaveBeenCalled();
            expect(mockPrisma.custoMensal.upsert).toHaveBeenCalled();
            expect(mockPrisma.historicoCalculo.create).toHaveBeenCalled();
        });
        it('deve falhar se projeto não existir', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            await expect(service.ajusteMassivoJornada({
                projectId: 'inexistente',
                mes: 1,
                ano: 2026,
                horasRealizadas: 150,
                motivo: 'teste',
            })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('ajusteMassivoTaxa', () => {
        it('deve ajustar taxas e registrar histórico', async () => {
            mockPrisma.colaborador.findMany
                .mockResolvedValueOnce([{ id: 'c1', nome: 'A', taxaHora: 100 }])
                .mockResolvedValueOnce([{ id: 'c1', nome: 'A', taxaHora: 105 }]);
            mockPrisma.jornada.findFirst.mockResolvedValue({ projectId: 'p1' });
            mockPrisma.historicoCalculo.create.mockResolvedValue({ id: 'h2' });
            const result = await service.ajusteMassivoTaxa({
                percentualAjuste: 5,
                motivo: 'dissídio',
            });
            expect(result.success).toBe(true);
            expect(result.historicoId).toBe('h2');
            expect(mockPrisma.colaborador.update).toHaveBeenCalled();
        });
        it('deve falhar se não houver colaboradores', async () => {
            mockPrisma.colaborador.findMany.mockResolvedValue([]);
            await expect(service.ajusteMassivoTaxa({ percentualAjuste: 5, motivo: 'teste' })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('listarHistorico', () => {
        it('deve listar histórico com limite', async () => {
            mockPrisma.historicoCalculo.findMany.mockResolvedValue([{ id: 'h1' }]);
            const result = await service.listarHistorico('p1', 10);
            expect(result).toHaveLength(1);
            expect(mockPrisma.historicoCalculo.findMany).toHaveBeenCalled();
        });
    });
    describe('rollbackMassivo', () => {
        it('deve aplicar rollback com dados anteriores', async () => {
            mockPrisma.historicoCalculo.findUnique.mockResolvedValue({
                id: 'h1',
                dadosAntes: {
                    jornadasAntes: [{ id: 'j1', horasRealizadas: 100, fte: 0.63 }],
                    colaboradoresAntes: [{ id: 'c1', taxaHora: 90 }],
                    custosAntes: [
                        {
                            colaboradorId: 'c1',
                            projectId: 'p1',
                            mes: 1,
                            ano: 2026,
                            custoFixo: 0,
                            custoVariavel: 9000,
                        },
                    ],
                },
            });
            const result = await service.rollbackMassivo('h1');
            expect(result.success).toBe(true);
            expect(mockPrisma.jornada.update).toHaveBeenCalled();
            expect(mockPrisma.colaborador.update).toHaveBeenCalled();
            expect(mockPrisma.custoMensal.upsert).toHaveBeenCalled();
        });
        it('deve falhar com histórico inexistente', async () => {
            mockPrisma.historicoCalculo.findUnique.mockResolvedValue(null);
            await expect(service.rollbackMassivo('x')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    // ===================== RECÁLCULO EM CASCATA =====================
    describe('recalculoCascata', () => {
        it('deve executar recálculo em cascata TAXA×CALENDÁRIO×HORAS×CUSTO×FTE', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1' });
            // Colaboradores
            mockPrisma.colaborador.findMany.mockResolvedValue([
                {
                    id: 'c1',
                    matricula: 'M001',
                    nome: 'João',
                    taxaHora: 100,
                    cargaHoraria: 176,
                    cidade: 'São Paulo',
                    estado: 'SP',
                },
            ]);
            // Snapshot antes
            mockPrisma.jornada.findMany
                .mockResolvedValueOnce([]) // jornadasAntes (vazio)
                .mockResolvedValueOnce([
                { id: 'j1', horasPrevistas: 168, horasRealizadas: 0, fte: 0.95, colaboradorId: 'c1', projectId: 'p1', mes: 1, ano: 2026 },
            ]);
            mockPrisma.custoMensal.findMany
                .mockResolvedValueOnce([]) // custosAntes
                .mockResolvedValueOnce([
                { colaboradorId: 'c1', projectId: 'p1', mes: 1, ano: 2026, custoFixo: 0, custoVariavel: 16800 },
            ]);
            // Calendário retorna 21 dias úteis
            mockCalendarioService.calcularDiasUteis.mockResolvedValue({
                mes: 1,
                ano: 2026,
                totalDias: 31,
                diasUteis: 22,
                feriados: 1,
                feriadosEmDiaUtil: 1,
                diasUteisLiquidos: 21,
                horasUteis: 168,
            });
            mockPrisma.historicoCalculo.create.mockResolvedValue({ id: 'h-cascata' });
            const result = await service.recalculoCascata({
                projectId: 'p1',
                mes: 1,
                ano: 2026,
                motivo: 'Recalculo após mudança de calendário',
            });
            expect(result.success).toBe(true);
            expect(result.processados).toBe(1);
            expect(result.historicoId).toBe('h-cascata');
            expect(result.detalhes).toHaveLength(1);
            expect(result.detalhes[0].diasUteis).toBe(21);
            expect(result.detalhes[0].horasPrevistas).toBeGreaterThan(0);
            expect(result.detalhes[0].custoVariavel).toBeGreaterThan(0);
            expect(result.detalhes[0].fte).toBeGreaterThan(0);
            expect(result.resumo.totalHorasPrevistas).toBeGreaterThan(0);
            expect(result.resumo.totalCustoVariavel).toBeGreaterThan(0);
            expect(mockCalendarioService.calcularDiasUteis).toHaveBeenCalledWith({
                mes: 1,
                ano: 2026,
                estado: 'SP',
                cidade: 'São Paulo',
            });
            expect(mockPrisma.jornada.upsert).toHaveBeenCalled();
            expect(mockPrisma.custoMensal.upsert).toHaveBeenCalled();
            expect(mockPrisma.historicoCalculo.create).toHaveBeenCalled();
        });
        it('deve falhar se projeto não existir', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            await expect(service.recalculoCascata({
                projectId: 'nao-existe',
                mes: 1,
                ano: 2026,
                motivo: 'teste',
            })).rejects.toThrow(common_1.NotFoundException);
        });
        it('deve falhar se não houver colaboradores', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1' });
            mockPrisma.colaborador.findMany.mockResolvedValue([]);
            await expect(service.recalculoCascata({
                projectId: 'p1',
                mes: 1,
                ano: 2026,
                motivo: 'teste',
            })).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('recalculoCascataRange', () => {
        it('deve executar recálculo para range de meses', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1' });
            mockPrisma.colaborador.findMany.mockResolvedValue([
                {
                    id: 'c1',
                    matricula: 'M001',
                    nome: 'João',
                    taxaHora: 100,
                    cargaHoraria: 176,
                    cidade: 'SP',
                    estado: 'SP',
                },
            ]);
            mockPrisma.jornada.findMany.mockResolvedValue([]);
            mockPrisma.custoMensal.findMany.mockResolvedValue([]);
            mockCalendarioService.calcularDiasUteis.mockResolvedValue({
                diasUteisLiquidos: 22,
                horasUteis: 176,
                feriados: 0,
                feriadosEmDiaUtil: 0,
                totalDias: 30,
                diasUteis: 22,
            });
            mockPrisma.historicoCalculo.create.mockResolvedValue({ id: 'h-range' });
            const result = await service.recalculoCascataRange({
                projectId: 'p1',
                mesInicio: 1,
                mesFim: 3,
                ano: 2026,
                motivo: 'Recálculo trimestral',
            });
            expect(result.success).toBe(true);
            expect(result.totalMeses).toBe(3);
            expect(result.resultados).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=operations.service.spec.js.map