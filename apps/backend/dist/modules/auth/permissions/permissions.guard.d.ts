import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private permissionService;
    constructor(reflector: Reflector, permissionService: PermissionService);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=permissions.guard.d.ts.map