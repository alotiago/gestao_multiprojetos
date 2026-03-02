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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contracts_service_1 = require("./contracts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ContractsController = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    // ═══════════════════════════════════════════
    //  OBJETOS CONTRATUAIS
    // ═══════════════════════════════════════════
    async findAllObjetos(page, limit, projectId) {
        return this.contractsService.findAllObjetos(Number(page) || 1, Number(limit) || 10, projectId);
    }
    async findObjetoById(id) {
        return this.contractsService.findObjetoById(id);
    }
    async findObjetosByProject(projectId) {
        return this.contractsService.findObjetosByProject(projectId);
    }
    async createObjeto(data) {
        return this.contractsService.createObjeto(data);
    }
    async updateObjeto(id, data) {
        return this.contractsService.updateObjeto(id, data);
    }
    async deleteObjeto(id) {
        return this.contractsService.deleteObjeto(id);
    }
    // ═══════════════════════════════════════════
    //  LINHAS CONTRATUAIS
    // ═══════════════════════════════════════════
    async findLinhasByObjeto(objetoId) {
        return this.contractsService.findLinhasByObjeto(objetoId);
    }
    async findLinhaById(id) {
        return this.contractsService.findLinhaById(id);
    }
    async findLinhasByProject(projectId) {
        return this.contractsService.findLinhasByProject(projectId);
    }
    async createLinha(data) {
        return this.contractsService.createLinha(data);
    }
    async updateLinha(id, data) {
        return this.contractsService.updateLinha(id, data);
    }
    async deleteLinha(id) {
        return this.contractsService.deleteLinha(id);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Get)('objetos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar objetos contratuais (paginado)' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findAllObjetos", null);
__decorate([
    (0, common_1.Get)('objetos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar objeto contratual por ID (com linhas)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findObjetoById", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/objetos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar objetos contratuais de um projeto' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findObjetosByProject", null);
__decorate([
    (0, common_1.Post)('objetos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar objeto contratual' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createObjeto", null);
__decorate([
    (0, common_1.Put)('objetos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar objeto contratual' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "updateObjeto", null);
__decorate([
    (0, common_1.Delete)('objetos/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar objeto contratual (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deleteObjeto", null);
__decorate([
    (0, common_1.Get)('objetos/:objetoId/linhas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar linhas contratuais de um objeto' }),
    __param(0, (0, common_1.Param)('objetoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findLinhasByObjeto", null);
__decorate([
    (0, common_1.Get)('linhas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar linha contratual por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findLinhaById", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/linhas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as linhas contratuais de um projeto' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findLinhasByProject", null);
__decorate([
    (0, common_1.Post)('linhas'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar linha contratual' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createLinha", null);
__decorate([
    (0, common_1.Put)('linhas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar linha contratual (recalcula receitas futuras)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "updateLinha", null);
__decorate([
    (0, common_1.Delete)('linhas/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar linha contratual (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deleteLinha", null);
exports.ContractsController = ContractsController = __decorate([
    (0, swagger_1.ApiTags)('Contracts'),
    (0, common_1.Controller)('contracts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map