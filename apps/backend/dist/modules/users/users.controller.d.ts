import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    /**
     * Lista todos os usuários (com paginação)
     */
    findAll(page?: string, limit?: string): Promise<{
        data: {
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            id: string;
            ativo: boolean;
            name: string;
            email: string;
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
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        id: string;
        ativo: boolean;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        lastLogin: Date | null;
    }>;
    /**
     * Cria um novo usuário
     */
    create(createUserDto: CreateUserDto): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    /**
     * Atualiza um usuário
     */
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    /**
     * Deleta um usuário (soft delete)
     */
    delete(id: string): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    /**
     * Ativa um usuário inativo
     */
    activate(id: string): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        name: string;
        email: string;
    }>;
    /**
     * Muda a role de um usuário
     */
    changeRole(id: string, role: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    /**
     * Retorna estatísticas de usuários
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
//# sourceMappingURL=users.controller.d.ts.map