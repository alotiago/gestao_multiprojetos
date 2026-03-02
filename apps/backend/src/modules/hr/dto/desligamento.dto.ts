import {
  IsISO8601,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateDesligamentoDto {
  @IsISO8601()
  @IsNotEmpty()
  dataDesligamento!: string;

  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
