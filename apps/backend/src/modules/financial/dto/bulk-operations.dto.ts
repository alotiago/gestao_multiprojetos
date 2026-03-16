import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDespesa } from './despesa.dto';
import { TipoProvisao } from './provisao.dto';
import { TipoImposto } from './imposto.dto';

// ===================== BULK IMPORT DESPESAS =====================

export class BulkDespesaItemDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoDespesa)
  tipo!: TipoDespesa;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  valor!: number;

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
}

export class BulkImportDespesaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkDespesaItemDto)
  items!: BulkDespesaItemDto[];

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}

// ===================== BULK IMPORT PROVISÕES =====================

export class BulkProvisaoItemDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoProvisao)
  tipo!: TipoProvisao;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  valor!: number;

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
}

export class BulkImportProvisaoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkProvisaoItemDto)
  items!: BulkProvisaoItemDto[];

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}

// ===================== BULK UPDATE IMPOSTOS =====================

export class BulkImpostoItemUpdateDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(TipoImposto)
  tipo!: TipoImposto;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  aliquota!: number; // 0-100 (percentual)

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

  @IsString()
  @IsOptional()
  descricao?: string;
}

export class BulkUpdateImpostoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => BulkImpostoItemUpdateDto)
  items!: BulkImpostoItemUpdateDto[];

  @IsString()
  @IsOptional()
  motivo?: string;

  @IsString()
  @IsOptional()
  descricaoOperacao?: string;
}

// ===================== CÁLCULO TRIBUTÁRIO POR SINDICATO =====================

export class CalculoTributarioSindicatoDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  receitaBruta!: number;

  @IsString()
  @IsOptional()
  sindicatoId?: string;

  @IsString()
  @IsOptional()
  estado?: string;

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
}

// ===================== RESULTADO BULK =====================

export class BulkOperationResultDto {
  totalProcessado!: number;
  sucessos!: number;
  erros!: number;
  avisos!: number;
  detalhes!: Array<{
    indice: number;
    status: string;
    mensagem: string;
    entityId?: string;
  }>;
}
