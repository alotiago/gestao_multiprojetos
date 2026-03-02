import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    private readonly SALT_ROUNDS;
    constructor(prisma: PrismaService);
    /**
     * Lista todos os usuários (com paginação)
     */
    findAll(page?: number, limit?: number): Promise<{
        data: {
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            name: string;
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            ativo: boolean;
            createdAt: Date;
            lastLogin: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Busca um usuário por ID
     */
    findById(id: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        lastLogin: Date | null;
    }>;
    /**
     * Busca um usuário por email
     */
    findByEmail(email: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        lastLogin: Date | null;
    } | null>;
    /**
     * Cria um novo usuário
     */
    create(createUserDto: CreateUserDto): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    /**
     * Atualiza um usuário
     */
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Deleta um usuário (soft delete)
     */
    delete(id: string): Promise<{
        message: string;
        user: {
            email: string;
            name: string;
            id: string;
        };
    }>;
    /**
     * Ativa um usuário que estava inativo
     */
    activate(id: string): Promise<{
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    /**
     * Muda a role de um usuário (Admin only)
     */
    changeRole(id: string, newRole: UserRole): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
    }>;
    /**
     * Valida a força da senha
     * Requisitos: mínimo 8 caracteres, letra maiúscula, letra minúscula, número
     */
    private validatePasswordStrength;
    /**
     * Retorna estatísticas de usuários (Admin only)
     */
    getStats(): Promise<{
        total: number;
        ativo: number;
        inativo: number;
        byRole: {
            role: import(".prisma/client").$Enums.UserRole;
            count: number;
        }[];
    }>;
}
//# sourceMappingURL=users.service.d.ts.map