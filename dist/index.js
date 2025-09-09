"use strict";
// Main exports for Dynamic Roles Next.js package
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHealthCheck = exports.useCache = exports.usePermissionLogs = exports.usePermissionCheck = exports.useUrls = exports.useMenus = exports.useRoles = exports.usePermissions = exports.getClient = exports.createClient = exports.DynamicRolesClient = void 0;
// Client
var client_1 = require("./client");
Object.defineProperty(exports, "DynamicRolesClient", { enumerable: true, get: function () { return client_1.DynamicRolesClient; } });
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return client_1.createClient; } });
Object.defineProperty(exports, "getClient", { enumerable: true, get: function () { return client_1.getClient; } });
// Types
__exportStar(require("./types"), exports);
// React Hooks
__exportStar(require("./hooks"), exports);
// Components
__exportStar(require("./components"), exports);
// Re-export for convenience
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "usePermissions", { enumerable: true, get: function () { return hooks_1.usePermissions; } });
Object.defineProperty(exports, "useRoles", { enumerable: true, get: function () { return hooks_1.useRoles; } });
Object.defineProperty(exports, "useMenus", { enumerable: true, get: function () { return hooks_1.useMenus; } });
Object.defineProperty(exports, "useUrls", { enumerable: true, get: function () { return hooks_1.useUrls; } });
Object.defineProperty(exports, "usePermissionCheck", { enumerable: true, get: function () { return hooks_1.usePermissionCheck; } });
Object.defineProperty(exports, "usePermissionLogs", { enumerable: true, get: function () { return hooks_1.usePermissionLogs; } });
Object.defineProperty(exports, "useCache", { enumerable: true, get: function () { return hooks_1.useCache; } });
Object.defineProperty(exports, "useHealthCheck", { enumerable: true, get: function () { return hooks_1.useHealthCheck; } });
//# sourceMappingURL=index.js.map