"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.SALT_ROUNDS = 10;
    }
    /**
     * Lista todos os usuários (com paginação)
     */
    async findAll(page = 1, limit = 10) {
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
    async findById(id) {
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
            throw new common_1.NotFoundException(`Usuário com ID '${id}' não encontrado`);
        }
        return user;
    }
    /**
     * Busca um usuário por email
     */
    async findByEmail(email) {
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
    async create(createUserDto) {
        const { email, password, name, role } = createUserDto;
        // Validar email único
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email já cadastrado no sistema');
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
                role: (role || 'VIEWER'),
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
    async update(id, updateUserDto) {
        // Verificar se o usuário existe
        await this.findById(id);
        const { name, role, status, password } = updateUserDto;
        const data = {};
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
    async delete(id) {
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
    async activate(id) {
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
    async changeRole(id, newRole) {
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
    validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < minLength ||
            !hasUpperCase ||
            !hasLowerCase ||
            !hasNumbers ||
            !hasSpecialChar) {
            throw new common_1.BadRequestException('Senha deve conter: mínimo 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map