import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

/**
 * DTO para cada projeto na importação em lote
 */
export class BulkProjectItemDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cliente: string;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsDateString()
  @IsNotEmpty()
  dataInicio: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}

/**
 * DTO para importação em lote de projetos
 */
export class BulkImportProjectDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProjectItemDto)
  projetos: BulkProjectItemDto[];

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}

/**
 * Resultado de importação
 */
export class BulkImportResultDto {
  totalProcessado: number;
  sucessos: number;
  erros: number;
  avisos: number;
  detalhes: {
    codigo: string;
    status: 'sucesso' | 'erro' | 'aviso';
    mensagem: string;
    projetoId?: string;
  }[];
}
