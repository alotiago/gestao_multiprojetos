import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os usuários (com paginação)
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          ativo: true,
          createdAt: true,
          lastLogin: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um usuário por ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        ativo: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID '${id}' não encontrado`);
    }

    return user;
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        ativo: true,
        createdAt: true,
        lastLogin: true,
      },
    });
  }

  /**
   * Cria um novo usuário
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role } = createUserDto;

    // Validar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já cadastrado no sistema');
    }

    // Validar força da senha
    this.validatePasswordStrength(password);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: (role || 'VIEWER') as UserRole,
        status: 'ATIVO',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se o usuário existe
    await this.findById(id);

    const { name, role, status, password } = updateUserDto;

    const data: any = {};

    if (name) {
      data.name = name;
    }

    if (role) {
      data.role = role;
    }

    if (status) {
      data.status = status;
    }

    if (password) {
      this.validatePasswordStrength(password);
      data.password = await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    data.updatedAt = new Date();

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Deleta um usuário (soft delete)
   */
  async delete(id: string) {
    // Verificar se o usuário existe
    await this.findById(id);

    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ativo: false,
        status: 'INATIVO',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return {
      message: 'Usuário deletado com sucesso',
      user: deletedUser,
    };
  }

  /**
   * Ativa um usuário que estava inativo
   */
  async activate(id: string) {
    // Verificar se o usuário existe
    await this.findById(id);

    const activatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ativo: true,
        status: 'ATIVO',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    return activatedUser;
  }

  /**
   * Muda a role de um usuário (Admin only)
   */
  async changeRole(id: string, newRole: UserRole) {
    // Verificar se o usuário existe
    await this.findById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        role: newRole,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return updatedUser;
  }

  /**
   * Valida a força da senha
   * Requisitos: mínimo 8 caracteres, letra maiúscula, letra minúscula, número
   */
  private validatePasswordStrength(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (
      password.length < minLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumbers ||
      !hasSpecialChar
    ) {
      throw new BadRequestException(
        'Senha deve conter: mínimo 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial',
      );
    }
  }

  /**
   * Retorna estatísticas de usuários (Admin only)
   */
  async getStats() {
    const [total, ativo, inativo, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ATIVO' } }),
      this.prisma.user.count({ where: { status: 'INATIVO' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ]);

    return {
      total,
      ativo,
      inativo,
      byRole: byRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
    };
  }
}
