"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = exports.ROLE_PERMISSIONS = exports.Permission = void 0;
const common_1 = require("@nestjs/common");
/**
 * Permissões sistema (chave única)
 * Formato: "recurso:ação"
 */
var Permission;
(function (Permission) {
    // === AUTH ===
    Permission["AUTH_LOGIN"] = "auth:login";
    Permission["AUTH_REGISTER"] = "auth:register";
    Permission["AUTH_REFRESH"] = "auth:refresh";
    Permission["AUTH_LOGOUT"] = "auth:logout";
    // === USERS ===
    Permission["USER_LIST"] = "user:list";
    Permission["USER_CREATE"] = "user:create";
    Permission["USER_READ"] = "user:read";
    Permission["USER_UPDATE"] = "user:update";
    Permission["USER_DELETE"] = "user:delete";
    Permission["USER_CHANGE_ROLE"] = "user:change_role";
    Permission["USER_VIEW_STATS"] = "user:view_stats";
    // === PROJECTS ===
    Permission["PROJECT_LIST"] = "project:list";
    Permission["PROJECT_CREATE"] = "project:create";
    Permission["PROJECT_READ"] = "project:read";
    Permission["PROJECT_UPDATE"] = "project:update";
    Permission["PROJECT_DELETE"] = "project:delete";
    Permission["PROJECT_EXPORT"] = "project:export";
    Permission["PROJECT_FORECAST"] = "project:forecast";
    // === RESOURCES (HC) ===
    Permission["RESOURCE_LIST"] = "resource:list";
    Permission["RESOURCE_CREATE"] = "resource:create";
    Permission["RESOURCE_READ"] = "resource:read";
    Permission["RESOURCE_UPDATE"] = "resource:update";
    Permission["RESOURCE_DELETE"] = "resource:delete";
    Permission["RESOURCE_MANAGE_JORNADA"] = "resource:manage_jornada";
    Permission["RESOURCE_BULK_UPDATE"] = "resource:bulk_update";
    // === FINANCIAL ===
    Permission["FINANCIAL_LIST"] = "financial:list";
    Permission["FINANCIAL_CREATE"] = "financial:create";
    Permission["FINANCIAL_READ"] = "financial:read";
    Permission["FINANCIAL_UPDATE"] = "financial:update";
    Permission["FINANCIAL_DELETE"] = "financial:delete";
    Permission["FINANCIAL_APPROVE"] = "financial:approve";
    Permission["FINANCIAL_VIEW_REPORTS"] = "financial:view_reports";
    // === CONFIGURATION ===
    Permission["CONFIG_CALENDAR"] = "config:calendar";
    Permission["CONFIG_SINDICATO"] = "config:sindicato";
    Permission["CONFIG_INDICES"] = "config:indices";
    Permission["CONFIG_SYSTEM"] = "config:system";
    // === DASHBOARDS ===
    Permission["DASHBOARD_EXECUTIVE"] = "dashboard:executive";
    Permission["DASHBOARD_FINANCIAL"] = "dashboard:financial";
    Permission["DASHBOARD_RESOURCES"] = "dashboard:resources";
    Permission["DASHBOARD_PROJECTS"] = "dashboard:projects";
    // === ADMIN ===
    Permission["ADMIN_FULL_ACCESS"] = "admin:full_access";
    Permission["ADMIN_VIEW_AUDIT"] = "admin:view_audit";
    Permission["ADMIN_MANAGE_PERMISSIONS"] = "admin:manage_permissions";
})(Permission || (exports.Permission = Permission = {}));
/**
 * Mapeamento de Roles → Permissions
 * Define quais permissões cada role tem acesso
 */
exports.ROLE_PERMISSIONS = {
    ADMIN: [
        // Admin tem acesso a TUDO
        Permission.ADMIN_FULL_ACCESS,
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Users
        Permission.USER_LIST,
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_CHANGE_ROLE,
        Permission.USER_VIEW_STATS,
        // Projects
        Permission.PROJECT_LIST,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_DELETE,
        Permission.PROJECT_EXPORT,
        Permission.PROJECT_FORECAST,
        // Resources
        Permission.RESOURCE_LIST,
        Permission.RESOURCE_CREATE,
        Permission.RESOURCE_READ,
        Permission.RESOURCE_UPDATE,
        Permission.RESOURCE_DELETE,
        Permission.RESOURCE_MANAGE_JORNADA,
        Permission.RESOURCE_BULK_UPDATE,
        // Financial
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_CREATE,
        Permission.FINANCIAL_READ,
        Permission.FINANCIAL_UPDATE,
        Permission.FINANCIAL_DELETE,
        Permission.FINANCIAL_APPROVE,
        Permission.FINANCIAL_VIEW_REPORTS,
        // Configuration
        Permission.CONFIG_CALENDAR,
        Permission.CONFIG_SINDICATO,
        Permission.CONFIG_INDICES,
        Permission.CONFIG_SYSTEM,
        // Dashboards
        Permission.DASHBOARD_EXECUTIVE,
        Permission.DASHBOARD_FINANCIAL,
        Permission.DASHBOARD_RESOURCES,
        Permission.DASHBOARD_PROJECTS,
        // Admin specific
        Permission.ADMIN_VIEW_AUDIT,
        Permission.ADMIN_MANAGE_PERMISSIONS,
    ],
    PMO: [
        // PMO tem visão geral
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Users (view and update own)
        Permission.USER_READ,
        Permission.USER_LIST,
        // Projects (full)
        Permission.PROJECT_LIST,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_EXPORT,
        Permission.PROJECT_FORECAST,
        // Resources
        Permission.RESOURCE_LIST,
        Permission.RESOURCE_CREATE,
        Permission.RESOURCE_READ,
        Permission.RESOURCE_UPDATE,
        Permission.RESOURCE_MANAGE_JORNADA,
        Permission.RESOURCE_BULK_UPDATE,
        // Financial (read)
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_READ,
        Permission.FINANCIAL_VIEW_REPORTS,
        // Configuration
        Permission.CONFIG_CALENDAR,
        Permission.CONFIG_SINDICATO,
        Permission.CONFIG_INDICES,
        // Dashboards
        Permission.DASHBOARD_EXECUTIVE,
        Permission.DASHBOARD_FINANCIAL,
        Permission.DASHBOARD_RESOURCES,
        Permission.DASHBOARD_PROJECTS,
    ],
    PROJECT_MANAGER: [
        // Project Manager tem visão do projeto
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Users (read own)
        Permission.USER_READ,
        // Projects (read own)
        Permission.PROJECT_READ,
        Permission.PROJECT_LIST,
        // Resources
        Permission.RESOURCE_LIST,
        Permission.RESOURCE_READ,
        Permission.RESOURCE_MANAGE_JORNADA,
        // Financial (read)
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_READ,
        Permission.FINANCIAL_VIEW_REPORTS,
        // Dashboards (project-specific)
        Permission.DASHBOARD_PROJECTS,
    ],
    HR: [
        // HR focado em recursos
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Resources (full)
        Permission.RESOURCE_LIST,
        Permission.RESOURCE_CREATE,
        Permission.RESOURCE_READ,
        Permission.RESOURCE_UPDATE,
        Permission.RESOURCE_DELETE,
        Permission.RESOURCE_MANAGE_JORNADA,
        Permission.RESOURCE_BULK_UPDATE,
        // Financial (read)
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_READ,
        // Configuration (calendar)
        Permission.CONFIG_CALENDAR,
        // Dashboards (resources)
        Permission.DASHBOARD_RESOURCES,
    ],
    FINANCE: [
        // Finance focado em financeiro
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Projects (read)
        Permission.PROJECT_LIST,
        Permission.PROJECT_READ,
        Permission.PROJECT_FORECAST,
        // Financial (full)
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_CREATE,
        Permission.FINANCIAL_READ,
        Permission.FINANCIAL_UPDATE,
        Permission.FINANCIAL_DELETE,
        Permission.FINANCIAL_APPROVE,
        Permission.FINANCIAL_VIEW_REPORTS,
        // Configuration
        Permission.CONFIG_INDICES,
        // Dashboards
        Permission.DASHBOARD_EXECUTIVE,
        Permission.DASHBOARD_FINANCIAL,
    ],
    VIEWER: [
        // Viewer é read-only
        // Auth
        Permission.AUTH_LOGIN,
        Permission.AUTH_REFRESH,
        Permission.AUTH_LOGOUT,
        // Projects (read)
        Permission.PROJECT_LIST,
        Permission.PROJECT_READ,
        // Resources (read)
        Permission.RESOURCE_LIST,
        Permission.RESOURCE_READ,
        // Financial (read)
        Permission.FINANCIAL_LIST,
        Permission.FINANCIAL_READ,
        // Dashboards
        Permission.DASHBOARD_PROJECTS,
        Permission.DASHBOARD_RESOURCES,
    ],
};
let PermissionService = class PermissionService {
    /**
     * Obtém todas as permissões de um usuário baseado em sua role
     */
    getUserPermissions(role) {
        return exports.ROLE_PERMISSIONS[role] || [];
    }
    /**
     * Verifica se um usuário tem uma permissão específica
     */
    hasPermission(role, permission) {
        const permissions = this.getUserPermissions(role);
        return permissions.includes(permission) || permissions.includes(Permission.ADMIN_FULL_ACCESS);
    }
    /**
     * Verifica se um usuário tem TODAS as permissões listadas
     */
    hasAllPermissions(role, permissions) {
        return permissions.every((perm) => this.hasPermission(role, perm));
    }
    /**
     * Verifica se um usuário tem PELO MENOS UMA das permissões listadas
     */
    hasAnyPermission(role, permissions) {
        return permissions.some((perm) => this.hasPermission(role, perm));
    }
    /**
     * Retorna a descrição de uma permissão em português
     */
    getPermissionDescription(permission) {
        const descriptions = {
            [Permission.AUTH_LOGIN]: 'Fazer login',
            [Permission.AUTH_REGISTER]: 'Registrar nova conta',
            [Permission.AUTH_REFRESH]: 'Renovar sessão',
            [Permission.AUTH_LOGOUT]: 'Fazer logout',
            [Permission.USER_LIST]: 'Listar usuários',
            [Permission.USER_CREATE]: 'Criar usuário',
            [Permission.USER_READ]: 'Visualizar usuário',
            [Permission.USER_UPDATE]: 'Atualizar usuário',
            [Permission.USER_DELETE]: 'Deletar usuário',
            [Permission.USER_CHANGE_ROLE]: 'Alterar role de usuário',
            [Permission.USER_VIEW_STATS]: 'Visualizar estatísticas de usuários',
            [Permission.PROJECT_LIST]: 'Listar projetos',
            [Permission.PROJECT_CREATE]: 'Criar projeto',
            [Permission.PROJECT_READ]: 'Visualizar projeto',
            [Permission.PROJECT_UPDATE]: 'Atualizar projeto',
            [Permission.PROJECT_DELETE]: 'Deletar projeto',
            [Permission.PROJECT_EXPORT]: 'Exportar projeto',
            [Permission.PROJECT_FORECAST]: 'Gerar forecast',
            [Permission.RESOURCE_LIST]: 'Listar recursos',
            [Permission.RESOURCE_CREATE]: 'Criar recurso',
            [Permission.RESOURCE_READ]: 'Visualizar recurso',
            [Permission.RESOURCE_UPDATE]: 'Atualizar recurso',
            [Permission.RESOURCE_DELETE]: 'Deletar recurso',
            [Permission.RESOURCE_MANAGE_JORNADA]: 'Gerenciar jornada',
            [Permission.RESOURCE_BULK_UPDATE]: 'Atualização massiva',
            [Permission.FINANCIAL_LIST]: 'Listar dados financeiros',
            [Permission.FINANCIAL_CREATE]: 'Criar dado financeiro',
            [Permission.FINANCIAL_READ]: 'Visualizar dado financeiro',
            [Permission.FINANCIAL_UPDATE]: 'Atualizar dado financeiro',
            [Permission.FINANCIAL_DELETE]: 'Deletar dado financeiro',
            [Permission.FINANCIAL_APPROVE]: 'Aprovar financeiro',
            [Permission.FINANCIAL_VIEW_REPORTS]: 'Visualizar relatórios financeiros',
            [Permission.CONFIG_CALENDAR]: 'Configurar calendário',
            [Permission.CONFIG_SINDICATO]: 'Configurar sindicatos',
            [Permission.CONFIG_INDICES]: 'Configurar índices',
            [Permission.CONFIG_SYSTEM]: 'Configuração de sistema',
            [Permission.DASHBOARD_EXECUTIVE]: 'Dashboard executivo',
            [Permission.DASHBOARD_FINANCIAL]: 'Dashboard financeiro',
            [Permission.DASHBOARD_RESOURCES]: 'Dashboard de recursos',
            [Permission.DASHBOARD_PROJECTS]: 'Dashboard de projetos',
            [Permission.ADMIN_FULL_ACCESS]: 'Acesso total (admin)',
            [Permission.ADMIN_VIEW_AUDIT]: 'Visualizar auditoria',
            [Permission.ADMIN_MANAGE_PERMISSIONS]: 'Gerenciar permissões',
        };
        return descriptions[permission] || 'Permissão desconhecida';
    }
    /**
     * Retorna todas as permissões categorizadas por tipo
     */
    getAllPermissionsGrouped() {
        return {
            AUTENTICAÇÃO: [
                Permission.AUTH_LOGIN,
                Permission.AUTH_REGISTER,
                Permission.AUTH_REFRESH,
                Permission.AUTH_LOGOUT,
            ],
            USUÁRIOS: [
                Permission.USER_LIST,
                Permission.USER_CREATE,
                Permission.USER_READ,
                Permission.USER_UPDATE,
                Permission.USER_DELETE,
                Permission.USER_CHANGE_ROLE,
                Permission.USER_VIEW_STATS,
            ],
            PROJETOS: [
                Permission.PROJECT_LIST,
                Permission.PROJECT_CREATE,
                Permission.PROJECT_READ,
                Permission.PROJECT_UPDATE,
                Permission.PROJECT_DELETE,
                Permission.PROJECT_EXPORT,
                Permission.PROJECT_FORECAST,
            ],
            RECURSOS: [
                Permission.RESOURCE_LIST,
                Permission.RESOURCE_CREATE,
                Permission.RESOURCE_READ,
                Permission.RESOURCE_UPDATE,
                Permission.RESOURCE_DELETE,
                Permission.RESOURCE_MANAGE_JORNADA,
                Permission.RESOURCE_BULK_UPDATE,
            ],
            FINANCEIRO: [
                Permission.FINANCIAL_LIST,
                Permission.FINANCIAL_CREATE,
                Permission.FINANCIAL_READ,
                Permission.FINANCIAL_UPDATE,
                Permission.FINANCIAL_DELETE,
                Permission.FINANCIAL_APPROVE,
                Permission.FINANCIAL_VIEW_REPORTS,
            ],
            CONFIGURAÇÃO: [
                Permission.CONFIG_CALENDAR,
                Permission.CONFIG_SINDICATO,
                Permission.CONFIG_INDICES,
                Permission.CONFIG_SYSTEM,
            ],
            DASHBOARDS: [
                Permission.DASHBOARD_EXECUTIVE,
                Permission.DASHBOARD_FINANCIAL,
                Permission.DASHBOARD_RESOURCES,
                Permission.DASHBOARD_PROJECTS,
            ],
            ADMINISTRAÇÃO: [
                Permission.ADMIN_FULL_ACCESS,
                Permission.ADMIN_VIEW_AUDIT,
                Permission.ADMIN_MANAGE_PERMISSIONS,
            ],
        };
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)()
], PermissionService);
//# sourceMappingURL=permission.service.js.map