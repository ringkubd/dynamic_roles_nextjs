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
  ApiError,
  AuthMethod,
  SessionAuthConfig
} from './types';

export class DynamicRolesClient {
  private api: AxiosInstance;
  private config: DynamicRolesConfig;
  private csrfToken: string | null = null;

  constructor(config: DynamicRolesConfig) {
    this.config = {
      apiVersion: 'v1',
      timeout: 10000,
      retryAttempts: 3,
      authMethod: 'token',
      sessionAuth: {
        csrfTokenUrl: '/sanctum/csrf-cookie',
        csrfCookieName: 'XSRF-TOKEN',
        csrfHeaderName: 'X-XSRF-TOKEN',
        withCredentials: true,
        sanctumPath: '/sanctum',
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
      },
      ...config,
    };

    this.api = axios.create({
      baseURL: `${this.config.apiBaseUrl}/dynamic-roles`,
      timeout: this.config.timeout,
      withCredentials: this.config.authMethod === 'session' ? this.config.sessionAuth?.withCredentials : false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        if (this.config.authMethod === 'token') {
          // Token-based authentication
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } else if (this.config.authMethod === 'session') {
          // Session-based authentication with CSRF protection
          await this.ensureCsrfToken();
          const csrfToken = this.getCsrfToken();
          
          if (csrfToken) {
            const headerName = this.config.sessionAuth?.csrfHeaderName || 'X-XSRF-TOKEN';
            config.headers[headerName] = csrfToken;
          }
          
          // Ensure credentials are included for session auth
          config.withCredentials = this.config.sessionAuth?.withCredentials ?? true;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message,
          status: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };

        // Handle CSRF token expiration for session auth
        if (
          this.config.authMethod === 'session' &&
          error.response?.status === 419 // Laravel's CSRF token mismatch status
        ) {
          try {
            // Refresh CSRF token and retry the request
            await this.fetchCsrfToken();
            const originalRequest = error.config;
            const csrfToken = this.getCsrfToken();
            
            if (csrfToken && originalRequest) {
              const headerName = this.config.sessionAuth?.csrfHeaderName || 'X-XSRF-TOKEN';
              originalRequest.headers[headerName] = csrfToken;
              return this.api.request(originalRequest);
            }
          } catch (retryError) {
            // If retry fails, return the original error
            return Promise.reject(apiError);
          }
        }

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

  private getCsrfToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookieName = this.config.sessionAuth?.csrfCookieName || 'XSRF-TOKEN';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return decodeURIComponent(value);
      }
    }
    
    return this.csrfToken;
  }

  private async fetchCsrfToken(): Promise<void> {
    if (this.config.authMethod !== 'session') return;
    
    try {
      const csrfUrl = this.config.sessionAuth?.csrfTokenUrl || '/sanctum/csrf-cookie';
      const baseUrl = this.config.apiBaseUrl.replace('/api', ''); // Remove /api if present
      
      await axios.get(`${baseUrl}${csrfUrl}`, {
        withCredentials: this.config.sessionAuth?.withCredentials || true,
      });
      
      // Token should now be in cookies
      this.csrfToken = this.getCsrfToken();
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }
  }

  private async ensureCsrfToken(): Promise<void> {
    if (this.config.authMethod === 'session' && !this.getCsrfToken()) {
      await this.fetchCsrfToken();
    }
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

  // Session-based authentication methods
  public async initializeSession(): Promise<void> {
    if (this.config.authMethod === 'session') {
      await this.fetchCsrfToken();
    }
  }

  public async login(credentials: { email: string; password: string }): Promise<any> {
    if (this.config.authMethod === 'session') {
      await this.ensureCsrfToken();
      const response = await this.api.post('/login', credentials);
      return response.data;
    } else {
      // For token-based auth, assume the API returns a token
      const response = await this.api.post('/login', credentials);
      if (response.data.data?.token) {
        this.setAuthToken(response.data.data.token);
      }
      return response.data;
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.config.authMethod === 'session') {
        await this.api.post('/logout');
        this.csrfToken = null;
      } else {
        await this.api.post('/logout');
        this.removeAuthToken();
      }
    } catch (error) {
      // Even if logout fails, clear local auth data
      if (this.config.authMethod === 'token') {
        this.removeAuthToken();
      } else {
        this.csrfToken = null;
      }
      throw error;
    }
  }

  public async refreshSession(): Promise<void> {
    if (this.config.authMethod === 'session') {
      await this.fetchCsrfToken();
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
    const response: AxiosResponse<ApiResponse<Permission[]>> = await this.api.get('/permissions');
    return response.data.data;
  }

  public async getUserRoles(): Promise<Role[]> {
    const response: AxiosResponse<ApiResponse<Role[]>> = await this.api.get('/roles');
    return response.data.data;
  }

  public async getUserMenus(): Promise<DynamicMenu[]> {
    const response: AxiosResponse<ApiResponse<DynamicMenu[]>> = await this.api.get('/menus');
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

export const createClient = async (config: DynamicRolesConfig): Promise<DynamicRolesClient> => {
  clientInstance = new DynamicRolesClient(config);
  
  // Initialize session if using session-based auth
  if (config.authMethod === 'session') {
    await clientInstance.initializeSession();
  }
  
  return clientInstance;
};

export const getClient = (): DynamicRolesClient => {
  if (!clientInstance) {
    throw new Error('DynamicRolesClient not initialized. Call createClient() first.');
  }
  return clientInstance;
};

// Helper function to create client with session auth for Laravel Sanctum
export const createSanctumClient = async (config: Omit<DynamicRolesConfig, 'authMethod'>): Promise<DynamicRolesClient> => {
  return createClient({
    ...config,
    authMethod: 'session',
  });
};

// Helper function to create client with token auth
export const createTokenClient = async (config: Omit<DynamicRolesConfig, 'authMethod'>): Promise<DynamicRolesClient> => {
  return createClient({
    ...config,
    authMethod: 'token',
  });
};
