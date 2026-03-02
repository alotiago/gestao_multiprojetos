"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const auth_service_1 = require("./auth.service");
const bcrypt = __importStar(require("bcrypt"));
jest.mock('bcrypt');
describe('AuthService', () => {
    let service;
    let prisma;
    let jwt;
    let config;
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
        get: jest.fn((key, defaultValue) => {
            const config = {
                JWT_SECRET: 'test-secret-key',
                JWT_REFRESH_SECRET: 'test-refresh-secret-key',
                JWT_EXPIRES_IN: '3600',
                JWT_REFRESH_EXPIRES_IN: '604800',
            };
            return config[key] || defaultValue;
        }),
    };
    const mockJwtService = {
        sign: jest.fn((payload, options) => 'test-token'),
        verify: jest.fn(),
    };
    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        prisma = module.get(prisma_service_1.PrismaService);
        jwt = module.get(jwt_1.JwtService);
        config = module.get(config_1.ConfigService);
    });
    describe('register', () => {
        it('deve registrar um novo usuário com sucesso', async () => {
            const registerDto = {
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
            bcrypt.hash.mockResolvedValue('hashed-password');
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue(mockUser);
            mockPrismaService.refreshTokenSession.create.mockResolvedValue({});
            const result = await service.register(registerDto);
            expect(result.user).toEqual(mockUser);
            expect(result.accessToken).toBe('test-token');
            expect(result.refreshToken).toBe('test-token');
            expect(mockPrismaService.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    email: registerDto.email,
                    name: registerDto.name,
                    role: 'VIEWER',
                }),
            }));
        });
        it('deve lançar erro se email já está registrado', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'TestPassword123!',
                name: 'Test User',
            };
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
            });
            await expect(service.register(registerDto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('login', () => {
        it('deve fazer login com sucesso', async () => {
            const loginDto = {
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
            bcrypt.compare.mockResolvedValue(true);
            mockPrismaService.user.update.mockResolvedValue(mockUser);
            mockPrismaService.refreshTokenSession.create.mockResolvedValue({});
            const result = await service.login(loginDto);
            expect(result.user).toEqual(expect.objectContaining({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
            }));
            expect(result.accessToken).toBe('test-token');
            expect(result.refreshToken).toBe('test-token');
        });
        it('deve lançar erro se usuário não encontrado', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'TestPassword123!',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar erro se senha incorreta', async () => {
            const loginDto = {
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
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('deve lançar erro se usuário está inativo', async () => {
            const loginDto = {
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
            await expect(service.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
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
            await expect(service.validateAccessToken(token)).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map