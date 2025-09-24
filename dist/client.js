"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenClient = exports.createSanctumClient = exports.getClient = exports.createClient = exports.DynamicRolesClient = void 0;
const axios_1 = __importDefault(require("axios"));
class DynamicRolesClient {
    constructor(config) {
        this.csrfToken = null;
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
        this.api = axios_1.default.create({
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
    setupInterceptors() {
        // Request interceptor for authentication
        this.api.interceptors.request.use(async (config) => {
            if (this.config.authMethod === 'token') {
                // Token-based authentication
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            else if (this.config.authMethod === 'session') {
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
        }, (error) => Promise.reject(error));
        // Response interceptor for error handling
        this.api.interceptors.response.use((response) => response, async (error) => {
            const apiError = {
                message: error.response?.data?.message || error.message,
                status: error.response?.status || 500,
                errors: error.response?.data?.errors,
            };
            // Handle CSRF token expiration for session auth
            if (this.config.authMethod === 'session' &&
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
                }
                catch (retryError) {
                    // If retry fails, return the original error
                    return Promise.reject(apiError);
                }
            }
            return Promise.reject(apiError);
        });
    }
    getAuthToken() {
        // Get token from localStorage, cookies, or context
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        }
        return null;
    }
    getCsrfToken() {
        if (typeof window === 'undefined')
            return null;
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
    async fetchCsrfToken() {
        if (this.config.authMethod !== 'session')
            return;
        try {
            const csrfUrl = this.config.sessionAuth?.csrfTokenUrl || '/sanctum/csrf-cookie';
            const baseUrl = this.config.apiBaseUrl.replace('/api', ''); // Remove /api if present
            await axios_1.default.get(`${baseUrl}${csrfUrl}`, {
                withCredentials: this.config.sessionAuth?.withCredentials || true,
            });
            // Token should now be in cookies
            this.csrfToken = this.getCsrfToken();
        }
        catch (error) {
            console.warn('Failed to fetch CSRF token:', error);
        }
    }
    async ensureCsrfToken() {
        if (this.config.authMethod === 'session' && !this.getCsrfToken()) {
            await this.fetchCsrfToken();
        }
    }
    setAuthToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }
    removeAuthToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');
        }
    }
    // Session-based authentication methods
    async initializeSession() {
        if (this.config.authMethod === 'session') {
            await this.fetchCsrfToken();
        }
    }
    async login(credentials) {
        if (this.config.authMethod === 'session') {
            await this.ensureCsrfToken();
            const response = await this.api.post('/login', credentials);
            return response.data;
        }
        else {
            // For token-based auth, assume the API returns a token
            const response = await this.api.post('/login', credentials);
            if (response.data.data?.token) {
                this.setAuthToken(response.data.data.token);
            }
            return response.data;
        }
    }
    async logout() {
        try {
            if (this.config.authMethod === 'session') {
                await this.api.post('/logout');
                this.csrfToken = null;
            }
            else {
                await this.api.post('/logout');
                this.removeAuthToken();
            }
        }
        catch (error) {
            // Even if logout fails, clear local auth data
            if (this.config.authMethod === 'token') {
                this.removeAuthToken();
            }
            else {
                this.csrfToken = null;
            }
            throw error;
        }
    }
    async refreshSession() {
        if (this.config.authMethod === 'session') {
            await this.fetchCsrfToken();
        }
    }
    // URL Management
    async getUrls(page = 1, perPage = 15) {
        const response = await this.api.get('/urls', {
            params: { page, per_page: perPage },
        });
        return response.data.data;
    }
    async getUrl(id) {
        const response = await this.api.get(`/urls/${id}`);
        return response.data.data;
    }
    async createUrl(data) {
        const response = await this.api.post('/urls', data);
        return response.data.data;
    }
    async updateUrl(id, data) {
        const response = await this.api.put(`/urls/${id}`, data);
        return response.data.data;
    }
    async deleteUrl(id) {
        const response = await this.api.delete(`/urls/${id}`);
        return response.data.data;
    }
    async assignUrlPermissions(urlId, data) {
        const response = await this.api.post(`/urls/${urlId}/permissions`, data);
        return response.data.data;
    }
    // Role Management
    async getRolePermissions(roleId) {
        const response = await this.api.get(`/roles/${roleId}/permissions`);
        return response.data.data;
    }
    async assignRolePermissions(roleId, data) {
        const response = await this.api.post(`/roles/${roleId}/permissions`, data);
        return response.data.data;
    }
    async removeRolePermission(roleId, permissionId) {
        const response = await this.api.delete(`/roles/${roleId}/permissions/${permissionId}`);
        return response.data.data;
    }
    // Menu Management
    async getMenus() {
        const response = await this.api.get('/menus');
        return response.data.data;
    }
    async getMenu(id) {
        const response = await this.api.get(`/menus/${id}`);
        return response.data.data;
    }
    async createMenu(data) {
        const response = await this.api.post('/menus', data);
        return response.data.data;
    }
    async updateMenu(id, data) {
        const response = await this.api.put(`/menus/${id}`, data);
        return response.data.data;
    }
    async deleteMenu(id) {
        const response = await this.api.delete(`/menus/${id}`);
        return response.data.data;
    }
    // Permission Checks
    async checkPermission(permission, url) {
        const response = await this.api.post('/check-permission', {
            permission,
            url,
        });
        return response.data.data;
    }
    async getPermissionLogs(page = 1, perPage = 15) {
        const response = await this.api.get('/permission-logs', {
            params: { page, per_page: perPage },
        });
        return response.data.data;
    }
    // User Permissions & Roles
    async getUserPermissions() {
        const response = await this.api.get('/permissions');
        return response.data.data;
    }
    async getUserRoles() {
        const response = await this.api.get('/roles');
        return response.data.data;
    }
    async getUserMenus() {
        const response = await this.api.get('/menus');
        return response.data.data;
    }
    // Cache Management
    async clearCache() {
        const response = await this.api.post('/cache/clear');
        return response.data.data;
    }
    async refreshCache() {
        const response = await this.api.post('/cache/refresh');
        return response.data.data;
    }
    // Health Check
    async healthCheck() {
        try {
            const response = await this.api.get('/health');
            return response.data.data;
        }
        catch {
            return false;
        }
    }
}
exports.DynamicRolesClient = DynamicRolesClient;
// Singleton instance
let clientInstance = null;
const createClient = async (config) => {
    clientInstance = new DynamicRolesClient(config);
    // Initialize session if using session-based auth
    if (config.authMethod === 'session') {
        await clientInstance.initializeSession();
    }
    return clientInstance;
};
exports.createClient = createClient;
const getClient = () => {
    if (!clientInstance) {
        throw new Error('DynamicRolesClient not initialized. Call createClient() first.');
    }
    return clientInstance;
};
exports.getClient = getClient;
// Helper function to create client with session auth for Laravel Sanctum
const createSanctumClient = async (config) => {
    return (0, exports.createClient)({
        ...config,
        authMethod: 'session',
    });
};
exports.createSanctumClient = createSanctumClient;
// Helper function to create client with token auth
const createTokenClient = async (config) => {
    return (0, exports.createClient)({
        ...config,
        authMethod: 'token',
    });
};
exports.createTokenClient = createTokenClient;
//# sourceMappingURL=client.js.map