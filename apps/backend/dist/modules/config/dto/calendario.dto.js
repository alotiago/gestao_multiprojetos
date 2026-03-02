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
exports.HorasPrevistaDto = exports.FilterCalendarioDto = exports.UpdateCalendarioDto = exports.CreateCalendarioDto = exports.FeriadoType = void 0;
const class_validator_1 = require("class-validator");
const mapped_types_1 = require("@nestjs/mapped-types");
var FeriadoType;
(function (FeriadoType) {
    FeriadoType["NACIONAL"] = "NACIONAL";
    FeriadoType["ESTADUAL"] = "ESTADUAL";
    FeriadoType["MUNICIPAL"] = "MUNICIPAL";
})(FeriadoType || (exports.FeriadoType = FeriadoType = {}));
class CreateCalendarioDto {
}
exports.CreateCalendarioDto = CreateCalendarioDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FeriadoType),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "tipoFeriado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCalendarioDto.prototype, "nacional", void 0);
class UpdateCalendarioDto extends (0, mapped_types_1.PartialType)(CreateCalendarioDto) {
}
exports.UpdateCalendarioDto = UpdateCalendarioDto;
class FilterCalendarioDto {
}
exports.FilterCalendarioDto = FilterCalendarioDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FeriadoType),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "tipoFeriado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterCalendarioDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2050),
    __metadata("design:type", Number)
], FilterCalendarioDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], FilterCalendarioDto.prototype, "mes", void 0);
class HorasPrevistaDto {
}
exports.HorasPrevistaDto = HorasPrevistaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HorasPrevistaDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], HorasPrevistaDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2050),
    __metadata("design:type", Number)
], HorasPrevistaDto.prototype, "ano", void 0);
//# sourceMappingURL=calendario.dto.js.map