import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoRecalculo {
  IMPOSTO = 'IMPOSTO',
  CALENDARIO = 'CALENDARIO',
  TAXA_COLABORADOR = 'TAXA_COLABORADOR',
  JORNADA = 'JORNADA',
  DISSIDIO = 'DISSIDIO',
  BULK_UPDATE = 'BULK_UPDATE',
}

export enum StatusRecalculo {
  INICIADO = 'INICIADO',
  PROCESSANDO = 'PROCESSANDO',
  CONCLUIDO = 'CONCLUIDO',
  FALHOU = 'FALHOU',
  CANCELADO = 'CANCELADO',
}

export class CreateHistoricoDto {
  @ApiProperty({ enum: TipoRecalculo })
  @IsEnum(TipoRecalculo)
  tipo!: TipoRecalculo;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entidadeId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  entidadeTipo!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;
}

export class UpdateHistoricoDto {
  @ApiPropertyOptional({ enum: StatusRecalculo })
  @IsEnum(StatusRecalculo)
  @IsOptional()
  status?: StatusRecalculo;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  totalAfetados?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  processados?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  erros?: number;

  @ApiPropertyOptional()
  @IsOptional()
  detalhes?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mensagemErro?: string;
}

export class HistoricoFiltersDto {
  @ApiPropertyOptional({ enum: TipoRecalculo })
  @IsEnum(TipoRecalculo)
  @IsOptional()
  tipo?: TipoRecalculo;

  @ApiPropertyOptional({ enum: StatusRecalculo })
  @IsEnum(StatusRecalculo)
  @IsOptional()
  status?: StatusRecalculo;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  usuarioId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @ApiPropertyOptional({ default: 50 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

export class RecalculoResultDto {
  @ApiProperty()
  sucesso!: boolean;

  @ApiProperty()
  totalAfetados!: number;

  @ApiProperty()
  detalhes!: any[];

  @ApiPropertyOptional()
  mensagemErro?: string;
}
