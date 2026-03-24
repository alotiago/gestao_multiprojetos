import { IsString, IsNumber, IsInt, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceitaDto {
  @IsString()
  projectId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  mes: number;

  @IsInt()
  @Min(2020)
  @Max(2099)
  @Type(() => Number)
  ano: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(36)
  @Type(() => Number)
  mesesAdicionais?: number;

  @IsOptional()
  @IsString()
  tipoReceita?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  // --- Campos opcionais para receita via contrato ---
  @IsOptional()
  @IsString()
  objetoContratualId?: string;

  @IsOptional()
  @IsString()
  linhaContratualId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantidade?: number;

  // --- Campos para receita manual ---
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorPrevisto?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorRealizado?: number;

  // --- Campos RN-003: Quantidade/Valor Realizado ---
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantidadeRealizada?: number;

  // --- Campos auto-preenchidos (read-only, do contrato) ---
  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorUnitario?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  justificativa?: string;
}

export class UpdateReceitaDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorPrevisto?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorRealizado?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  tipoReceita?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantidadeRealizada?: number;

  @IsOptional()
  @IsString()
  objetoContratualId?: string;

  @IsOptional()
  @IsString()
  linhaContratualId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  justificativa?: string;
}
