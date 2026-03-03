import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    /**
     * Registro de novo usuário
     */
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            name: string;
            id: string;
        };
    }>;
    /**
     * Login de usuário
     */
    login(loginDto: LoginDto): Promise<any>;
    /**
     * Refresh token - gera novo access token
     */
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service").TokenPair>;
    /**
     * Logout - revoga o refresh token
     */
    logout(refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    /**
     * Valida o token atual e retorna dados do usuário
     */
    getMe(request: any): Promise<{
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        lastLogin: Date | null;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map