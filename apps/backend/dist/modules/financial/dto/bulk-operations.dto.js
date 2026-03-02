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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperationResultDto = exports.CalculoTributarioSindicatoDto = exports.BulkImportProvisaoDto = exports.BulkProvisaoItemDto = exports.BulkImportDespesaDto = exports.BulkDespesaItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const despesa_dto_1 = require("./despesa.dto");
const provisao_dto_1 = require("./provisao.dto");
// ===================== BULK IMPORT DESPESAS =====================
class BulkDespesaItemDto {
}
exports.BulkDespesaItemDto = BulkDespesaItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkDespesaItemDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(despesa_dto_1.TipoDespesa),
    __metadata("design:type", String)
], BulkDespesaItemDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkDespesaItemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkDespesaItemDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkDespesaItemDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkDespesaItemDto.prototype, "ano", void 0);
class BulkImportDespesaDto {
}
exports.BulkImportDespesaDto = BulkImportDespesaDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => BulkDespesaItemDto),
    __metadata("design:type", Array)
], BulkImportDespesaDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkImportDespesaDto.prototype, "descricaoOperacao", void 0);
// ===================== BULK IMPORT PROVISÕES =====================
class BulkProvisaoItemDto {
}
exports.BulkProvisaoItemDto = BulkProvisaoItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkProvisaoItemDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(provisao_dto_1.TipoProvisao),
    __metadata("design:type", String)
], BulkProvisaoItemDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkProvisaoItemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkProvisaoItemDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkProvisaoItemDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkProvisaoItemDto.prototype, "ano", void 0);
class BulkImportProvisaoDto {
}
exports.BulkImportProvisaoDto = BulkImportProvisaoDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => BulkProvisaoItemDto),
    __metadata("design:type", Array)
], BulkImportProvisaoDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkImportProvisaoDto.prototype, "descricaoOperacao", void 0);
// ===================== CÁLCULO TRIBUTÁRIO POR SINDICATO =====================
class CalculoTributarioSindicatoDto {
}
exports.CalculoTributarioSindicatoDto = CalculoTributarioSindicatoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CalculoTributarioSindicatoDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculoTributarioSindicatoDto.prototype, "receitaBruta", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalculoTributarioSindicatoDto.prototype, "sindicatoId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalculoTributarioSindicatoDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculoTributarioSindicatoDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculoTributarioSindicatoDto.prototype, "ano", void 0);
// ===================== RESULTADO BULK =====================
class BulkOperationResultDto {
}
exports.BulkOperationResultDto = BulkOperationResultDto;
//# sourceMappingURL=bulk-operations.dto.js.map