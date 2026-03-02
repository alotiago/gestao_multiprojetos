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
exports.CreateIndiceFinanceiroDto = exports.CalcularImpostosDto = exports.UpdateImpostoDto = exports.CreateImpostoDto = exports.RegimeTributario = exports.TipoImposto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoImposto;
(function (TipoImposto) {
    TipoImposto["INSS"] = "INSS";
    TipoImposto["ISS"] = "ISS";
    TipoImposto["PIS"] = "PIS";
    TipoImposto["COFINS"] = "COFINS";
    TipoImposto["IRPJ"] = "IRPJ";
    TipoImposto["CSLL"] = "CSLL";
    TipoImposto["FGTS"] = "FGTS";
    TipoImposto["CPP"] = "CPP";
    TipoImposto["CPRB"] = "CPRB";
    TipoImposto["OUTROS"] = "OUTROS";
})(TipoImposto || (exports.TipoImposto = TipoImposto = {}));
var RegimeTributario;
(function (RegimeTributario) {
    RegimeTributario["LUCRO_REAL"] = "LUCRO_REAL";
    RegimeTributario["LUCRO_PRESUMIDO"] = "LUCRO_PRESUMIDO";
    RegimeTributario["SIMPLES_NACIONAL"] = "SIMPLES_NACIONAL";
    RegimeTributario["CPRB"] = "CPRB";
})(RegimeTributario || (exports.RegimeTributario = RegimeTributario = {}));
class CreateImpostoDto {
}
exports.CreateImpostoDto = CreateImpostoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateImpostoDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoImposto),
    __metadata("design:type", String)
], CreateImpostoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateImpostoDto.prototype, "aliquota", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateImpostoDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateImpostoDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateImpostoDto.prototype, "ano", void 0);
class UpdateImpostoDto {
}
exports.UpdateImpostoDto = UpdateImpostoDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoImposto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateImpostoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateImpostoDto.prototype, "aliquota", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateImpostoDto.prototype, "valor", void 0);
class CalcularImpostosDto {
}
exports.CalcularImpostosDto = CalcularImpostosDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CalcularImpostosDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RegimeTributario),
    __metadata("design:type", String)
], CalcularImpostosDto.prototype, "regime", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalcularImpostosDto.prototype, "receitaBruta", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalcularImpostosDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalcularImpostosDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalcularImpostosDto.prototype, "estado", void 0);
class CreateIndiceFinanceiroDto {
}
exports.CreateIndiceFinanceiroDto = CreateIndiceFinanceiroDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateIndiceFinanceiroDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateIndiceFinanceiroDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateIndiceFinanceiroDto.prototype, "mesReferencia", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateIndiceFinanceiroDto.prototype, "anoReferencia", void 0);
//# sourceMappingURL=imposto.dto.js.map