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
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoImposto {
  INSS = 'INSS',
  ISS = 'ISS',
  PIS = 'PIS',
  COFINS = 'COFINS',
  IRPJ = 'IRPJ',
  CSLL = 'CSLL',
  FGTS = 'FGTS',
  CPP = 'CPP',
  CPRB = 'CPRB',
  OUTROS = 'OUTROS',
}

export enum RegimeTributario {
  LUCRO_REAL = 'LUCRO_REAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  CPRB = 'CPRB', // Contribuição Previdenciária sobre Receita Bruta
}

export class CreateImpostoDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoImposto)
  tipo!: TipoImposto;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  aliquota!: number; // Em decimal, ex: 0.03 = 3%

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

export class UpdateImpostoDto {
  @IsEnum(TipoImposto)
  @IsOptional()
  tipo?: TipoImposto;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  aliquota?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  valor?: number;
}

export class CalcularImpostosDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(RegimeTributario)
  regime!: RegimeTributario;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  receitaBruta!: number;

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
  estado?: string; // Para cálculo ISS por estado
}

export class CreateIndiceFinanceiroDto {
  @IsString()
  @IsNotEmpty()
  tipo!: string; // Ex: IPCA, INPC, CDI

  @IsNumber()
  @Type(() => Number)
  valor!: number; // Em decimal, ex: 0.04 = 4%

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  mesReferencia!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  anoReferencia!: number;
}
