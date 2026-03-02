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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.SALT_ROUNDS = 10;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    /**
     * Registra novo usuário
     */
    async register(dto) {
        const { email, password, name } = dto;
        // Validar se o email já existe
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já cadastrado no sistema');
        }
        // Validar força da senha (OWASP A07)
        this.validatePasswordStrength(password);
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);
        // Criar usuário
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'VIEWER', // Role padrão para novos usuários
                status: 'ATIVO',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });
        // Gerar tokens
        const tokens = await this.generateTokenPair(user.id, user.email, user.role);
        return {
            user,
            ...tokens,
        };
    }
    /**
     * Faz login do usuário
     */
    async login(dto) {
        const { email, password } = dto;
        // Buscar usuário
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            this.logger.warn(`Login falhou: email não encontrado - ${email}`);
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        // Verificar se o usuário está ativo
        if (user.status !== 'ATIVO' || !user.ativo) {
            throw new common_1.UnauthorizedException('Usuário inativo ou desligado');
        }
        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Login falhou: senha inválida para ${email}`);
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        // Atualizar último login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Gerar tokens
        const tokens = await this.generateTokenPair(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        };
    }
    /**
     * Refresh token - gera novo access token usando o refresh token
     */
    async refreshToken(dto) {
        const { refreshToken } = dto;
        try {
            // Validar o refresh token
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
            // Verificar se o token não foi revogado
            const session = await this.prisma.refreshTokenSession.findUnique({
                where: { token: refreshToken },
            });
            if (!session || session.revokedAt) {
                throw new common_1.UnauthorizedException('Refresh token inválido ou revogado');
            }
            if (new Date() > session.expiresAt) {
                throw new common_1.UnauthorizedException('Refresh token expirado');
            }
            // Buscar usuário para confirmar que ainda existe e é ativo
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status !== 'ATIVO' || !user.ativo) {
                throw new common_1.UnauthorizedException('Usuário não encontrado ou inativo');
            }
            // Gerar novo par de tokens
            const newTokens = await this.generateTokenPair(user.id, user.email, user.role);
            return newTokens;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('Refresh token expirado');
            }
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
    }
    /**
     * Faz logout revogando o refresh token
     */
    async logout(refreshToken) {
        try {
            // Marcar o token como revogado
            await this.prisma.refreshTokenSession.update({
                where: { token: refreshToken },
                data: { revokedAt: new Date() },
            });
        }
        catch (error) {
            // Token pode não existir, ignorar o erro
        }
    }
    /**
     * Valida um access token e retorna o payload
     */
    async validateAccessToken(token) {
        try {
            const payload = this.jwt.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido ou expirado');
        }
    }
    /**
     * Gera um par de tokens (access + refresh)
     */
    async generateTokenPair(userId, email, role) {
        const accessTokenExpiresIn = parseInt(this.config.get('JWT_EXPIRES_IN', '3600'), 10); // 1 hora
        const refreshTokenExpiresIn = parseInt(this.config.get('JWT_REFRESH_EXPIRES_IN', '604800'), 10); // 7 dias
        // Payload comum
        const payload = {
            sub: userId,
            email,
            role,
        };
        // Gerar access token (curta duração)
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: accessTokenExpiresIn,
        });
        // Gerar refresh token (longa duração)
        const refreshToken = this.jwt.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: refreshTokenExpiresIn,
        });
        // Salvar refresh token na sessão (para poder revogar depois)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpiresIn);
        await this.prisma.refreshTokenSession.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: accessTokenExpiresIn,
        };
    }
    /**
     * Obtém um usuário por ID
     */
    async getUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Usuário não encontrado');
        }
        return user;
    }
    /**
     * Valida a força da senha (OWASP A07)
     * Requisitos: mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial
     */
    validatePasswordStrength(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < 8 ||
            !hasUpperCase ||
            !hasLowerCase ||
            !hasNumbers ||
            !hasSpecialChar) {
            throw new common_1.BadRequestException('Senha deve conter: mínimo 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map