import { Test, TestingModule } from '@nestjs/testing';
import { SindicatoService } from './sindicato.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockPrisma = {
  sindicato: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  colaborador: {
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

const mockSindicato = {
  id: 'sind-001',
  nome: 'Sindicato TI SP',
  regiao: 'SP',
  percentualDissidio: 0.05,
  dataDissidio: new Date('2026-01-01'),
  regimeTributario: 'LUCRO_PRESUMIDO',
  ativo: true,
  colaboradores: [],
};

describe('SindicatoService', () => {
  let service: SindicatoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SindicatoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SindicatoService>(SindicatoService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar sindicato com sucesso', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(null);
      mockPrisma.sindicato.create.mockResolvedValue(mockSindicato);

      const result = await service.create({
        nome: 'Sindicato TI SP',
        regiao: 'SP',
        percentualDissidio: 0.05,
        regimeTributario: 'LUCRO_PRESUMIDO',
      });

      expect(result.nome).toBe('Sindicato TI SP');
      expect(result.regiao).toBe('SP');
    });

    it('deve lançar ConflictException se sindicato já existe', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValueOnce({ id: 'sind-exist' });

      await expect(
        service.create({
          nome: 'Sindicato TI SP',
          regiao: 'SP',
          regimeTributario: 'LUCRO_PRESUMIDO',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('deve retornar sindicato com colaboradores', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue({
        ...mockSindicato,
        colaboradores: [
          { id: 'col-001', matricula: 'M001', nome: 'João', cargo: 'Dev', taxaHora: 100 },
        ],
      });

      const result = await service.findById('sind-001');
      expect(result.nome).toBe('Sindicato TI SP');
      expect(result.colaboradores).toHaveLength(1);
    });

    it('deve lançar NotFoundException', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(null);
      await expect(service.findById('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deve impedir exclusão com colaboradores ativos', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);
      mockPrisma.colaborador.count.mockResolvedValue(5);

      await expect(service.delete('sind-001')).rejects.toThrow(ConflictException);
    });

    it('deve permitir exclusão sem colaboradores', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);
      mockPrisma.colaborador.count.mockResolvedValue(0);
      mockPrisma.sindicato.delete.mockResolvedValue(mockSindicato);

      const result = await service.delete('sind-001');
      expect(result.id).toBe('sind-001');
    });
  });

  describe('aplicarDissidio', () => {
    it('deve aplicar dissídio em todos os colaboradores', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);
      mockPrisma.colaborador.findMany.mockResolvedValue([
        { id: 'col-001', matricula: 'M001', nome: 'João', taxaHora: 100 },
        { id: 'col-002', matricula: 'M002', nome: 'Maria', taxaHora: 120 },
      ]);
      mockPrisma.colaborador.update.mockResolvedValue({});
      mockPrisma.sindicato.update.mockResolvedValue({});

      const result = await service.aplicarDissidio({
        sindicatoId: 'sind-001',
        percentualReajuste: 0.08,
      });

      expect(result.totalColaboradores).toBe(2);
      expect(result.percentualReajuste).toBe(0.08);
      expect(result.detalhes).toHaveLength(2);
      expect(result.detalhes[0].taxaNova).toBe(108); // 100 * 1.08
      expect(result.detalhes[1].taxaNova).toBe(129.6); // 120 * 1.08
    });

    it('deve retornar mensagem se nenhum colaborador', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);
      mockPrisma.colaborador.findMany.mockResolvedValue([]);

      const result = await service.aplicarDissidio({
        sindicatoId: 'sind-001',
        percentualReajuste: 0.05,
      });

      expect(result.totalColaboradores).toBe(0);
      expect(result.mensagem).toContain('Nenhum colaborador');
    });
  });

  describe('simularImpactoFinanceiro', () => {
    it('deve calcular simulação trabalhista completa', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue(mockSindicato);

      const result = await service.simularImpactoFinanceiro({
        sindicatoId: 'sind-001',
        salarioBase: 5000,
      });

      expect(result.sindicato.nome).toBe('Sindicato TI SP');
      expect(result.simulacao.salarioBase).toBe(5000);
      expect(result.simulacao.salarioComDissidio).toBe(5250); // 5000 * 1.05
      expect(result.simulacao.encargos.length).toBeGreaterThan(0);
      expect(result.simulacao.totalEncargos).toBeGreaterThan(0);
      expect(result.simulacao.custoTotalMensal).toBeGreaterThan(5250);
      expect(result.simulacao.custoAnual).toBe(result.simulacao.custoTotalMensal * 12);
      expect(result.simulacao.custoHora).toBeGreaterThan(0);
      expect(result.simulacao.percentualEncargos).toBeGreaterThan(0);
    });

    it('deve calcular sem dissídio quando percentual é zero', async () => {
      mockPrisma.sindicato.findUnique.mockResolvedValue({
        ...mockSindicato,
        percentualDissidio: 0,
      });

      const result = await service.simularImpactoFinanceiro({
        sindicatoId: 'sind-001',
        salarioBase: 5000,
        cargaHorariaMensal: 176,
      });

      expect(result.simulacao.salarioComDissidio).toBe(5000);
    });
  });

  describe('relatorioPorRegiao', () => {
    it('deve gerar relatório agrupado por região', async () => {
      mockPrisma.sindicato.findMany.mockResolvedValue([
        { ...mockSindicato, regiao: 'SP', _count: { colaboradores: 10 } },
        {
          ...mockSindicato,
          id: 'sind-002',
          nome: 'Sindicato RJ',
          regiao: 'RJ',
          percentualDissidio: 0.06,
          _count: { colaboradores: 5 },
        },
      ]);

      const result = await service.relatorioPorRegiao();

      expect(result.totalSindicatos).toBe(2);
      expect(result.regioes['SP']).toBeDefined();
      expect(result.regioes['SP'].colaboradores).toBe(10);
      expect(result.regioes['RJ']).toBeDefined();
      expect(result.regioes['RJ'].colaboradores).toBe(5);
    });
  });
});
