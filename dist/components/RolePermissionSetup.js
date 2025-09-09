"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionSetup = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const hooks_1 = require("../hooks");
const client_1 = require("../client");
const RolePermissionSetup = ({ className = '', onSave, onError }) => {
    const { roles, loading: rolesLoading, error: rolesError } = (0, hooks_1.useRoles)();
    const { permissions, loading: permissionsLoading, error: permissionsError } = (0, hooks_1.usePermissions)();
    const [selectedRole, setSelectedRole] = (0, react_1.useState)(null);
    const [rolePermissions, setRolePermissions] = (0, react_1.useState)([]);
    const [permissionChanges, setPermissionChanges] = (0, react_1.useState)({});
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [loadingRolePermissions, setLoadingRolePermissions] = (0, react_1.useState)(false);
    const client = (0, client_1.getClient)();
    // Load role permissions when component mounts
    (0, react_1.useEffect)(() => {
        const loadData = async () => {
            if (!roles.length)
                return;
            setLoadingRolePermissions(true);
            try {
                const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
                    try {
                        const rolePerms = await client.getRolePermissions(role.id);
                        return { ...role, permissions: rolePerms };
                    }
                    catch (error) {
                        console.error(`Failed to load permissions for role ${role.id}:`, error);
                        return { ...role, permissions: [] };
                    }
                }));
                setRolePermissions(rolesWithPermissions);
            }
            catch (error) {
                console.error('Failed to load role permissions:', error);
                onError?.('Failed to load role permissions');
            }
            finally {
                setLoadingRolePermissions(false);
            }
        };
        loadData();
    }, [roles, client, onError]);
    const getRolePermissionIds = (roleId) => {
        if (permissionChanges[roleId]) {
            return permissionChanges[roleId];
        }
        const role = rolePermissions.find(r => r.id === roleId);
        return role?.permissions.map(p => p.id) || [];
    };
    const handlePermissionToggle = (roleId, permissionId) => {
        const currentPermissions = getRolePermissionIds(roleId);
        const newPermissions = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(id => id !== permissionId)
            : [...currentPermissions, permissionId];
        setPermissionChanges(prev => ({
            ...prev,
            [roleId]: newPermissions
        }));
    };
    const saveRolePermissions = async (roleId) => {
        if (!permissionChanges[roleId])
            return;
        setSaving(true);
        try {
            await client.assignRolePermissions(roleId, { permission_ids: permissionChanges[roleId] });
            // Update local state
            setRolePermissions(prev => prev.map(role => role.id === roleId
                ? {
                    ...role,
                    permissions: permissions.filter(p => permissionChanges[roleId].includes(p.id))
                }
                : role));
            // Clear changes for this role
            setPermissionChanges(prev => {
                const { [roleId]: removed, ...rest } = prev;
                return rest;
            });
            onSave?.(roleId, permissionChanges[roleId]);
        }
        catch (error) {
            console.error('Failed to save role permissions:', error);
            onError?.(error.message || 'Failed to save role permissions');
        }
        finally {
            setSaving(false);
        }
    };
    const hasChanges = (roleId) => {
        return permissionChanges[roleId] !== undefined;
    };
    const getPermissionsByCategory = () => {
        const categories = {};
        permissions.forEach(permission => {
            const category = permission.name.split('-')[0] || 'general';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(permission);
        });
        return categories;
    };
    if (rolesLoading || permissionsLoading || loadingRolePermissions) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `p-6 ${className}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "animate-pulse", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-gray-200 rounded" }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-gray-200 rounded w-5/6" }), (0, jsx_runtime_1.jsx)("div", { className: "h-3 bg-gray-200 rounded w-4/6" })] })] }) }));
    }
    if (rolesError || permissionsError) {
        return ((0, jsx_runtime_1.jsx)("div", { className: `p-6 ${className}`, children: (0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-red-800", children: "Error loading data" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-sm text-red-700", children: rolesError || permissionsError })] })] }) }) }));
    }
    const permissionCategories = getPermissionsByCategory();
    return ((0, jsx_runtime_1.jsxs)("div", { className: `p-6 ${className}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Role Permission Setup" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage permissions for each role in your application." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "lg:col-span-1", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-4 py-3 border-b border-gray-200", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: "Roles" }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: rolePermissions.map((role) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedRole(role.id), className: `w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${selectedRole === role.id
                                                ? 'bg-blue-100 text-blue-800 border-blue-200 border'
                                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: role.name }), hasChanges(role.id) && ((0, jsx_runtime_1.jsx)("span", { className: "w-2 h-2 bg-orange-400 rounded-full" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500 mt-1", children: [getRolePermissionIds(role.id).length, " permissions"] })] }, role.id))) }) })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "lg:col-span-2", children: selectedRole ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-3 border-b border-gray-200 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-medium text-gray-900", children: ["Permissions for ", rolePermissions.find(r => r.id === selectedRole)?.name] }), hasChanges(selectedRole) && ((0, jsx_runtime_1.jsx)("button", { onClick: () => saveRolePermissions(selectedRole), disabled: saving, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: saving ? 'Saving...' : 'Save Changes' }))] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: Object.entries(permissionCategories).map(([category, categoryPermissions]) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3", children: category }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: categoryPermissions.map((permission) => {
                                                        const isChecked = getRolePermissionIds(selectedRole).includes(permission.id);
                                                        return ((0, jsx_runtime_1.jsxs)("label", { className: "flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: isChecked, onChange: () => handlePermissionToggle(selectedRole, permission.id), className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3 flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900", children: permission.name }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["Guard: ", permission.guard_name] })] })] }, permission.id));
                                                    }) })] }, category))) }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "bg-white border border-gray-200 rounded-lg shadow-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-8 text-center", children: [(0, jsx_runtime_1.jsx)("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No role selected" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Select a role from the list to manage its permissions." })] }) })) })] })] }));
};
exports.RolePermissionSetup = RolePermissionSetup;
exports.default = exports.RolePermissionSetup;
//# sourceMappingURL=RolePermissionSetup.js.map