import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSindicatoDto {
  @IsString()
  nome!: string;

  @IsString()
  regiao!: string;

  @IsNumber()
  @Type(() => Number)
  percentualDissidio!: number;

  @IsOptional()
  @IsDateString()
  dataDissidio?: string;

  @IsString()
  regimeTributario!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdateSindicatoDto extends PartialType(CreateSindicatoDto) {}

export class SimulacaoTrabalhistaDto {
  @IsString()
  sindicatoId!: string;

  @IsNumber()
  @Type(() => Number)
  salarioBase!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2050)
  ano!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  horasExtras?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  adicionalNoturno?: number;
}
