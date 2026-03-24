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

export enum TipoDespesa {
  COMERCIAIS = 'comerciais',
  OPERACAO = 'operacao',
  TAXAS = 'taxas',
  ADMINISTRATIVAS = 'administrativas',
  SOFTWARE = 'software',
  TRIBUTARIAS = 'tributarias',
  FINANCEIRAS = 'financeiras',
  FACILITIES = 'facilities',
  FORNECEDOR = 'fornecedor',
  ALUGUEL = 'aluguel',
  ENDOMARKETING = 'endomarketing',
  AMORTIZACAO = 'amortizacao',
  RATEIO = 'rateio',
  PROVISAO = 'provisao',
  OUTROS = 'outros',
}

export enum NaturezaCusto {
  FIXO = 'FIXO',
  VARIAVEL = 'VARIAVEL',
}

export class CreateDespesaDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoDespesa)
  tipo!: TipoDespesa;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

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

  @IsInt()
  @Min(0)
  @Max(36)
  @IsOptional()
  @Type(() => Number)
  mesesAdicionais?: number;

  @IsEnum(NaturezaCusto)
  @IsOptional()
  naturezaCusto?: NaturezaCusto;

  @IsOptional()
  @Type(() => Boolean)
  replicarAteFimContrato?: boolean;
}

export class UpdateDespesaDto {
  @IsEnum(TipoDespesa)
  @IsOptional()
  tipo?: TipoDespesa;

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

  @IsEnum(NaturezaCusto)
  @IsOptional()
  naturezaCusto?: NaturezaCusto;
}

export class FilterDespesaDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(TipoDespesa)
  @IsOptional()
  tipo?: TipoDespesa;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  mes?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  ano?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
