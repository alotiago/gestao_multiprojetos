import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockProject = {
  id: 'proj-1',
  codigo: 'P001',
  nome: 'Projeto Alpha',
  cliente: 'Cliente X',
  status: 'ATIVO',
  ativo: true,
  dataInicio: new Date('2026-01-01'),
  dataFim: null,
  unitId: 'unit-1',
  tipo: 'serviço',
  descricao: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  criadoPor: null,
  receitas: [],
  custos: [],
  despesas: [],
  impostos: [],
};

const mockReceita = {
  id: 'rec-1',
  projectId: 'proj-1',
  mes: 1,
  ano: 2026,
  tipoReceita: 'serviço',
  descricao: null,
  valorPrevisto: 50000,
  valorRealizado: 45000,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCusto = {
  id: 'cst-1',
  colaboradorId: 'col-1',
  projectId: 'proj-1',
  mes: 1,
  ano: 2026,
  custoFixo: 8000,
  custoVariavel: 2000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDespesa = {
  id: 'dep-1',
  projectId: 'proj-1',
  tipo: 'ALUGUEL',
  descricao: 'Aluguel do escritório',
  valor: 5000,
  mes: 1,
  ano: 2026,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockImposto = {
  id: 'imp-1',
  projectId: 'proj-1',
  tipoImposto: 'PIS',
  valor: 1650,
  mes: 1,
  ano: 2026,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockColaborador = {
  id: 'col-1',
  matricula: 'MAT001',
  nome: 'João Silva',
  cargo: 'Engenheiro',
  estado: 'SP',
  taxaHora: 50,
  cargaHoraria: 160,
  ativo: true,
};

const mockJornada = {
  id: 'jor-1',
  colaboradorId: 'col-1',
  projectId: 'proj-1',
  mes: 1,
  ano: 2026,
  horasPrevistas: 160,
  horasRealizadas: 150,
  fte: 0.94,
  createdAt: new Date(),
  updatedAt: new Date(),
  colaborador: mockColaborador,
};

const mockPrisma = {
  project: { findMany: jest.fn() },
  receitaMensal: { findMany: jest.fn() },
  custoMensal: { findMany: jest.fn() },
  despesa: { findMany: jest.fn() },
  imposto: { findMany: jest.fn() },
  colaborador: { findMany: jest.fn() },
  jornada: { findMany: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  // =============================================================
  // DASHBOARD EXECUTIVO
  // =============================================================

  describe('getDashboardExecutivo', () => {
    it('deve retornar KPIs consolidados do ano', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      mockPrisma.receitaMensal.findMany.mockResolvedValue([mockReceita]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([mockCusto]);
      mockPrisma.despesa.findMany.mockResolvedValue([mockDespesa]);
      mockPrisma.imposto.findMany.mockResolvedValue([mockImposto]);
      mockPrisma.colaborador.findMany.mockResolvedValue([mockColaborador]);
      mockPrisma.jornada.findMany.mockResolvedValue([mockJornada]);

      const result = await service.getDashboardExecutivo(2026);

      expect(result.ano).toBe(2026);
      expect(result.kpis.projetosAtivos).toBe(1);
      expect(result.kpis.colaboradoresAtivos).toBe(1);
      expect(result.financeiro.receitaPrevista).toBe(50000);
      expect(result.financeiro.receitaRealizada).toBe(45000);
      expect(result.financeiro.totalCustos).toBe(16650); // 10000 + 5000 + 1650
      expect(result.financeiro.margemRealizada).toBeGreaterThan(0);
    });

    it('deve calcular margem zero quando sem receita realizada', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      mockPrisma.receitaMensal.findMany.mockResolvedValue([]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([]);
      mockPrisma.despesa.findMany.mockResolvedValue([]);
      mockPrisma.imposto.findMany.mockResolvedValue([]);
      mockPrisma.colaborador.findMany.mockResolvedValue([]);
      mockPrisma.jornada.findMany.mockResolvedValue([]);

      const result = await service.getDashboardExecutivo(2026);
      expect(result.financeiro.margemRealizada).toBe(0);
    });
  });

  // =============================================================
  // DASHBOARD FINANCEIRO
  // =============================================================

  describe('getDashboardFinanceiro', () => {
    it('deve consolidar dados financeiros por projeto', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      mockPrisma.receitaMensal.findMany.mockResolvedValue([mockReceita]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([mockCusto]);
      mockPrisma.despesa.findMany.mockResolvedValue([mockDespesa]);
      mockPrisma.imposto.findMany.mockResolvedValue([mockImposto]);

      const result = await service.getDashboardFinanceiro(2026);

      expect(result.projetos).toHaveLength(1);
      expect(result.projetos[0].receitaPrevista).toBe(50000);
      expect(result.projetos[0].totalCustos).toBe(16650);
      expect(result.totais.receitaRealizada).toBe(45000);
    });

    it('deve filtrar por mês quando fornecido', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.receitaMensal.findMany.mockResolvedValue([]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([]);
      mockPrisma.despesa.findMany.mockResolvedValue([]);
      mockPrisma.imposto.findMany.mockResolvedValue([]);

      await service.getDashboardFinanceiro(2026, 1);

      expect(mockPrisma.receitaMensal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ mes: 1, ano: 2026 }) }),
      );
    });

    it('deve exportar dashboard financeiro em CSV', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      mockPrisma.receitaMensal.findMany.mockResolvedValue([mockReceita]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([mockCusto]);
      mockPrisma.despesa.findMany.mockResolvedValue([mockDespesa]);
      mockPrisma.imposto.findMany.mockResolvedValue([mockImposto]);

      const csv = await service.exportDashboardFinanceiroCsv(2026);

      expect(csv).toContain('projectId,nome,cliente,status,receitaPrevista,receitaRealizada,custoPessoal,despesas,impostos,totalCustos,margem');
      expect(csv).toContain('"proj-1"');
      expect(csv).toContain('"Projeto Alpha"');
      expect(csv).toContain('"TOTAL"');
    });
  });

  // =============================================================
  // DASHBOARD RECURSOS
  // =============================================================

  describe('getDashboardRecursos', () => {
    it('deve retornar KPIs de recursos humanos', async () => {
      mockPrisma.jornada.findMany.mockResolvedValue([mockJornada]);
      mockPrisma.colaborador.findMany.mockResolvedValue([mockColaborador]);

      const result = await service.getDashboardRecursos(2026);

      expect(result.kpis.totalColaboradoresAtivos).toBe(1);
      expect(result.kpis.fteTotal).toBe(0.94);
      expect(result.kpis.utilizacaoMedia).toBeCloseTo(93.75, 0);
      expect(result.ftePorEstado).toHaveLength(1);
      expect(result.ftePorEstado[0].estado).toBe('SP');
    });
  });

  // =============================================================
  // VISÃO ANO-A-ANO
  // =============================================================

  describe('getVisaoAnoAno', () => {
    it('deve retornar dados anuais de 2024 a 2026', async () => {
      mockPrisma.receitaMensal.findMany.mockResolvedValue([mockReceita]);
      mockPrisma.custoMensal.findMany.mockResolvedValue([mockCusto]);
      mockPrisma.despesa.findMany.mockResolvedValue([mockDespesa]);
      mockPrisma.imposto.findMany.mockResolvedValue([mockImposto]);

      const result = await service.getVisaoAnoAno(2024, 2026);

      expect(result).toHaveLength(3); // 2024, 2025, 2026
      const resultAno2026 = result.find((r) => r.ano === 2026)!;
      expect(resultAno2026.receitaPrevista).toBe(50000);
      expect(resultAno2026.totalCustos).toBe(16650);
    });
  });

  // =============================================================
  // DASHBOARD PROJETOS
  // =============================================================

  describe('getDashboardProjetos', () => {
    it('deve retornar dados financeiros por projeto com relações', async () => {
      const projetoComRelacoes = {
        ...mockProject,
        receitas: [mockReceita],
        custos: [mockCusto],
        despesas: [mockDespesa],
        impostos: [mockImposto],
      };
      mockPrisma.project.findMany.mockResolvedValue([projetoComRelacoes]);

      const result = await service.getDashboardProjetos(2026);

      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('P001');
      expect(result[0].receitaPrevista).toBe(50000);
      expect(result[0].totalCustos).toBe(16650);
    });
  });
});
