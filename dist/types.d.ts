export interface User {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
    permissions?: Permission[];
}
export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}
export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}
export interface DynamicUrl {
    id: number;
    url: string;
    method: string;
    name?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
    roles?: Role[];
}
export interface DynamicMenu {
    id: number;
    name: string;
    label: string;
    url?: string;
    icon?: string;
    parent_id?: number;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    children?: DynamicMenu[];
    permissions?: Permission[];
    roles?: Role[];
}
export interface PermissionCheck {
    id: number;
    user_id: number;
    permission: string;
    url: string;
    method: string;
    result: boolean;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: boolean;
}
export interface PaginatedResponse<T = any> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
export interface CreateUrlRequest {
    url: string;
    method: string;
    name?: string;
    description?: string;
    is_active?: boolean;
}
export interface UpdateUrlRequest extends Partial<CreateUrlRequest> {
}
export interface AssignUrlPermissionsRequest {
    permission_ids: number[];
}
export interface AssignRolePermissionsRequest {
    permission_ids: number[];
}
export interface CreateMenuRequest {
    name: string;
    label: string;
    url?: string;
    icon?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
}
export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
}
export type AuthMethod = 'token' | 'session';
export interface SessionAuthConfig {
    csrfTokenUrl?: string;
    csrfCookieName?: string;
    csrfHeaderName?: string;
    withCredentials?: boolean;
    sanctumPath?: string;
}
export interface DynamicRolesConfig {
    apiBaseUrl: string;
    apiVersion?: string;
    headers?: Record<string, string>;
    timeout?: number;
    retryAttempts?: number;
    authMethod?: AuthMethod;
    sessionAuth?: SessionAuthConfig;
    cache?: {
        enabled: boolean;
        ttl: number;
    };
}
export interface UsePermissionsReturn {
    permissions: Permission[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export interface UseRolesReturn {
    roles: Role[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export interface UseMenusReturn {
    menus: DynamicMenu[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export interface UseUrlsReturn {
    urls: DynamicUrl[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}
export interface MenuComponentProps {
    menus?: DynamicMenu[];
    className?: string;
    itemClassName?: string;
    activeClassName?: string;
    onMenuClick?: (menu: DynamicMenu) => void;
    loading?: boolean;
    error?: string | null;
}
export interface PermissionGateProps {
    permission: string | string[];
    role?: string | string[];
    fallback?: any;
    children: any;
}
export interface RoleGateProps {
    role: string | string[];
    fallback?: any;
    children: any;
}
export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}
export interface CacheItem<T = any> {
    data: T;
    timestamp: number;
    ttl: number;
}
export type CacheStore = Map<string, CacheItem>;
export interface PermissionEvent {
    type: 'permission_checked' | 'permission_granted' | 'permission_denied';
    permission: string;
    user_id?: number;
    timestamp: number;
}
export interface MenuEvent {
    type: 'menu_clicked' | 'menu_loaded' | 'menu_error';
    menu?: DynamicMenu;
    timestamp: number;
}
//# sourceMappingURL=types.d.ts.map