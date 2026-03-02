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
    //  CONTRATOS
    // ═══════════════════════════════════════════
    async findAll(page, limit, status) {
        return this.contractsService.findAllContratos(Number(page) || 1, Number(limit) || 10, status);
    }
    async findDisponíveis() {
        return this.contractsService.findContratosDisponíveis();
    }
    async findById(id) {
        return this.contractsService.findContratoById(id);
    }
    async create(data) {
        return this.contractsService.createContrato(data);
    }
    async update(id, data) {
        return this.contractsService.updateContrato(id, data);
    }
    async delete(id) {
        return this.contractsService.deleteContrato(id);
    }
    async clone(id, data) {
        return this.contractsService.cloneContrato(id, data.novoNome, data.novoNumero);
    }
    // ═══════════════════════════════════════════
    //  OBJETOS CONTRATUAIS
    // ═══════════════════════════════════════════
    async createObjeto(contratoId, data) {
        return this.contractsService.createObjeto({ ...data, contratoId });
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
    async createLinha(objetoContratualId, data) {
        return this.contractsService.createLinha({
            ...data,
            objetoContratualId,
        });
    }
    async updateLinha(id, data) {
        return this.contractsService.updateLinha(id, data);
    }
    async deleteLinha(id) {
        return this.contractsService.deleteLinha(id);
    }
    // ═══════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════
    async getObjetosByProject(projectId) {
        return this.contractsService.findObjetosByProject(projectId);
    }
    async getLinhasByObjeto(objetoId) {
        return this.contractsService.findLinhasByObjeto(objetoId);
    }
    async getProjectSummary(projectId) {
        return this.contractsService.getProjectContractSummary(projectId);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar contratos (paginado) - US 1.1' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('disponíveis'),
    (0, swagger_1.ApiOperation)({ summary: 'Contratos disponíveis para novos projetos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findDispon\u00EDveis", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhe de contrato com objetos e linhas - US 1.2' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar contrato - US 1.3' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar contrato - US 1.4' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar contrato - soft delete' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Clonar contrato com estrutura completa - US 5.1' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "clone", null);
__decorate([
    (0, common_1.Post)(':contratoId/objetos'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar objeto contratual - US 2.1' }),
    __param(0, (0, common_1.Param)('contratoId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createObjeto", null);
__decorate([
    (0, common_1.Put)('objetos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar objeto contratual - US 2.2' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "updateObjeto", null);
__decorate([
    (0, common_1.Delete)('objetos/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar objeto contratual - US 2.3' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deleteObjeto", null);
__decorate([
    (0, common_1.Post)('objetos/:objetoId/linhas'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar linha contratual - US 3.1' }),
    __param(0, (0, common_1.Param)('objetoId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "createLinha", null);
__decorate([
    (0, common_1.Put)('linhas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar linha contratual - US 3.2' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "updateLinha", null);
__decorate([
    (0, common_1.Delete)('linhas/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Desativar linha contratual - US 3.3' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "deleteLinha", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/objetos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar objetos contratuais do contrato vinculado ao projeto' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getObjetosByProject", null);
__decorate([
    (0, common_1.Get)('objetos/:objetoId/linhas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar linhas contratuais de um objeto contratual' }),
    __param(0, (0, common_1.Param)('objetoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getLinhasByObjeto", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/resumo'),
    (0, swagger_1.ApiOperation)({ summary: 'Resumo contratual do projeto' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "getProjectSummary", null);
exports.ContractsController = ContractsController = __decorate([
    (0, swagger_1.ApiTags)('Contracts'),
    (0, common_1.Controller)('contracts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map