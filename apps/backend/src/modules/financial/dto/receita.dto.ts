import { IsString, IsDecimal, IsInt, IsOptional, Min, Max } from 'class-validator';

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

  @IsString()
  tipoReceita: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsDecimal()
  valorPrevisto: number;

  @IsOptional()
  @IsDecimal()
  valorRealizado?: number;
}

export class UpdateReceitaDto {
  @IsOptional()
  @IsDecimal()
  valorPrevisto?: number;

  @IsOptional()
  @IsDecimal()
  valorRealizado?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  tipoReceita?: string;
}
