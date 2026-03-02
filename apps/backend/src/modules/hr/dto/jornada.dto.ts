import {
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJornadaDto {
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
  @Type(() => Number)
  horasPrevistas!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  horasRealizadas?: number;
}

export class UpdateJornadaDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  horasPrevistas?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  horasRealizadas?: number;
}

export class BulkJornadaDto {
  @IsNotEmpty()
  colaboradorIds!: string[];

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
  @Type(() => Number)
  horasPrevistas!: number;
}
