import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { BulkImportProjectDto } from './dto/bulk-import-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // PROJETOS CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  @Get()
  // @Permissions(Permission.PROJECT_LIST) // TODO: temp comentado para teste
  @ApiOperation({ summary: 'Listar todos os projetos com filtros e paginação' })
  findAll(@Query() filters: FilterProjectDto) {
    return this.projectsService.findAll(filters);
  }

  @Get('carteira')
  @Permissions(Permission.PROJECT_LIST)
  @ApiOperation({ summary: 'Análise de carteira consolidada' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'unitId', required: false, type: String })
  analisarCarteira(
    @Query('ano') ano?: string,
    @Query('unitId') unitId?: string,
  ) {
    return this.projectsService.analisarCarteira(
      ano ? parseInt(ano, 10) : undefined,
      unitId,
    );
  }

  @Get(':id')
  @Permissions(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Buscar projeto por ID ou código' })
  @ApiParam({ name: 'id', description: 'ID ou código do projeto' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Post()
  @Permissions(Permission.PROJECT_CREATE)
  @ApiOperation({ summary: 'Criar novo projeto' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Post('import/bulk')
  @Permissions(Permission.PROJECT_CREATE)
  @ApiOperation({ summary: 'Importar múltiplos projetos em lote' })
  @HttpCode(HttpStatus.CREATED)
  importarEmLote(
    @Body() dto: BulkImportProjectDto,
    @Request() req: any,
  ) {
    return this.projectsService.importarEmLote(
      dto.projetos,
      req.user.id,
      dto.descricaoOperacao,
    );
  }

  @Put(':id')
  @Permissions(Permission.PROJECT_UPDATE)
  @ApiOperation({ summary: 'Atualizar projeto' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.PROJECT_DELETE)
  @ApiOperation({ summary: 'Remover projeto (soft delete)' })
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RECEITAS
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':id/receitas')
  @Permissions(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Listar receitas mensais do projeto' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  findReceitas(
    @Param('id') id: string,
    @Query('ano') ano?: string,
  ) {
    return this.projectsService.findReceitas(id, ano ? parseInt(ano, 10) : undefined);
  }

  @Post(':id/receitas')
  @Permissions(Permission.PROJECT_UPDATE)
  @ApiOperation({ summary: 'Registrar receita mensal' })
  @HttpCode(HttpStatus.CREATED)
  createReceita(@Param('id') id: string, @Body() dto: CreateReceitaDto) {
    return this.projectsService.createReceita(id, dto);
  }

  @Put(':id/receitas/:receitaId')
  @Permissions(Permission.PROJECT_UPDATE)
  @ApiOperation({ summary: 'Atualizar receita mensal' })
  updateReceita(
    @Param('id') id: string,
    @Param('receitaId') receitaId: string,
    @Body() dto: UpdateReceitaDto,
  ) {
    return this.projectsService.updateReceita(id, receitaId, dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FCST e INDICADORES
  // ─────────────────────────────────────────────────────────────────────────────

  @Get(':id/fcst')
  @Permissions(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Motor FCST — projeções até 2030' })
  @ApiQuery({ name: 'anoFim', required: false, type: Number, description: 'Ano final da projeção (padrão: 2030)' })
  calcularFcst(
    @Param('id') id: string,
    @Query('anoFim') anoFim?: string,
  ) {
    return this.projectsService.calcularFcst(id, anoFim ? parseInt(anoFim, 10) : 2030);
  }

  @Get(':id/margens')
  @Permissions(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Calcular margens e indicadores financeiros' })
  @ApiQuery({ name: 'ano', required: true, type: Number })
  @ApiQuery({ name: 'mes', required: false, type: Number })
  calcularMargens(
    @Param('id') id: string,
    @Query('ano') ano: string,
    @Query('mes') mes?: string,
  ) {
    return this.projectsService.calcularMargens(
      id,
      parseInt(ano, 10),
      mes ? parseInt(mes, 10) : undefined,
    );
  }

  @Get(':id/consolidado')
  @Permissions(Permission.PROJECT_READ)
  @ApiOperation({ summary: 'Consolidação previsto vs. realizado por mês' })
  @ApiQuery({ name: 'ano', required: true, type: Number })
  consolidar(@Param('id') id: string, @Query('ano') ano: string) {
    return this.projectsService.consolidar(id, parseInt(ano, 10));
  }
}
