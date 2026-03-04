import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RecalculoService } from './recalculo.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoRecalculo, StatusRecalculo } from './dto/recalculo.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { FinancialService } from '../financial/financial.service';
import { ProjectsService } from '../projects/projects.service';
import { HrService } from '../hr/hr.service';

describe('RecalculoService', () => {
  let service: RecalculoService;
  let prisma: PrismaService;
  let financialService: FinancialService;
  let projectsService: ProjectsService;
  let hrService: HrService;

  // Mock data
  const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' };
  const mockImposto = {
    id: 'imposto-1',
    nome: 'INSS Patronal',
    aliquota: new Decimal(20),
    ativo: true,
  };

  const mockCalendario = {
    id: 'calendario-1',
    nome: 'Natal 2026',
    data: new Date('2026-12-25'),
    nacional: true,
    estado: null,
    cidade: null,
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: new Decimal(100),
  };

  const mockColaborador = {
    id: 'colab-1',
    matricula: '001',
    nome: 'João Silva',
    email: 'joao@example.com',
    taxaHora: new Decimal(50),
    ativo: true,
    estado: 'SP',
  };

  const mockSindicato = {
    id: 'sindicato-1',
    nome: 'Sindicato dos TI',
    sigla: 'SINDTI',
    percentualDissidio: new Decimal(0.05),
    colaboradores: [mockColaborador],
  };

  const mockProjeto = {
    id: 'projeto-1',
    codigo: 'PRJ-001',
    nome: 'Projeto Alpha',
    ativo: true,
  };

  const mockHistorico = {
    id: 'historico-1',
    tipo: TipoRecalculo.IMPOSTO,
    entidadeId: 'imposto-1',
    entidadeTipo: 'Imposto',
    usuarioId: 'user-1',
    status: StatusRecalculo.PROCESSANDO,
    dataInicio: new Date(),
    dataFim: null,
    totalAfetados: null,
    processados: null,
    erros: null,
    detalhes: null,
    mensagemErro: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecalculoService,
        {
          provide: PrismaService,
          useValue: {
            imposto: {
              findUnique: jest.fn(),
            },
            calendario: {
              findUnique: jest.fn(),
            },
            colaborador: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            sindicato: {
              findUnique: jest.fn(),
            },
            project: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            jornada: {
              findMany: jest.fn(),
            },
            historicoRecalculo: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: FinancialService,
          useValue: {
            calcularCustoTotalCompleto: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            calcularMargens: jest.fn(),
          },
        },
        {
          provide: HrService,
          useValue: {
            calcularCustoIndividual: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecalculoService>(RecalculoService);
    prisma = module.get<PrismaService>(PrismaService);
    financialService = module.get<FinancialService>(FinancialService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    hrService = module.get<HrService>(HrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recalcularPorAlteracaoImposto', () => {
    it('deve recalcular custos de todos os projetos após alteração de imposto', async () => {
      jest.spyOn(prisma.imposto, 'findUnique').mockResolvedValue(mockImposto as any);
      jest.spyOn(prisma.project, 'findMany').mockResolvedValue([mockProjeto] as any);
      jest.spyOn(financialService, 'calcularCustoTotalCompleto').mockResolvedValue({ custoTotal: 1000 } as any);
      jest.spyOn(projectsService, 'calcularMargens').mockResolvedValue({ margemLiquidaPercent: 20 } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: 1,
        processados: 1,
      } as any);

      const result = await service.recalcularPorAlteracaoImposto('imposto-1', 'user-1');

      expect(result.sucesso).toBe(true);
      expect(result.totalAfetados).toBe(1);
      expect(result.detalhes).toHaveLength(1);
      expect(result.detalhes[0].projetoId).toBe('projeto-1');
      expect(result.detalhes[0].custoTotal).toBe(1000);
      expect(result.detalhes[0].margemLiquidaPercent).toBe(20);
      expect(financialService.calcularCustoTotalCompleto).toHaveBeenCalledTimes(1);
      expect(projectsService.calcularMargens).toHaveBeenCalledTimes(1);
      expect(prisma.historicoRecalculo.create).toHaveBeenCalledWith({
        data: {
          tipo: TipoRecalculo.IMPOSTO,
          entidadeId: 'imposto-1',
          entidadeTipo: 'Imposto',
          usuarioId: 'user-1',
          status: StatusRecalculo.PROCESSANDO,
          dataInicio: expect.any(Date),
          detalhes: expect.anything(),
        },
      });
    });

    it('deve lançar NotFoundException se imposto não existe', async () => {
      jest.spyOn(prisma.imposto, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.FALHOU,
      } as any);

      await expect(
        service.recalcularPorAlteracaoImposto('imposto-invalido', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recalcularPorAlteracaoCalendario', () => {
    it('deve recalcular jornadas de colaboradores afetados por feriado nacional', async () => {
      jest.spyOn(prisma.calendario, 'findUnique').mockResolvedValue(mockCalendario as any);
      jest.spyOn(prisma.colaborador, 'findMany').mockResolvedValue([mockColaborador] as any);
      jest.spyOn(hrService, 'calcularCustoIndividual').mockResolvedValue({ fte: 1, custoTotal: 5000 } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: 1,
      } as any);

      const result = await service.recalcularPorAlteracaoCalendario('calendario-1', 'user-1');

      expect(result.sucesso).toBe(true);
      expect(result.totalAfetados).toBe(1);
      expect(result.detalhes[0].colaboradorId).toBe('colab-1');
      expect(result.detalhes[0].fte).toBe(1);
      expect(result.detalhes[0].custoTotal).toBe(5000);
    });

    it('deve recalcular apenas colaboradores do estado afetado', async () => {
      const calendarioEstadual = { ...mockCalendario, nacional: false, estado: 'SP' };
      jest.spyOn(prisma.calendario, 'findUnique').mockResolvedValue(calendarioEstadual as any);
      jest.spyOn(prisma.colaborador, 'findMany').mockResolvedValue([mockColaborador] as any);
      jest.spyOn(hrService, 'calcularCustoIndividual').mockResolvedValue({ fte: 1, custoTotal: 5000 } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
      } as any);

      const result = await service.recalcularPorAlteracaoCalendario('calendario-1', 'user-1');

      expect(result.sucesso).toBe(true);
      expect(prisma.colaborador.findMany).toHaveBeenCalledWith({
        where: {
          ativo: true,
          OR: [{ estado: 'SP' }, { estado: null }],
        },
        select: { id: true, matricula: true, nome: true, estado: true },
      });
    });

    it('deve lançar NotFoundException se calendário não existe', async () => {
      jest.spyOn(prisma.calendario, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.FALHOU,
      } as any);

      await expect(
        service.recalcularPorAlteracaoCalendario('calendario-invalido', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recalcularPorAlteracaoTaxa', () => {
    it('deve recalcular custos de projetos que alocam o colaborador', async () => {
      const mockJornadas = [
        {
          id: 'jornada-1',
          colaboradorId: 'colab-1',
          projectId: 'projeto-1',
        },
      ];

      jest.spyOn(prisma.colaborador, 'findUnique').mockResolvedValue(mockColaborador as any);
      jest.spyOn(prisma.jornada, 'findMany').mockResolvedValue(mockJornadas as any);
      jest.spyOn(prisma.project, 'findMany').mockResolvedValue([mockProjeto] as any);
      jest.spyOn(hrService, 'calcularCustoIndividual').mockResolvedValue({ fte: 1, custoTotal: 5000 } as any);
      jest.spyOn(financialService, 'calcularCustoTotalCompleto').mockResolvedValue({ custoTotal: 1000 } as any);
      jest.spyOn(projectsService, 'calcularMargens').mockResolvedValue({ margemLiquidaPercent: 20 } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: 2,
      } as any);

      const result = await service.recalcularPorAlteracaoTaxa('colab-1', 'user-1');

      expect(result.sucesso).toBe(true);
      expect(result.totalAfetados).toBe(2); // colaborador + 1 projeto
      expect(result.detalhes).toHaveLength(2);
      expect(result.detalhes[0].fte).toBe(1);
      expect(result.detalhes[0].custoTotal).toBe(5000);
      expect(result.detalhes[1].custoTotal).toBe(1000);
      expect(result.detalhes[1].margemLiquidaPercent).toBe(20);
    });

    it('deve lançar NotFoundException se colaborador não existe', async () => {
      jest.spyOn(prisma.colaborador, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.FALHOU,
      } as any);

      await expect(
        service.recalcularPorAlteracaoTaxa('colab-invalido', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('recalcularPorDissidio', () => {
    it('deve aplicar dissídio e atualizar taxas de colaboradores', async () => {
      jest.spyOn(prisma.sindicato, 'findUnique').mockResolvedValue(mockSindicato as any);
      jest.spyOn(prisma.jornada, 'findMany').mockResolvedValue([{ projectId: 'projeto-1' }] as any);
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValue(mockProjeto as any);
      jest.spyOn(hrService, 'calcularCustoIndividual').mockResolvedValue({ fte: 1, custoTotal: 5250 } as any);
      jest.spyOn(financialService, 'calcularCustoTotalCompleto').mockResolvedValue({ custoTotal: 1200 } as any);
      jest.spyOn(projectsService, 'calcularMargens').mockResolvedValue({ margemLiquidaPercent: 18 } as any);
      jest.spyOn(prisma.colaborador, 'update').mockResolvedValue({
        ...mockColaborador,
        taxaHora: new Decimal(52.5),
      } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
        totalAfetados: 1,
      } as any);

      const result = await service.recalcularPorDissidio('sindicato-1', 'user-1');

      expect(result.sucesso).toBe(true);
      expect(result.totalAfetados).toBe(2);
      expect(result.detalhes[0].taxaAntiga).toBe(50);
      expect(result.detalhes[0].taxaNova).toBe(52.5);
      expect(result.detalhes[0].percentualReajuste).toBe('5.00%');
      expect(result.detalhes[1].projetoId).toBe('projeto-1');
      expect(result.detalhes[1].custoTotal).toBe(1200);
      expect(result.detalhes[1].margemLiquidaPercent).toBe(18);
      expect(prisma.colaborador.update).toHaveBeenCalledWith({
        where: { id: 'colab-1' },
        data: { taxaHora: expect.any(Decimal) },
      });
    });

    it('deve lançar NotFoundException se sindicato não existe', async () => {
      jest.spyOn(prisma.sindicato, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.FALHOU,
      } as any);

      await expect(
        service.recalcularPorDissidio('sindicato-invalido', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('consultarHistorico', () => {
    it('deve retornar histórico com filtros aplicados', async () => {
      const mockHistoricos = [mockHistorico];
      jest.spyOn(prisma.historicoRecalculo, 'findMany').mockResolvedValue(mockHistoricos as any);
      jest.spyOn(prisma.historicoRecalculo, 'count').mockResolvedValue(1);

      const result = await service.consultarHistorico({
        tipo: TipoRecalculo.IMPOSTO,
        status: StatusRecalculo.CONCLUIDO,
        limit: 50,
        offset: 0,
      });

      expect(result.historicos).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pagina).toBe(1);
      expect(result.totalPaginas).toBe(1);
    });

    it('deve aplicar paginação corretamente', async () => {
      jest.spyOn(prisma.historicoRecalculo, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.historicoRecalculo, 'count').mockResolvedValue(150);

      const result = await service.consultarHistorico({
        limit: 25,
        offset: 25,
      });

      expect(result.pagina).toBe(2);
      expect(result.totalPaginas).toBe(6);
      expect(result.itensPorPagina).toBe(25);
    });
  });

  describe('detalheRecalculo', () => {
    it('deve retornar detalhes completos de um recálculo', async () => {
      const mockHistoricoCompleto = {
        ...mockHistorico,
        usuario: mockUser,
      };
      jest.spyOn(prisma.historicoRecalculo, 'findUnique').mockResolvedValue(mockHistoricoCompleto as any);

      const result = await service.detalheRecalculo('historico-1');

      expect(result.id).toBe('historico-1');
      expect(result.usuario).toBeDefined();
      expect(result.usuario.name).toBe('Test User');
    });

    it('deve lançar NotFoundException se histórico não existe', async () => {
      jest.spyOn(prisma.historicoRecalculo, 'findUnique').mockResolvedValue(null);

      await expect(service.detalheRecalculo('historico-invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fila assíncrona', () => {
    it('deve enfileirar e concluir recálculo de imposto com status CONCLUIDO', async () => {
      jest.spyOn(prisma.imposto, 'findUnique').mockResolvedValue(mockImposto as any);
      jest.spyOn(prisma.project, 'findMany').mockResolvedValue([mockProjeto] as any);
      jest.spyOn(financialService, 'calcularCustoTotalCompleto').mockResolvedValue({ custoTotal: 1000 } as any);
      jest.spyOn(projectsService, 'calcularMargens').mockResolvedValue({ margemLiquidaPercent: 20 } as any);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.CONCLUIDO,
      } as any);

      const enfileirado = service.enfileirarRecalculoImposto('imposto-1', 'user-1');
      expect(enfileirado.status).toBe(StatusRecalculo.INICIADO);

      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));

      const status = service.consultarStatusFila(enfileirado.jobId);
      expect(status.status).toBe(StatusRecalculo.CONCLUIDO);
      expect(status.result?.sucesso).toBe(true);
    });

    it('deve marcar job como FALHOU quando recálculo lançar erro', async () => {
      jest.spyOn(prisma.imposto, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.historicoRecalculo, 'create').mockResolvedValue(mockHistorico as any);
      jest.spyOn(prisma.historicoRecalculo, 'update').mockResolvedValue({
        ...mockHistorico,
        status: StatusRecalculo.FALHOU,
      } as any);

      const enfileirado = service.enfileirarRecalculoImposto('imposto-invalido', 'user-1');

      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));

      const status = service.consultarStatusFila(enfileirado.jobId);
      expect(status.status).toBe(StatusRecalculo.FALHOU);
      expect(status.erro).toContain('não encontrado');
    });
  });
});
