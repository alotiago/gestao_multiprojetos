import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, Matches } from 'class-validator';

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter exatamente 14 dígitos numéricos' })
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  razaoSocial!: string;

  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateFornecedorDto {
  @IsString()
  @IsOptional()
  razaoSocial?: string;

  @IsString()
  @IsOptional()
  nomeFantasia?: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
