import { IsString, IsOptional, IsIn, IsBoolean, IsDateString } from 'class-validator';

// ── Status Report ───────────────────────────────────────────

export class CreateStatusReportDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsIn(['green', 'yellow', 'red'])
  status: string;

  @IsOptional()
  @IsString()
  gargalo?: string;

  @IsOptional()
  @IsString()
  detalheGargalo?: string;

  @IsOptional()
  @IsString()
  acaoCLevel?: string;

  @IsOptional()
  @IsString()
  responsavel?: string;
}

export class UpdateStatusReportDto {
  @IsOptional()
  @IsString()
  @IsIn(['green', 'yellow', 'red'])
  status?: string;

  @IsOptional()
  @IsString()
  gargalo?: string;

  @IsOptional()
  @IsString()
  detalheGargalo?: string;

  @IsOptional()
  @IsString()
  acaoCLevel?: string;

  @IsOptional()
  @IsString()
  responsavel?: string;
}

// ── Go-Live ─────────────────────────────────────────────────

export class CreateGoLiveDto {
  @IsString()
  projectId: string;

  @IsDateString()
  dataGoLive: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UpdateGoLiveDto {
  @IsOptional()
  @IsDateString()
  dataGoLive?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  concluido?: boolean;
}
