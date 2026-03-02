import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class BulkAjusteJornadaDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2050)
  ano!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colaboradorIds?: string[];

  @ValidateIf((dto) => dto.horasRealizadas !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  horasRealizadas?: number;

  @ValidateIf((dto) => dto.percentualAjuste !== undefined)
  @Type(() => Number)
  @IsNumber()
  percentualAjuste?: number;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsOptional()
  @IsString()
  criadoPor?: string;
}

export class BulkAjusteTaxaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colaboradorIds?: string[];

  @Type(() => Number)
  @IsNumber()
  percentualAjuste!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  ano?: number;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsOptional()
  @IsString()
  criadoPor?: string;
}

export class RollbackMassivoDto {
  @IsString()
  @IsNotEmpty()
  historicoId!: string;
}
