"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const calendario_service_1 = require("./calendario.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const mockPrisma = {
    calendario: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};
describe('CalendarioService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                calendario_service_1.CalendarioService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrisma },
            ],
        }).compile();
        service = module.get(calendario_service_1.CalendarioService);
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('deve criar feriado nacional', async () => {
            const mockFeriado = {
                id: 'fer-001',
                data: new Date('2026-01-01'),
                tipoFeriado: 'NACIONAL',
                descricao: 'Confraternização Universal',
                diaSemana: 4,
                nacional: true,
            };
            mockPrisma.calendario.create.mockResolvedValue(mockFeriado);
            const result = await service.create({
                data: '2026-01-01',
                tipoFeriado: 'NACIONAL',
                descricao: 'Confraternização Universal',
                diaSemana: 4,
                nacional: true,
            });
            expect(result.descricao).toBe('Confraternização Universal');
            expect(result.nacional).toBe(true);
        });
        it('deve criar feriado estadual', async () => {
            const mockFeriado = {
                id: 'fer-002',
                data: new Date('2026-07-09'),
                tipoFeriado: 'ESTADUAL',
                descricao: 'Revolução Constitucionalista',
                estado: 'SP',
                diaSemana: 4,
                nacional: false,
            };
            mockPrisma.calendario.create.mockResolvedValue(mockFeriado);
            const result = await service.create({
                data: '2026-07-09',
                tipoFeriado: 'ESTADUAL',
                descricao: 'Revolução Constitucionalista',
                estado: 'SP',
                diaSemana: 4,
            });
            expect(result.estado).toBe('SP');
            expect(result.tipoFeriado).toBe('ESTADUAL');
        });
    });
    describe('findById', () => {
        it('deve retornar feriado por id', async () => {
            mockPrisma.calendario.findUnique.mockResolvedValue({
                id: 'fer-001',
                descricao: 'Natal',
            });
            const result = await service.findById('fer-001');
            expect(result.descricao).toBe('Natal');
        });
        it('deve lançar NotFoundException', async () => {
            mockPrisma.calendario.findUnique.mockResolvedValue(null);
            await expect(service.findById('nao-existe')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('findAll', () => {
        it('deve listar feriados com filtros', async () => {
            mockPrisma.calendario.findMany.mockResolvedValue([
                { id: 'fer-001', descricao: 'Natal', estado: 'SP' },
            ]);
            const result = await service.findAll({ estado: 'SP' });
            expect(result).toHaveLength(1);
        });
    });
    describe('calcularDiasUteis', () => {
        it('deve calcular dias úteis descontando feriados', async () => {
            // Janeiro 2026: 31 dias, ~22 dias úteis
            mockPrisma.calendario.findMany.mockResolvedValue([
                { data: new Date('2026-01-01'), diaSemana: 4 }, // quinta (dia útil)
            ]);
            const result = await service.calcularDiasUteis({
                mes: 1,
                ano: 2026,
            });
            expect(result.totalDias).toBe(31);
            expect(result.diasUteis).toBeGreaterThan(20);
            expect(result.feriadosEmDiaUtil).toBe(1);
            expect(result.diasUteisLiquidos).toBe(result.diasUteis - 1);
            expect(result.horasUteis).toBe(result.diasUteisLiquidos * 8);
        });
        it('deve calcular dias úteis sem feriados', async () => {
            mockPrisma.calendario.findMany.mockResolvedValue([]);
            const result = await service.calcularDiasUteis({
                mes: 1,
                ano: 2026,
            });
            expect(result.feriadosEmDiaUtil).toBe(0);
            expect(result.diasUteisLiquidos).toBe(result.diasUteis);
        });
        it('deve considerar feriado em fim de semana (não desconta)', async () => {
            // Feriado cai no sábado (diaSemana=6)
            mockPrisma.calendario.findMany.mockResolvedValue([
                { data: new Date('2026-01-03'), diaSemana: 6 }, // sábado
            ]);
            const result = await service.calcularDiasUteis({
                mes: 1,
                ano: 2026,
            });
            expect(result.feriados).toBe(1);
            expect(result.feriadosEmDiaUtil).toBe(0); // sábado não desconta
        });
    });
    describe('calcularJornadaPorRegiao', () => {
        it('deve calcular jornada anual por região', async () => {
            mockPrisma.calendario.findMany.mockResolvedValue([]); // sem feriados
            const result = await service.calcularJornadaPorRegiao('SP', 2026);
            expect(result.estado).toBe('SP');
            expect(result.ano).toBe(2026);
            expect(result.mensal).toHaveLength(12);
            expect(result.totalAnual.diasUteis).toBeGreaterThan(200);
            expect(result.totalAnual.horasUteis).toBeGreaterThan(1600);
        });
    });
    describe('importarFeriadosEmLote', () => {
        it('deve importar feriados com sucesso', async () => {
            mockPrisma.calendario.create.mockResolvedValue({
                id: 'fer-new',
                descricao: 'Natal',
            });
            const result = await service.importarFeriadosEmLote({
                items: [
                    {
                        data: '2026-12-25',
                        tipoFeriado: 'NACIONAL',
                        descricao: 'Natal',
                        diaSemana: 5,
                        nacional: true,
                    },
                ],
            });
            expect(result.totalProcessado).toBe(1);
            expect(result.sucessos).toBe(1);
        });
        it('deve tratar feriado duplicado como aviso', async () => {
            mockPrisma.calendario.create.mockRejectedValue({ code: 'P2002' });
            const result = await service.importarFeriadosEmLote({
                items: [
                    {
                        data: '2026-12-25',
                        tipoFeriado: 'NACIONAL',
                        descricao: 'Natal',
                        diaSemana: 5,
                    },
                ],
            });
            expect(result.avisos).toBe(1);
        });
        it('deve reportar erro para campos faltando', async () => {
            const result = await service.importarFeriadosEmLote({
                items: [
                    { data: '', tipoFeriado: '', descricao: '', diaSemana: 0 },
                ],
            });
            expect(result.erros).toBe(1);
        });
    });
    describe('seedFeriadosNacionais', () => {
        it('deve criar seed de feriados nacionais', async () => {
            mockPrisma.calendario.create.mockResolvedValue({ id: 'fer-seed' });
            const result = await service.seedFeriadosNacionais(2026);
            expect(result.ano).toBe(2026);
            expect(result.totalFeriados).toBe(12);
            expect(result.criados).toBe(12);
        });
        it('deve reportar feriados já existentes', async () => {
            mockPrisma.calendario.create.mockRejectedValue({ code: 'P2002' });
            const result = await service.seedFeriadosNacionais(2026);
            expect(result.existentes).toBe(12);
            expect(result.criados).toBe(0);
        });
    });
});
//# sourceMappingURL=calendario.service.spec.js.map