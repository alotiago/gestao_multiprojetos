import { Permission } from './permission.service';
export declare const PERMISSIONS_KEY = "permissions";
/**
 * Decorator para marcar uma rota como requerendo permissões específicas
 * @param permissions - Uma ou mais permissões requeridas
 * @returns Metadata setter
 *
 * @example
 * @Permissions(Permission.PROJECT_CREATE, Permission.PROJECT_READ)
 * async createProject() {}
 */
export declare const Permissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
/**
 * Decorator para indicar que a rota requer TODAS as permissões (AND logic)
 */
export declare const RequireAllPermissions: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
/**
 * Decorator para indicar que a rota requer QUALQUER UMA das permissões (OR logic)
 */
export declare const RequireAnyPermission: (...permissions: Permission[]) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=permissions.decorator.d.ts.map