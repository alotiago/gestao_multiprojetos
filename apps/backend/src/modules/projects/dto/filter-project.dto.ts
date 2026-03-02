import { IsOptional, IsEnum, IsString, IsNumberString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class FilterProjectDto {
  @ApiPropertyOptional({ description: 'Filtrar por status do projeto' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Busca por nome, código ou cliente' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por unidade' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Página (padrão: 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página (padrão: 20)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Campo de ordenação', default: 'createdAt' })
  @IsOptional()
  @IsIn(['codigo', 'nome', 'cliente', 'status', 'dataInicio', 'createdAt'])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Direção da ordenação', default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
