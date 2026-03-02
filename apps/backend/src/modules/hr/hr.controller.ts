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
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HrService } from './hr.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';
import { CreateJornadaDto, UpdateJornadaDto, BulkJornadaDto } from './dto/jornada.dto';
import { CreateFeriasDto, UpdateFeriasDto } from './dto/ferias.dto';
import { CreateDesligamentoDto } from './dto/desligamento.dto';
import { BulkImportColaboradorDto, BulkUpdateJornadaDto } from './dto/bulk-operations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';

@Controller('hr/colaboradores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ===================== COLABORADORES =====================

  @Get()
  @Permissions(Permission.RESOURCE_LIST)
  findAll(@Query() filters: FilterColaboradorDto) {
    return this.hrService.findAll(filters);
  }

  @Get(':id')
  @Permissions(Permission.RESOURCE_READ)
  findById(@Param('id') id: string) {
    return this.hrService.findById(id);
  }

  @Post()
  @Permissions(Permission.RESOURCE_CREATE)
  create(@Body() dto: CreateColaboradorDto) {
    return this.hrService.create(dto);
  }

  @Put(':id')
  @Permissions(Permission.RESOURCE_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateColaboradorDto) {
    return this.hrService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.RESOURCE_DELETE)
  delete(@Param('id') id: string) {
    return this.hrService.delete(id);
  }

  @Post('import/bulk')
  @Permissions(Permission.RESOURCE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  importarEmLote(
    @Body() dto: BulkImportColaboradorDto,
    @Request() req: any,
  ) {
    return this.hrService.importarColaboradoresEmLote(
      dto.colaboradores,
      req.user.id,
      dto.descricaoOperacao,
    );
  }

  // ===================== IMPORTAÇÃO CSV =====================

  @Post('importar/csv')
  @Permissions(Permission.RESOURCE_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  async importarCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Arquivo CSV não fornecido');
    }
    const csvContent = file.buffer.toString('utf-8');
    return this.hrService.importarCSV(csvContent);
  }

  // ===================== JORNADAS =====================

  @Get(':id/jornadas')
  @Permissions(Permission.RESOURCE_READ)
  findJornadas(
    @Param('id') id: string,
    @Query('ano') ano?: string,
  ) {
    return this.hrService.findJornadas(id, ano ? parseInt(ano, 10) : undefined);
  }

  @Post(':id/jornadas')
  @Permissions(Permission.RESOURCE_MANAGE_JORNADA)
  createJornada(@Param('id') id: string, @Body() dto: CreateJornadaDto) {
    return this.hrService.createJornada(id, dto);
  }

  @Put(':id/jornadas/:jornadaId')
  @Permissions(Permission.RESOURCE_MANAGE_JORNADA)
  updateJornada(
    @Param('id') id: string,
    @Param('jornadaId') jornadaId: string,
    @Body() dto: UpdateJornadaDto,
  ) {
    return this.hrService.updateJornada(id, jornadaId, dto);
  }

  @Post('jornadas/bulk')
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  bulkJornadas(@Body() dto: BulkJornadaDto) {
    return this.hrService.bulkCreateJornadas(dto);
  }

  @Post('jornadas/bulk-update')
  @Permissions(Permission.RESOURCE_BULK_UPDATE)
  @HttpCode(HttpStatus.CREATED)
  atualizarJornadasEmLote(
    @Body() dto: BulkUpdateJornadaDto,
    @Request() req: any,
  ) {
    return this.hrService.atualizarJornadasEmLote(
      dto.jornadas,
      dto.motivo,
      req.user.id,
    );
  }

  // ===================== FÉRIAS =====================

  @Get(':id/ferias')
  @Permissions(Permission.RESOURCE_READ)
  findFerias(@Param('id') id: string) {
    return this.hrService.findFerias(id);
  }

  @Post(':id/ferias')
  @Permissions(Permission.RESOURCE_UPDATE)
  createFerias(@Param('id') id: string, @Body() dto: CreateFeriasDto) {
    return this.hrService.createFerias(id, dto);
  }

  @Put(':id/ferias/:feriasId')
  @Permissions(Permission.RESOURCE_UPDATE)
  updateFerias(
    @Param('id') id: string,
    @Param('feriasId') feriasId: string,
    @Body() dto: UpdateFeriasDto,
  ) {
    return this.hrService.updateFerias(id, feriasId, dto);
  }

  // ===================== DESLIGAMENTO =====================

  @Post(':id/desligamento')
  @Permissions(Permission.RESOURCE_UPDATE)
  createDesligamento(
    @Param('id') id: string,
    @Body() dto: CreateDesligamentoDto,
  ) {
    return this.hrService.createDesligamento(id, dto);
  }

  // ===================== CUSTOS E FTE =====================

  @Get(':id/custo')
  @Permissions(Permission.RESOURCE_READ)
  calcularCusto(
    @Param('id') id: string,
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
  ) {
    return this.hrService.calcularCustoIndividual(id, mes, ano);
  }

  @Get(':id/projecao')
  @Permissions(Permission.RESOURCE_READ)
  projetarCustos(
    @Param('id') id: string,
    @Query('ano', ParseIntPipe) ano: number,
  ) {
    return this.hrService.projetarCustosAnuais(id, ano);
  }

  @Get('equipe/custo')
  @Permissions(Permission.RESOURCE_READ)
  calcularCustoEquipe(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
  ) {
    return this.hrService.calcularCustoEquipe(mes, ano);
  }
}
