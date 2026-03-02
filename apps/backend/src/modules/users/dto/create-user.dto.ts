import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser um dos valores válidos' })
  role?: UserRole;
}
