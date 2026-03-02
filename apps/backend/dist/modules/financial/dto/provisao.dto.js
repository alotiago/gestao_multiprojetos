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
exports.FilterProvisaoDto = exports.UpdateProvisaoDto = exports.CreateProvisaoDto = exports.TipoProvisao = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoProvisao;
(function (TipoProvisao) {
    TipoProvisao["DECIMO_TERCEIRO"] = "13_salario";
    TipoProvisao["FERIAS"] = "ferias";
    TipoProvisao["RESCISAO"] = "rescisao";
    TipoProvisao["CONTINGENCIA"] = "contingencia";
    TipoProvisao["INSS_PATRONAL"] = "inss_patronal";
    TipoProvisao["FGTS"] = "fgts";
    TipoProvisao["MULTA_FGTS"] = "multa_fgts";
    TipoProvisao["OUTROS"] = "outros";
})(TipoProvisao || (exports.TipoProvisao = TipoProvisao = {}));
class CreateProvisaoDto {
}
exports.CreateProvisaoDto = CreateProvisaoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProvisaoDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoProvisao),
    __metadata("design:type", String)
], CreateProvisaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProvisaoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateProvisaoDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateProvisaoDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateProvisaoDto.prototype, "ano", void 0);
class UpdateProvisaoDto {
}
exports.UpdateProvisaoDto = UpdateProvisaoDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoProvisao),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProvisaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProvisaoDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateProvisaoDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateProvisaoDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateProvisaoDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateProvisaoDto.prototype, "ativo", void 0);
class FilterProvisaoDto {
}
exports.FilterProvisaoDto = FilterProvisaoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterProvisaoDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoProvisao),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterProvisaoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterProvisaoDto.prototype, "ano", void 0);
//# sourceMappingURL=provisao.dto.js.map