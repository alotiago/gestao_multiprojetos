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
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const financial_service_1 = require("./financial.service");
const despesa_dto_1 = require("./dto/despesa.dto");
const imposto_dto_1 = require("./dto/imposto.dto");
const custo_mensal_dto_1 = require("./dto/custo-mensal.dto");
const provisao_dto_1 = require("./dto/provisao.dto");
const receita_dto_1 = require("./dto/receita.dto");
const bulk_operations_dto_1 = require("./dto/bulk-operations.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions/permissions.decorator");
const permission_service_1 = require("../auth/permissions/permission.service");
const swagger_1 = require("@nestjs/swagger");
let FinancialController = class FinancialController {
    constructor(financialService) {
        this.financialService = financialService;
    }
    // ===================== DESPESAS =====================
    findDespesas(filters) {
        return this.financialService.findDespesas(filters);
    }
    findDespesaById(id) {
        return this.financialService.findDespesaById(id);
    }
    createDespesa(dto) {
        return this.financialService.createDespesa(dto);
    }
    updateDespesa(id, dto) {
        return this.financialService.updateDespesa(id, dto);
    }
    deleteDespesa(id) {
        return this.financialService.deleteDespesa(id);
    }
    // ===================== IMPOSTOS =====================
    findImpostos(id, ano) {
        return this.financialService.findImpostos(id, ano ? parseInt(ano, 10) : undefined);
    }
    createImposto(dto) {
        return this.financialService.createImposto(dto);
    }
    updateImposto(id, dto) {
        return this.financialService.updateImposto(id, dto);
    }
    deleteImposto(id) {
        return this.financialService.deleteImposto(id);
    }
    // ===================== ENGINE TRIBUTÁRIA =====================
    calcularImpostos(dto) {
        return this.financialService.calcularImpostos(dto);
    }
    gravarImpostos(dto) {
        return this.financialService.gravarImpostosCalculados(dto);
    }
    // ===================== CUSTOS MENSAIS DE PESSOAL =====================
    findCustosMensais(id, ano) {
        return this.financialService.findCustosMensais(id, ano ? parseInt(ano, 10) : undefined);
    }
    upsertCustoMensal(dto) {
        return this.financialService.upsertCustoMensal(dto);
    }
    // ===================== ÍNDICES FINANCEIROS =====================
    findIndices(tipo, ano) {
        return this.financialService.findIndices(tipo, ano ? parseInt(ano, 10) : undefined);
    }
    createIndice(dto) {
        return this.financialService.createIndice(dto);
    }
    // ===================== CUSTO TOTAL =====================
    calcularCustoTotal(id, mes, ano) {
        return this.financialService.calcularCustoTotal(id, parseInt(mes, 10), parseInt(ano, 10));
    }
    calcularCustoAnual(id, ano) {
        return this.financialService.calcularCustoAnual(id, parseInt(ano, 10));
    }
    // ===================== PROVISÕES =====================
    findProvisoes(filters) {
        return this.financialService.findProvisoes(filters);
    }
    findProvisaoById(id) {
        return this.financialService.findProvisaoById(id);
    }
    createProvisao(dto) {
        return this.financialService.createProvisao(dto);
    }
    updateProvisao(id, dto) {
        return this.financialService.updateProvisao(id, dto);
    }
    deleteProvisao(id) {
        return this.financialService.deleteProvisao(id);
    }
    // ===================== BULK OPERATIONS =====================
    importarDespesasEmLote(dto, req) {
        return this.financialService.importarDespesasEmLote(dto, req.user?.sub);
    }
    importarProvisoesEmLote(dto, req) {
        return this.financialService.importarProvisoesEmLote(dto, req.user?.sub);
    }
    // ===================== IMPACTO TRIBUTÁRIO =====================
    calcularImpactoTributario(dto) {
        return this.financialService.calcularImpactoTributarioSindicato(dto);
    }
    // ===================== CUSTO TOTAL COMPLETO =====================
    calcularCustoTotalCompleto(id, mes, ano) {
        return this.financialService.calcularCustoTotalCompleto(id, parseInt(mes, 10), parseInt(ano, 10));
    }
    // ===================== RECEITAS =====================
    findAllReceitas(page = '1', limit = '10', ano) {
        return this.financialService.findAllReceitas(parseInt(page, 10), parseInt(limit, 10), ano ? parseInt(ano, 10) : undefined);
    }
    findReceitasById(projectId, ano) {
        return this.financialService.findReceitasById(projectId, ano ? parseInt(ano, 10) : undefined);
    }
    findReceitasByObjeto(objetoContratualId, ano) {
        return this.financialService.findReceitasByObjeto(objetoContratualId, ano ? parseInt(ano, 10) : undefined);
    }
    createReceita(dto) {
        return this.financialService.createReceita(dto);
    }
    updateReceita(id, dto) {
        return this.financialService.updateReceita(id, dto);
    }
    deleteReceita(id) {
        return this.financialService.deleteReceita(id);
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.Get)('despesas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar despesas' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_LIST),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [despesa_dto_1.FilterDespesaDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findDespesas", null);
__decorate([
    (0, common_1.Get)('despesas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar despesa por ID' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findDespesaById", null);
__decorate([
    (0, common_1.Post)('despesas'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar despesa' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [despesa_dto_1.CreateDespesaDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createDespesa", null);
__decorate([
    (0, common_1.Put)('despesas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar despesa' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, despesa_dto_1.UpdateDespesaDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "updateDespesa", null);
__decorate([
    (0, common_1.Delete)('despesas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir despesa' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "deleteDespesa", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/impostos'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findImpostos", null);
__decorate([
    (0, common_1.Post)('impostos'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [imposto_dto_1.CreateImpostoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createImposto", null);
__decorate([
    (0, common_1.Put)('impostos/:id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, imposto_dto_1.UpdateImpostoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "updateImposto", null);
__decorate([
    (0, common_1.Delete)('impostos/:id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "deleteImposto", null);
__decorate([
    (0, common_1.Post)('impostos/calcular'),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular impostos', description: 'Engine tributária: calcula ISS, COFINS, PIS, CSLL, IR sobre valor base' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [imposto_dto_1.CalcularImpostosDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calcularImpostos", null);
__decorate([
    (0, common_1.Post)('impostos/gravar'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [imposto_dto_1.CalcularImpostosDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "gravarImpostos", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/custos-pessoal'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findCustosMensais", null);
__decorate([
    (0, common_1.Post)('custos-pessoal'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [custo_mensal_dto_1.CreateCustoMensalDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "upsertCustoMensal", null);
__decorate([
    (0, common_1.Get)('indices'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findIndices", null);
__decorate([
    (0, common_1.Post)('indices'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.CONFIG_INDICES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [imposto_dto_1.CreateIndiceFinanceiroDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createIndice", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/custo-total'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calcularCustoTotal", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/custo-anual'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calcularCustoAnual", null);
__decorate([
    (0, common_1.Get)('provisoes'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar provisões' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_LIST),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [provisao_dto_1.FilterProvisaoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findProvisoes", null);
__decorate([
    (0, common_1.Get)('provisoes/:id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findProvisaoById", null);
__decorate([
    (0, common_1.Post)('provisoes'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar provisão' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [provisao_dto_1.CreateProvisaoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createProvisao", null);
__decorate([
    (0, common_1.Put)('provisoes/:id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, provisao_dto_1.UpdateProvisaoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "updateProvisao", null);
__decorate([
    (0, common_1.Delete)('provisoes/:id'),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "deleteProvisao", null);
__decorate([
    (0, common_1.Post)('despesas/import/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar despesas em lote', description: 'Importação bulk com audit log' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_operations_dto_1.BulkImportDespesaDto, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "importarDespesasEmLote", null);
__decorate([
    (0, common_1.Post)('provisoes/import/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Importar provisões em lote', description: 'Importação bulk com upsert e detecção de duplicatas' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_operations_dto_1.BulkImportProvisaoDto, Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "importarProvisoesEmLote", null);
__decorate([
    (0, common_1.Post)('impacto-tributario/sindicato'),
    (0, swagger_1.ApiOperation)({ summary: 'Impacto tributário sindical', description: 'Calcula impacto de dissídio + IPCA nos custos com encargos' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_operations_dto_1.CalculoTributarioSindicatoDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calcularImpactoTributario", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/custo-total-completo'),
    (0, swagger_1.ApiOperation)({ summary: 'Custo total completo', description: 'Inclui pessoal + impostos + despesas + provisões' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "calcularCustoTotalCompleto", null);
__decorate([
    (0, common_1.Get)('receitas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar receitas' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findAllReceitas", null);
__decorate([
    (0, common_1.Get)('projetos/:projectId/receitas'),
    (0, swagger_1.ApiOperation)({ summary: 'Receitas por projeto' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findReceitasById", null);
__decorate([
    (0, common_1.Get)('objetos/:objetoContratualId/receitas'),
    (0, swagger_1.ApiOperation)({ summary: 'Receitas por objeto contratual (US3)' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_READ),
    __param(0, (0, common_1.Param)('objetoContratualId')),
    __param(1, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "findReceitasByObjeto", null);
__decorate([
    (0, common_1.Post)('receitas'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar receita' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receita_dto_1.CreateReceitaDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createReceita", null);
__decorate([
    (0, common_1.Put)('receitas/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar receita' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_UPDATE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, receita_dto_1.UpdateReceitaDto]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "updateReceita", null);
__decorate([
    (0, common_1.Delete)('receitas/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Deletar receita (soft delete)' }),
    (0, permissions_decorator_1.Permissions)(permission_service_1.Permission.FINANCIAL_DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "deleteReceita", null);
exports.FinancialController = FinancialController = __decorate([
    (0, swagger_1.ApiTags)('Financeiro'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('financial'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map