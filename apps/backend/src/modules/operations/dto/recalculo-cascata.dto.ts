import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RecalculoCascataDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  ano!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colaboradorIds?: string[];

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsOptional()
  @IsString()
  criadoPor?: string;
}

export class RecalculoRangeDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mesInicio!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mesFim!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  ano!: number;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsOptional()
  @IsString()
  criadoPor?: string;
}
