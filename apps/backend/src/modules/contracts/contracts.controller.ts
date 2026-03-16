import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contracts')
@Controller('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ═══════════════════════════════════════════
  //  CONTRATOS
  // ═══════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Listar contratos (paginado) - US 1.1' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.contractsService.findAllContratos(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @Get('disponíveis')
  @ApiOperation({ summary: 'Contratos disponíveis para novos projetos' })
  async findDisponíveis() {
    return this.contractsService.findContratosDisponíveis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de contrato com objetos e linhas - US 1.2' })
  async findById(@Param('id') id: string) {
    return this.contractsService.findContratoById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar contrato - US 1.3' })
  async create(
    @Body()
    data: {
      nomeContrato: string;
      cliente: string;
      numeroContrato: string;
      dataInicio: string;
      dataFim?: string;
      status?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.createContrato(data as any);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar contrato - US 1.4' })
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      nomeContrato?: string;
      cliente?: string;
      numeroContrato?: string;
      dataInicio?: string;
      dataFim?: string;
      status?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.updateContrato(id, data as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar contrato - soft delete' })
  async delete(@Param('id') id: string) {
    return this.contractsService.deleteContrato(id);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clonar contrato com estrutura completa - US 5.1' })
  async clone(
    @Param('id') id: string,
    @Body() data: { novoNome: string; novoNumero: string },
  ) {
    return this.contractsService.cloneContrato(id, data.novoNome, data.novoNumero);
  }

  // ═══════════════════════════════════════════
  //  OBJETOS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Post(':contratoId/objetos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar objeto contratual - US 2.1' })
  async createObjeto(
    @Param('contratoId') contratoId: string,
    @Body()
    data: {
      nome: string;
      descricao: string;
      dataInicio: string;
      dataFim?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.createObjeto({ ...data, contratoId });
  }

  @Put('objetos/:id')
  @ApiOperation({ summary: 'Atualizar objeto contratual - US 2.2' })
  async updateObjeto(
    @Param('id') id: string,
    @Body()
    data: {
      nome?: string;
      descricao?: string;
      dataInicio?: string;
      dataFim?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.updateObjeto(id, data);
  }

  @Delete('objetos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar objeto contratual - US 2.3' })
  async deleteObjeto(@Param('id') id: string) {
    return this.contractsService.deleteObjeto(id);
  }

  // ═══════════════════════════════════════════
  //  LINHAS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Post('objetos/:objetoId/linhas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar linha contratual - US 3.1' })
  async createLinha(
    @Param('objetoId') objetoContratualId: string,
    @Body()
    data: {
      descricaoItem: string;
      unidade: string;
      quantidadeAnualEstimada: number;
      valorUnitario: number;
    },
  ) {
    return this.contractsService.createLinha({
      ...data,
      objetoContratualId,
    });
  }

  @Put('linhas/:id')
  @ApiOperation({ summary: 'Atualizar linha contratual - US 3.2' })
  async updateLinha(
    @Param('id') id: string,
    @Body()
    data: {
      descricaoItem?: string;
      unidade?: string;
      quantidadeAnualEstimada?: number;
      valorUnitario?: number;
    },
  ) {
    return this.contractsService.updateLinha(id, data);
  }

  @Delete('linhas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar linha contratual - US 3.3' })
  async deleteLinha(@Param('id') id: string) {
    return this.contractsService.deleteLinha(id);
  }

  // ═══════════════════════════════════════════
  //  IMPORTAÇÃO EXCEL (US-044)
  // ═══════════════════════════════════════════

  @Get('import/template')
  @ApiOperation({ summary: 'Download template Excel para importação de contratos - US 044' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = this.contractsService.gerarTemplateExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=template_contratos.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Importar contratos via Excel (.xlsx) - US 044' })
  @UseInterceptors(FileInterceptor('file'))
  async importarExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Apenas arquivos .xlsx são aceitos');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Arquivo excede o tamanho máximo de 5 MB');
    }
    return this.contractsService.importarExcel(file.buffer);
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════

  @Get('projetos/:projectId/objetos')
  @ApiOperation({ summary: 'Listar objetos contratuais do contrato vinculado ao projeto' })
  async getObjetosByProject(@Param('projectId') projectId: string) {
    return this.contractsService.findObjetosByProject(projectId);
  }

  @Get('objetos/:objetoId/linhas')
  @ApiOperation({ summary: 'Listar linhas contratuais de um objeto contratual' })
  async getLinhasByObjeto(@Param('objetoId') objetoId: string) {
    return this.contractsService.findLinhasByObjeto(objetoId);
  }

  @Get('projetos/:projectId/resumo')
  @ApiOperation({ summary: 'Resumo contratual do projeto' })
  async getProjectSummary(@Param('projectId') projectId: string) {
    return this.contractsService.getProjectContractSummary(projectId);
  }
}
