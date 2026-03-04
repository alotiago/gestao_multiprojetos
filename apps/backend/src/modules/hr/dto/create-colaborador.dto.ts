import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsISO8601,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, TipoContratacao } from '@prisma/client';

export class CreateColaboradorDto {
  @IsString()
  @IsNotEmpty()
  matricula!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  nome!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @IsString()
  @IsOptional()
  classe?: string;

  @IsEnum(TipoContratacao)
  @IsOptional()
  tipoContratacao?: TipoContratacao;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  taxaHora!: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(300)
  @Type(() => Number)
  cargaHoraria!: number;

  @IsString()
  @IsNotEmpty()
  cidade!: string;

  @IsString()
  @IsNotEmpty()
  estado!: string;

  @IsString()
  @IsOptional()
  sindicatoId?: string;

  @IsString()
  @IsNotEmpty({ message: 'O projeto vinculado é obrigatório' })
  projectId!: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsISO8601()
  dataAdmissao!: string;
}
