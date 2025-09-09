import { DynamicRolesConfig, PaginatedResponse, DynamicUrl, DynamicMenu, Role, Permission, PermissionCheck, CreateUrlRequest, UpdateUrlRequest, AssignUrlPermissionsRequest, AssignRolePermissionsRequest, CreateMenuRequest, UpdateMenuRequest } from './types';
export declare class DynamicRolesClient {
    private api;
    private config;
    constructor(config: DynamicRolesConfig);
    private setupInterceptors;
    private getAuthToken;
    setAuthToken(token: string): void;
    removeAuthToken(): void;
    getUrls(page?: number, perPage?: number): Promise<PaginatedResponse<DynamicUrl>>;
    getUrl(id: number): Promise<DynamicUrl>;
    createUrl(data: CreateUrlRequest): Promise<DynamicUrl>;
    updateUrl(id: number, data: UpdateUrlRequest): Promise<DynamicUrl>;
    deleteUrl(id: number): Promise<boolean>;
    assignUrlPermissions(urlId: number, data: AssignUrlPermissionsRequest): Promise<boolean>;
    getRolePermissions(roleId: number): Promise<Permission[]>;
    assignRolePermissions(roleId: number, data: AssignRolePermissionsRequest): Promise<boolean>;
    removeRolePermission(roleId: number, permissionId: number): Promise<boolean>;
    getMenus(): Promise<DynamicMenu[]>;
    getMenu(id: number): Promise<DynamicMenu>;
    createMenu(data: CreateMenuRequest): Promise<DynamicMenu>;
    updateMenu(id: number, data: UpdateMenuRequest): Promise<DynamicMenu>;
    deleteMenu(id: number): Promise<boolean>;
    checkPermission(permission: string, url?: string): Promise<boolean>;
    getPermissionLogs(page?: number, perPage?: number): Promise<PaginatedResponse<PermissionCheck>>;
    getUserPermissions(): Promise<Permission[]>;
    getUserRoles(): Promise<Role[]>;
    getUserMenus(): Promise<DynamicMenu[]>;
    clearCache(): Promise<boolean>;
    refreshCache(): Promise<boolean>;
    healthCheck(): Promise<boolean>;
}
export declare const createClient: (config: DynamicRolesConfig) => DynamicRolesClient;
export declare const getClient: () => DynamicRolesClient;
//# sourceMappingURL=client.d.ts.map