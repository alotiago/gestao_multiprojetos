import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService, Permission, ROLE_PERMISSIONS } from './permission.service';
import { UserRole } from '@prisma/client';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionService],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  describe('getUserPermissions', () => {
    it('deve retornar todas as permissões do ADMIN', () => {
      const permissions = service.getUserPermissions('ADMIN');

      expect(permissions).toContain(Permission.ADMIN_FULL_ACCESS);
      expect(permissions).toContain(Permission.USER_CREATE);
      expect(permissions).toContain(Permission.PROJECT_DELETE);
      expect(permissions.length).toBeGreaterThan(30);
    });

    it('deve retornar permissões restritas do VIEWER', () => {
      const permissions = service.getUserPermissions('VIEWER');

      expect(permissions).toContain(Permission.AUTH_LOGIN);
      expect(permissions).toContain(Permission.PROJECT_READ);
      expect(permissions).not.toContain(Permission.USER_DELETE);
      expect(permissions).not.toContain(Permission.ADMIN_FULL_ACCESS);
    });

    it('deve retornar permissões do PMO', () => {
      const permissions = service.getUserPermissions('PMO');

      expect(permissions).toContain(Permission.PROJECT_CREATE);
      expect(permissions).toContain(Permission.RESOURCE_UPDATE);
      expect(permissions).not.toContain(Permission.ADMIN_FULL_ACCESS);
    });

    it('deve retornar permissões do HR', () => {
      const permissions = service.getUserPermissions('HR');

      expect(permissions).toContain(Permission.RESOURCE_CREATE);
      expect(permissions).toContain(Permission.RESOURCE_BULK_UPDATE);
      expect(permissions).not.toContain(Permission.PROJECT_DELETE);
    });

    it('deve retornar permissões do FINANCE', () => {
      const permissions = service.getUserPermissions('FINANCE');

      expect(permissions).toContain(Permission.FINANCIAL_APPROVE);
      expect(permissions).toContain(Permission.FINANCIAL_UPDATE);
      expect(permissions).not.toContain(Permission.RESOURCE_DELETE);
    });
  });

  describe('hasPermission', () => {
    it('ADMIN deve ter todas as permissões', () => {
      const allPermissions = Object.values(Permission);

      allPermissions.forEach((permission) => {
        expect(service.hasPermission('ADMIN', permission)).toBe(true);
      });
    });

    it('VIEWER deve ter apenas permissões de leitura', () => {
      expect(service.hasPermission('VIEWER', Permission.PROJECT_READ)).toBe(true);
      expect(service.hasPermission('VIEWER', Permission.PROJECT_DELETE)).toBe(false);
      expect(service.hasPermission('VIEWER', Permission.USER_CREATE)).toBe(false);
    });

    it('PMO deve ter USER_READ mas não USER_DELETE', () => {
      expect(service.hasPermission('PMO', Permission.USER_READ)).toBe(true);
      expect(service.hasPermission('PMO', Permission.USER_DELETE)).toBe(false);
    });

    it('HR deve ter RESOURCE_CREATE mas não PROJECT_DELETE', () => {
      expect(service.hasPermission('HR', Permission.RESOURCE_CREATE)).toBe(true);
      expect(service.hasPermission('HR', Permission.PROJECT_DELETE)).toBe(false);
    });

    it('FINANCE deve ter FINANCIAL_APPROVE mas não RESOURCE_DELETE', () => {
      expect(service.hasPermission('FINANCE', Permission.FINANCIAL_APPROVE)).toBe(true);
      expect(service.hasPermission('FINANCE', Permission.RESOURCE_DELETE)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('ADMIN deve ter TODAS as permissões de lista', () => {
      const permissions = [
        Permission.PROJECT_CREATE,
        Permission.USER_DELETE,
        Permission.FINANCIAL_APPROVE,
      ];

      expect(service.hasAllPermissions('ADMIN', permissions)).toBe(true);
    });

    it('PMO não deve ter TODAS as permissões', () => {
      const permissions = [
        Permission.PROJECT_CREATE,
        Permission.USER_DELETE, // PMO não tem isso
      ];

      expect(service.hasAllPermissions('PMO', permissions)).toBe(false);
    });

    it('VIEWER não deve ter nenhuma permissão de escrita', () => {
      const writePermissions = [Permission.PROJECT_DELETE, Permission.USER_CREATE];

      expect(service.hasAllPermissions('VIEWER', writePermissions)).toBe(false);
    });

    it('HR deve ter todas as permissões de RESOURCE', () => {
      const hrPermissions = [
        Permission.RESOURCE_CREATE,
        Permission.RESOURCE_READ,
        Permission.RESOURCE_MANAGE_JORNADA,
      ];

      expect(service.hasAllPermissions('HR', hrPermissions)).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('deve retornar true se tiver qualquer uma das permissões', () => {
      const permissions = [
        Permission.ADMIN_MANAGE_PERMISSIONS, // ADMIN tem
        Permission.RESOURCE_DELETE, // ADMIN tem
      ];

      expect(service.hasAnyPermission('ADMIN', permissions)).toBe(true);
    });

    it('VIEWER deve ter pelo menos AUTH_LOGIN', () => {
      const permissions = [
        Permission.ADMIN_MANAGE_PERMISSIONS, // VIEWER não tem
        Permission.AUTH_LOGIN, // VIEWER tem
      ];

      expect(service.hasAnyPermission('VIEWER', permissions)).toBe(true);
    });

    it('VIEWER não deve ter nenhuma das permissões admin', () => {
      const adminPermissions = [
        Permission.ADMIN_MANAGE_PERMISSIONS,
        Permission.ADMIN_VIEW_AUDIT,
      ];

      expect(service.hasAnyPermission('VIEWER', adminPermissions)).toBe(false);
    });

    it('PMO deve ter qualquer uma das permissões de projeto', () => {
      const permissions = [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_DELETE,
      ];

      expect(service.hasAnyPermission('PMO', permissions)).toBe(true);
    });
  });

  describe('getPermissionDescription', () => {
    it('deve retornar descrição em português', () => {
      expect(service.getPermissionDescription(Permission.AUTH_LOGIN)).toBe(
        'Fazer login',
      );
      expect(service.getPermissionDescription(Permission.USER_CREATE)).toBe(
        'Criar usuário',
      );
      expect(service.getPermissionDescription(Permission.PROJECT_DELETE)).toBe(
        'Deletar projeto',
      );
    });

    it('deve retornar descrição para todas as permissões', () => {
      const allPermissions = Object.values(Permission);

      allPermissions.forEach((permission) => {
        const description = service.getPermissionDescription(permission);
        expect(description).toBeTruthy();
        expect(description).not.toBe('Permissão desconhecida');
      });
    });
  });

  describe('getAllPermissionsGrouped', () => {
    it('deve retornar todas as permissões agrupadas', () => {
      const grouped = service.getAllPermissionsGrouped();

      expect(grouped).toHaveProperty('AUTENTICAÇÃO');
      expect(grouped).toHaveProperty('USUÁRIOS');
      expect(grouped).toHaveProperty('PROJETOS');
      expect(grouped).toHaveProperty('RECURSOS');
      expect(grouped).toHaveProperty('FINANCEIRO');
      expect(grouped).toHaveProperty('CONFIGURAÇÃO');
      expect(grouped).toHaveProperty('DASHBOARDS');
      expect(grouped).toHaveProperty('ADMINISTRAÇÃO');
    });

    it('deve conter permissões corretas em cada grupo', () => {
      const grouped = service.getAllPermissionsGrouped();

      expect(grouped.AUTENTICAÇÃO).toContain(Permission.AUTH_LOGIN);
      expect(grouped.USUÁRIOS).toContain(Permission.USER_CREATE);
      expect(grouped.PROJETOS).toContain(Permission.PROJECT_DELETE);
      expect(grouped.RECURSOS).toContain(Permission.RESOURCE_MANAGE_JORNADA);
      expect(grouped.FINANCEIRO).toContain(Permission.FINANCIAL_APPROVE);
    });
  });

  describe('Role Permissions Mapping', () => {
    it('deve ter definições de permissão para todas as roles', () => {
      const roles: UserRole[] = [
        'ADMIN',
        'PMO',
        'PROJECT_MANAGER',
        'HR',
        'FINANCE',
        'VIEWER',
      ];

      roles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
        expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
      });
    });

    it('ADMIN deve ter mais permissões que outras roles', () => {
      const adminCount = ROLE_PERMISSIONS.ADMIN.length;
      const pmoCount = ROLE_PERMISSIONS.PMO.length;
      const viewerCount = ROLE_PERMISSIONS.VIEWER.length;

      expect(adminCount).toBeGreaterThan(pmoCount);
      expect(pmoCount).toBeGreaterThan(viewerCount);
    });

    it('todas as roles devem ter AUTH_LOGIN', () => {
      const roles: UserRole[] = [
        'ADMIN',
        'PMO',
        'PROJECT_MANAGER',
        'HR',
        'FINANCE',
        'VIEWER',
      ];

      roles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toContain(Permission.AUTH_LOGIN);
      });
    });

    it('apenas ADMIN deve ter ADMIN_FULL_ACCESS', () => {
      const roles: UserRole[] = [
        'PMO',
        'PROJECT_MANAGER',
        'HR',
        'FINANCE',
        'VIEWER',
      ];

      roles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).not.toContain(
          Permission.ADMIN_FULL_ACCESS,
        );
      });
      expect(ROLE_PERMISSIONS.ADMIN).toContain(Permission.ADMIN_FULL_ACCESS);
    });
  });

  describe('Permission Consistency', () => {
    it('não deve haver permissões duplicadas em uma role', () => {
      const roles: UserRole[] = [
        'ADMIN',
        'PMO',
        'PROJECT_MANAGER',
        'HR',
        'FINANCE',
        'VIEWER',
      ];

      roles.forEach((role) => {
        const permissions = ROLE_PERMISSIONS[role];
        const uniquePermissions = new Set(permissions);
        expect(permissions.length).toBe(uniquePermissions.size);
      });
    });

    it('todas as permissões no enum devem existir', () => {
      const roles: UserRole[] = [
        'ADMIN',
        'PMO',
        'PROJECT_MANAGER',
        'HR',
        'FINANCE',
        'VIEWER',
      ];

      const validPermissions = Object.values(Permission);

      roles.forEach((role) => {
        const permissions = ROLE_PERMISSIONS[role];
        permissions.forEach((perm) => {
          expect(validPermissions).toContain(perm);
        });
      });
    });
  });
});
