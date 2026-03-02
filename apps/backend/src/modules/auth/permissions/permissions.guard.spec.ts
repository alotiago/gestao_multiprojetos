import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PermissionService, Permission } from './permission.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let permissionService: PermissionService;
  let reflector: Reflector;

  const mockExecutionContext = (
    user: any,
    permissions: Permission[] | null = null,
    requireAll: boolean = false,
    requireAny: boolean = false,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsGuard, PermissionService, Reflector],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    permissionService = module.get<PermissionService>(PermissionService);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      jest.spyOn(reflector, 'get').mockReturnValue(false);
    });

    it('deve permitir acesso se não há permissões requeridas', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve permitir acesso se usuário tem a permissão necessária', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'ADMIN' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.USER_CREATE]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve lançar ForbiddenException se usuário não tem permissão', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.USER_DELETE]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se não há usuário', () => {
      const context = mockExecutionContext(null);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.USER_CREATE]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve permitir ADMIN acessar qualquer permissão', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'ADMIN' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.ADMIN_MANAGE_PERMISSIONS]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve negar VIEWER de acessar operações de escrita', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.PROJECT_CREATE]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve permitir PMO acessar PROJECT_CREATE', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.PROJECT_CREATE]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve negar PMO de usar ADMIN_MANAGE_PERMISSIONS', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.ADMIN_MANAGE_PERMISSIONS]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('HR deve acessar RESOURCE_CREATE', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'HR' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.RESOURCE_CREATE]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('HR não deve acessar PROJECT_DELETE', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'HR' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.PROJECT_DELETE]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('FINANCE deve acessar FINANCIAL_APPROVE', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'FINANCE' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.FINANCIAL_APPROVE]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('FINANCE não deve acessar RESOURCE_DELETE', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'FINANCE' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.RESOURCE_DELETE]);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Multiple Permissions Logic', () => {
    it('deve permitir quando qualquer uma das permissões é válida (OR)', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.PROJECT_CREATE,
        Permission.ADMIN_MANAGE_PERMISSIONS,
      ]);
      jest.spyOn(reflector, 'get').mockReturnValue(false);

      // PMO tem PROJECT_CREATE mas não ADMIN_MANAGE_PERMISSIONS
      // Deve permitir pois tem pelo menos uma
      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve negar quando nenhuma das permissões é válida (OR)', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.PROJECT_CREATE,
        Permission.USER_DELETE,
      ]);
      jest.spyOn(reflector, 'get').mockReturnValue(false);

      // VIEWER não tem nenhuma dessas permissões
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('deve permitir quando TODAS as permissões são válidas (AND)', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'ADMIN' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.PROJECT_CREATE,
        Permission.USER_DELETE,
        Permission.FINANCIAL_APPROVE,
      ]);
      jest.spyOn(reflector, 'get').mockReturnValueOnce(true); // requireAll = true

      expect(guard.canActivate(context)).toBe(true);
    });

    it('deve negar quando NÃO TEM TODAS as permissões (AND)', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        Permission.PROJECT_CREATE,
        Permission.ADMIN_MANAGE_PERMISSIONS, // PMO não tem isso
      ]);
      jest.spyOn(reflector, 'get').mockReturnValueOnce(true); // requireAll = true

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Error Messages', () => {
    it('deve incluir role e permissões na mensagem de erro', () => {
      const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.USER_DELETE]);

      try {
        guard.canActivate(context);
        fail('Deveria ter lançado ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toContain('VIEWER');
        expect((error as ForbiddenException).message).toContain('user:delete');
      }
    });

    it('deve mencionar "não autenticado" se não há usuário', () => {
      const context = mockExecutionContext(null);

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.USER_CREATE]);

      try {
        guard.canActivate(context);
        fail('Deveria ter lançado ForbiddenException');
      } catch (error) {
        expect((error as ForbiddenException).message).toContain('não autenticado');
      }
    });
  });
});
