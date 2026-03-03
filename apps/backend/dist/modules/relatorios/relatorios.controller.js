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
exports.RelatoriosController = void 0;
const common_1 = require("@nestjs/common");
const relatorios_service_1 = require("./relatorios.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
const swagger_1 = require("@nestjs/swagger");
let RelatoriosController = class RelatoriosController {
    constructor(relatoriosService) {
        this.relatoriosService = relatoriosService;
    }
    getDashboardContratos(ano) {
        const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
        return this.relatoriosService.getDashboardContratos(anoNum);
    }
};
exports.RelatoriosController = RelatoriosController;
__decorate([
    (0, common_1.Get)('contratos-dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard de Contratos com análise financeira' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.DASHBOARD_FINANCIAL),
    __param(0, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelatoriosController.prototype, "getDashboardContratos", null);
exports.RelatoriosController = RelatoriosController = __decorate([
    (0, swagger_1.ApiTags)('Relatórios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('relatorios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [relatorios_service_1.RelatoriosService])
], RelatoriosController);
//# sourceMappingURL=relatorios.controller.js.map