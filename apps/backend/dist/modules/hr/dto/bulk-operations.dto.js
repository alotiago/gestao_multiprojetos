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
exports.BulkOperationResultDto = exports.BulkJornadaItemDto = exports.BulkUpdateJornadaDto = exports.BulkImportColaboradorDto = exports.BulkColaboradorItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
/**
 * DTO para cada colaborador na importação em lote
 */
class BulkColaboradorItemDto {
}
exports.BulkColaboradorItemDto = BulkColaboradorItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "matricula", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "cargo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "classe", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], BulkColaboradorItemDto.prototype, "taxaHora", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], BulkColaboradorItemDto.prototype, "cargaHoraria", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "cidade", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "sindicatoId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "dataAdmissao", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkColaboradorItemDto.prototype, "dataDesligamento", void 0);
/**
 * DTO para importação em lote de colaboradores
 */
class BulkImportColaboradorDto {
}
exports.BulkImportColaboradorDto = BulkImportColaboradorDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkColaboradorItemDto),
    __metadata("design:type", Array)
], BulkImportColaboradorDto.prototype, "colaboradores", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkImportColaboradorDto.prototype, "descricaoOperacao", void 0);
/**
 * DTO para bulk update de jornadas
 */
class BulkUpdateJornadaDto {
}
exports.BulkUpdateJornadaDto = BulkUpdateJornadaDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkJornadaItemDto),
    __metadata("design:type", Array)
], BulkUpdateJornadaDto.prototype, "jornadas", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkUpdateJornadaDto.prototype, "motivo", void 0);
class BulkJornadaItemDto {
}
exports.BulkJornadaItemDto = BulkJornadaItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BulkJornadaItemDto.prototype, "colaboradorId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], BulkJornadaItemDto.prototype, "mes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2026),
    (0, class_validator_1.Max)(2035),
    __metadata("design:type", Number)
], BulkJornadaItemDto.prototype, "ano", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkJornadaItemDto.prototype, "horasPrevistas", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkJornadaItemDto.prototype, "projectId", void 0);
/**
 * Resultado de bulk operation
 */
class BulkOperationResultDto {
}
exports.BulkOperationResultDto = BulkOperationResultDto;
//# sourceMappingURL=bulk-operations.dto.js.map