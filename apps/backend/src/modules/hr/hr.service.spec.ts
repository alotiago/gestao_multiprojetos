import { Test, TestingModule } from '@nestjs/testing';
import { HrService } from './hr.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

const mockPrisma = {
  colaborador: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  sindicato: {
    findUnique: jest.fn(),
  },
  jornada: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  ferias: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  desligamento: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockColaborador = {
  id: 'col-001',
  matricula: 'MAT001',
  nome: 'João Silva',
  email: 'joao@empresa.com',
  cargo: 'Analista',
  classe: 'Pleno',
  taxaHora: 50,
  cargaHoraria: 176,
  cidade: 'Brasília',
  estado: 'DF',
  sindicatoId: null,
  status: UserStatus.ATIVO,
  dataAdmissao: new Date('2023-01-01'),
  dataDesligamento: null,
  ativo: true,
  desligamento: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('HrService', () => {
  let service: HrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
    jest.clearAllMocks();
  });

  // ===================== UNIT: findAll =====================

  describe('findAll', () => {
    it('deve retornar lista paginada de colaboradores', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockColaborador], 1]);

      const result = await service.findAll({ page: 1, limit: 20, orderBy: 'nome', order: 'asc' });

      expect(result.data).toEqual([mockColaborador]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('deve filtrar por status', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll({ status: UserStatus.DESLIGADO });

      const callArgs = mockPrisma.$transaction.mock.calls[0][0];
      expect(callArgs).toBeDefined();
    });
  });

  // ===================== UNIT: findById =====================

  describe('findById', () => {
    it('deve retornar colaborador pelo id', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);

      const result = await service.findById('col-001');
      expect(result).toEqual(mockColaborador);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(null);

      await expect(service.findById('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ===================== UNIT: create =====================

  describe('create', () => {
    const dto = {
      matricula: 'MAT002',
      nome: 'Maria Oliveira',
      cargo: 'Desenvolvedora',
      taxaHora: 80,
      cargaHoraria: 176,
      cidade: 'São Paulo',
      estado: 'SP',
      dataAdmissao: '2024-01-01',
    };

    it('deve criar colaborador com sucesso', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(null);
      mockPrisma.colaborador.create.mockResolvedValue({ ...mockColaborador, ...dto });

      const result = await service.create(dto);
      expect(result.matricula).toBe('MAT002');
    });

    it('deve lançar ConflictException se matrícula já existe', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('deve lançar NotFoundException se sindicato não existe', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(null);
      mockPrisma.sindicato.findUnique.mockResolvedValue(null);

      const dtoComSindicato = { ...dto, sindicatoId: 'sind-999' };
      await expect(service.create(dtoComSindicato)).rejects.toThrow(NotFoundException);
    });
  });

  // ===================== UNIT: update =====================

  describe('update', () => {
    it('deve atualizar colaborador com sucesso', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.colaborador.update.mockResolvedValue({ ...mockColaborador, cargo: 'Sênior' });

      const result = await service.update('col-001', { cargo: 'Sênior' });
      expect(result.cargo).toBe('Sênior');
    });

    it('deve lançar NotFoundException para colaborador inexistente', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(null);

      await expect(service.update('nao-existe', { cargo: 'Sênior' })).rejects.toThrow(NotFoundException);
    });
  });

  // ===================== UNIT: delete =====================

  describe('delete', () => {
    it('deve desativar colaborador (soft delete)', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.colaborador.update.mockResolvedValue({
        ...mockColaborador,
        ativo: false,
        status: UserStatus.INATIVO,
      });

      const result = await service.delete('col-001');
      expect(result.ativo).toBe(false);
      expect(result.status).toBe(UserStatus.INATIVO);
    });
  });

  // ===================== UNIT: importarCSV =====================

  describe('importarCSV', () => {
    it('deve lançar BadRequestException para CSV vazio', async () => {
      await expect(service.importarCSV('')).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException para CSV sem campos obrigatórios', async () => {
      const csv = 'nome;cargo\nJoão;Dev';
      await expect(service.importarCSV(csv)).rejects.toThrow(BadRequestException);
    });

    it('deve importar CSV válido', async () => {
      const csv =
        'matricula;nome;cargo;taxahora;cargahoraria;cidade;estado;dataadmissao\n' +
        'MAT003;Pedro Costa;Analista;60;176;Rio de Janeiro;RJ;2024-01-01';

      mockPrisma.colaborador.findUnique.mockResolvedValue(null);
      mockPrisma.colaborador.create.mockResolvedValue(mockColaborador);

      const result = await service.importarCSV(csv);
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('deve registrar erro para matrícula duplicada no CSV', async () => {
      const csv =
        'matricula;nome;cargo;taxahora;cargahoraria;cidade;estado;dataadmissao\n' +
        'MAT001;João;Dev;50;176;Brasília;DF;2024-01-01';

      mockPrisma.colaborador.findUnique.mockResolvedValue(mockColaborador);

      const result = await service.importarCSV(csv);
      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ===================== UNIT: jornadas =====================

  describe('createJornada', () => {
    it('deve criar jornada com FTE calculado', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.jornada.findUnique.mockResolvedValue(null);
      mockPrisma.jornada.create.mockResolvedValue({
        id: 'jorn-001',
        colaboradorId: 'col-001',
        mes: 1,
        ano: 2026,
        horasPrevistas: 176,
        horasRealizadas: 160,
        fte: 0.91,
      });

      const result = await service.createJornada('col-001', {
        mes: 1,
        ano: 2026,
        horasPrevistas: 176,
        horasRealizadas: 160,
      });

      expect(result.mes).toBe(1);
    });

    it('deve lançar ConflictException para jornada duplicada', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.jornada.findUnique.mockResolvedValue({ id: 'jorn-001' });

      await expect(
        service.createJornada('col-001', { mes: 1, ano: 2026, horasPrevistas: 176 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===================== UNIT: férias =====================

  describe('createFerias', () => {
    it('deve criar férias com dias calculados', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.ferias.create.mockResolvedValue({
        id: 'fer-001',
        colaboradorId: 'col-001',
        dataInicio: new Date('2026-07-01'),
        dataFim: new Date('2026-07-30'),
        dias: 29,
        aprovado: false,
      });

      const result = await service.createFerias('col-001', {
        dataInicio: '2026-07-01',
        dataFim: '2026-07-30',
      });

      expect(result.dias).toBe(29);
    });

    it('deve lançar BadRequestException se data fim < data início', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);

      await expect(
        service.createFerias('col-001', {
          dataInicio: '2026-07-30',
          dataFim: '2026-07-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===================== UNIT: desligamento =====================

  describe('createDesligamento', () => {
    it('deve registrar desligamento e atualizar status', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.$transaction.mockImplementation((fn: any) =>
        fn({
          desligamento: { create: jest.fn().mockResolvedValue({ id: 'desl-001' }) },
          colaborador: { update: jest.fn().mockResolvedValue({}) },
        }),
      );

      const result = await service.createDesligamento('col-001', {
        dataDesligamento: '2026-06-30',
        motivo: 'Pedido de demissão',
      });

      expect(result).toBeDefined();
    });

    it('deve lançar ConflictException se já possui desligamento', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue({
        ...mockColaborador,
        desligamento: { id: 'desl-001' },
      });

      await expect(
        service.createDesligamento('col-001', {
          dataDesligamento: '2026-06-30',
          motivo: 'Duplicado',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ===================== UNIT: calcularCustoIndividual =====================

  describe('calcularCustoIndividual', () => {
    it('deve calcular custo corretamente', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.jornada.findUnique.mockResolvedValue({
        horasPrevistas: 176,
        horasRealizadas: 176,
        fte: 1.0,
      });

      const result = await service.calcularCustoIndividual('col-001', 1, 2026);

      expect(result.fte).toBe(1);
      expect(result.custoVariavel).toBe(50 * 176); // taxaHora * horas
      expect(result.custoTotal).toBeGreaterThan(result.custoVariavel);
    });

    it('deve retornar zero horas se não há jornada registrada', async () => {
      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.jornada.findUnique.mockResolvedValue(null);

      const result = await service.calcularCustoIndividual('col-001', 1, 2026);

      expect(result.horasRealizadas).toBe(0);
      expect(result.fte).toBe(0);
    });
  });

  // ===================== BULK OPERATIONS =====================

  describe('importarColaboradoresEmLote', () => {
    it('deve importar múltiplos colaboradores com sucesso', async () => {
      const colaboradores = [
        {
          matricula: 'MAT-NEW-001',
          nome: 'Novo Colaborador 1',
          email: 'novo1@empresa.com',
          cargo: 'Dev',
          taxaHora: 60,
          cargaHoraria: 176,
          cidade: 'SP',
          estado: 'SP',
          dataAdmissao: '2026-01-01',
        },
        {
          matricula: 'MAT-NEW-002',
          nome: 'Novo Colaborador 2',
          email: 'novo2@empresa.com',
          cargo: 'QA',
          taxaHora: 50,
          cargaHoraria: 176,
          cidade: 'RJ',
          estado: 'RJ',
          dataAdmissao: '2026-02-01',
        },
      ];

      mockPrisma.colaborador.findFirst.mockResolvedValue(null);
      mockPrisma.colaborador.create
        .mockResolvedValueOnce({ id: 'col-new-1', ...colaboradores[0] })
        .mockResolvedValueOnce({ id: 'col-new-2', ...colaboradores[1] });

      const result = await service.importarColaboradoresEmLote(colaboradores, 'user-1', 'Importação teste');

      expect(result.totalProcessado).toBe(2);
      expect(result.sucessos).toBe(2);
      expect(result.erros).toBe(0);
      expect(result.avisos).toBe(0);
      expect(mockPrisma.colaborador.create).toHaveBeenCalledTimes(2);
    });

    it('deve detectar erro ao faltar matrícula', async () => {
      const colaboradores = [
        {
          nome: 'Colaborador sem matrícula',
          cargo: 'Dev',
          taxaHora: 60,
          cargaHoraria: 176,
          cidade: 'SP',
          estado: 'SP',
          dataAdmissao: '2026-01-01',
        },
      ];

      const result = await service.importarColaboradoresEmLote(colaboradores, 'user-1');

      expect(result.totalProcessado).toBe(1);
      expect(result.erros).toBe(1);
      expect(result.detalhes[0].status).toBe('erro');
      expect(result.detalhes[0].mensagem).toContain('Matrícula é obrigatória');
    });

    it('deve detectar aviso ao encontrar matrícula duplicada', async () => {
      const colaboradores = [
        {
          matricula: 'MAT001',
          nome: 'Colaborador Existente',
          cargo: 'Dev',
          taxaHora: 60,
          cargaHoraria: 176,
          cidade: 'SP',
          estado: 'SP',
          dataAdmissao: '2026-01-01',
        },
      ];

      mockPrisma.colaborador.findFirst.mockResolvedValue({ id: 'col-001', matricula: 'MAT001' });

      const result = await service.importarColaboradoresEmLote(colaboradores, 'user-1');

      expect(result.totalProcessado).toBe(1);
      expect(result.avisos).toBe(1);
      expect(result.detalhes[0].status).toBe('aviso');
      expect(result.detalhes[0].mensagem).toContain('já existe');
    });
  });

  describe('atualizarJornadasEmLote', () => {
    it('deve atualizar múltiplas jornadas com sucesso', async () => {
      const jornadas = [
        {
          colaboradorId: 'col-001',
          mes: 1,
          ano: 2026,
          horasPrevistas: 160,
        },
        {
          colaboradorId: 'col-001',
          mes: 2,
          ano: 2026,
          horasPrevistas: 176,
        },
      ];

      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);
      mockPrisma.jornada.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.jornada.create
        .mockResolvedValueOnce({ id: 'jorn-1', ...jornadas[0] })
        .mockResolvedValueOnce({ id: 'jorn-2', ...jornadas[1] });

      const result = await service.atualizarJornadasEmLote(jornadas, 'Contratação', 'user-1');

      expect(result.totalProcessado).toBe(2);
      expect(result.sucessos).toBe(2);
      expect(result.erros).toBe(0);
      expect(mockPrisma.jornada.create).toHaveBeenCalledTimes(2);
    });

    it('deve detectar erro ao referenciar colaborador inexistente', async () => {
      const jornadas = [
        {
          colaboradorId: 'col-inexistente',
          mes: 1,
          ano: 2026,
          horasPrevistas: 160,
        },
      ];

      mockPrisma.colaborador.findFirst.mockResolvedValue(null);

      const result = await service.atualizarJornadasEmLote(jornadas, 'Contratação', 'user-1');

      expect(result.totalProcessado).toBe(1);
      expect(result.erros).toBe(1);
      expect(result.detalhes[0].status).toBe('erro');
      expect(result.detalhes[0].mensagem).toContain('não encontrado');
    });

    it('deve detectar erro ao fornecer mês inválido', async () => {
      const jornadas = [
        {
          colaboradorId: 'col-001',
          mes: 13,
          ano: 2026,
          horasPrevistas: 160,
        },
      ];

      mockPrisma.colaborador.findFirst.mockResolvedValue(mockColaborador);

      const result = await service.atualizarJornadasEmLote(jornadas, 'Contratação', 'user-1');

      expect(result.totalProcessado).toBe(1);
      expect(result.erros).toBe(1);
      expect(result.detalhes[0].mensagem).toContain('Mês deve estar entre');
    });
  });});