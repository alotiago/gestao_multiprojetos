import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user ID (subject)
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

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Registra novo usuário
   */
  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    // Validar se o email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado no sistema');
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
  async login(dto: LoginDto): Promise<any> {
    const { email, password } = dto;

    // Buscar usuário
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Login falhou: email não encontrado - ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se o usuário está ativo
    if (user.status !== 'ATIVO' || !user.ativo) {
      throw new UnauthorizedException('Usuário inativo ou desligado');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login falhou: senha inválida para ${email}`);
      throw new UnauthorizedException('Credenciais inválidas');
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
  async refreshToken(dto: RefreshTokenDto): Promise<TokenPair> {
    const { refreshToken } = dto;

    try {
      // Validar o refresh token
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      // Verificar se o token não foi revogado
      const session = await this.prisma.refreshTokenSession.findUnique({
        where: { token: refreshToken },
      });

      if (!session || session.revokedAt) {
        throw new UnauthorizedException('Refresh token inválido ou revogado');
      }

      if (new Date() > session.expiresAt) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Buscar usuário para confirmar que ainda existe e é ativo
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ATIVO' || !user.ativo) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      // Gerar novo par de tokens
      const newTokens = await this.generateTokenPair(user.id, user.email, user.role);

      return newTokens;
    } catch (error: unknown) {
      if ((error as Error).name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expirado');
      }
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * Faz logout revogando o refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // Marcar o token como revogado
      await this.prisma.refreshTokenSession.update({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      // Token pode não existir, ignorar o erro
    }
  }

  /**
   * Valida um access token e retorna o payload
   */
  async validateAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  /**
   * Gera um par de tokens (access + refresh)
   */
  private async generateTokenPair(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const accessTokenExpiresIn = parseInt(this.config.get('JWT_EXPIRES_IN', '3600'), 10); // 1 hora
    const refreshTokenExpiresIn = parseInt(
      this.config.get('JWT_REFRESH_EXPIRES_IN', '604800'),
      10,
    ); // 7 dias

    // Payload comum
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
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
  async getUserById(userId: string) {
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
      throw new BadRequestException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Valida a força da senha (OWASP A07)
   * Requisitos: mínimo 8 caracteres, letra maiúscula, minúscula, número e caractere especial
   */
  private validatePasswordStrength(password: string) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (
      password.length < 8 ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumbers ||
      !hasSpecialChar
    ) {
      throw new BadRequestException(
        'Senha deve conter: mínimo 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial',
      );
    }
  }
}
