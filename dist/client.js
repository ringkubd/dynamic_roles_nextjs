"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.createClient = exports.DynamicRolesClient = void 0;
const axios_1 = __importDefault(require("axios"));
class DynamicRolesClient {
    constructor(config) {
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
        this.api = axios_1.default.create({
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
    setupInterceptors() {
        // Request interceptor for auth token
        this.api.interceptors.request.use((config) => {
            const token = this.getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        // Response interceptor for error handling
        this.api.interceptors.response.use((response) => response, (error) => {
            const apiError = {
                message: error.response?.data?.message || error.message,
                status: error.response?.status || 500,
                errors: error.response?.data?.errors,
            };
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
        const response = await this.api.get('/user/permissions');
        return response.data.data;
    }
    async getUserRoles() {
        const response = await this.api.get('/user/roles');
        return response.data.data;
    }
    async getUserMenus() {
        const response = await this.api.get('/user/menus');
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
const createClient = (config) => {
    clientInstance = new DynamicRolesClient(config);
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
//# sourceMappingURL=client.js.map