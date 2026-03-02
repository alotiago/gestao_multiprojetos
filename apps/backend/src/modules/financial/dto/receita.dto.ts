import { IsString, IsNumber, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateReceitaDto {
  @IsString()
  projectId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2020)
  @Max(2099)
  ano: number;

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
  quantidade?: number;

  // --- Campos para receita manual ---
  @IsOptional()
  @IsNumber()
  valorPrevisto?: number;

  @IsOptional()
  @IsNumber()
  valorRealizado?: number;

  // --- Campos auto-preenchidos (read-only, do contrato) ---
  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsNumber()
  valorUnitario?: number;
}

export class UpdateReceitaDto {
  @IsOptional()
  @IsNumber()
  valorPrevisto?: number;

  @IsOptional()
  @IsNumber()
  valorRealizado?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  tipoReceita?: string;

  @IsOptional()
  @IsNumber()
  quantidade?: number;

  @IsOptional()
  @IsString()
  objetoContratualId?: string;

  @IsOptional()
  @IsString()
  linhaContratualId?: string;
}
