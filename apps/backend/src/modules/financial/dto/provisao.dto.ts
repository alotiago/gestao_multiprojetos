import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoProvisao {
  DECIMO_TERCEIRO = '13_salario',
  FERIAS = 'ferias',
  RESCISAO = 'rescisao',
  CONTINGENCIA = 'contingencia',
  INSS_PATRONAL = 'inss_patronal',
  FGTS = 'fgts',
  MULTA_FGTS = 'multa_fgts',
  OUTROS = 'outros',
}

export class CreateProvisaoDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoProvisao)
  tipo!: TipoProvisao;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  valor!: number;

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
}

export class UpdateProvisaoDto {
  @IsEnum(TipoProvisao)
  @IsOptional()
  tipo?: TipoProvisao;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  valor?: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  @Type(() => Number)
  mes?: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsOptional()
  @Type(() => Number)
  ano?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

export class FilterProvisaoDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(TipoProvisao)
  @IsOptional()
  tipo?: TipoProvisao;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  ano?: number;
}
