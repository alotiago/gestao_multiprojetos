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
     * Ativa um usuário inativo
     */
    activate(id: string): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        id: string;
        email: string;
    }>;
    /**
     * Muda a role de um usuário
     */
    changeRole(id: string, role: string): Promise<{
        name: string;
        id: string;
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