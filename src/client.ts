import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  DynamicRolesConfig,
  ApiResponse,
  PaginatedResponse,
  DynamicUrl,
  DynamicMenu,
  Role,
  Permission,
  PermissionCheck,
  CreateUrlRequest,
  UpdateUrlRequest,
  AssignUrlPermissionsRequest,
  AssignRolePermissionsRequest,
  CreateMenuRequest,
  UpdateMenuRequest,
  ApiError
} from './types';

export class DynamicRolesClient {
  private api: AxiosInstance;
  private config: DynamicRolesConfig;

  constructor(config: DynamicRolesConfig) {
    this.config = {
      apiVersion: 'v1',
      timeout: 10000,
      retryAttempts: 3,
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
      },
      ...config,
    };

    this.api = axios.create({
      baseURL: `${this.config.apiBaseUrl}/api/dynamic-roles`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message,
          status: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage, cookies, or context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
  }

  // URL Management
  public async getUrls(page = 1, perPage = 15): Promise<PaginatedResponse<DynamicUrl>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<DynamicUrl>>> = await this.api.get('/urls', {
      params: { page, per_page: perPage },
    });
    return response.data.data;
  }

  public async getUrl(id: number): Promise<DynamicUrl> {
    const response: AxiosResponse<ApiResponse<DynamicUrl>> = await this.api.get(`/urls/${id}`);
    return response.data.data;
  }

  public async createUrl(data: CreateUrlRequest): Promise<DynamicUrl> {
    const response: AxiosResponse<ApiResponse<DynamicUrl>> = await this.api.post('/urls', data);
    return response.data.data;
  }

  public async updateUrl(id: number, data: UpdateUrlRequest): Promise<DynamicUrl> {
    const response: AxiosResponse<ApiResponse<DynamicUrl>> = await this.api.put(`/urls/${id}`, data);
    return response.data.data;
  }

  public async deleteUrl(id: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.delete(`/urls/${id}`);
    return response.data.data;
  }

  public async assignUrlPermissions(urlId: number, data: AssignUrlPermissionsRequest): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.post(`/urls/${urlId}/permissions`, data);
    return response.data.data;
  }

  // Role Management
  public async getRolePermissions(roleId: number): Promise<Permission[]> {
    const response: AxiosResponse<ApiResponse<Permission[]>> = await this.api.get(`/roles/${roleId}/permissions`);
    return response.data.data;
  }

  public async assignRolePermissions(roleId: number, data: AssignRolePermissionsRequest): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.post(`/roles/${roleId}/permissions`, data);
    return response.data.data;
  }

  public async removeRolePermission(roleId: number, permissionId: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return response.data.data;
  }

  // Menu Management
  public async getMenus(): Promise<DynamicMenu[]> {
    const response: AxiosResponse<ApiResponse<DynamicMenu[]>> = await this.api.get('/menus');
    return response.data.data;
  }

  public async getMenu(id: number): Promise<DynamicMenu> {
    const response: AxiosResponse<ApiResponse<DynamicMenu>> = await this.api.get(`/menus/${id}`);
    return response.data.data;
  }

  public async createMenu(data: CreateMenuRequest): Promise<DynamicMenu> {
    const response: AxiosResponse<ApiResponse<DynamicMenu>> = await this.api.post('/menus', data);
    return response.data.data;
  }

  public async updateMenu(id: number, data: UpdateMenuRequest): Promise<DynamicMenu> {
    const response: AxiosResponse<ApiResponse<DynamicMenu>> = await this.api.put(`/menus/${id}`, data);
    return response.data.data;
  }

  public async deleteMenu(id: number): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.delete(`/menus/${id}`);
    return response.data.data;
  }

  // Permission Checks
  public async checkPermission(permission: string, url?: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.post('/check-permission', {
      permission,
      url,
    });
    return response.data.data;
  }

  public async getPermissionLogs(page = 1, perPage = 15): Promise<PaginatedResponse<PermissionCheck>> {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<PermissionCheck>>> = await this.api.get('/permission-logs', {
      params: { page, per_page: perPage },
    });
    return response.data.data;
  }

  // User Permissions & Roles
  public async getUserPermissions(): Promise<Permission[]> {
    const response: AxiosResponse<ApiResponse<Permission[]>> = await this.api.get('/user/permissions');
    return response.data.data;
  }

  public async getUserRoles(): Promise<Role[]> {
    const response: AxiosResponse<ApiResponse<Role[]>> = await this.api.get('/user/roles');
    return response.data.data;
  }

  public async getUserMenus(): Promise<DynamicMenu[]> {
    const response: AxiosResponse<ApiResponse<DynamicMenu[]>> = await this.api.get('/user/menus');
    return response.data.data;
  }

  // Cache Management
  public async clearCache(): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.post('/cache/clear');
    return response.data.data;
  }

  public async refreshCache(): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<boolean>> = await this.api.post('/cache/refresh');
    return response.data.data;
  }

  // Health Check
  public async healthCheck(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<boolean>> = await this.api.get('/health');
      return response.data.data;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let clientInstance: DynamicRolesClient | null = null;

export const createClient = (config: DynamicRolesConfig): DynamicRolesClient => {
  clientInstance = new DynamicRolesClient(config);
  return clientInstance;
};

export const getClient = (): DynamicRolesClient => {
  if (!clientInstance) {
    throw new Error('DynamicRolesClient not initialized. Call createClient() first.');
  }
  return clientInstance;
};
