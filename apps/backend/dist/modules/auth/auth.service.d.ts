import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private readonly SALT_ROUNDS;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    /**
     * Registra novo usuário
     */
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    /**
     * Faz login do usuário
     */
    login(dto: LoginDto): Promise<any>;
    /**
     * Refresh token - gera novo access token usando o refresh token
     */
    refreshToken(dto: RefreshTokenDto): Promise<TokenPair>;
    /**
     * Faz logout revogando o refresh token
     */
    logout(refreshToken: string): Promise<void>;
    /**
     * Valida um access token e retorna o payload
     */
    validateAccessToken(token: string): Promise<JwtPayload>;
    /**
     * Gera um par de tokens (access + refresh)
     */
    private generateTokenPair;
    /**
     * Obtém um usuário por ID
     */
    getUserById(userId: string): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLogin: Date | null;
    }>;
    /**
     * Valida a força da senha (OWASP A07)
     * Requisitos: mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial
     */
    private validatePasswordStrength;
}
//# sourceMappingURL=auth.service.d.ts.map