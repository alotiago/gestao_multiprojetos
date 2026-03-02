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
import { SindicatoService } from './sindicato.service';
import {
  CreateSindicatoDto,
  UpdateSindicatoDto,
  FilterSindicatoDto,
  AplicarDissidioDto,
  SimulacaoTrabalhistaDto,
} from './dto/sindicato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';

@ApiTags('Sindicatos')
@ApiBearerAuth()
@Controller('sindicatos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SindicatoController {
  constructor(private readonly sindicatoService: SindicatoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sindicatos', description: 'Lista sindicatos com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de sindicatos' })
  @Permissions(Permission.PROJECT_LIST)
  findAll(@Query() filters: FilterSindicatoDto) {
    return this.sindicatoService.findAll(filters);
  }

  @Get('relatorio/regioes')
  @ApiOperation({ summary: 'Relatório por região', description: 'Agrupa sindicatos por região com médias de piso e dissídio' })
  @ApiResponse({ status: 200, description: 'Relatório agrupado por região' })
  @Permissions(Permission.PROJECT_READ)
  relatorioPorRegiao() {
    return this.sindicatoService.relatorioPorRegiao();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sindicato por ID' })
  @ApiResponse({ status: 200, description: 'Sindicato encontrado' })
  @ApiResponse({ status: 404, description: 'Sindicato não encontrado' })
  @Permissions(Permission.PROJECT_READ)
  findById(@Param('id') id: string) {
    return this.sindicatoService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar sindicato' })
  @ApiResponse({ status: 201, description: 'Sindicato criado' })
  @Permissions(Permission.CONFIG_INDICES)
  create(@Body() dto: CreateSindicatoDto) {
    return this.sindicatoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar sindicato' })
  @ApiResponse({ status: 200, description: 'Sindicato atualizado' })
  @Permissions(Permission.CONFIG_INDICES)
  update(@Param('id') id: string, @Body() dto: UpdateSindicatoDto) {
    return this.sindicatoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir sindicato', description: 'Bloqueia exclusão se houver colaboradores vinculados' })
  @ApiResponse({ status: 200, description: 'Sindicato excluído' })
  @ApiResponse({ status: 409, description: 'Sindicato possui colaboradores ativos' })
  @Permissions(Permission.CONFIG_INDICES)
  delete(@Param('id') id: string) {
    return this.sindicatoService.delete(id);
  }

  // ===================== DISSÍDIO =====================

  @Post('dissidio/aplicar')
  @ApiOperation({ summary: 'Aplicar dissídio', description: 'Aplica reajuste percentual às taxas de todos colaboradores do sindicato' })
  @ApiResponse({ status: 200, description: 'Dissídio aplicado com contagem de afetados' })
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.CONFIG_INDICES)
  aplicarDissidio(@Body() dto: AplicarDissidioDto) {
    return this.sindicatoService.aplicarDissidio(dto);
  }

  // ===================== SIMULAÇÃO =====================

  @Post('simulacao/impacto-financeiro')
  @ApiOperation({ summary: 'Simular impacto financeiro', description: 'Simula custo total trabalhista com encargos (INSS, RAT, FGTS, férias, 13º, rescisão)' })
  @ApiResponse({ status: 201, description: 'Simulação com breakdown de encargos' })
  @Permissions(Permission.FINANCIAL_READ)
  simularImpacto(@Body() dto: SimulacaoTrabalhistaDto) {
    return this.sindicatoService.simularImpactoFinanceiro(dto);
  }
}
