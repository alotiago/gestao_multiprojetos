import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustoMensalDto {
  @IsString()
  @IsNotEmpty()
  colaboradorId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  custoFixo?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  custoVariavel?: number;
}

export class UpdateCustoMensalDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  custoFixo?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  custoVariavel?: number;
}
