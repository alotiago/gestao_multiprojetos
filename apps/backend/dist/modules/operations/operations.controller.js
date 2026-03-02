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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
const mass_update_dto_1 = require("./dto/mass-update.dto");
const recalculo_cascata_dto_1 = require("./dto/recalculo-cascata.dto");
const operations_service_1 = require("./operations.service");
const swagger_1 = require("@nestjs/swagger");
let OperationsController = class OperationsController {
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    ajusteMassivoJornada(dto) {
        return this.operationsService.ajusteMassivoJornada(dto);
    }
    ajusteMassivoTaxa(dto) {
        return this.operationsService.ajusteMassivoTaxa(dto);
    }
    listarHistorico(projectId, limit) {
        return this.operationsService.listarHistorico(projectId, limit ?? 20);
    }
    rollbackMassivo(historicoId) {
        return this.operationsService.rollbackMassivo(historicoId);
    }
    // ===================== RECÁLCULO EM CASCATA =====================
    recalculoCascata(dto) {
        return this.operationsService.recalculoCascata(dto);
    }
    recalculoCascataRange(dto) {
        return this.operationsService.recalculoCascataRange(dto);
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Post)('jornadas'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajuste massivo de jornadas', description: 'Atualiza carga horária de múltiplos colaboradores com histórico de auditoria' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ajuste realizado com sucesso' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mass_update_dto_1.BulkAjusteJornadaDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "ajusteMassivoJornada", null);
__decorate([
    (0, common_1.Post)('taxas'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajuste massivo de taxas', description: 'Aplica reajuste percentual ou absoluto às taxas hora dos colaboradores' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Taxas ajustadas com histórico' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mass_update_dto_1.BulkAjusteTaxaDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "ajusteMassivoTaxa", null);
__decorate([
    (0, common_1.Get)('historico'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar histórico de operações', description: 'Retorna histórico de ajustes massivos e recálculos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de registros de histórico' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_SYSTEM),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "listarHistorico", null);
__decorate([
    (0, common_1.Post)('rollback/:historicoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Rollback de operação', description: 'Reverte uma operação massiva anterior pelo ID do histórico' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rollback realizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Histórico não encontrado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Param)('historicoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "rollbackMassivo", null);
__decorate([
    (0, common_1.Post)('recalculo-cascata'),
    (0, swagger_1.ApiOperation)({ summary: 'Recálculo em cascata', description: 'TAXA × CALENDÁRIO × HORAS × CUSTO × FTE — recalcula para um mês específico' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Recálculo executado com detalhes por colaborador' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recalculo_cascata_dto_1.RecalculoCascataDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "recalculoCascata", null);
__decorate([
    (0, common_1.Post)('recalculo-cascata/range'),
    (0, swagger_1.ApiOperation)({ summary: 'Recálculo cascata (range)', description: 'Executa recálculo cascata para um intervalo de meses' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resultados para cada mês do range' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recalculo_cascata_dto_1.RecalculoRangeDto]),
    __metadata("design:returntype", void 0)
], OperationsController.prototype, "recalculoCascataRange", null);
exports.OperationsController = OperationsController = __decorate([
    (0, swagger_1.ApiTags)('Operações'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('operations/mass-update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [operations_service_1.OperationsService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map