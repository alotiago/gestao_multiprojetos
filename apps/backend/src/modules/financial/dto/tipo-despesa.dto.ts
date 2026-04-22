import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTipoDespesaDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}

export class UpdateTipoDespesaDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
