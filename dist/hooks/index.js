"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHealthCheck = exports.useCache = exports.usePermissionLogs = exports.usePermissionCheck = exports.useUrls = exports.useMenus = exports.useRoles = exports.usePermissions = void 0;
const react_1 = require("react");
const client_1 = require("../client");
// Custom hook for permissions
const usePermissions = () => {
    const [permissions, setPermissions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchPermissions = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const data = await client.getUserPermissions();
            setPermissions(data);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch permissions');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchPermissions();
    }, [fetchPermissions]);
    return {
        permissions,
        loading,
        error,
        refetch: fetchPermissions,
    };
};
exports.usePermissions = usePermissions;
// Custom hook for roles
const useRoles = () => {
    const [roles, setRoles] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchRoles = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const data = await client.getUserRoles();
            setRoles(data);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch roles');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchRoles();
    }, [fetchRoles]);
    return {
        roles,
        loading,
        error,
        refetch: fetchRoles,
    };
};
exports.useRoles = useRoles;
// Custom hook for menus
const useMenus = () => {
    const [menus, setMenus] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchMenus = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const data = await client.getUserMenus();
            setMenus(data);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch menus');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchMenus();
    }, [fetchMenus]);
    return {
        menus,
        loading,
        error,
        refetch: fetchMenus,
    };
};
exports.useMenus = useMenus;
// Custom hook for URLs
const useUrls = (page = 1, perPage = 15) => {
    const [urls, setUrls] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchUrls = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const data = await client.getUrls(page, perPage);
            setUrls(data.data);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch URLs');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage]);
    (0, react_1.useEffect)(() => {
        fetchUrls();
    }, [fetchUrls]);
    return {
        urls,
        loading,
        error,
        refetch: fetchUrls,
    };
};
exports.useUrls = useUrls;
// Custom hook for permission checking
const usePermissionCheck = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const checkPermission = (0, react_1.useCallback)(async (permission, url) => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const result = await client.checkPermission(permission, url);
            return result;
        }
        catch (err) {
            setError(err.message || 'Failed to check permission');
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return {
        checkPermission,
        loading,
        error,
    };
};
exports.usePermissionCheck = usePermissionCheck;
// Custom hook for permission logs
const usePermissionLogs = (page = 1, perPage = 15) => {
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [pagination, setPagination] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchLogs = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const response = await client.getPermissionLogs(page, perPage);
            setLogs(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                per_page: response.per_page,
                total: response.total,
                from: response.from,
                to: response.to,
            });
        }
        catch (err) {
            setError(err.message || 'Failed to fetch permission logs');
        }
        finally {
            setLoading(false);
        }
    }, [page, perPage]);
    (0, react_1.useEffect)(() => {
        fetchLogs();
    }, [fetchLogs]);
    return {
        logs,
        pagination,
        loading,
        error,
        refetch: fetchLogs,
    };
};
exports.usePermissionLogs = usePermissionLogs;
// Custom hook for cache management
const useCache = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const clearCache = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const result = await client.clearCache();
            return result;
        }
        catch (err) {
            setError(err.message || 'Failed to clear cache');
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const refreshCache = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const result = await client.refreshCache();
            return result;
        }
        catch (err) {
            setError(err.message || 'Failed to refresh cache');
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return {
        clearCache,
        refreshCache,
        loading,
        error,
    };
};
exports.useCache = useCache;
// Custom hook for health check
const useHealthCheck = () => {
    const [isHealthy, setIsHealthy] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const checkHealth = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = (0, client_1.getClient)();
            const result = await client.healthCheck();
            setIsHealthy(result);
        }
        catch (err) {
            setError(err.message || 'Health check failed');
            setIsHealthy(false);
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        checkHealth();
        // Set up periodic health checks
        const interval = setInterval(checkHealth, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkHealth]);
    return {
        isHealthy,
        loading,
        error,
        refetch: checkHealth,
    };
};
exports.useHealthCheck = useHealthCheck;
//# sourceMappingURL=index.js.map