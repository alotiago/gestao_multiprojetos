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
exports.UpdateReceitaDto = exports.CreateReceitaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateReceitaDto {
    constructor() {
        this.valorRealizado = 0;
    }
}
exports.CreateReceitaDto = CreateReceitaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Mês (1-12)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreateReceitaDto.prototype, "mes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2026, description: 'Ano' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2020),
    (0, class_validator_1.Max)(2035),
    __metadata("design:type", Number)
], CreateReceitaDto.prototype, "ano", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'serviço', description: 'Tipo de receita' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReceitaDto.prototype, "tipoReceita", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Consultoria mensal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceitaDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100000.00, description: 'Valor previsto (R$)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReceitaDto.prototype, "valorPrevisto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 95000.00, description: 'Valor realizado (R$)', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReceitaDto.prototype, "valorRealizado", void 0);
class UpdateReceitaDto {
}
exports.UpdateReceitaDto = UpdateReceitaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReceitaDto.prototype, "tipoReceita", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateReceitaDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateReceitaDto.prototype, "valorPrevisto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateReceitaDto.prototype, "valorRealizado", void 0);
//# sourceMappingURL=receita.dto.js.map