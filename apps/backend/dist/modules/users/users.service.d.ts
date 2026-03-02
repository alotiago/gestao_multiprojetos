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
            name: string;
            status: import(".prisma/client").$Enums.UserStatus;
            id: string;
            createdAt: Date;
            email: string;
            ativo: boolean;
            role: import(".prisma/client").$Enums.UserRole;
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
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        email: string;
        ativo: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        lastLogin: Date | null;
    }>;
    /**
     * Busca um usuário por email
     */
    findByEmail(email: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        email: string;
        ativo: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        lastLogin: Date | null;
    } | null>;
    /**
     * Cria um novo usuário
     */
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    /**
     * Atualiza um usuário
     */
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        createdAt: Date;
        email: string;
        ativo: boolean;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    /**
     * Deleta um usuário (soft delete)
     */
    delete(id: string): Promise<{
        message: string;
        user: {
            name: string;
            id: string;
            email: string;
        };
    }>;
    /**
     * Ativa um usuário que estava inativo
     */
    activate(id: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        email: string;
    }>;
    /**
     * Muda a role de um usuário (Admin only)
     */
    changeRole(id: string, newRole: UserRole): Promise<{
        name: string;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
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