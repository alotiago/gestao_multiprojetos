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
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FinancialService } from './financial.service';
import { CreateDespesaDto, UpdateDespesaDto, FilterDespesaDto } from './dto/despesa.dto';
import {
  CreateImpostoDto,
  UpdateImpostoDto,
  CalcularImpostosDto,
  CreateIndiceFinanceiroDto,
} from './dto/imposto.dto';
import { CreateCustoMensalDto } from './dto/custo-mensal.dto';
import { CreateProvisaoDto, UpdateProvisaoDto, FilterProvisaoDto } from './dto/provisao.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import {
  BulkImportDespesaDto,
  BulkImportProvisaoDto,
  BulkUpdateImpostoDto,
  CalculoTributarioSindicatoDto,
} from './dto/bulk-operations.dto';
import { CreateAliquotaRegimeDto, UpdateAliquotaRegimeDto } from './dto/aliquota-regime.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Financeiro')
@ApiBearerAuth()
@Controller('financial')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ===================== ALÍQUOTAS POR REGIME =====================

  @Get('aliquotas-regime')
  @ApiOperation({ summary: 'Listar alíquotas por regime tributário' })
  @Permissions(Permission.FINANCIAL_READ)
  findAliquotasRegime(@Query('regime') regime?: string) {
    return this.financialService.findAliquotasRegime(regime);
  }

  @Post('aliquotas-regime')
  @ApiOperation({ summary: 'Criar alíquota para um regime' })
  @Permissions(Permission.FINANCIAL_CREATE)
  createAliquotaRegime(@Body() dto: CreateAliquotaRegimeDto) {
    return this.financialService.createAliquotaRegime(dto);
  }

  @Put('aliquotas-regime/:id')
  @ApiOperation({ summary: 'Atualizar alíquota' })
  @Permissions(Permission.FINANCIAL_UPDATE)
  updateAliquotaRegime(@Param('id') id: string, @Body() dto: UpdateAliquotaRegimeDto) {
    return this.financialService.updateAliquotaRegime(id, dto);
  }

  @Delete('aliquotas-regime/:id')
  @ApiOperation({ summary: 'Excluir alíquota' })
  @Permissions(Permission.FINANCIAL_DELETE)
  deleteAliquotaRegime(@Param('id') id: string) {
    return this.financialService.deleteAliquotaRegime(id);
  }

  @Post('aliquotas-regime/seed')
  @ApiOperation({ summary: 'Seed alíquotas padrão', description: 'Popula tabela com valores padrão (idempotente)' })
  @Permissions(Permission.FINANCIAL_CREATE)
  seedAliquotasRegime() {
    return this.financialService.seedAliquotasRegime();
  }

  // ===================== DESPESAS =====================

  @Get('despesas')
  @ApiOperation({ summary: 'Listar despesas' })
  @Permissions(Permission.FINANCIAL_LIST)
  findDespesas(@Query() filters: FilterDespesaDto) {
    return this.financialService.findDespesas(filters);
  }

  @Get('despesas/template')
  @ApiOperation({ summary: 'Baixar template Excel para importação de despesas' })
  @Permissions(Permission.FINANCIAL_LIST)
  baixarTemplateDespesas(@Res() res: Response) {
    const buffer = this.financialService.gerarTemplateDespesas();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template_despesas.xlsx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Post('despesas/upload')
  @ApiOperation({ 
    summary: 'Importar despesas via upload de planilha Excel',
    description: 'Upload de arquivo .xlsx/.xls com validação (máx 5MB, 1000 linhas). Retorna erros por linha.'
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FINANCIAL_CREATE)
  @ApiResponse({ status: 200, description: 'Importação concluída com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido ou erros de validação' })
  uploadDespesas(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não enviado. Selecione um .xlsx/.xls para importar.');
    }

    return this.financialService.importarDespesasViaExcel(
      file.buffer,
      file.originalname,
      req.user?.sub,
    );
  }

  @Get('despesas/:id')
  @ApiOperation({ summary: 'Buscar despesa por ID' })
  @Permissions(Permission.FINANCIAL_READ)
  findDespesaById(@Param('id') id: string) {
    return this.financialService.findDespesaById(id);
  }

  @Post('despesas')
  @ApiOperation({ summary: 'Criar despesa' })
  @Permissions(Permission.FINANCIAL_CREATE)
  createDespesa(@Body() dto: CreateDespesaDto) {
    return this.financialService.createDespesa(dto);
  }

  @Put('despesas/:id')
  @ApiOperation({ summary: 'Atualizar despesa' })
  @Permissions(Permission.FINANCIAL_UPDATE)
  updateDespesa(@Param('id') id: string, @Body() dto: UpdateDespesaDto) {
    return this.financialService.updateDespesa(id, dto);
  }

  @Delete('despesas/:id')
  @ApiOperation({ summary: 'Excluir despesa' })
  @Permissions(Permission.FINANCIAL_DELETE)
  deleteDespesa(@Param('id') id: string) {
    return this.financialService.deleteDespesa(id);
  }

  // ===================== IMPOSTOS =====================

  @Get('projetos/:projectId/impostos')
  @Permissions(Permission.FINANCIAL_READ)
  findImpostos(@Param('projectId') id: string, @Query('ano') ano?: string) {
    return this.financialService.findImpostos(id, ano ? parseInt(ano, 10) : undefined);
  }

  @Post('impostos')
  @Permissions(Permission.FINANCIAL_CREATE)
  createImposto(@Body() dto: CreateImpostoDto) {
    return this.financialService.createImposto(dto);
  }

  @Put('impostos/:id')
  @Permissions(Permission.FINANCIAL_UPDATE)
  updateImposto(@Param('id') id: string, @Body() dto: UpdateImpostoDto) {
    return this.financialService.updateImposto(id, dto);
  }

  @Delete('impostos/:id')
  @Permissions(Permission.FINANCIAL_DELETE)
  deleteImposto(@Param('id') id: string) {
    return this.financialService.deleteImposto(id);
  }

  // ===================== ENGINE TRIBUTÁRIA =====================

  @Post('impostos/calcular')
  @ApiOperation({ summary: 'Calcular impostos', description: 'Engine tributária: calcula ISS, COFINS, PIS, CSLL, IR sobre valor base' })
  @Permissions(Permission.FINANCIAL_READ)
  calcularImpostos(@Body() dto: CalcularImpostosDto) {
    return this.financialService.calcularImpostos(dto);
  }

  @Post('impostos/gravar')
  @Permissions(Permission.FINANCIAL_CREATE)
  gravarImpostos(@Body() dto: CalcularImpostosDto) {
    return this.financialService.gravarImpostosCalculados(dto);
  }

  // ===================== CUSTOS MENSAIS DE PESSOAL =====================

  @Get('projetos/:projectId/custos-pessoal')
  @Permissions(Permission.FINANCIAL_READ)
  findCustosMensais(
    @Param('projectId') id: string,
    @Query('ano') ano?: string,
  ) {
    return this.financialService.findCustosMensais(id, ano ? parseInt(ano, 10) : undefined);
  }

  @Post('custos-pessoal')
  @Permissions(Permission.FINANCIAL_CREATE)
  upsertCustoMensal(@Body() dto: CreateCustoMensalDto) {
    return this.financialService.upsertCustoMensal(dto);
  }

  // ===================== ÍNDICES FINANCEIROS =====================

  @Get('indices')
  @Permissions(Permission.FINANCIAL_READ)
  findIndices(@Query('tipo') tipo?: string, @Query('ano') ano?: string) {
    return this.financialService.findIndices(tipo, ano ? parseInt(ano, 10) : undefined);
  }

  @Post('indices')
  @Permissions(Permission.CONFIG_INDICES)
  createIndice(@Body() dto: CreateIndiceFinanceiroDto) {
    return this.financialService.createIndice(dto);
  }

  // ===================== CUSTO TOTAL =====================

  @Get('projetos/:projectId/custo-total')
  @Permissions(Permission.FINANCIAL_READ)
  calcularCustoTotal(
    @Param('projectId') id: string,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
  ) {
    return this.financialService.calcularCustoTotal(id, parseInt(mes, 10), parseInt(ano, 10));
  }

  @Get('projetos/:projectId/custo-anual')
  @Permissions(Permission.FINANCIAL_READ)
  calcularCustoAnual(
    @Param('projectId') id: string,
    @Query('ano') ano: string,
  ) {
    return this.financialService.calcularCustoAnual(id, parseInt(ano, 10));
  }

  // ===================== PROVISÕES =====================

  @Get('provisoes')
  @ApiOperation({ summary: 'Listar provisões' })
  @Permissions(Permission.FINANCIAL_LIST)
  findProvisoes(@Query() filters: FilterProvisaoDto) {
    return this.financialService.findProvisoes(filters);
  }

  @Get('provisoes/:id')
  @Permissions(Permission.FINANCIAL_READ)
  findProvisaoById(@Param('id') id: string) {
    return this.financialService.findProvisaoById(id);
  }

  @Post('provisoes')
  @ApiOperation({ summary: 'Criar provisão' })
  @Permissions(Permission.FINANCIAL_CREATE)
  createProvisao(@Body() dto: CreateProvisaoDto) {
    return this.financialService.createProvisao(dto);
  }

  @Put('provisoes/:id')
  @Permissions(Permission.FINANCIAL_UPDATE)
  updateProvisao(@Param('id') id: string, @Body() dto: UpdateProvisaoDto) {
    return this.financialService.updateProvisao(id, dto);
  }

  @Delete('provisoes/:id')
  @Permissions(Permission.FINANCIAL_DELETE)
  deleteProvisao(@Param('id') id: string) {
    return this.financialService.deleteProvisao(id);
  }

  // ===================== BULK OPERATIONS =====================

  @Post('despesas/import/bulk')
  @ApiOperation({ summary: 'Importar despesas em lote', description: 'Importação bulk com audit log' })
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FINANCIAL_CREATE)
  importarDespesasEmLote(@Body() dto: BulkImportDespesaDto, @Req() req: any) {
    return this.financialService.importarDespesasEmLote(dto, req.user?.sub);
  }

  @Post('provisoes/import/bulk')
  @ApiOperation({ summary: 'Importar provisões em lote', description: 'Importação bulk com upsert e detecção de duplicatas' })
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FINANCIAL_CREATE)
  importarProvisoesEmLote(@Body() dto: BulkImportProvisaoDto, @Req() req: any) {
    return this.financialService.importarProvisoesEmLote(dto, req.user?.sub);
  }

  @Post('impostos/bulk-update')
  @ApiOperation({ summary: 'Atualizar impostos em lote', description: 'Bulk update com validação de alíquota 0-100% e detecção de novos' })
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.FINANCIAL_UPDATE)
  atualizarImpostosEmLote(@Body() dto: BulkUpdateImpostoDto, @Req() req: any) {
    return this.financialService.atualizarImpostosEmLote(dto, req.user?.sub);
  }

  // ===================== IMPACTO TRIBUTÁRIO =====================

  @Post('impacto-tributario/sindicato')
  @ApiOperation({ summary: 'Impacto tributário sindical', description: 'Calcula impacto de dissídio + IPCA nos custos com encargos' })
  @Permissions(Permission.FINANCIAL_READ)
  calcularImpactoTributario(@Body() dto: CalculoTributarioSindicatoDto) {
    return this.financialService.calcularImpactoTributarioSindicato(dto);
  }

  // ===================== CUSTO TOTAL COMPLETO =====================

  @Get('projetos/:projectId/custo-total-completo')
  @ApiOperation({ summary: 'Custo total completo', description: 'Inclui pessoal + impostos + despesas + provisões' })
  @Permissions(Permission.FINANCIAL_READ)
  calcularCustoTotalCompleto(
    @Param('projectId') id: string,
    @Query('mes') mes: string,
    @Query('ano') ano: string,
  ) {
    return this.financialService.calcularCustoTotalCompleto(
      id,
      parseInt(mes, 10),
      parseInt(ano, 10),
    );
  }

  // ===================== RECEITAS =====================

  @Get('receitas')
  @ApiOperation({ summary: 'Listar receitas' })
  @Permissions(Permission.FINANCIAL_READ)
  findAllReceitas(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.financialService.findAllReceitas(
      parseInt(page, 10),
      parseInt(limit, 10),
      ano ? parseInt(ano, 10) : undefined,
      mes ? parseInt(mes, 10) : undefined,
      projectId,
    );
  }

  @Get('projetos/:projectId/receitas')
  @ApiOperation({ summary: 'Receitas por projeto' })
  @Permissions(Permission.FINANCIAL_READ)
  findReceitasById(@Param('projectId') projectId: string, @Query('ano') ano?: string) {
    return this.financialService.findReceitasById(projectId, ano ? parseInt(ano, 10) : undefined);
  }

  @Get('objetos/:objetoContratualId/receitas')
  @ApiOperation({ summary: 'Receitas por objeto contratual (US3)' })
  @Permissions(Permission.FINANCIAL_READ)
  findReceitasByObjeto(
    @Param('objetoContratualId') objetoContratualId: string,
    @Query('ano') ano?: string,
  ) {
    return this.financialService.findReceitasByObjeto(
      objetoContratualId,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Post('receitas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar receita' })
  @Permissions(Permission.FINANCIAL_CREATE)
  createReceita(@Body() dto: CreateReceitaDto) {
    return this.financialService.createReceita(dto);
  }

  @Put('receitas/:id')
  @ApiOperation({ summary: 'Atualizar receita' })
  @Permissions(Permission.FINANCIAL_UPDATE)
  updateReceita(@Param('id') id: string, @Body() dto: UpdateReceitaDto) {
    return this.financialService.updateReceita(id, dto);
  }

  @Delete('receitas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar receita (soft delete)' })
  @Permissions(Permission.FINANCIAL_DELETE)
  deleteReceita(@Param('id') id: string) {
    return this.financialService.deleteReceita(id);
  }
}
