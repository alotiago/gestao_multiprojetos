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
exports.SindicatoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sindicato_service_1 = require("./sindicato.service");
const sindicato_dto_1 = require("./dto/sindicato.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
let SindicatoController = class SindicatoController {
    constructor(sindicatoService) {
        this.sindicatoService = sindicatoService;
    }
    findAll(filters) {
        return this.sindicatoService.findAll(filters);
    }
    relatorioPorRegiao() {
        return this.sindicatoService.relatorioPorRegiao();
    }
    findById(id) {
        return this.sindicatoService.findById(id);
    }
    create(dto) {
        return this.sindicatoService.create(dto);
    }
    update(id, dto) {
        return this.sindicatoService.update(id, dto);
    }
    delete(id) {
        return this.sindicatoService.delete(id);
    }
    // ===================== DISSÍDIO =====================
    aplicarDissidio(dto) {
        return this.sindicatoService.aplicarDissidio(dto);
    }
    // ===================== SIMULAÇÃO =====================
    simularImpacto(dto) {
        return this.sindicatoService.simularImpactoFinanceiro(dto);
    }
};
exports.SindicatoController = SindicatoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar sindicatos', description: 'Lista sindicatos com filtros opcionais' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de sindicatos' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_LIST),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sindicato_dto_1.FilterSindicatoDto]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('relatorio/regioes'),
    (0, swagger_1.ApiOperation)({ summary: 'Relatório por região', description: 'Agrupa sindicatos por região com médias de piso e dissídio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Relatório agrupado por região' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "relatorioPorRegiao", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar sindicato por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sindicato encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sindicato não encontrado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.PROJECT_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar sindicato' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sindicato criado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sindicato_dto_1.CreateSindicatoDto]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar sindicato' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sindicato atualizado' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sindicato_dto_1.UpdateSindicatoDto]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir sindicato', description: 'Bloqueia exclusão se houver colaboradores vinculados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sindicato excluído' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Sindicato possui colaboradores ativos' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('dissidio/aplicar'),
    (0, swagger_1.ApiOperation)({ summary: 'Aplicar dissídio', description: 'Aplica reajuste percentual às taxas de todos colaboradores do sindicato' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dissídio aplicado com contagem de afetados' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sindicato_dto_1.AplicarDissidioDto]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "aplicarDissidio", null);
__decorate([
    (0, common_1.Post)('simulacao/impacto-financeiro'),
    (0, swagger_1.ApiOperation)({ summary: 'Simular impacto financeiro', description: 'Simula custo total trabalhista com encargos (INSS, RAT, FGTS, férias, 13º, rescisão)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Simulação com breakdown de encargos' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sindicato_dto_1.SimulacaoTrabalhistaDto]),
    __metadata("design:returntype", void 0)
], SindicatoController.prototype, "simularImpacto", null);
exports.SindicatoController = SindicatoController = __decorate([
    (0, swagger_1.ApiTags)('Sindicatos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sindicatos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [sindicato_service_1.SindicatoService])
], SindicatoController);
//# sourceMappingURL=sindicato.controller.js.map