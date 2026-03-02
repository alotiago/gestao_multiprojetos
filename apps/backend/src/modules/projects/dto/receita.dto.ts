import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReceitaDto {
  @ApiProperty({ example: 1, description: 'Mês (1-12)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  mes!: number;

  @ApiProperty({ example: 2026, description: 'Ano' })
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2035)
  ano!: number;

  @ApiProperty({ example: 'serviço', description: 'Tipo de receita' })
  @IsString()
  @IsNotEmpty()
  tipoReceita!: string;

  @ApiPropertyOptional({ example: 'Consultoria mensal' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 100000.00, description: 'Valor previsto (R$)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPrevisto!: number;

  @ApiPropertyOptional({ example: 95000.00, description: 'Valor realizado (R$)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorRealizado?: number = 0;
}

export class UpdateReceitaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoReceita?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorPrevisto?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorRealizado?: number;
}
