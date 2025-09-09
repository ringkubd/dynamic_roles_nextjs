import { UsePermissionsReturn, UseRolesReturn, UseMenusReturn, UseUrlsReturn, PaginatedResponse, PermissionCheck } from '../types';
export declare const usePermissions: () => UsePermissionsReturn;
export declare const useRoles: () => UseRolesReturn;
export declare const useMenus: () => UseMenusReturn;
export declare const useUrls: (page?: number, perPage?: number) => UseUrlsReturn;
export declare const usePermissionCheck: () => {
    checkPermission: (permission: string, url?: string) => Promise<boolean>;
    loading: boolean;
    error: string | null;
};
export declare const usePermissionLogs: (page?: number, perPage?: number) => {
    logs: PermissionCheck[];
    pagination: Omit<PaginatedResponse<any>, "data"> | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
export declare const useCache: () => {
    clearCache: () => Promise<boolean>;
    refreshCache: () => Promise<boolean>;
    loading: boolean;
    error: string | null;
};
export declare const useHealthCheck: () => {
    isHealthy: boolean | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=index.d.ts.map