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
exports.BulkImportFeriadoDto = exports.BulkFeriadoItemDto = exports.CalculoDiasUteisDto = exports.FilterCalendarioDto = exports.UpdateCalendarioDto = exports.CreateCalendarioDto = exports.TipoFeriado = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TipoFeriado;
(function (TipoFeriado) {
    TipoFeriado["NACIONAL"] = "NACIONAL";
    TipoFeriado["ESTADUAL"] = "ESTADUAL";
    TipoFeriado["MUNICIPAL"] = "MUNICIPAL";
})(TipoFeriado || (exports.TipoFeriado = TipoFeriado = {}));
class CreateCalendarioDto {
}
exports.CreateCalendarioDto = CreateCalendarioDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoFeriado),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "tipoFeriado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCalendarioDto.prototype, "diaSemana", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCalendarioDto.prototype, "nacional", void 0);
class UpdateCalendarioDto {
}
exports.UpdateCalendarioDto = UpdateCalendarioDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalendarioDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoFeriado),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalendarioDto.prototype, "tipoFeriado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalendarioDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCalendarioDto.prototype, "estado", void 0);
class FilterCalendarioDto {
}
exports.FilterCalendarioDto = FilterCalendarioDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FilterCalendarioDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoFeriado),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "tipoFeriado", void 0);
class CalculoDiasUteisDto {
}
exports.CalculoDiasUteisDto = CalculoDiasUteisDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculoDiasUteisDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CalculoDiasUteisDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalculoDiasUteisDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CalculoDiasUteisDto.prototype, "cidade", void 0);
// ===================== BULK IMPORT FERIADOS =====================
class BulkFeriadoItemDto {
}
exports.BulkFeriadoItemDto = BulkFeriadoItemDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BulkFeriadoItemDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TipoFeriado),
    __metadata("design:type", String)
], BulkFeriadoItemDto.prototype, "tipoFeriado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkFeriadoItemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkFeriadoItemDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkFeriadoItemDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BulkFeriadoItemDto.prototype, "diaSemana", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BulkFeriadoItemDto.prototype, "nacional", void 0);
class BulkImportFeriadoDto {
}
exports.BulkImportFeriadoDto = BulkImportFeriadoDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => BulkFeriadoItemDto),
    __metadata("design:type", Array)
], BulkImportFeriadoDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkImportFeriadoDto.prototype, "descricaoOperacao", void 0);
//# sourceMappingURL=calendario.dto.js.map