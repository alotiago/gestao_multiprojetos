import { SetMetadata } from '@nestjs/common';
import { Permission } from './permission.service';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator para marcar uma rota como requerendo permissões específicas
 * @param permissions - Uma ou mais permissões requeridas
 * @returns Metadata setter
 * 
 * @example
 * @Permissions(Permission.PROJECT_CREATE, Permission.PROJECT_READ)
 * async createProject() {}
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator para indicar que a rota requer TODAS as permissões (AND logic)
 */
export const RequireAllPermissions = (...permissions: Permission[]) =>
  SetMetadata('requireAll', true) &&
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator para indicar que a rota requer QUALQUER UMA das permissões (OR logic)
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata('requireAny', true) &&
  SetMetadata(PERMISSIONS_KEY, permissions);
