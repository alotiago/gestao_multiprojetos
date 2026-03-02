import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService, Permission } from './permission.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Obter permissões requeridas da metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se não há permissões requeridas, permite acesso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Obter usuário da request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar lógica (requireAll vs requireAny)
    const requireAll = this.reflector.get<boolean>('requireAll', context.getHandler());
    const requireAny = this.reflector.get<boolean>('requireAny', context.getHandler());

    if (requireAll) {
      // Todas as permissões são obrigatórias
      const hasAllPermissions = this.permissionService.hasAllPermissions(
        user.role,
        requiredPermissions as Permission[],
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Usuário com role '${user.role}' não tem todas as permissões requeridas: ${requiredPermissions.join(', ')}`,
        );
      }
    } else if (requireAny) {
      // Pelo menos uma permissão é obrigatória
      const hasAnyPermission = this.permissionService.hasAnyPermission(
        user.role,
        requiredPermissions as Permission[],
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Usuário com role '${user.role}' não tem nenhuma das permissões requeridas: ${requiredPermissions.join(', ')}`,
        );
      }
    } else {
      // Comportamento padrão: qualquer uma das permissões (OR)
      const hasAnyPermission = this.permissionService.hasAnyPermission(
        user.role,
        requiredPermissions as Permission[],
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Usuário com role '${user.role}' não tem as permissões requeridas: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
