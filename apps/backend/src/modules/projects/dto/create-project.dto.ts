import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { RegimeTributario } from '../../financial/dto/imposto.dto';

export class CreateProjectDto {
  @ApiProperty({ example: 'PROJ-2026-001', description: 'Código único do projeto' })
  @IsString()
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-_]+$/, { message: 'Código deve conter apenas letras maiúsculas, números, hífens e underscores' })
  codigo!: string;

  @ApiProperty({ example: 'Sistema de Gestão', description: 'Nome do projeto' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3)
  @MaxLength(200)
  nome!: string;

  @ApiProperty({ example: 'Empresa XYZ', description: 'Nome do cliente' })
  @IsString()
  @IsNotEmpty({ message: 'Cliente é obrigatório' })
  @MaxLength(200)
  cliente!: string;

  @ApiProperty({ example: 'clUnit123', description: 'ID da unidade responsável' })
  @IsString()
  @IsNotEmpty({ message: 'Unidade é obrigatória' })
  unitId!: string;

  @ApiProperty({ example: 'contrato123', description: 'ID do contrato obrigatório' })
  @IsString()
  @IsNotEmpty({ message: 'Contrato é obrigatório' })
  contratoId!: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.ATIVO })
  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Status deve ser um valor válido' })
  status?: ProjectStatus;

  @ApiProperty({ example: 'serviço', description: 'Tipo do projeto (serviço, produto, consultoria...)' })
  @IsString()
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @MaxLength(100)
  tipo!: string;

  @ApiProperty({ example: '2026-01-01', description: 'Data de início do projeto (ISO 8601)' })
  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  dataInicio!: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Data de fim prevista (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida' })
  dataFim?: string;

  @ApiPropertyOptional({ example: 'Descrição detalhada do projeto' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @ApiPropertyOptional({
    enum: RegimeTributario,
    default: RegimeTributario.SIMPLES_NACIONAL,
    description: 'Regime tributário do projeto',
  })
  @IsOptional()
  @IsEnum(RegimeTributario, { message: 'Regime tributário inválido' })
  regimeTributario?: RegimeTributario;
}
