import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FeriadoType } from './dto/calendario.dto';

const mockCalendario = {
  id: 'cal-1',
  data: new Date('2026-01-01'),
  tipoFeriado: FeriadoType.NACIONAL,
  descricao: 'Confraternização Universal',
  cidade: null,
  estado: null,
  nacional: true,
  diaSemana: 4,
  createdAt: new Date(),
};

const mockSindicato = {
  id: 'sind-1',
  nome: 'SINTICOT',
  regiao: 'SP',
  percentualDissidio: 5.0,
  dataDissidio: null,
  regimeTributario: 'CPRB',
  descricao: null,
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  colaboradores: [],
};

const mockIndice = {
  id: 'idx-1',
  tipo: 'IPCA',
  valor: 4.83,
  mesReferencia: 1,
  anoReferencia: 2026,
  createdAt: new Date(),
};

const mockPrisma = {
  calendario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sindicato: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  indiceFinanceiro: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    jest.clearAllMocks();
  });

  // =============================================================
  // CALENDÁRIO
  // =============================================================

  describe('createCalendario', () => {
    it('deve criar um feriado nacional', async () => {
      mockPrisma.calendario.create.mockResolvedValue(mockCalendario);

      const result = await service.createCalendario({
        data: '2026-01-01',
        tipoFeriado: FeriadoType.NACIONAL,
        descricao: 'Confraternização Universal',
        nacional: true,
      });

      expect(mockPrisma.calendario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nacional: true }),
        }),
      );
      expect(result.id).toBe('cal-1');
    });

    it('deve calcular o diaSemana automaticamente', async () => {
      mockPrisma.calendario.create.mockResolvedValue(mockCalendario);

      await service.createCalendario({
        data: '2026-01-01', // quinta-feira = 4
        tipoFeriado: FeriadoType.NACIONAL,
        descricao: 'Ano Novo',
      });

      const callArgs = mockPrisma.calendario.create.mock.calls[0][0];
      expect(callArgs.data.diaSemana).toBeDefined();
    });
  });

  describe('findCalendarios', () => {
    it('deve listar feriados com filtros', async () => {
      mockPrisma.calendario.findMany.mockResolvedValue([mockCalendario]);
      const result = await service.findCalendarios({ ano: 2026, tipoFeriado: FeriadoType.NACIONAL });
      expect(result).toHaveLength(1);
      expect(mockPrisma.calendario.findMany).toHaveBeenCalled();
    });
  });

  describe('findCalendarioById', () => {
    it('deve lançar NotFoundException para id inexistente', async () => {
      mockPrisma.calendario.findUnique.mockResolvedValue(null);
      await expect(service.findCalendarioById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calcularHorasPrevistas', () => {
    it('deve calcular horas previstas descontando feriados', async () => {
      // Janeiro 2026: 22 dias úteis - 1 feriado nacional (01/jan) = 21 dias úteis
      mockPrisma.calendario.findMany.mockResolvedValue([mockCalendario]);

      const result = await service.calcularHorasPrevistas('SP', 1, 2026);

      expect(result).toMatchObject({
        estado: 'SP',
        mes: 1,
        ano: 2026,
      });
      expect(result.diasUteis).toBeGreaterThan(0);
      expect(result.horasPrevistas).toBe(result.diasUteis * 8);
      expect(result.feriados).toBe(1);
    });
  });

  // =============================================================
  // SINDICATOS
  // =============================================================

  describe('createSindicato', () => {
    it('deve criar um sindicato', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(null); // sem conflito
      mockPrisma.sindicato.create.mockResolvedValue(mockSindicato);

      const result = await service.createSindicato({
        nome: 'SINTICOT',
        regiao: 'SP',
        percentualDissidio: 5.0,
        regimeTributario: 'CPRB',
      });

      expect(result.id).toBe('sind-1');
      expect(result.nome).toBe('SINTICOT');
    });

    it('deve lançar ConflictException para nome duplicado', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);
      await expect(
        service.createSindicato({ nome: 'SINTICOT', regiao: 'SP', percentualDissidio: 5.0, regimeTributario: 'CPRB' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateSindicato', () => {
    it('deve atualizar dados do sindicato', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue({ ...mockSindicato, colaboradores: [] });
      const atualizado = { ...mockSindicato, percentualDissidio: 6.0 };
      mockPrisma.sindicato.update.mockResolvedValue(atualizado);

      const result = await service.updateSindicato('sind-1', { percentualDissidio: 6.0 });
      expect(result.percentualDissidio).toBe(6.0);
    });
  });

  describe('simularCustoTrabalhista', () => {
    it('deve calcular custo trabalhista com dissídio', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);

      const result = await service.simularCustoTrabalhista({
        sindicatoId: 'sind-1',
        salarioBase: 5000,
        mes: 1,
        ano: 2026,
      });

      expect(result.salarioBase).toBe(5000);
      expect(result.percentualDissidio).toBe(5.0);
      expect(result.salarioComDissidio).toBeCloseTo(5250, 0);
      expect(result.custoTotal).toBeGreaterThan(result.salarioBruto);
    });

    it('deve incluir horas extras no cálculo', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);

      const result = await service.simularCustoTrabalhista({
        sindicatoId: 'sind-1',
        salarioBase: 5000,
        mes: 1,
        ano: 2026,
        horasExtras: 10,
      });

      expect(result.horasExtrasValor).toBeGreaterThan(0);
    });

    it('deve lançar NotFoundException para sindicato inexistente', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(null);
      await expect(
        service.simularCustoTrabalhista({ sindicatoId: 'invalid', salarioBase: 5000, mes: 1, ano: 2026 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =============================================================
  // ÍNDICES FINANCEIROS
  // =============================================================

  describe('createIndice', () => {
    it('deve criar ou atualizar um índice financeiro', async () => {
      mockPrisma.indiceFinanceiro.upsert.mockResolvedValue(mockIndice);

      const result = await service.createIndice('IPCA', 4.83, 1, 2026);
      expect(result.tipo).toBe('IPCA');
      expect(mockPrisma.indiceFinanceiro.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo_mesReferencia_anoReferencia: { tipo: 'IPCA', mesReferencia: 1, anoReferencia: 2026 } },
        }),
      );
    });
  });

  describe('findIndices', () => {
    it('deve listar índices filtrados por tipo e ano', async () => {
      mockPrisma.indiceFinanceiro.findMany.mockResolvedValue([mockIndice]);
      const result = await service.findIndices('IPCA', 2026);
      expect(result).toHaveLength(1);
    });
  });
});
