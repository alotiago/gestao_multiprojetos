import { IsString, IsNotEmpty, IsNumber, IsEnum, IsDateString, IsOptional, IsArray, ValidateNested, IsEmail, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '@prisma/client';

/**
 * DTO para cada colaborador na importação em lote
 */
export class BulkColaboradorItemDto {
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;

  @IsString()
  @IsOptional()
  classe?: string;

  @IsNumber()
  @IsNotEmpty()
  taxaHora: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(200)
  cargaHoraria: number; // Horas por mês

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  estado: string; // Sigla: SP, RJ, MG, etc.

  @IsString()
  @IsOptional()
  sindicatoId?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsDateString()
  @IsNotEmpty()
  dataAdmissao: string;

  @IsDateString()
  @IsOptional()
  dataDesligamento?: string;
}

/**
 * DTO para importação em lote de colaboradores
 */
export class BulkImportColaboradorDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkColaboradorItemDto)
  colaboradores: BulkColaboradorItemDto[];

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}

/**
 * DTO para bulk update de jornadas
 */
export class BulkUpdateJornadaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkJornadaItemDto)
  jornadas: BulkJornadaItemDto[];

  @IsString()
  @IsNotEmpty()
  motivo: string; // Ex: "Contratação", "Férias", "Demissão"
}

export class BulkJornadaItemDto {
  @IsString()
  @IsNotEmpty()
  colaboradorId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2026)
  @Max(2035)
  ano: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  horasPrevistas: number;

  @IsString()
  @IsOptional()
  projectId?: string; // Opcional, pode ser alocação geral
}

/**
 * Resultado de bulk operation
 */
export class BulkOperationResultDto {
  totalProcessado: number;
  sucessos: number;
  erros: number;
  avisos: number;
  detalhes: {
    identificador: string;
    status: 'sucesso' | 'erro' | 'aviso';
    mensagem: string;
    entityId?: string;
  }[];
}
