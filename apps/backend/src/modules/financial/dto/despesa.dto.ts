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
  IsDateString,
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

  @IsString()
  @IsNotEmpty()
  tipo!: string;

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

  @IsString()
  @IsOptional()
  fornecedorId?: string;

  @IsDateString()
  @IsOptional()
  dataVencimento?: string;

  @IsString()
  @IsOptional()
  anexoUrl?: string;
}

export class UpdateDespesaDto {
  @IsString()
  @IsOptional()
  tipo?: string;

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

  @IsString()
  @IsOptional()
  fornecedorId?: string | null;

  @IsDateString()
  @IsOptional()
  dataVencimento?: string | null;

  @IsString()
  @IsOptional()
  anexoUrl?: string | null;
}

export class FilterDespesaDto {
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

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
