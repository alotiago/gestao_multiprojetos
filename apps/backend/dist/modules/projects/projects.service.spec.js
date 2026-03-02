"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
// ─── Mock Prisma ───────────────────────────────────────────────────────────────
const mockPrismaService = {
    project: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    unit: {
        findUnique: jest.fn(),
    },
    receitaMensal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    custoMensal: { findMany: jest.fn() },
    despesa: { findMany: jest.fn() },
    imposto: { findMany: jest.fn() },
    historicoCalculo: { create: jest.fn() },
};
// ─── Test Data ─────────────────────────────────────────────────────────────────
const mockUnit = { id: 'unit-1', nome: 'Unidade TI', sigla: 'UTI' };
const mockProject = {
    id: 'proj-1',
    codigo: 'PROJ-001',
    nome: 'Projeto Teste',
    cliente: 'Cliente ABC',
    unitId: 'unit-1',
    unit: mockUnit,
    status: client_1.ProjectStatus.ATIVO,
    tipo: 'serviço',
    dataInicio: new Date('2026-01-01'),
    dataFim: null,
    descricao: null,
    ativo: true,
    criadoPor: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
};
// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('ProjectsService', () => {
    let service;
    let prisma;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                projects_service_1.ProjectsService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
            ],
        }).compile();
        service = module.get(projects_service_1.ProjectsService);
        prisma = module.get(prisma_service_1.PrismaService);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // findAll
    // ─────────────────────────────────────────────────────────────────────────────
    describe('findAll', () => {
        it('deve retornar lista paginada de projetos', async () => {
            prisma.project.findMany.mockResolvedValue([mockProject]);
            prisma.project.count.mockResolvedValue(1);
            const result = await service.findAll({});
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.totalPages).toBe(1);
        });
        it('deve aplicar filtro de status', async () => {
            prisma.project.findMany.mockResolvedValue([]);
            prisma.project.count.mockResolvedValue(0);
            await service.findAll({ status: client_1.ProjectStatus.ENCERRADO });
            expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ status: client_1.ProjectStatus.ENCERRADO }),
            }));
        });
        it('deve aplicar filtro de busca por nome/código/cliente', async () => {
            prisma.project.findMany.mockResolvedValue([]);
            prisma.project.count.mockResolvedValue(0);
            await service.findAll({ search: 'XYZ' });
            expect(prisma.project.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ OR: expect.any(Array) }),
            }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // findById
    // ─────────────────────────────────────────────────────────────────────────────
    describe('findById', () => {
        it('deve retornar projeto por ID', async () => {
            prisma.project.findFirst.mockResolvedValue(mockProject);
            const result = await service.findById('proj-1');
            expect(result).toEqual(mockProject);
        });
        it('deve lançar NotFoundException se projeto não existe', async () => {
            prisma.project.findFirst.mockResolvedValue(null);
            await expect(service.findById('inexistente')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // create
    // ─────────────────────────────────────────────────────────────────────────────
    describe('create', () => {
        const dto = {
            codigo: 'PROJ-002',
            nome: 'Novo Projeto',
            cliente: 'Cliente Novo',
            unitId: 'unit-1',
            tipo: 'produto',
            dataInicio: '2026-03-01',
        };
        it('deve criar projeto com sucesso', async () => {
            prisma.project.findUnique.mockResolvedValue(null); // código não existe
            prisma.unit.findUnique.mockResolvedValue(mockUnit);
            prisma.project.create.mockResolvedValue({ ...mockProject, codigo: dto.codigo });
            const result = await service.create(dto, 'user-1');
            expect(result.codigo).toBe(dto.codigo);
            expect(prisma.project.create).toHaveBeenCalled();
        });
        it('deve lançar ConflictException se código já existe', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject); // código já existe
            await expect(service.create(dto, 'user-1')).rejects.toThrow(common_1.ConflictException);
        });
        it('deve lançar NotFoundException se unidade não existe', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            prisma.unit.findUnique.mockResolvedValue(null); // unidade não existe
            await expect(service.create(dto, 'user-1')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // update
    // ─────────────────────────────────────────────────────────────────────────────
    describe('update', () => {
        it('deve atualizar projeto com sucesso', async () => {
            const updateDto = { nome: 'Projeto Atualizado' };
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.project.update.mockResolvedValue({ ...mockProject, nome: 'Projeto Atualizado' });
            const result = await service.update('proj-1', updateDto);
            expect(result.nome).toBe('Projeto Atualizado');
        });
        it('deve lançar NotFoundException se projeto não existe', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            await expect(service.update('inexistente', {})).rejects.toThrow(common_1.NotFoundException);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // delete
    // ─────────────────────────────────────────────────────────────────────────────
    describe('delete', () => {
        it('deve fazer soft delete do projeto', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.project.update.mockResolvedValue({
                ...mockProject,
                ativo: false,
                status: client_1.ProjectStatus.ENCERRADO,
            });
            const result = await service.delete('proj-1');
            expect(result.message).toBe('Projeto removido com sucesso');
            expect(result.project.ativo).toBe(false);
            expect(result.project.status).toBe(client_1.ProjectStatus.ENCERRADO);
        });
        it('deve lançar NotFoundException para projeto inexistente', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            await expect(service.delete('inexistente')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // Receitas
    // ─────────────────────────────────────────────────────────────────────────────
    describe('createReceita', () => {
        const receitaDto = {
            mes: 3,
            ano: 2026,
            tipoReceita: 'serviço',
            valorPrevisto: 100000,
        };
        it('deve lançar NotFoundException se projeto não existe', async () => {
            prisma.project.findUnique.mockResolvedValue(null);
            await expect(service.createReceita('inexistente', receitaDto)).rejects.toThrow(common_1.NotFoundException);
        });
        it('deve lançar ConflictException se receita duplicada', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findUnique.mockResolvedValue({ id: 'rec-1' }); // já existe
            await expect(service.createReceita('proj-1', receitaDto)).rejects.toThrow(common_1.ConflictException);
        });
        it('deve criar receita com sucesso', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findUnique.mockResolvedValue(null);
            prisma.receitaMensal.create.mockResolvedValue({
                id: 'rec-1',
                projectId: 'proj-1',
                ...receitaDto,
                valorRealizado: 0,
            });
            const result = await service.createReceita('proj-1', receitaDto);
            expect(result.id).toBe('rec-1');
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // FCST
    // ─────────────────────────────────────────────────────────────────────────────
    describe('calcularFcst', () => {
        it('deve lançar BadRequestException para anoFim > 2035', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            await expect(service.calcularFcst('proj-1', 2036)).rejects.toThrow(common_1.BadRequestException);
        });
        it('deve retornar pontos FCST mensais', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findMany.mockResolvedValue([]);
            const result = await service.calcularFcst('proj-1', new Date().getFullYear());
            expect(Array.isArray(result)).toBe(true);
            if (result.length > 0) {
                expect(result[0]).toHaveProperty('mes');
                expect(result[0]).toHaveProperty('valorFcst');
            }
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // Margens
    // ─────────────────────────────────────────────────────────────────────────────
    describe('calcularMargens', () => {
        it('deve retornar indicadores zerados sem dados', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findMany.mockResolvedValue([]);
            prisma.custoMensal.findMany.mockResolvedValue([]);
            prisma.despesa.findMany.mockResolvedValue([]);
            prisma.imposto.findMany.mockResolvedValue([]);
            const result = await service.calcularMargens('proj-1', 2026);
            expect(result.receitaBruta).toBe(0);
            expect(result.margeBruta).toBe(0);
            expect(result.margemLiquida).toBe(0);
        });
        it('deve calcular margens corretamente', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findMany.mockResolvedValue([
                { valorPrevisto: 100000, valorRealizado: 100000 },
            ]);
            prisma.custoMensal.findMany.mockResolvedValue([
                { custoFixo: 30000, custoVariavel: 10000 },
            ]);
            prisma.despesa.findMany.mockResolvedValue([{ valor: 5000 }]);
            prisma.imposto.findMany.mockResolvedValue([{ valor: 15000 }]);
            const result = await service.calcularMargens('proj-1', 2026);
            expect(result.receitaBruta).toBe(100000);
            expect(result.custoTotal).toBe(40000);
            expect(result.margeBruta).toBe(60000);
            expect(result.margemBrutaPercent).toBe(60);
            expect(result.margemOperacional).toBe(55000);
            expect(result.margemLiquida).toBe(40000);
            expect(result.margemLiquidaPercent).toBe(40);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────────
    // Consolidação
    // ─────────────────────────────────────────────────────────────────────────────
    describe('consolidar', () => {
        it('deve retornar 12 meses de consolidação', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findMany.mockResolvedValue([]);
            const result = await service.consolidar('proj-1', 2026);
            expect(result).toHaveLength(12);
            expect(result[0].mes).toBe(1);
            expect(result[11].mes).toBe(12);
        });
        it('deve identificar desvio corretamente', async () => {
            prisma.project.findUnique.mockResolvedValue(mockProject);
            prisma.receitaMensal.findMany.mockResolvedValue([
                { mes: 1, valorPrevisto: 100000, valorRealizado: 120000 },
                { mes: 1, valorPrevisto: 50000, valorRealizado: 40000 },
            ]);
            const result = await service.consolidar('proj-1', 2026);
            const janeiro = result[0];
            expect(janeiro.previsto).toBe(150000);
            expect(janeiro.realizado).toBe(160000);
            expect(janeiro.desvio).toBe(10000);
            expect(janeiro.status).toBe('acima');
        });
    });
    describe('Importação em Lote', () => {
        it('deve importar múltiplos projetos com sucesso', async () => {
            const projetos = [
                {
                    codigo: 'PROJ-NEW-001',
                    nome: 'Novo Projeto 1',
                    cliente: 'Cliente 1',
                    unitId: 'unit-1',
                    tipo: 'serviço',
                    dataInicio: '2026-01-01',
                },
                {
                    codigo: 'PROJ-NEW-002',
                    nome: 'Novo Projeto 2',
                    cliente: 'Cliente 2',
                    unitId: 'unit-1',
                    tipo: 'produto',
                    dataInicio: '2026-02-01',
                },
            ];
            prisma.unit.findUnique.mockResolvedValue(mockUnit);
            prisma.project.findFirst.mockResolvedValue(null);
            prisma.project.create.mockResolvedValueOnce({
                id: 'proj-new-1',
                ...projetos[0],
            });
            prisma.project.create.mockResolvedValueOnce({
                id: 'proj-new-2',
                ...projetos[1],
            });
            prisma.historicoCalculo.create.mockResolvedValue({});
            const result = await service.importarEmLote(projetos, 'user-1', 'Importação teste');
            expect(result.totalProcessado).toBe(2);
            expect(result.sucessos).toBe(2);
            expect(result.erros).toBe(0);
            expect(result.avisos).toBe(0);
            expect(prisma.project.create).toHaveBeenCalledTimes(2);
        });
        it('deve detectar erro ao faltar código', async () => {
            const projetos = [
                {
                    nome: 'Projeto sem código',
                    cliente: 'Cliente',
                    unitId: 'unit-1',
                    tipo: 'serviço',
                    dataInicio: '2026-01-01',
                },
            ];
            const result = await service.importarEmLote(projetos, 'user-1');
            expect(result.totalProcessado).toBe(1);
            expect(result.erros).toBe(1);
            expect(result.detalhes[0].status).toBe('erro');
            expect(result.detalhes[0].mensagem).toContain('Código é obrigatório');
        });
        it('deve detectar aviso ao encontrar código duplicado', async () => {
            const projetos = [
                {
                    codigo: 'PROJ-001',
                    nome: 'Projeto Existente',
                    cliente: 'Cliente',
                    unitId: 'unit-1',
                    tipo: 'serviço',
                    dataInicio: '2026-01-01',
                },
            ];
            prisma.unit.findUnique.mockResolvedValue(mockUnit);
            prisma.project.findFirst.mockResolvedValue({ id: 'proj-1', codigo: 'PROJ-001' });
            const result = await service.importarEmLote(projetos, 'user-1');
            expect(result.totalProcessado).toBe(1);
            expect(result.avisos).toBe(1);
            expect(result.detalhes[0].status).toBe('aviso');
            expect(result.detalhes[0].mensagem).toContain('já existe');
        });
        it('deve detectar erro ao referenciar unidade inexistente', async () => {
            const projetos = [
                {
                    codigo: 'PROJ-NEW-001',
                    nome: 'Novo Projeto',
                    cliente: 'Cliente',
                    unitId: 'unit-inexistente',
                    tipo: 'serviço',
                    dataInicio: '2026-01-01',
                },
            ];
            prisma.unit.findUnique.mockResolvedValue(null);
            const result = await service.importarEmLote(projetos, 'user-1');
            expect(result.totalProcessado).toBe(1);
            expect(result.erros).toBe(1);
            expect(result.detalhes[0].status).toBe('erro');
            expect(result.detalhes[0].mensagem).toContain('não encontrada');
        });
    });
});
//# sourceMappingURL=projects.service.spec.js.map