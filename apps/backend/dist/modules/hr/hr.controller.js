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
exports.HrController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const hr_service_1 = require("./hr.service");
const create_colaborador_dto_1 = require("./dto/create-colaborador.dto");
const update_colaborador_dto_1 = require("./dto/update-colaborador.dto");
const filter_colaborador_dto_1 = require("./dto/filter-colaborador.dto");
const jornada_dto_1 = require("./dto/jornada.dto");
const ferias_dto_1 = require("./dto/ferias.dto");
const desligamento_dto_1 = require("./dto/desligamento.dto");
const bulk_operations_dto_1 = require("./dto/bulk-operations.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
let HrController = class HrController {
    constructor(hrService) {
        this.hrService = hrService;
    }
    // ===================== COLABORADORES =====================
    findAll(filters) {
        return this.hrService.findAll(filters);
    }
    findById(id) {
        return this.hrService.findById(id);
    }
    create(dto) {
        return this.hrService.create(dto);
    }
    update(id, dto) {
        return this.hrService.update(id, dto);
    }
    delete(id) {
        return this.hrService.delete(id);
    }
    importarEmLote(dto, req) {
        return this.hrService.importarColaboradoresEmLote(dto.colaboradores, req.user.id, dto.descricaoOperacao);
    }
    // ===================== IMPORTAÇÃO CSV =====================
    async importarCSV(file) {
        if (!file) {
            throw new Error('Arquivo CSV não fornecido');
        }
        const csvContent = file.buffer.toString('utf-8');
        return this.hrService.importarCSV(csvContent);
    }
    // ===================== JORNADAS =====================
    findJornadas(id, ano) {
        return this.hrService.findJornadas(id, ano ? parseInt(ano, 10) : undefined);
    }
    createJornada(id, dto) {
        return this.hrService.createJornada(id, dto);
    }
    updateJornada(id, jornadaId, dto) {
        return this.hrService.updateJornada(id, jornadaId, dto);
    }
    bulkJornadas(dto) {
        return this.hrService.bulkCreateJornadas(dto);
    }
    atualizarJornadasEmLote(dto, req) {
        return this.hrService.atualizarJornadasEmLote(dto.jornadas, dto.motivo, req.user.id);
    }
    // ===================== FÉRIAS =====================
    findFerias(id) {
        return this.hrService.findFerias(id);
    }
    createFerias(id, dto) {
        return this.hrService.createFerias(id, dto);
    }
    updateFerias(id, feriasId, dto) {
        return this.hrService.updateFerias(id, feriasId, dto);
    }
    // ===================== DESLIGAMENTO =====================
    createDesligamento(id, dto) {
        return this.hrService.createDesligamento(id, dto);
    }
    // ===================== CUSTOS E FTE =====================
    calcularCusto(id, mes, ano) {
        return this.hrService.calcularCustoIndividual(id, mes, ano);
    }
    projetarCustos(id, ano) {
        return this.hrService.projetarCustosAnuais(id, ano);
    }
    calcularCustoEquipe(mes, ano) {
        return this.hrService.calcularCustoEquipe(mes, ano);
    }
};
exports.HrController = HrController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_LIST),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_colaborador_dto_1.FilterColaboradorDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_colaborador_dto_1.CreateColaboradorDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_colaborador_dto_1.UpdateColaboradorDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('import/bulk'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_CREATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_operations_dto_1.BulkImportColaboradorDto, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "importarEmLote", null);
__decorate([
    (0, common_1.Post)('importar/csv'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_CREATE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HrController.prototype, "importarCSV", null);
__decorate([
    (0, common_1.Get)(':id/jornadas'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findJornadas", null);
__decorate([
    (0, common_1.Post)(':id/jornadas'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_MANAGE_JORNADA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, jornada_dto_1.CreateJornadaDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createJornada", null);
__decorate([
    (0, common_1.Put)(':id/jornadas/:jornadaId'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_MANAGE_JORNADA),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('jornadaId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, jornada_dto_1.UpdateJornadaDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "updateJornada", null);
__decorate([
    (0, common_1.Post)('jornadas/bulk'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jornada_dto_1.BulkJornadaDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "bulkJornadas", null);
__decorate([
    (0, common_1.Post)('jornadas/bulk-update'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_BULK_UPDATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_operations_dto_1.BulkUpdateJornadaDto, Object]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "atualizarJornadasEmLote", null);
__decorate([
    (0, common_1.Get)(':id/ferias'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "findFerias", null);
__decorate([
    (0, common_1.Post)(':id/ferias'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ferias_dto_1.CreateFeriasDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createFerias", null);
__decorate([
    (0, common_1.Put)(':id/ferias/:feriasId'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('feriasId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, ferias_dto_1.UpdateFeriasDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "updateFerias", null);
__decorate([
    (0, common_1.Post)(':id/desligamento'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, desligamento_dto_1.CreateDesligamentoDto]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "createDesligamento", null);
__decorate([
    (0, common_1.Get)(':id/custo'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('mes', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('ano', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "calcularCusto", null);
__decorate([
    (0, common_1.Get)(':id/projecao'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('ano', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "projetarCustos", null);
__decorate([
    (0, common_1.Get)('equipe/custo'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.RESOURCE_READ),
    __param(0, (0, common_1.Query)('mes', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('ano', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], HrController.prototype, "calcularCustoEquipe", null);
exports.HrController = HrController = __decorate([
    (0, common_1.Controller)('hr/colaboradores'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [hr_service_1.HrService])
], HrController);
//# sourceMappingURL=hr.controller.js.map