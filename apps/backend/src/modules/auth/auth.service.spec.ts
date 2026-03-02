import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    refreshTokenSession: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        JWT_SECRET: 'test-secret-key',
        JWT_REFRESH_SECRET: 'test-refresh-secret-key',
        JWT_EXPIRES_IN: '3600',
        JWT_REFRESH_EXPIRES_IN: '604800',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockJwtService = {
    sign: jest.fn((payload: any, options?: any) => 'test-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User',
      };

      const mockUser = {
        id: 'user-1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'VIEWER',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.refreshTokenSession.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('test-token');
      expect(result.refreshToken).toBe('test-token');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerDto.email,
            name: registerDto.name,
            role: 'VIEWER',
          }),
        }),
      );
    });

    it('deve lançar erro se email já está registrado', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginDto.email,
        name: 'Test User',
        role: 'VIEWER',
        password: 'hashed-password',
        status: 'ATIVO',
        ativo: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.refreshTokenSession.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        }),
      );
      expect(result.accessToken).toBe('test-token');
      expect(result.refreshToken).toBe('test-token');
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro se senha incorreta', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginDto.email,
        name: 'Test User',
        role: 'VIEWER',
        password: 'hashed-password',
        status: 'ATIVO',
        ativo: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar erro se usuário está inativo', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      const mockUser = {
        id: 'user-1',
        email: loginDto.email,
        name: 'Test User',
        role: 'VIEWER',
        password: 'hashed-password',
        status: 'INATIVO',
        ativo: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateAccessToken', () => {
    it('deve validar token com sucesso', async () => {
      const token = 'valid-token';
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        role: 'VIEWER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await service.validateAccessToken(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, expect.any(Object));
    });

    it('deve lançar erro se token inválido', async () => {
      const token = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await expect(service.validateAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
