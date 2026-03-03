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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getDashboardExecutivo(ano, projectId) {
        const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
        return this.dashboardService.getDashboardExecutivo(anoNum, projectId);
    }
    getDashboardFinanceiro(ano, mes, projectId) {
        const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
        const mesNum = mes ? parseInt(mes, 10) : undefined;
        return this.dashboardService.getDashboardFinanceiro(anoNum, mesNum, projectId);
    }
    exportDashboardFinanceiroCsv(ano, mes, projectId) {
        const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
        const mesNum = mes ? parseInt(mes, 10) : undefined;
        return this.dashboardService.exportDashboardFinanceiroCsv(anoNum, mesNum, projectId);
    }
    getDashboardRecursos(ano, mes) {
        return this.dashboardService.getDashboardRecursos(ano, mes);
    }
    getDashboardProjetos(ano) {
        return this.dashboardService.getDashboardProjetos(ano);
    }
    getVisaoAnoAno(anoInicio, anoFim) {
        return this.dashboardService.getVisaoAnoAno(anoInicio ?? 2024, anoFim ?? 2030);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('executivo'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_EXECUTIVE),
    __param(0, (0, common_1.Query)('ano')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboardExecutivo", null);
__decorate([
    (0, common_1.Get)('financeiro'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_FINANCIAL),
    __param(0, (0, common_1.Query)('ano')),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboardFinanceiro", null);
__decorate([
    (0, common_1.Get)('financeiro/export/csv'),
    (0, common_1.Header)('Content-Type', 'text/csv; charset=utf-8'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_FINANCIAL),
    __param(0, (0, common_1.Query)('ano')),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "exportDashboardFinanceiroCsv", null);
__decorate([
    (0, common_1.Get)('recursos'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_RESOURCES),
    __param(0, (0, common_1.Query)('ano', new common_1.ParseIntPipe({ optional: false }))),
    __param(1, (0, common_1.Query)('mes', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboardRecursos", null);
__decorate([
    (0, common_1.Get)('projetos'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_PROJECTS),
    __param(0, (0, common_1.Query)('ano', new common_1.ParseIntPipe({ optional: false }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboardProjetos", null);
__decorate([
    (0, common_1.Get)('ano-a-ano'),
    (0, permissions_decorator_1.RequirePermissions)(permission_service_1.Permission.DASHBOARD_EXECUTIVE),
    __param(0, (0, common_1.Query)('anoInicio', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('anoFim', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getVisaoAnoAno", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map