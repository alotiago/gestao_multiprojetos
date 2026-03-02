import { UserRole } from '@prisma/client';
/**
 * Permissões sistema (chave única)
 * Formato: "recurso:ação"
 */
export declare enum Permission {
    AUTH_LOGIN = "auth:login",
    AUTH_REGISTER = "auth:register",
    AUTH_REFRESH = "auth:refresh",
    AUTH_LOGOUT = "auth:logout",
    USER_LIST = "user:list",
    USER_CREATE = "user:create",
    USER_READ = "user:read",
    USER_UPDATE = "user:update",
    USER_DELETE = "user:delete",
    USER_CHANGE_ROLE = "user:change_role",
    USER_VIEW_STATS = "user:view_stats",
    PROJECT_LIST = "project:list",
    PROJECT_CREATE = "project:create",
    PROJECT_READ = "project:read",
    PROJECT_UPDATE = "project:update",
    PROJECT_DELETE = "project:delete",
    PROJECT_EXPORT = "project:export",
    PROJECT_FORECAST = "project:forecast",
    RESOURCE_LIST = "resource:list",
    RESOURCE_CREATE = "resource:create",
    RESOURCE_READ = "resource:read",
    RESOURCE_UPDATE = "resource:update",
    RESOURCE_DELETE = "resource:delete",
    RESOURCE_MANAGE_JORNADA = "resource:manage_jornada",
    RESOURCE_BULK_UPDATE = "resource:bulk_update",
    FINANCIAL_LIST = "financial:list",
    FINANCIAL_CREATE = "financial:create",
    FINANCIAL_READ = "financial:read",
    FINANCIAL_UPDATE = "financial:update",
    FINANCIAL_DELETE = "financial:delete",
    FINANCIAL_APPROVE = "financial:approve",
    FINANCIAL_VIEW_REPORTS = "financial:view_reports",
    CONFIG_CALENDAR = "config:calendar",
    CONFIG_SINDICATO = "config:sindicato",
    CONFIG_INDICES = "config:indices",
    CONFIG_SYSTEM = "config:system",
    DASHBOARD_EXECUTIVE = "dashboard:executive",
    DASHBOARD_FINANCIAL = "dashboard:financial",
    DASHBOARD_RESOURCES = "dashboard:resources",
    DASHBOARD_PROJECTS = "dashboard:projects",
    ADMIN_FULL_ACCESS = "admin:full_access",
    ADMIN_VIEW_AUDIT = "admin:view_audit",
    ADMIN_MANAGE_PERMISSIONS = "admin:manage_permissions"
}
/**
 * Mapeamento de Roles → Permissions
 * Define quais permissões cada role tem acesso
 */
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
export declare class PermissionService {
    /**
     * Obtém todas as permissões de um usuário baseado em sua role
     */
    getUserPermissions(role: UserRole): Permission[];
    /**
     * Verifica se um usuário tem uma permissão específica
     */
    hasPermission(role: UserRole, permission: Permission): boolean;
    /**
     * Verifica se um usuário tem TODAS as permissões listadas
     */
    hasAllPermissions(role: UserRole, permissions: Permission[]): boolean;
    /**
     * Verifica se um usuário tem PELO MENOS UMA das permissões listadas
     */
    hasAnyPermission(role: UserRole, permissions: Permission[]): boolean;
    /**
     * Retorna a descrição de uma permissão em português
     */
    getPermissionDescription(permission: Permission): string;
    /**
     * Retorna todas as permissões categorizadas por tipo
     */
    getAllPermissionsGrouped(): Record<string, Permission[]>;
}
//# sourceMappingURL=permission.service.d.ts.map