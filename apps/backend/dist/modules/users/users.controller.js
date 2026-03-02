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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_1 = require("../auth/permissions");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    /**
     * Lista todos os usuários (com paginação)
     */
    async findAll(page = '1', limit = '10') {
        return this.usersService.findAll(parseInt(page), parseInt(limit));
    }
    /**
     * Busca um usuário por ID
     */
    async findById(id) {
        return this.usersService.findById(id);
    }
    /**
     * Cria um novo usuário
     */
    async create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    /**
     * Atualiza um usuário
     */
    async update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    /**
     * Deleta um usuário (soft delete)
     */
    async delete(id) {
        return this.usersService.delete(id);
    }
    /**
     * Ativa um usuário inativo
     */
    async activate(id) {
        return this.usersService.activate(id);
    }
    /**
     * Muda a role de um usuário
     */
    async changeRole(id, role) {
        return this.usersService.changeRole(id, role);
    }
    /**
     * Retorna estatísticas de usuários
     */
    async getStats() {
        return this.usersService.getStats();
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_LIST),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todos os usuários do sistema' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuários recuperada com sucesso',
        schema: {
            example: {
                data: [
                    {
                        id: 'cid_123456',
                        email: 'user@example.com',
                        name: 'John Doe',
                        role: 'PMO',
                        status: 'ATIVO',
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Busca um usuário específico pelo ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuário encontrado',
        schema: {
            example: {
                id: 'cid_123456',
                email: 'user@example.com',
                name: 'John Doe',
                role: 'PMO',
                status: 'ATIVO',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuário não encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um novo usuário no sistema' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuário criado com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Email já cadastrado ou dados inválidos',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza os dados de um usuário' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuário atualizado com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuário não encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Deleta um usuário (soft delete)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuário deletado com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuário não encontrado',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Ativa um usuário que estava inativo' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuário ativado com sucesso',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/change-role'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_CHANGE_ROLE),
    (0, swagger_1.ApiOperation)({ summary: 'Altera a role de um usuário' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role alterada com sucesso',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeRole", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, permissions_1.Permissions)(permissions_1.Permission.USER_VIEW_STATS),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna estatísticas dos usuários' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estatísticas de usuários',
        schema: {
            example: {
                total: 10,
                ativo: 8,
                inativo: 2,
                byRole: [
                    { role: 'ADMIN', count: 1 },
                    { role: 'PMO', count: 3 },
                ],
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map