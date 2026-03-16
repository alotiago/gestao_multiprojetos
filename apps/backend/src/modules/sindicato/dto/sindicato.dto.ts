import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSindicatoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsOptional()
  sigla?: string;

  @IsString()
  @IsNotEmpty()
  regiao!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  percentualDissidio?: number;

  @IsDateString()
  @IsOptional()
  dataDissidio?: string;

  @IsString()
  @IsNotEmpty()
  regimeTributario!: string; // Ex: CPRB, LUCRO_PRESUMIDO, LUCRO_REAL

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  contacto?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsString()
  @IsOptional()
  criadoPor?: string;
}

export class UpdateSindicatoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  sigla?: string;

  @IsString()
  @IsOptional()
  regiao?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  percentualDissidio?: number;

  @IsDateString()
  @IsOptional()
  dataDissidio?: string;

  @IsString()
  @IsOptional()
  regimeTributario?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  contacto?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

export class FilterSindicatoDto {
  @IsString()
  @IsOptional()
  regiao?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

export class AplicarDissidioDto {
  @IsString()
  @IsNotEmpty()
  sindicatoId!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  percentualReajuste!: number;

  @IsDateString()
  @IsOptional()
  dataBase?: string;
}

export class SimulacaoTrabalhistaDto {
  @IsString()
  @IsNotEmpty()
  sindicatoId!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salarioBase!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  cargaHorariaMensal?: number;
}
