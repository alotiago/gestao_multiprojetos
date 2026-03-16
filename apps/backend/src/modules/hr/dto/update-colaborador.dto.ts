import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsISO8601,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, TipoContratacao } from '@prisma/client';

export class UpdateColaboradorDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  classe?: string;

  @IsEnum(TipoContratacao)
  @IsOptional()
  tipoContratacao?: TipoContratacao;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  taxaHora?: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(300)
  @IsOptional()
  @Type(() => Number)
  cargaHoraria?: number;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  sindicatoId?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
