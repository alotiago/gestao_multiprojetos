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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CalendarioService } from './calendario.service';
import {
  CreateCalendarioDto,
  UpdateCalendarioDto,
  FilterCalendarioDto,
  CalculoDiasUteisDto,
  BulkImportFeriadoDto,
} from './dto/calendario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';

@ApiTags('Calendário')
@ApiBearerAuth()
@Controller('calendario')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar feriados', description: 'Retorna feriados filtrados por ano, estado e cidade' })
  @ApiResponse({ status: 200, description: 'Lista de feriados retornada' })
  @Permissions(Permission.PROJECT_LIST)
  findAll(@Query() filters: FilterCalendarioDto) {
    return this.calendarioService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar feriado por ID' })
  @ApiResponse({ status: 200, description: 'Feriado encontrado' })
  @ApiResponse({ status: 404, description: 'Feriado não encontrado' })
  @Permissions(Permission.PROJECT_READ)
  findById(@Param('id') id: string) {
    return this.calendarioService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar feriado' })
  @ApiResponse({ status: 201, description: 'Feriado criado com sucesso' })
  @Permissions(Permission.CONFIG_INDICES)
  create(@Body() dto: CreateCalendarioDto) {
    return this.calendarioService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar feriado' })
  @ApiResponse({ status: 200, description: 'Feriado atualizado' })
  @Permissions(Permission.CONFIG_INDICES)
  update(@Param('id') id: string, @Body() dto: UpdateCalendarioDto) {
    return this.calendarioService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir feriado' })
  @ApiResponse({ status: 200, description: 'Feriado excluído' })
  @Permissions(Permission.CONFIG_INDICES)
  delete(@Param('id') id: string) {
    return this.calendarioService.delete(id);
  }

  // ===================== ENGINE DIAS ÚTEIS =====================

  @Get('calcular/dias-uteis')
  @ApiOperation({ summary: 'Calcular dias úteis', description: 'Engine de cálculo: total dias, dias úteis, feriados em dia útil, dias úteis líquidos' })
  @ApiResponse({ status: 200, description: 'Cálculo retornado com sucesso' })
  @Permissions(Permission.PROJECT_READ)
  calcularDiasUteis(@Query() dto: CalculoDiasUteisDto) {
    return this.calendarioService.calcularDiasUteis(dto);
  }

  @Get('calcular/jornada-regiao/:estado/:ano')
  @ApiOperation({ summary: 'Calcular jornada por região', description: 'Retorna jornada mensal (12 meses) para estado/cidade' })
  @ApiResponse({ status: 200, description: 'Jornada calculada por região' })
  @Permissions(Permission.PROJECT_READ)
  calcularJornadaPorRegiao(
    @Param('estado') estado: string,
    @Param('ano') ano: string,
    @Query('cidade') cidade?: string,
  ) {
    return this.calendarioService.calcularJornadaPorRegiao(
      estado,
      parseInt(ano, 10),
      cidade,
    );
  }

  // ===================== BULK IMPORT =====================

  @Post('import/bulk')
  @ApiOperation({ summary: 'Importar feriados em lote', description: 'Importação bulk de feriados com tratamento de duplicatas' })
  @ApiResponse({ status: 200, description: 'Resultado da importação (sucessos, erros, avisos)' })
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CONFIG_INDICES)
  importarFeriadosEmLote(@Body() dto: BulkImportFeriadoDto) {
    return this.calendarioService.importarFeriadosEmLote(dto);
  }

  // ===================== SEED =====================

  @Post('seed/:ano')
  @ApiOperation({ summary: 'Seed feriados nacionais', description: 'Popula os 12 feriados nacionais brasileiros para o ano informado' })
  @ApiResponse({ status: 201, description: 'Feriados nacionais inseridos' })
  @Permissions(Permission.CONFIG_INDICES)
  seedFeriadosNacionais(@Param('ano') ano: string) {
    return this.calendarioService.seedFeriadosNacionais(parseInt(ano, 10));
  }
}
