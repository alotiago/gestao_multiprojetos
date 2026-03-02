import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { BulkAjusteJornadaDto, BulkAjusteTaxaDto } from './dto/mass-update.dto';
import { RecalculoCascataDto, RecalculoRangeDto } from './dto/recalculo-cascata.dto';
import { OperationsService } from './operations.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Operações')
@ApiBearerAuth()
@Controller('operations/mass-update')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('jornadas')
  @ApiOperation({ summary: 'Ajuste massivo de jornadas', description: 'Atualiza carga horária de múltiplos colaboradores com histórico de auditoria' })
  @ApiResponse({ status: 201, description: 'Ajuste realizado com sucesso' })
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  ajusteMassivoJornada(@Body() dto: BulkAjusteJornadaDto) {
    return this.operationsService.ajusteMassivoJornada(dto);
  }

  @Post('taxas')
  @ApiOperation({ summary: 'Ajuste massivo de taxas', description: 'Aplica reajuste percentual ou absoluto às taxas hora dos colaboradores' })
  @ApiResponse({ status: 201, description: 'Taxas ajustadas com histórico' })
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  ajusteMassivoTaxa(@Body() dto: BulkAjusteTaxaDto) {
    return this.operationsService.ajusteMassivoTaxa(dto);
  }

  @Get('historico')
  @ApiOperation({ summary: 'Listar histórico de operações', description: 'Retorna histórico de ajustes massivos e recálculos' })
  @ApiResponse({ status: 200, description: 'Lista de registros de histórico' })
  @Permissions(Permission.CONFIG_SYSTEM)
  listarHistorico(
    @Query('projectId') projectId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.operationsService.listarHistorico(projectId, limit ?? 20);
  }

  @Post('rollback/:historicoId')
  @ApiOperation({ summary: 'Rollback de operação', description: 'Reverte uma operação massiva anterior pelo ID do histórico' })
  @ApiResponse({ status: 201, description: 'Rollback realizado' })
  @ApiResponse({ status: 404, description: 'Histórico não encontrado' })
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  rollbackMassivo(@Param('historicoId') historicoId: string) {
    return this.operationsService.rollbackMassivo(historicoId);
  }

  // ===================== RECÁLCULO EM CASCATA =====================

  @Post('recalculo-cascata')
  @ApiOperation({ summary: 'Recálculo em cascata', description: 'TAXA × CALENDÁRIO × HORAS × CUSTO × FTE — recalcula para um mês específico' })
  @ApiResponse({ status: 201, description: 'Recálculo executado com detalhes por colaborador' })
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  recalculoCascata(@Body() dto: RecalculoCascataDto) {
    return this.operationsService.recalculoCascata(dto);
  }

  @Post('recalculo-cascata/range')
  @ApiOperation({ summary: 'Recálculo cascata (range)', description: 'Executa recálculo cascata para um intervalo de meses' })
  @ApiResponse({ status: 201, description: 'Resultados para cada mês do range' })
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  recalculoCascataRange(@Body() dto: RecalculoRangeDto) {
    return this.operationsService.recalculoCascataRange(dto);
  }
}
