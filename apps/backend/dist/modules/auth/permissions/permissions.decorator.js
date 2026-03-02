"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAnyPermission = exports.RequireAllPermissions = exports.RequirePermissions = exports.Permissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
/**
 * Decorator para marcar uma rota como requerendo permissões específicas
 * @param permissions - Uma ou mais permissões requeridas
 * @returns Metadata setter
 *
 * @example
 * @Permissions(Permission.PROJECT_CREATE, Permission.PROJECT_READ)
 * async createProject() {}
 */
const Permissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.Permissions = Permissions;
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
/**
 * Decorator para indicar que a rota requer TODAS as permissões (AND logic)
 */
const RequireAllPermissions = (...permissions) => (0, common_1.SetMetadata)('requireAll', true) &&
    (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequireAllPermissions = RequireAllPermissions;
/**
 * Decorator para indicar que a rota requer QUALQUER UMA das permissões (OR logic)
 */
const RequireAnyPermission = (...permissions) => (0, common_1.SetMetadata)('requireAny', true) &&
    (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequireAnyPermission = RequireAnyPermission;
//# sourceMappingURL=permissions.decorator.js.map