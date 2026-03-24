import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RegimeTributario, TipoImposto } from './dto/imposto.dto';
import { TipoDespesa, NaturezaCusto } from './dto/despesa.dto';
import { TipoProvisao } from './dto/provisao.dto';

const mockPrisma = {
  project: { findUnique: jest.fn() },
  despesa: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  receitaMensal: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  linhaContratual: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  contrato: {
    update: jest.fn(),
  },
  aliquotaRegime: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  imposto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
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
  dataFim: new Date('2026-12-31T00:00:00.000Z'),
  contrato: {
    id: 'ctr-001',
    dataFim: new Date('2026-12-31T00:00:00.000Z'),
  },
};

const mockDespesa = {
  id: 'desp-001',
  projectId: 'proj-001',
  tipo: TipoDespesa.FACILITIES,
  naturezaCusto: 'VARIAVEL',
  descricao: 'Aluguel escritório',
  valor: 5000,
  mes: 1,
  ano: 2026,
};

const mockImposto = {
  id: 'imp-001',
  projectId: 'proj-001',
  tipo: TipoImposto.ISS,
  aliquota: 0.05,
  valor: 2500,
  mes: 1,
  ano: 2026,
};

describe('FinancialService', () => {
  let service: FinancialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    jest.clearAllMocks();
    mockPrisma.aliquotaRegime.findMany.mockResolvedValue([]);
    mockPrisma.$transaction.mockImplementation(async (input: any) => {
      if (typeof input === 'function') {
        return input(mockPrisma);
      }

      return Promise.all(input);
    });
  });

  // ===================== DESPESAS =====================

  describe('createDespesa', () => {
    it('deve criar despesa com sucesso', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.despesa.create.mockResolvedValue(mockDespesa);

      const result = await service.createDespesa({
        projectId: 'proj-001',
        tipo: TipoDespesa.FACILITIES,
        descricao: 'Aluguel escritório',
        valor: 5000,
        mes: 1,
        ano: 2026,
      });

      expect(result.tipo).toBe(TipoDespesa.FACILITIES);
      expect(result.valor).toBe(5000);
    });

    it('deve lançar NotFoundException para projeto inexistente', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.createDespesa({
          projectId: 'nao-existe',
          tipo: TipoDespesa.FACILITIES,
          descricao: 'Teste',
          valor: 100,
          mes: 1,
          ano: 2026,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve bloquear despesa além da vigência contratual', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(
        service.createDespesa({
          projectId: 'proj-001',
          tipo: TipoDespesa.FACILITIES,
          descricao: 'Despesa fora da vigência',
          valor: 100,
          mes: 1,
          ano: 2027,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve replicar despesa para os meses seguintes com virada de ano', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.despesa.create
        .mockResolvedValueOnce({ ...mockDespesa, id: 'desp-011', mes: 11, ano: 2026 })
        .mockResolvedValueOnce({ ...mockDespesa, id: 'desp-012', mes: 12, ano: 2026 });

      const result = await service.createDespesa({
        projectId: 'proj-001',
        tipo: TipoDespesa.FACILITIES,
        descricao: 'Licença recorrente',
        valor: 5000,
        mes: 11,
        ano: 2026,
        mesesAdicionais: 1,
      });

      expect(result.totalCriados).toBe(2);
      expect(result.competenciaInicial).toBe('11/2026');
      expect(result.competenciaFinal).toBe('12/2026');
      expect(result.items).toHaveLength(2);
    });

    it('deve replicar despesa fixa até o fim da vigência do contrato', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.despesa.create
        .mockResolvedValueOnce({ ...mockDespesa, id: 'desp-011', mes: 11, ano: 2026, naturezaCusto: 'FIXO' })
        .mockResolvedValueOnce({ ...mockDespesa, id: 'desp-012', mes: 12, ano: 2026, naturezaCusto: 'FIXO' });

      const result = await service.createDespesa({
        projectId: 'proj-001',
        tipo: TipoDespesa.FACILITIES,
        naturezaCusto: NaturezaCusto.FIXO,
        replicarAteFimContrato: true,
        descricao: 'Custo fixo mensal',
        valor: 5000,
        mes: 11,
        ano: 2026,
      });

      expect(result.totalCriados).toBe(2);
      expect(result.competenciaFinal).toBe('12/2026');
    });
  });

  describe('createReceita', () => {
    it('deve replicar receita manual para os meses seguintes', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.receitaMensal.findFirst.mockResolvedValue(null);
      mockPrisma.receitaMensal.create
        .mockResolvedValueOnce({ id: 'rec-001', mes: 11, ano: 2026, valorPrevisto: 1500, valorRealizado: 1000 })
        .mockResolvedValueOnce({ id: 'rec-002', mes: 12, ano: 2026, valorPrevisto: 1500, valorRealizado: 1000 });

      const result = await service.createReceita({
        projectId: 'proj-001',
        tipoReceita: 'Serviços',
        descricao: 'Receita recorrente',
        valorPrevisto: 1500,
        valorRealizado: 1000,
        justificativa: 'Recebimento parcial no período',
        mes: 11,
        ano: 2026,
        mesesAdicionais: 1,
      });

      expect('totalCriados' in result && result.totalCriados).toBe(2);
      expect('competenciaFinal' in result && result.competenciaFinal).toBe('12/2026');
      expect('items' in result && result.items).toHaveLength(2);
    });

    it('deve bloquear replicação quando já existir receita em um dos meses', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.receitaMensal.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'rec-existente', mes: 12, ano: 2026 });

      await expect(
        service.createReceita({
          projectId: 'proj-001',
          tipoReceita: 'Serviços',
          descricao: 'Receita recorrente',
          valorPrevisto: 1500,
          valorRealizado: 1000,
          justificativa: 'Parcial de faturamento no mês',
          mes: 11,
          ano: 2026,
          mesesAdicionais: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve exigir justificativa quando valor realizado divergir do planejado', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      await expect(
        service.createReceita({
          projectId: 'proj-001',
          tipoReceita: 'Serviços',
          descricao: 'Receita sem justificativa',
          valorPrevisto: 2000,
          valorRealizado: 1500,
          mes: 10,
          ano: 2026,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateDespesa', () => {
    it('deve atualizar despesa', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.despesa.findUnique.mockResolvedValue(mockDespesa);
      mockPrisma.despesa.update.mockResolvedValue({ ...mockDespesa, valor: 6000 });

      const result = await service.updateDespesa('desp-001', { valor: 6000 });
      expect(result.valor).toBe(6000);
    });

    it('deve lançar NotFoundException se despesa não existe', async () => {
      mockPrisma.despesa.findUnique.mockResolvedValue(null);
      await expect(service.updateDespesa('nao-existe', { valor: 100 })).rejects.toThrow(NotFoundException);
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
        regime: RegimeTributario.LUCRO_PRESUMIDO,
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
        regime: RegimeTributario.LUCRO_REAL,
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
        regime: RegimeTributario.LUCRO_PRESUMIDO,
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
        regime: RegimeTributario.CPRB,
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

      await expect(
        service.createIndice({
          tipo: 'IPCA',
          valor: 0.04,
          mesReferencia: 1,
          anoReferencia: 2026,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===================== CUSTO TOTAL =====================

  describe('calcularCustoTotal', () => {
    it('deve calcular custo total por mês', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.$transaction.mockResolvedValue([
        [{ valor: 5000 }, { valor: 3000 }], // despesas
        [{ valor: 2500 }],                   // impostos
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
        [{ valor: 500 }],  // impostos
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
        tipo: TipoProvisao.DECIMO_TERCEIRO,
        valor: 15000,
        mes: 1,
        ano: 2026,
      });

      const result = await service.createProvisao({
        projectId: 'proj-001',
        tipo: TipoProvisao.DECIMO_TERCEIRO,
        valor: 15000,
        mes: 1,
        ano: 2026,
      });

      expect(result.tipo).toBe(TipoProvisao.DECIMO_TERCEIRO);
      expect(result.valor).toBe(15000);
    });

    it('deve lançar ConflictException se provisão já existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.provisao.findUnique.mockResolvedValue({ id: 'prov-exist' });

      await expect(
        service.createProvisao({
          projectId: 'proj-001',
          tipo: TipoProvisao.DECIMO_TERCEIRO,
          valor: 15000,
          mes: 1,
          ano: 2026,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar NotFoundException para projeto inexistente', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.createProvisao({
          projectId: 'nao-existe',
          tipo: TipoProvisao.FERIAS,
          valor: 5000,
          mes: 1,
          ano: 2026,
        }),
      ).rejects.toThrow(NotFoundException);
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
      mockPrisma.despesa.create.mockResolvedValue({ id: 'desp-new', tipo: TipoDespesa.FACILITIES });
      mockPrisma.historicoCalculo.create.mockResolvedValue({});

      const result = await service.importarDespesasEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoDespesa.FACILITIES,
            descricao: 'Aluguel',
            valor: 5000,
            mes: 1,
            ano: 2026,
          },
          {
            projectId: 'proj-001',
            tipo: TipoDespesa.FORNECEDOR,
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
            tipo: TipoDespesa.FACILITIES,
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
            tipo: TipoDespesa.FACILITIES,
            descricao: '',
            valor: 0,
            mes: 1,
            ano: 2026,
          } as any,
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
        tipo: TipoProvisao.DECIMO_TERCEIRO,
        createdAt: now,
        updatedAt: now,
      });
      mockPrisma.historicoCalculo.create.mockResolvedValue({});

      const result = await service.importarProvisoesEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoProvisao.DECIMO_TERCEIRO,
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
            tipo: TipoProvisao.FERIAS,
            valor: 5000,
            mes: 1,
            ano: 2026,
          },
        ],
      });

      expect(result.erros).toBe(1);
    });
  });

  // ===================== BULK UPDATE IMPOSTOS =====================

  describe('atualizarImpostosEmLote', () => {
    it('deve atualizar múltiplos impostos com sucesso', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.imposto.findFirst.mockResolvedValue(mockImposto);
      mockPrisma.imposto.update.mockResolvedValue({
        ...mockImposto,
        aliquota: 0.08,
      });
      mockPrisma.historicoCalculo.create.mockResolvedValue({});

      const result = await service.atualizarImpostosEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoImposto.ISS,
            aliquota: 8,
            mes: 1,
            ano: 2026,
          },
        ],
        motivo: 'Ajuste de alíquota ISS',
      }, 'user-001');

      expect(result.totalProcessado).toBe(1);
      expect(result.sucessos).toBe(1);
      expect(result.erros).toBe(0);
    });

    it('deve validar alíquota entre 0-100%', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.atualizarImpostosEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoImposto.ISS,
            aliquota: 150,
            mes: 1,
            ano: 2026,
          },
        ],
      });

      expect(result.erros).toBe(1);
      expect(result.detalhes[0].mensagem).toContain('fora do intervalo');
    });

    it('deve criar novo imposto se não existir', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      mockPrisma.imposto.findFirst.mockResolvedValue(null);
      mockPrisma.imposto.create.mockResolvedValue({
        id: 'imp-novo',
        projectId: 'proj-001',
        tipo: TipoImposto.IRPJ,
        aliquota: 0.15,
        valor: 0.15,
        mes: 1,
        ano: 2026,
      });
      mockPrisma.historicoCalculo.create.mockResolvedValue({});

      const result = await service.atualizarImpostosEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoImposto.IRPJ,
            aliquota: 15,
            mes: 1,
            ano: 2026,
          },
        ],
      }, 'user-001');

      expect(result.avisos).toBe(1);
      expect(result.detalhes[0].mensagem).toContain('criado');
    });

    it('deve reportar erro para alíquota inválida (vazia)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await service.atualizarImpostosEmLote({
        items: [
          {
            projectId: 'proj-001',
            tipo: TipoImposto.ISS,
            aliquota: null as any,
            mes: 1,
            ano: 2026,
          },
        ],
      });

      expect(result.erros).toBe(1);
      expect(result.detalhes[0].mensagem).toContain('obrigatórios');
    });

    it('deve reportar erro para projeto inexistente', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const result = await service.atualizarImpostosEmLote({
        items: [
          {
            projectId: 'nao-existe',
            tipo: TipoImposto.ISS,
            aliquota: 5,
            mes: 1,
            ano: 2026,
          },
        ],
      });

      expect(result.erros).toBe(1);
      expect(result.detalhes[0].mensagem).toContain('não encontrado');
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
        [{ valor: 5000 }],                          // despesas
        [{ valor: 2500 }],                          // impostos
        [{ custoFixo: 10000, custoVariavel: 8000 }], // pessoal
        [{ valor: 3000, tipo: '13_salario' }],       // provisões
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
