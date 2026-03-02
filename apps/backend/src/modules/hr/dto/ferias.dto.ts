import {
  IsISO8601,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateFeriasDto {
  @IsISO8601()
  @IsNotEmpty()
  dataInicio!: string;

  @IsISO8601()
  @IsNotEmpty()
  dataFim!: string;

  @IsBoolean()
  @IsOptional()
  aprovado?: boolean;
}

export class UpdateFeriasDto {
  @IsISO8601()
  @IsOptional()
  dataInicio?: string;

  @IsISO8601()
  @IsOptional()
  dataFim?: string;

  @IsBoolean()
  @IsOptional()
  aprovado?: boolean;
}
