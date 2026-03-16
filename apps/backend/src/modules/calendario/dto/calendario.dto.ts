import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  IsNumber,
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

  @IsString()
  @IsNotEmpty()
  nome!: string; // Ex: "Carnaval", "Corpus Christi"

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

  @IsBoolean()
  @IsOptional()
  ehFeriado?: boolean; // true = feriado oficial, false = pont facultativo

  @IsBoolean()
  @IsOptional()
  ehRecuperavel?: boolean; // true = pont recuperável

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  percentualDesc?: number; // 100 = dia inteiro, 50 = meio período

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  criadoPor?: string;
}

export class UpdateCalendarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

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

  @IsBoolean()
  @IsOptional()
  ehFeriado?: boolean;

  @IsBoolean()
  @IsOptional()
  ehRecuperavel?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  percentualDesc?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
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

  @IsString()
  @IsNotEmpty()
  nome!: string;

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

  @IsBoolean()
  @IsOptional()
  ehFeriado?: boolean;

  @IsBoolean()
  @IsOptional()
  ehRecuperavel?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  percentualDesc?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
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
