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
exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateProjectDto {
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PROJ-2026-001', description: 'Código único do projeto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Código é obrigatório' }),
    (0, class_validator_1.MaxLength)(50),
    (0, class_validator_1.Matches)(/^[A-Z0-9\-_]+$/, { message: 'Código deve conter apenas letras maiúsculas, números, hífens e underscores' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "codigo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sistema de Gestão', description: 'Nome do projeto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome é obrigatório' }),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Empresa XYZ', description: 'Nome do cliente' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Cliente é obrigatório' }),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "cliente", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'clUnit123', description: 'ID da unidade responsável' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Unidade é obrigatória' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ProjectStatus, default: client_1.ProjectStatus.ATIVO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ProjectStatus, { message: 'Status deve ser um valor válido' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'serviço', description: 'Tipo do projeto (serviço, produto, consultoria...)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tipo é obrigatório' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-01-01', description: 'Data de início do projeto (ISO 8601)' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de início deve ser uma data válida' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "dataInicio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31', description: 'Data de fim prevista (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de fim deve ser uma data válida' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "dataFim", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Descrição detalhada do projeto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "descricao", void 0);
//# sourceMappingURL=create-project.dto.js.map