import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Permissões sistema (chave única)
 * Formato: "recurso:ação"
 */
export enum Permission {
  // === AUTH ===
  AUTH_LOGIN = 'auth:login',
  AUTH_REGISTER = 'auth:register',
  AUTH_REFRESH = 'auth:refresh',
  AUTH_LOGOUT = 'auth:logout',

  // === USERS ===
  USER_LIST = 'user:list',
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_CHANGE_ROLE = 'user:change_role',
  USER_VIEW_STATS = 'user:view_stats',

  // === PROJECTS ===
  PROJECT_LIST = 'project:list',
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_EXPORT = 'project:export',
  PROJECT_FORECAST = 'project:forecast',

  // === RESOURCES (HC) ===
  RESOURCE_LIST = 'resource:list',
  RESOURCE_CREATE = 'resource:create',
  RESOURCE_READ = 'resource:read',
  RESOURCE_UPDATE = 'resource:update',
  RESOURCE_DELETE = 'resource:delete',
  RESOURCE_MANAGE_JORNADA = 'resource:manage_jornada',
  RESOURCE_BULK_UPDATE = 'resource:bulk_update',

  // === FINANCIAL ===
  FINANCIAL_LIST = 'financial:list',
  FINANCIAL_CREATE = 'financial:create',
  FINANCIAL_READ = 'financial:read',
  FINANCIAL_UPDATE = 'financial:update',
  FINANCIAL_DELETE = 'financial:delete',
  FINANCIAL_APPROVE = 'financial:approve',
  FINANCIAL_VIEW_REPORTS = 'financial:view_reports',

  // === CONFIGURATION ===
  CONFIG_CALENDAR = 'config:calendar',
  CONFIG_SINDICATO = 'config:sindicato',
  CONFIG_INDICES = 'config:indices',
  CONFIG_SYSTEM = 'config:system',

  // === DASHBOARDS ===
  DASHBOARD_EXECUTIVE = 'dashboard:executive',
  DASHBOARD_FINANCIAL = 'dashboard:financial',
  DASHBOARD_RESOURCES = 'dashboard:resources',
  DASHBOARD_PROJECTS = 'dashboard:projects',

  // === ADMIN ===
  ADMIN_FULL_ACCESS = 'admin:full_access',
  ADMIN_VIEW_AUDIT = 'admin:view_audit',
  ADMIN_MANAGE_PERMISSIONS = 'admin:manage_permissions',
}

/**
 * Mapeamento de Roles → Permissions
 * Define quais permissões cada role tem acesso
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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

@Injectable()
export class PermissionService {
  /**
   * Obtém todas as permissões de um usuário baseado em sua role
   */
  getUserPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Verifica se um usuário tem uma permissão específica
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.getUserPermissions(role);
    return permissions.includes(permission) || permissions.includes(Permission.ADMIN_FULL_ACCESS);
  }

  /**
   * Verifica se um usuário tem TODAS as permissões listadas
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((perm) => this.hasPermission(role, perm));
  }

  /**
   * Verifica se um usuário tem PELO MENOS UMA das permissões listadas
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((perm) => this.hasPermission(role, perm));
  }

  /**
   * Retorna a descrição de uma permissão em português
   */
  getPermissionDescription(permission: Permission): string {
    const descriptions: Record<Permission, string> = {
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
  getAllPermissionsGrouped(): Record<string, Permission[]> {
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
}
