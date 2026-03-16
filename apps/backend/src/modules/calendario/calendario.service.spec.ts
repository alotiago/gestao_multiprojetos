import { Test, TestingModule } from '@nestjs/testing';
import { CalendarioService } from './calendario.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

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
  let service: CalendarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarioService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CalendarioService>(CalendarioService);
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
        nome: 'Confraternização Universal',
        tipoFeriado: 'NACIONAL' as any,
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
        nome: 'Revolução Constitucionalista',
        tipoFeriado: 'ESTADUAL' as any,
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
      await expect(service.findById('nao-existe')).rejects.toThrow(NotFoundException);
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
            nome: 'Natal',
            tipoFeriado: 'NACIONAL' as any,
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
            nome: 'Natal',
            tipoFeriado: 'NACIONAL' as any,
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
          { data: '', nome: '', tipoFeriado: '' as any, descricao: '', diaSemana: 0 },
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

  describe('Novos campos Sprint 6', () => {
    it('deve criar feriado com campo nome obrigatório', async () => {
      const mockFeriado = {
        id: 'fer-nome',
        data: new Date('2026-06-11'),
        nome: 'Corpus Christi',
        descricao: 'Corpus Christi',
        ehFeriado: true,
      };
      mockPrisma.calendario.create.mockResolvedValue(mockFeriado);

      const result = await service.create({
        data: '2026-06-11',
        nome: 'Corpus Christi',
        tipoFeriado: 'NACIONAL' as any,
        descricao: 'Corpus Christi',
        diaSemana: 4,
      });

      expect(result.nome).toBe('Corpus Christi');
      expect(mockPrisma.calendario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nome: 'Corpus Christi' }),
        }),
      );
    });

    it('deve criar feriado com ehFeriado = false (ponto facultativo)', async () => {
      const mockPonto = {
        id: 'fer-facultativo',
        nome: 'Quarta de Cinzas',
        ehFeriado: false,
        ehRecuperavel: true,
      };
      mockPrisma.calendario.create.mockResolvedValue(mockPonto);

      const result = await service.create({
        data: '2026-02-18',
        nome: 'Quarta de Cinzas',
        tipoFeriado: 'NACIONAL' as any,
        descricao: 'Quarta de Cinzas (ponto facultativo)',
        diaSemana: 3,
        ehFeriado: false,
        ehRecuperavel: true,
      });

      expect(result.ehFeriado).toBe(false);
      expect(result.ehRecuperavel).toBe(true);
    });

    it('deve criar feriado com percentualDesc customizado (50%)', async () => {
      const mockFeriado = {
        id: 'fer-parcial',
        nome: 'Black Friday',
        percentualDesc: 50,
      };
      mockPrisma.calendario.create.mockResolvedValue(mockFeriado);

      const result = await service.create({
        data: '2026-11-27',
        nome: 'Black Friday',
        tipoFeriado: 'MUNICIPAL' as any,
        descricao: 'Black Friday - expediente até meio-dia',
        diaSemana: 5,
        percentualDesc: 50,
      });

      expect(result.percentualDesc).toBe(50);
      expect(mockPrisma.calendario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ percentualDesc: 50 }),
        }),
      );
    });

    it('deve aplicar valores default para campos opcionais', async () => {
      mockPrisma.calendario.create.mockResolvedValue({
        id: 'fer-defaults',
        ehFeriado: true,
        ehRecuperavel: false,
        percentualDesc: 100,
      });

      await service.create({
        data: '2026-05-01',
        nome: 'Dia do Trabalho',
        tipoFeriado: 'NACIONAL' as any,
        descricao: 'Dia Mundial do Trabalho',
        diaSemana: 5,
      });

      expect(mockPrisma.calendario.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ehFeriado: true,
            ehRecuperavel: false,
            percentualDesc: 100,
          }),
        }),
      );
    });

    it('deve atualizar feriado com novos campos', async () => {
      mockPrisma.calendario.findUnique.mockResolvedValue({
        id: 'fer-upd',
        nome: 'Feriado Local',
      });
      mockPrisma.calendario.update.mockResolvedValue({
        id: 'fer-upd',
        nome: 'Feriado Local Atualizado',
        ehRecuperavel: true,
      });

      await service.update('fer-upd', {
        nome: 'Feriado Local Atualizado',
        ehRecuperavel: true,
        observacoes: 'Atualizado com recuperação obrigatória',
      });

      expect(mockPrisma.calendario.update).toHaveBeenCalledWith({
        where: { id: 'fer-upd' },
        data: {
          nome: 'Feriado Local Atualizado',
          ehRecuperavel: true,
          observacoes: 'Atualizado com recuperação obrigatória',
        },
      });
    });
  });
});
