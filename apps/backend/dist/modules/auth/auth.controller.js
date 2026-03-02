"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    /**
     * Registro de novo usuário
     */
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    /**
     * Login de usuário
     */
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    /**
     * Refresh token - gera novo access token
     */
    async refresh(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
    /**
     * Logout - revoga o refresh token
     */
    async logout(refreshTokenDto) {
        await this.authService.logout(refreshTokenDto.refreshToken);
        return { message: 'Logout realizado com sucesso' };
    }
    /**
     * Valida o token atual e retorna dados do usuário
     */
    async getMe(request) {
        const userId = request.user.sub;
        return this.authService.getUserById(userId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }) // OWASP A07: 5 registros/min
    ,
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Registra novo usuário no sistema' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Email já cadastrado ou dados inválidos',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }) // OWASP A07: 30 tentativas/min
    ,
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Autentica usuário e retorna tokens JWT' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Credenciais inválidas ou usuário inativo',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Gera novo access token usando refresh token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Novo token gerado com sucesso',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIs...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                expiresIn: 3600,
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Refresh token inválido ou expirado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Realiza logout revogando o refresh token' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout realizado com sucesso',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna informações do usuário autenticado' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map