"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = exports.PERMISSIONS_KEY = exports.RequireAnyPermission = exports.RequireAllPermissions = exports.Permissions = exports.ROLE_PERMISSIONS = exports.PermissionService = exports.Permission = void 0;
var permission_service_1 = require("./permission.service");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return permission_service_1.Permission; } });
Object.defineProperty(exports, "PermissionService", { enumerable: true, get: function () { return permission_service_1.PermissionService; } });
Object.defineProperty(exports, "ROLE_PERMISSIONS", { enumerable: true, get: function () { return permission_service_1.ROLE_PERMISSIONS; } });
var permissions_decorator_1 = require("./permissions.decorator");
Object.defineProperty(exports, "Permissions", { enumerable: true, get: function () { return permissions_decorator_1.Permissions; } });
Object.defineProperty(exports, "RequireAllPermissions", { enumerable: true, get: function () { return permissions_decorator_1.RequireAllPermissions; } });
Object.defineProperty(exports, "RequireAnyPermission", { enumerable: true, get: function () { return permissions_decorator_1.RequireAnyPermission; } });
Object.defineProperty(exports, "PERMISSIONS_KEY", { enumerable: true, get: function () { return permissions_decorator_1.PERMISSIONS_KEY; } });
var permissions_guard_1 = require("./permissions.guard");
Object.defineProperty(exports, "PermissionsGuard", { enumerable: true, get: function () { return permissions_guard_1.PermissionsGuard; } });
//# sourceMappingURL=index.js.map