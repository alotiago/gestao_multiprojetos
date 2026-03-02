import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registro de novo usuário
   */
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // OWASP A07: 5 registros/min
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra novo usuário no sistema' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      example: {
        user: {
          id: 'cid_123456',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'VIEWER',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email já cadastrado ou dados inválidos',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login de usuário
   */
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // OWASP A07: 30 tentativas/min
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica usuário e retorna tokens JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        user: {
          id: 'cid_123456',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'PMO',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas ou usuário inativo',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Refresh token - gera novo access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera novo access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Novo token gerado com sucesso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Logout - revoga o refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Realiza logout revogando o refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Valida o token atual e retorna dados do usuário
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna informações do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
    schema: {
      example: {
        id: 'cid_123456',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'PMO',
        status: 'ATIVO',
        createdAt: '2026-03-01T10:00:00Z',
        lastLogin: '2026-03-01T15:30:00Z',
      },
    },
  })
  async getMe(@Req() request: any) {
    const userId = request.user.sub;
    return this.authService.getUserById(userId);
  }
}
