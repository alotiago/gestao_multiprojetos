import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser um dos valores válidos' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'DESLIGADO'], { message: 'Status deve ser um dos valores válidos' })
  status?: string;
}
