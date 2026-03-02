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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
const config_service_1 = require("./config.service");
const calendario_dto_1 = require("./dto/calendario.dto");
const sindicato_dto_1 = require("./dto/sindicato.dto");
let ConfigController = class ConfigController {
    constructor(configService) {
        this.configService = configService;
    }
    // =============================================================
    // CALENDÁRIO
    // =============================================================
    findCalendarios(filters) {
        return this.configService.findCalendarios(filters);
    }
    calcularHorasPrevistas(estado, mes, ano) {
        return this.configService.calcularHorasPrevistas(estado, mes, ano);
    }
    findCalendario(id) {
        return this.configService.findCalendarioById(id);
    }
    createCalendario(dto) {
        return this.configService.createCalendario(dto);
    }
    updateCalendario(id, dto) {
        return this.configService.updateCalendario(id, dto);
    }
    deleteCalendario(id) {
        return this.configService.deleteCalendario(id);
    }
    // =============================================================
    // SINDICATOS
    // =============================================================
    findSindicatos(ativo) {
        const ativoParsed = ativo !== undefined ? ativo === 'true' : undefined;
        return this.configService.findSindicatos(ativoParsed);
    }
    findSindicato(id) {
        return this.configService.findSindicatoById(id);
    }
    createSindicato(dto) {
        return this.configService.createSindicato(dto);
    }
    updateSindicato(id, dto) {
        return this.configService.updateSindicato(id, dto);
    }
    deleteSindicato(id) {
        return this.configService.deleteSindicato(id);
    }
    simularCustoTrabalhista(id, dto) {
        dto.sindicatoId = id;
        return this.configService.simularCustoTrabalhista(dto);
    }
    // =============================================================
    // ÍNDICES FINANCEIROS
    // =============================================================
    findIndices(tipo, ano) {
        return this.configService.findIndices(tipo, ano);
    }
    createIndice(body) {
        return this.configService.createIndice(body.tipo, body.valor, body.mesReferencia, body.anoReferencia);
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, common_1.Get)('calendarios'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.FilterCalendarioDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "findCalendarios", null);
__decorate([
    (0, common_1.Get)('calendarios/horas-previstas'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Query)('estado')),
    __param(1, (0, common_1.Query)('mes', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('ano', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "calcularHorasPrevistas", null);
__decorate([
    (0, common_1.Get)('calendarios/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "findCalendario", null);
__decorate([
    (0, common_1.Post)('calendarios'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.CreateCalendarioDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "createCalendario", null);
__decorate([
    (0, common_1.Put)('calendarios/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, calendario_dto_1.UpdateCalendarioDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateCalendario", null);
__decorate([
    (0, common_1.Delete)('calendarios/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_CALENDAR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "deleteCalendario", null);
__decorate([
    (0, common_1.Get)('sindicatos'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Query)('ativo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "findSindicatos", null);
__decorate([
    (0, common_1.Get)('sindicatos/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "findSindicato", null);
__decorate([
    (0, common_1.Post)('sindicatos'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sindicato_dto_1.CreateSindicatoDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "createSindicato", null);
__decorate([
    (0, common_1.Put)('sindicatos/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sindicato_dto_1.UpdateSindicatoDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "updateSindicato", null);
__decorate([
    (0, common_1.Delete)('sindicatos/:id'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "deleteSindicato", null);
__decorate([
    (0, common_1.Post)('sindicatos/:id/simular'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_SINDICATO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sindicato_dto_1.SimulacaoTrabalhistaDto]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "simularCustoTrabalhista", null);
__decorate([
    (0, common_1.Get)('indices'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('ano', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "findIndices", null);
__decorate([
    (0, common_1.Post)('indices'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigController.prototype, "createIndice", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map