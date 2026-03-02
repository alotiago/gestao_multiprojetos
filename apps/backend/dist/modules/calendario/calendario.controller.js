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
exports.CalendarioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calendario_service_1 = require("./calendario.service");
const calendario_dto_1 = require("./dto/calendario.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
let CalendarioController = class CalendarioController {
    constructor(calendarioService) {
        this.calendarioService = calendarioService;
    }
    findAll(filters) {
        return this.calendarioService.findAll(filters);
    }
    findById(id) {
        return this.calendarioService.findById(id);
    }
    create(dto) {
        return this.calendarioService.create(dto);
    }
    update(id, dto) {
        return this.calendarioService.update(id, dto);
    }
    delete(id) {
        return this.calendarioService.delete(id);
    }
    // ===================== ENGINE DIAS ÚTEIS =====================
    calcularDiasUteis(dto) {
        return this.calendarioService.calcularDiasUteis(dto);
    }
    calcularJornadaPorRegiao(estado, ano, cidade) {
        return this.calendarioService.calcularJornadaPorRegiao(estado, parseInt(ano, 10), cidade);
    }
    // ===================== BULK IMPORT =====================
    importarFeriadosEmLote(dto) {
        return this.calendarioService.importarFeriadosEmLote(dto);
    }
    // ===================== SEED =====================
    seedFeriadosNacionais(ano) {
        return this.calendarioService.seedFeriadosNacionais(parseInt(ano, 10));
    }
};
exports.CalendarioController = CalendarioController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar feriados', description: 'Retorna feriados filtrados por ano, estado e cidade' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de feriados retornada' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_LIST),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.FilterCalendarioDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar feriado por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feriado encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Feriado não encontrado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar feriado' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Feriado criado com sucesso' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.CreateCalendarioDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar feriado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feriado atualizado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, calendario_dto_1.UpdateCalendarioDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir feriado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feriado excluído' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('calcular/dias-uteis'),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular dias úteis', description: 'Engine de cálculo: total dias, dias úteis, feriados em dia útil, dias úteis líquidos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cálculo retornado com sucesso' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.CalculoDiasUteisDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "calcularDiasUteis", null);
__decorate([
    (0, common_1.Get)('calcular/jornada-regiao/:estado/:ano'),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular jornada por região', description: 'Retorna jornada mensal (12 meses) para estado/cidade' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Jornada calculada por região' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    __param(0, (0, common_1.Param)('estado')),
    __param(1, (0, common_1.Param)('ano')),
    __param(2, (0, common_1.Query)('cidade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "calcularJornadaPorRegiao", null);
__decorate([
    (0, common_1.Post)('import/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar feriados em lote', description: 'Importação bulk de feriados com tratamento de duplicatas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado da importação (sucessos, erros, avisos)' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calendario_dto_1.BulkImportFeriadoDto]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "importarFeriadosEmLote", null);
__decorate([
    (0, common_1.Post)('seed/:ano'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed feriados nacionais', description: 'Popula os 12 feriados nacionais brasileiros para o ano informado' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Feriados nacionais inseridos' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Param)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CalendarioController.prototype, "seedFeriadosNacionais", null);
exports.CalendarioController = CalendarioController = __decorate([
    (0, swagger_1.ApiTags)('Calendário'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('calendario'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [calendario_service_1.CalendarioService])
], CalendarioController);
//# sourceMappingURL=calendario.controller.js.map