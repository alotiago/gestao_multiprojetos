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
     * Ativa um usuário inativo
     */
    activate(id: string): Promise<{
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
    }>;
    /**
     * Muda a role de um usuário
     */
    changeRole(id: string, role: string): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
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