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
exports.FilterDespesaDto = exports.UpdateDespesaDto = exports.CreateDespesaDto = exports.TipoDespesa = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoDespesa;
(function (TipoDespesa) {
    TipoDespesa["FACILITIES"] = "facilities";
    TipoDespesa["FORNECEDOR"] = "fornecedor";
    TipoDespesa["ALUGUEL"] = "aluguel";
    TipoDespesa["ENDOMARKETING"] = "endomarketing";
    TipoDespesa["AMORTIZACAO"] = "amortizacao";
    TipoDespesa["RATEIO"] = "rateio";
    TipoDespesa["PROVISAO"] = "provisao";
    TipoDespesa["OUTROS"] = "outros";
})(TipoDespesa || (exports.TipoDespesa = TipoDespesa = {}));
class CreateDespesaDto {
}
exports.CreateDespesaDto = CreateDespesaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDespesaDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoDespesa),
    __metadata("design:type", String)
], CreateDespesaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDespesaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDespesaDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDespesaDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDespesaDto.prototype, "ano", void 0);
class UpdateDespesaDto {
}
exports.UpdateDespesaDto = UpdateDespesaDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoDespesa),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDespesaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDespesaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateDespesaDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateDespesaDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateDespesaDto.prototype, "ano", void 0);
class FilterDespesaDto {
}
exports.FilterDespesaDto = FilterDespesaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterDespesaDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoDespesa),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterDespesaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterDespesaDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterDespesaDto.prototype, "ano", void 0);
//# sourceMappingURL=despesa.dto.js.map