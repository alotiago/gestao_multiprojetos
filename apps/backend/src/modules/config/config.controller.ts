import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { ConfigService } from './config.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto } from './dto/calendario.dto';
import { CreateSindicatoDto, UpdateSindicatoDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';

@Controller('config')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // =============================================================
  // CALENDÁRIO
  // =============================================================

  @Get('calendarios')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  findCalendarios(@Query() filters: FilterCalendarioDto) {
    return this.configService.findCalendarios(filters);
  }

  @Get('calendarios/horas-previstas')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  calcularHorasPrevistas(
    @Query('estado') estado: string,
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
  ) {
    return this.configService.calcularHorasPrevistas(estado, mes, ano);
  }

  @Get('calendarios/:id')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  findCalendario(@Param('id') id: string) {
    return this.configService.findCalendarioById(id);
  }

  @Post('calendarios')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  createCalendario(@Body() dto: CreateCalendarioDto) {
    return this.configService.createCalendario(dto);
  }

  @Put('calendarios/:id')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  updateCalendario(@Param('id') id: string, @Body() dto: UpdateCalendarioDto) {
    return this.configService.updateCalendario(id, dto);
  }

  @Delete('calendarios/:id')
  @RequirePermissions(Permission.CONFIG_CALENDAR)
  deleteCalendario(@Param('id') id: string) {
    return this.configService.deleteCalendario(id);
  }

  // =============================================================
  // SINDICATOS
  // =============================================================

  @Get('sindicatos')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  findSindicatos(@Query('ativo') ativo?: string) {
    const ativoParsed = ativo !== undefined ? ativo === 'true' : undefined;
    return this.configService.findSindicatos(ativoParsed);
  }

  @Get('sindicatos/:id')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  findSindicato(@Param('id') id: string) {
    return this.configService.findSindicatoById(id);
  }

  @Post('sindicatos')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  createSindicato(@Body() dto: CreateSindicatoDto) {
    return this.configService.createSindicato(dto);
  }

  @Put('sindicatos/:id')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  updateSindicato(@Param('id') id: string, @Body() dto: UpdateSindicatoDto) {
    return this.configService.updateSindicato(id, dto);
  }

  @Delete('sindicatos/:id')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  deleteSindicato(@Param('id') id: string) {
    return this.configService.deleteSindicato(id);
  }

  @Post('sindicatos/:id/simular')
  @RequirePermissions(Permission.CONFIG_SINDICATO)
  simularCustoTrabalhista(@Param('id') id: string, @Body() dto: SimulacaoTrabalhistaDto) {
    dto.sindicatoId = id;
    return this.configService.simularCustoTrabalhista(dto);
  }

  // =============================================================
  // ÍNDICES FINANCEIROS
  // =============================================================

  @Get('indices')
  @RequirePermissions(Permission.CONFIG_INDICES)
  findIndices(
    @Query('tipo') tipo?: string,
    @Query('ano', new ParseIntPipe({ optional: true })) ano?: number,
  ) {
    return this.configService.findIndices(tipo, ano);
  }

  @Post('indices')
  @RequirePermissions(Permission.CONFIG_INDICES)
  createIndice(
    @Body() body: { tipo: string; valor: number; mesReferencia: number; anoReferencia: number },
  ) {
    return this.configService.createIndice(body.tipo, body.valor, body.mesReferencia, body.anoReferencia);
  }
}
