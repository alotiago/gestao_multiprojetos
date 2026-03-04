import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecalculoService } from './recalculo.service';
import { HistoricoFiltersDto, RecalculoResultDto } from './dto/recalculo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';

@ApiTags('Recálculos')
@ApiBearerAuth()
@Controller('recalculos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RecalculoController {
  constructor(private readonly recalculoService: RecalculoService) {}

  @Post('imposto/:id')
  @ApiOperation({
    summary: 'Recalcular após alteração de imposto',
    description: 'Recalcula custos e margens de todos os projetos após alteração de alíquota de imposto',
  })
  @ApiResponse({ status: 200, description: 'Recálculo iniciado e concluído', type: RecalculoResultDto })
  @ApiResponse({ status: 404, description: 'Imposto não encontrado' })
  @Permissions(Permission.FINANCIAL_UPDATE)
  @HttpCode(HttpStatus.OK)
  async recalcularImposto(
    @Param('id') id: string,
    @Request() req: any,
    @Query('async') asyncMode?: string,
  ) {
    if (asyncMode === 'true') {
      return this.recalculoService.enfileirarRecalculoImposto(id, req.user.userId);
    }
    return this.recalculoService.recalcularPorAlteracaoImposto(id, req.user.userId);
  }

  @Post('calendario/:id')
  @ApiOperation({
    summary: 'Recalcular após alteração de calendário/feriado',
    description: 'Recalcula jornadas, FTE e custos de colaboradores afetados por alteração em feriado',
  })
  @ApiResponse({ status: 200, description: 'Recálculo iniciado e concluído', type: RecalculoResultDto })
  @ApiResponse({ status: 404, description: 'Calendário não encontrado' })
  @Permissions(Permission.CONFIG_INDICES)
  @HttpCode(HttpStatus.OK)
  async recalcularCalendario(
    @Param('id') id: string,
    @Request() req: any,
    @Query('async') asyncMode?: string,
  ) {
    if (asyncMode === 'true') {
      return this.recalculoService.enfileirarRecalculoCalendario(id, req.user.userId);
    }
    return this.recalculoService.recalcularPorAlteracaoCalendario(id, req.user.userId);
  }

  @Post('colaborador/:id/taxa')
  @ApiOperation({
    summary: 'Recalcular após alteração de taxa/salário',
    description: 'Recalcula custos de projetos que alocam o colaborador após alteração de taxa horária',
  })
  @ApiResponse({ status: 200, description: 'Recálculo iniciado e concluído', type: RecalculoResultDto })
  @ApiResponse({ status: 404, description: 'Colaborador não encontrado' })
  @Permissions(Permission.RESOURCE_UPDATE)
  @HttpCode(HttpStatus.OK)
  async recalcularTaxa(
    @Param('id') id: string,
    @Request() req: any,
    @Query('async') asyncMode?: string,
  ) {
    if (asyncMode === 'true') {
      return this.recalculoService.enfileirarRecalculoTaxa(id, req.user.userId);
    }
    return this.recalculoService.recalcularPorAlteracaoTaxa(id, req.user.userId);
  }

  @Post('sindicato/:id/dissidio')
  @ApiOperation({
    summary: 'Recalcular após aplicação de dissídio',
    description: 'Aplica reajuste de dissídio e recalcula custos de todos os colaboradores do sindicato',
  })
  @ApiResponse({ status: 200, description: 'Dissídio aplicado e recálculo concluído', type: RecalculoResultDto })
  @ApiResponse({ status: 404, description: 'Sindicato não encontrado' })
  @Permissions(Permission.RESOURCE_UPDATE)
  @HttpCode(HttpStatus.OK)
  async recalcularDissidio(
    @Param('id') id: string,
    @Request() req: any,
    @Query('async') asyncMode?: string,
  ) {
    if (asyncMode === 'true') {
      return this.recalculoService.enfileirarRecalculoDissidio(id, req.user.userId);
    }
    return this.recalculoService.recalcularPorDissidio(id, req.user.userId);
  }

  @Get('fila/:jobId/status')
  @ApiOperation({
    summary: 'Consultar status de job enfileirado',
    description: 'Retorna status atual do recálculo assíncrono na fila em memória',
  })
  @ApiResponse({ status: 200, description: 'Status do job retornado' })
  @ApiResponse({ status: 404, description: 'Job não encontrado' })
  @Permissions(Permission.PROJECT_READ)
  async statusFila(@Param('jobId') jobId: string) {
    return this.recalculoService.consultarStatusFila(jobId);
  }

  @Get('historico')
  @ApiOperation({
    summary: 'Consultar histórico de recálculos',
    description: 'Lista histórico de recálculos com filtros opcionais',
  })
  @ApiResponse({ status: 200, description: 'Lista de históricos retornada' })
  @Permissions(Permission.PROJECT_READ)
  async consultarHistorico(@Query() filters: HistoricoFiltersDto) {
    return this.recalculoService.consultarHistorico(filters);
  }

  @Get('historico/:id')
  @ApiOperation({
    summary: 'Detalhes de um recálculo específico',
    description: 'Retorna informações completas de um recálculo incluindo todos os detalhes',
  })
  @ApiResponse({ status: 200, description: 'Detalhes do recálculo' })
  @ApiResponse({ status: 404, description: 'Histórico não encontrado' })
  @Permissions(Permission.PROJECT_READ)
  async detalheRecalculo(@Param('id') id: string) {
    return this.recalculoService.detalheRecalculo(id);
  }
}
