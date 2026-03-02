import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoFeriado {
  NACIONAL = 'NACIONAL',
  ESTADUAL = 'ESTADUAL',
  MUNICIPAL = 'MUNICIPAL',
}

export class CreateCalendarioDto {
  @IsDateString()
  data!: string;

  @IsEnum(TipoFeriado)
  tipoFeriado!: TipoFeriado;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  diaSemana!: number;

  @IsBoolean()
  @IsOptional()
  nacional?: boolean;
}

export class UpdateCalendarioDto {
  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(TipoFeriado)
  @IsOptional()
  tipoFeriado?: TipoFeriado;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}

export class FilterCalendarioDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  ano?: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsEnum(TipoFeriado)
  @IsOptional()
  tipoFeriado?: TipoFeriado;
}

export class CalculoDiasUteisDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  ano!: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  cidade?: string;
}

// ===================== BULK IMPORT FERIADOS =====================

export class BulkFeriadoItemDto {
  @IsDateString()
  data!: string;

  @IsEnum(TipoFeriado)
  tipoFeriado!: TipoFeriado;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  diaSemana!: number;

  @IsBoolean()
  @IsOptional()
  nacional?: boolean;
}

export class BulkImportFeriadoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkFeriadoItemDto)
  items!: BulkFeriadoItemDto[];

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}
