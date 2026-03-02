import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission, PermissionsGuard, Permissions } from '../auth/permissions';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Lista todos os usuários (com paginação)
   */
  @Get()
  @Permissions(Permission.USER_LIST)
  @ApiOperation({ summary: 'Lista todos os usuários do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários recuperada com sucesso',
    schema: {
      example: {
        data: [
          {
            id: 'cid_123456',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'PMO',
            status: 'ATIVO',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.usersService.findAll(parseInt(page), parseInt(limit));
  }

  /**
   * Busca um usuário por ID
   */
  @Get(':id')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Busca um usuário específico pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    schema: {
      example: {
        id: 'cid_123456',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'PMO',
        status: 'ATIVO',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Cria um novo usuário
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.USER_CREATE)
  @ApiOperation({ summary: 'Cria um novo usuário no sistema' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Email já cadastrado ou dados inválidos',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Atualiza um usuário
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USER_UPDATE)
  @ApiOperation({ summary: 'Atualiza os dados de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deleta um usuário (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Deleta um usuário (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Usuário deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  /**
   * Ativa um usuário inativo
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USER_UPDATE)
  @ApiOperation({ summary: 'Ativa um usuário que estava inativo' })
  @ApiResponse({
    status: 200,
    description: 'Usuário ativado com sucesso',
  })
  async activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  /**
   * Muda a role de um usuário
   */
  @Post(':id/change-role')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.USER_CHANGE_ROLE)
  @ApiOperation({ summary: 'Altera a role de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Role alterada com sucesso',
  })
  async changeRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.changeRole(id, role as any);
  }

  /**
   * Retorna estatísticas de usuários
   */
  @Get('stats/overview')
  @Permissions(Permission.USER_VIEW_STATS)
  @ApiOperation({ summary: 'Retorna estatísticas dos usuários' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de usuários',
    schema: {
      example: {
        total: 10,
        ativo: 8,
        inativo: 2,
        byRole: [
          { role: 'ADMIN', count: 1 },
          { role: 'PMO', count: 3 },
        ],
      },
    },
  })
  async getStats() {
    return this.usersService.getStats();
  }
}
