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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const filter_project_dto_1 = require("./dto/filter-project.dto");
const receita_dto_1 = require("./dto/receita.dto");
const bulk_import_project_dto_1 = require("./dto/bulk-import-project.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // PROJETOS CRUD
    // ─────────────────────────────────────────────────────────────────────────────
    findAll(filters) {
        return this.projectsService.findAll(filters);
    }
    analisarCarteira(ano, unitId) {
        return this.projectsService.analisarCarteira(ano ? parseInt(ano, 10) : undefined, unitId);
    }
    findOne(id) {
        return this.projectsService.findById(id);
    }
    create(dto, req) {
        return this.projectsService.create(dto, req.user.id);
    }
    importarEmLote(dto, req) {
        return this.projectsService.importarEmLote(dto.projetos, req.user.id, dto.descricaoOperacao);
    }
    update(id, dto) {
        return this.projectsService.update(id, dto);
    }
    remove(id) {
        return this.projectsService.delete(id);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // RECEITAS
    // ─────────────────────────────────────────────────────────────────────────────
    findReceitas(id, ano) {
        return this.projectsService.findReceitas(id, ano ? parseInt(ano, 10) : undefined);
    }
    createReceita(id, dto) {
        return this.projectsService.createReceita(id, dto);
    }
    updateReceita(id, receitaId, dto) {
        return this.projectsService.updateReceita(id, receitaId, dto);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // FCST e INDICADORES
    // ─────────────────────────────────────────────────────────────────────────────
    calcularFcst(id, anoFim) {
        return this.projectsService.calcularFcst(id, anoFim ? parseInt(anoFim, 10) : 2030);
    }
    calcularMargens(id, ano, mes) {
        return this.projectsService.calcularMargens(id, parseInt(ano, 10), mes ? parseInt(mes, 10) : undefined);
    }
    consolidar(id, ano) {
        return this.projectsService.consolidar(id, parseInt(ano, 10));
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_LIST),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os projetos com filtros e paginação' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_project_dto_1.FilterProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('carteira'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_LIST),
    (0, swagger_1.ApiOperation)({ summary: 'Análise de carteira consolidada' }),
    (0, swagger_1.ApiQuery)({ name: 'ano', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'unitId', required: false, type: String }),
    __param(0, (0, common_1.Query)('ano')),
    __param(1, (0, common_1.Query)('unitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "analisarCarteira", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar projeto por ID ou código' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID ou código do projeto' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo projeto' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import/bulk'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Importar múltiplos projetos em lote' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_import_project_dto_1.BulkImportProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "importarEmLote", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar projeto' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Remover projeto (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/receitas'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Listar receitas mensais do projeto' }),
    (0, swagger_1.ApiQuery)({ name: 'ano', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findReceitas", null);
__decorate([
    (0, common_1.Post)(':id/receitas'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar receita mensal' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, receita_dto_1.CreateReceitaDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "createReceita", null);
__decorate([
    (0, common_1.Put)(':id/receitas/:receitaId'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar receita mensal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('receitaId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, receita_dto_1.UpdateReceitaDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateReceita", null);
__decorate([
    (0, common_1.Get)(':id/fcst'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Motor FCST — projeções até 2030' }),
    (0, swagger_1.ApiQuery)({ name: 'anoFim', required: false, type: Number, description: 'Ano final da projeção (padrão: 2030)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('anoFim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "calcularFcst", null);
__decorate([
    (0, common_1.Get)(':id/margens'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular margens e indicadores financeiros' }),
    (0, swagger_1.ApiQuery)({ name: 'ano', required: true, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'mes', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ano')),
    __param(2, (0, common_1.Query)('mes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "calcularMargens", null);
__decorate([
    (0, common_1.Get)(':id/consolidado'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    (0, swagger_1.ApiOperation)({ summary: 'Consolidação previsto vs. realizado por mês' }),
    (0, swagger_1.ApiQuery)({ name: 'ano', required: true, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "consolidar", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map