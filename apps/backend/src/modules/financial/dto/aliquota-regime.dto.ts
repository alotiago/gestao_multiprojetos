import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum RegimeTributarioEnum {
  LUCRO_REAL = 'LUCRO_REAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  CPRB = 'CPRB',
}

export class CreateAliquotaRegimeDto {
  @IsEnum(RegimeTributarioEnum)
  regime!: RegimeTributarioEnum;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsNumber()
  @Min(0)
  @Max(1) // Fração: 0.05 = 5%
  @Type(() => Number)
  aliquota!: number;
}

export class UpdateAliquotaRegimeDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  @IsOptional()
  aliquota?: number;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
