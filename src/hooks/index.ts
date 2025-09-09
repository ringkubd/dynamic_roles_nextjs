import { useState, useEffect, useCallback } from 'react';
import { getClient } from '../client';
import {
  Permission,
  Role,
  DynamicMenu,
  DynamicUrl,
  UsePermissionsReturn,
  UseRolesReturn,
  UseMenusReturn,
  UseUrlsReturn,
  PaginatedResponse,
  PermissionCheck
} from '../types';

// Custom hook for permissions
export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const data = await client.getUserPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
};

// Custom hook for roles
export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const data = await client.getUserRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
};

// Custom hook for menus
export const useMenus = (): UseMenusReturn => {
  const [menus, setMenus] = useState<DynamicMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const data = await client.getUserMenus();
      setMenus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    refetch: fetchMenus,
  };
};

// Custom hook for URLs
export const useUrls = (page = 1, perPage = 15): UseUrlsReturn => {
  const [urls, setUrls] = useState<DynamicUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const data = await client.getUrls(page, perPage);
      setUrls(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return {
    urls,
    loading,
    error,
    refetch: fetchUrls,
  };
};

// Custom hook for permission checking
export const usePermissionCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async (permission: string, url?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const result = await client.checkPermission(permission, url);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to check permission');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkPermission,
    loading,
    error,
  };
};

// Custom hook for permission logs
export const usePermissionLogs = (page = 1, perPage = 15) => {
  const [logs, setLogs] = useState<PermissionCheck[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse, 'data'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
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
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permission logs');
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
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

// Custom hook for cache management
export const useCache = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const result = await client.clearCache();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to clear cache');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCache = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const result = await client.refreshCache();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh cache');
      return false;
    } finally {
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

// Custom hook for health check
export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getClient();
      const result = await client.healthCheck();
      setIsHealthy(result);
    } catch (err: any) {
      setError(err.message || 'Health check failed');
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
