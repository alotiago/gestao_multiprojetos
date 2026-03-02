"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_guard_1 = require("./permissions.guard");
const permission_service_1 = require("./permission.service");
describe('PermissionsGuard', () => {
    let guard;
    let permissionService;
    let reflector;
    const mockExecutionContext = (user, permissions = null, requireAll = false, requireAny = false) => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: () => ({}),
            getClass: () => ({}),
        };
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [permissions_guard_1.PermissionsGuard, permission_service_1.PermissionService, core_1.Reflector],
        }).compile();
        guard = module.get(permissions_guard_1.PermissionsGuard);
        permissionService = module.get(permission_service_1.PermissionService);
        reflector = module.get(core_1.Reflector);
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
                .mockReturnValue([permission_service_1.Permission.USER_CREATE]);
            expect(guard.canActivate(context)).toBe(true);
        });
        it('deve lançar ForbiddenException se usuário não tem permissão', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.USER_DELETE]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('deve lançar ForbiddenException se não há usuário', () => {
            const context = mockExecutionContext(null);
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.USER_CREATE]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('deve permitir ADMIN acessar qualquer permissão', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'ADMIN' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.ADMIN_MANAGE_PERMISSIONS]);
            expect(guard.canActivate(context)).toBe(true);
        });
        it('deve negar VIEWER de acessar operações de escrita', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.PROJECT_CREATE]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('deve permitir PMO acessar PROJECT_CREATE', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.PROJECT_CREATE]);
            expect(guard.canActivate(context)).toBe(true);
        });
        it('deve negar PMO de usar ADMIN_MANAGE_PERMISSIONS', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.ADMIN_MANAGE_PERMISSIONS]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('HR deve acessar RESOURCE_CREATE', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'HR' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.RESOURCE_CREATE]);
            expect(guard.canActivate(context)).toBe(true);
        });
        it('HR não deve acessar PROJECT_DELETE', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'HR' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.PROJECT_DELETE]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('FINANCE deve acessar FINANCIAL_APPROVE', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'FINANCE' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.FINANCIAL_APPROVE]);
            expect(guard.canActivate(context)).toBe(true);
        });
        it('FINANCE não deve acessar RESOURCE_DELETE', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'FINANCE' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.RESOURCE_DELETE]);
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
    });
    describe('Multiple Permissions Logic', () => {
        it('deve permitir quando qualquer uma das permissões é válida (OR)', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                permission_service_1.Permission.PROJECT_CREATE,
                permission_service_1.Permission.ADMIN_MANAGE_PERMISSIONS,
            ]);
            jest.spyOn(reflector, 'get').mockReturnValue(false);
            // PMO tem PROJECT_CREATE mas não ADMIN_MANAGE_PERMISSIONS
            // Deve permitir pois tem pelo menos uma
            expect(guard.canActivate(context)).toBe(true);
        });
        it('deve negar quando nenhuma das permissões é válida (OR)', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                permission_service_1.Permission.PROJECT_CREATE,
                permission_service_1.Permission.USER_DELETE,
            ]);
            jest.spyOn(reflector, 'get').mockReturnValue(false);
            // VIEWER não tem nenhuma dessas permissões
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
        it('deve permitir quando TODAS as permissões são válidas (AND)', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'ADMIN' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                permission_service_1.Permission.PROJECT_CREATE,
                permission_service_1.Permission.USER_DELETE,
                permission_service_1.Permission.FINANCIAL_APPROVE,
            ]);
            jest.spyOn(reflector, 'get').mockReturnValueOnce(true); // requireAll = true
            expect(guard.canActivate(context)).toBe(true);
        });
        it('deve negar quando NÃO TEM TODAS as permissões (AND)', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'PMO' });
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
                permission_service_1.Permission.PROJECT_CREATE,
                permission_service_1.Permission.ADMIN_MANAGE_PERMISSIONS, // PMO não tem isso
            ]);
            jest.spyOn(reflector, 'get').mockReturnValueOnce(true); // requireAll = true
            expect(() => guard.canActivate(context)).toThrow(common_1.ForbiddenException);
        });
    });
    describe('Error Messages', () => {
        it('deve incluir role e permissões na mensagem de erro', () => {
            const context = mockExecutionContext({ sub: 'user-1', role: 'VIEWER' });
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.USER_DELETE]);
            try {
                guard.canActivate(context);
                fail('Deveria ter lançado ForbiddenException');
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.ForbiddenException);
                expect(error.message).toContain('VIEWER');
                expect(error.message).toContain('user:delete');
            }
        });
        it('deve mencionar "não autenticado" se não há usuário', () => {
            const context = mockExecutionContext(null);
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([permission_service_1.Permission.USER_CREATE]);
            try {
                guard.canActivate(context);
                fail('Deveria ter lançado ForbiddenException');
            }
            catch (error) {
                expect(error.message).toContain('não autenticado');
            }
        });
    });
});
//# sourceMappingURL=permissions.guard.spec.js.map