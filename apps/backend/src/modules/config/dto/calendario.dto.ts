import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum FeriadoType {
  NACIONAL = 'NACIONAL',
  ESTADUAL = 'ESTADUAL',
  MUNICIPAL = 'MUNICIPAL',
}

export class CreateCalendarioDto {
  @IsDateString()
  data!: string;

  @IsEnum(FeriadoType)
  tipoFeriado!: FeriadoType;

  @IsString()
  descricao!: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsBoolean()
  nacional?: boolean;
}

export class UpdateCalendarioDto extends PartialType(CreateCalendarioDto) {}

export class FilterCalendarioDto {
  @IsOptional()
  @IsEnum(FeriadoType)
  tipoFeriado?: FeriadoType;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  ano?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;
}

export class HorasPrevistaDto {
  @IsString()
  estado!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2050)
  ano!: number;
}
