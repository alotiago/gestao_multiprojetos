import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('deve listar todos os usuários com paginação', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'test1@example.com',
          name: 'Test User 1',
          role: 'VIEWER',
          status: 'ATIVO',
          ativo: true,
          createdAt: new Date(),
          lastLogin: null,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('findById', () => {
    it('deve buscar um usuário por ID', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'VIEWER',
        status: 'ATIVO',
        ativo: true,
        createdAt: new Date(),
        lastLogin: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('deve lançar NotFoundException se usuário não encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        name: 'New User',
        role: 'VIEWER',
      };

      const mockCreatedUser = {
        id: 'user-new',
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        status: 'ATIVO',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('deve lançar erro se email já existe', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'TestPassword123!',
        name: 'Existing User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        role: 'PMO',
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: updateUserDto.name,
        role: updateUserDto.role,
        status: 'ATIVO',
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.update('user-1', updateUserDto);

      expect(result.name).toBe(updateUserDto.name);
      expect(result.role).toBe(updateUserDto.role);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar um usuário (soft delete)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ativo: false,
        status: 'INATIVO',
      });

      const result = await service.delete('user-1');

      expect(result.message).toBe('Usuário deletado com sucesso');
      expect(result.user).toEqual({ ...mockUser, ativo: false, status: 'INATIVO' });
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas de usuários', async () => {
      mockPrismaService.user.count.mockResolvedValueOnce(10);
      mockPrismaService.user.count.mockResolvedValueOnce(8);
      mockPrismaService.user.count.mockResolvedValueOnce(2);
      mockPrismaService.user.groupBy.mockResolvedValue([
        { role: 'ADMIN', _count: 1 },
        { role: 'PMO', _count: 3 },
        { role: 'VIEWER', _count: 6 },
      ]);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.ativo).toBe(8);
      expect(result.inativo).toBe(2);
      expect(result.byRole).toEqual([
        { role: 'ADMIN', count: 1 },
        { role: 'PMO', count: 3 },
        { role: 'VIEWER', count: 6 },
      ]);
    });
  });
});
