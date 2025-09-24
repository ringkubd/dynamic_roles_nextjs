import React, { useState, useEffect } from 'react';
import { useRoles, usePermissions } from '../hooks';
import { getClient } from '../client';
import { Role, Permission, User } from '../types';

interface RolePermissionSetupProps {
  className?: string;
  onSave?: (roleId: number, permissionIds: number[]) => void;
  onError?: (error: string) => void;
  debug?: boolean; // Optional debug mode - defaults to process.env.NODE_ENV === 'development'
}

interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export const RolePermissionSetup: React.FC<RolePermissionSetupProps> = ({
  className = '',
  onSave,
  onError,
  debug
}) => {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const { permissions, loading: permissionsLoading, error: permissionsError } = usePermissions();
  
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RoleWithPermissions[]>([]);
  const [permissionChanges, setPermissionChanges] = useState<Record<number, number[]>>({});
  const [saving, setSaving] = useState(false);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);

  const client = getClient();

  // Determine debug mode - use prop or auto-detect development environment
  const isDebugMode = debug !== undefined ? debug : (
    typeof window !== 'undefined' && 
    ((window as any).__DEV__ === true || 
     (window as any).location?.hostname === 'localhost' ||
     (window as any).location?.hostname === '127.0.0.1')
  );

  // Debug logging helper
  const debugLog = React.useCallback((message: string, data?: any) => {
    if (isDebugMode) {
      console.log(`[RolePermissionSetup Debug] ${message}`, data || '');
    }
  }, [isDebugMode]);

  // Initial debug log
  React.useEffect(() => {
    if (isDebugMode) {
      debugLog('Component initialized', {
        rolesLoading,
        permissionsLoading,
        rolesCount: roles.length,
        permissionsCount: permissions.length,
        debugMode: isDebugMode
      });
    }
  }, [debugLog, isDebugMode, rolesLoading, permissionsLoading, roles.length, permissions.length]);

  // Load role permissions when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!roles.length) {
        debugLog('No roles found, skipping permission loading');
        return;
      }
      
      debugLog('Loading role permissions', { roleCount: roles.length, roles });
      setLoadingRolePermissions(true);
      
      try {
        const rolesWithPermissions: RoleWithPermissions[] = await Promise.all(
          roles.map(async (role) => {
            try {
              debugLog(`Loading permissions for role: ${role.name}`, { roleId: role.id });
              const rolePerms = await client.getRolePermissions(role.id);
              const validPerms = Array.isArray(rolePerms) ? rolePerms : [];
              debugLog(`Loaded ${validPerms.length} permissions for role: ${role.name}`, validPerms);
              return { ...role, permissions: validPerms };
            } catch (error) {
              debugLog(`Failed to load permissions for role ${role.id}`, error);
              console.error(`Failed to load permissions for role ${role.id}:`, error);
              return { ...role, permissions: [] };
            }
          })
        );
        
        debugLog('All role permissions loaded successfully', rolesWithPermissions);
        setRolePermissions(rolesWithPermissions);
      } catch (error) {
        debugLog('Failed to load role permissions', error);
        console.error('Failed to load role permissions:', error);
        onError?.('Failed to load role permissions');
      } finally {
        setLoadingRolePermissions(false);
      }
    };

    loadData();
  }, [roles, client, onError, debugLog]);

  const getRolePermissionIds = (roleId: number): number[] => {
    if (permissionChanges[roleId]) {
      debugLog(`Using unsaved changes for role ${roleId}`, permissionChanges[roleId]);
      return permissionChanges[roleId];
    }
    const role = rolePermissions.find(r => r.id === roleId);
    const permissionIds = role?.permissions?.map(p => p.id) || [];
    debugLog(`Getting permission IDs for role ${roleId}`, { role: role?.name, permissionIds });
    return permissionIds;
  };

  const handlePermissionToggle = (roleId: number, permissionId: number) => {
    const currentPermissions = getRolePermissionIds(roleId);
    const isCurrentlySelected = currentPermissions.indexOf(permissionId) !== -1;
    const newPermissions = isCurrentlySelected
      ? currentPermissions.filter(id => id !== permissionId)
      : currentPermissions.concat([permissionId]);
    
    debugLog(`Permission toggle for role ${roleId}`, {
      permissionId,
      isCurrentlySelected,
      currentCount: currentPermissions.length,
      newCount: newPermissions.length
    });
    
    setPermissionChanges(prev => ({
      ...prev,
      [roleId]: newPermissions
    }));
  };

  const saveRolePermissions = async (roleId: number) => {
    if (!permissionChanges[roleId]) {
      debugLog(`No changes to save for role ${roleId}`);
      return;
    }

    debugLog(`Saving permissions for role ${roleId}`, {
      permissionIds: permissionChanges[roleId],
      count: permissionChanges[roleId].length
    });

    setSaving(true);
    try {
      await client.assignRolePermissions(roleId, { permissions: permissionChanges[roleId] });
      debugLog(`Successfully saved permissions for role ${roleId}`);
      
      // Update local state
      setRolePermissions(prev => 
        prev.map(role => 
          role.id === roleId 
            ? { 
                ...role, 
                permissions: permissionChanges[roleId] 
                  ? permissions.filter(p => permissionChanges[roleId].indexOf(p.id) !== -1)
                  : []
              }
            : role
        )
      );

      // Clear changes for this role
      setPermissionChanges(prev => {
        const { [roleId]: removed, ...rest } = prev;
        return rest;
      });

      onSave?.(roleId, permissionChanges[roleId]);
    } catch (error: any) {
      debugLog(`Failed to save permissions for role ${roleId}`, error);
      console.error('Failed to save role permissions:', error);
      onError?.(error.message || 'Failed to save role permissions');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (roleId: number) => {
    return permissionChanges[roleId] !== undefined;
  };

  const getPermissionsByCategory = (): Record<string, Permission[]> => {
    const categories: Record<string, Permission[]> = {};
    if (!Array.isArray(permissions)) {
      debugLog('Permissions is not an array', permissions);
      return categories;
    }
    
    debugLog(`Categorizing ${permissions.length} permissions`);
    
    permissions.forEach(permission => {
      if (permission && permission.name) {
        const category = permission.name.split('-')[0] || 'general';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(permission);
      }
    });
    
    debugLog('Permission categories created', Object.keys(categories).map(cat => `${cat}: ${categories[cat].length}`));
    return categories;
  };

  if (rolesLoading || permissionsLoading || loadingRolePermissions) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (rolesError || permissionsError) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {rolesError || permissionsError}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className={`p-6 ${className}`}>
      {isDebugMode && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-yellow-800">Debug Mode Enabled</span>
          </div>
          <div className="mt-2 text-xs text-yellow-700">
            Roles: {rolePermissions.length} | Permissions: {permissions.length} | 
            Changes: {Object.keys(permissionChanges).length} | 
            Loading: {loadingRolePermissions ? 'Yes' : 'No'}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Permission Setup</h2>
        <p className="text-gray-600">Manage permissions for each role in your application.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Roles</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {rolePermissions.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                      selectedRole === role.id
                        ? 'bg-blue-100 text-blue-800 border-blue-200 border'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role.name}</span>
                      {hasChanges(role.id) && (
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getRolePermissionIds(role.id).length} permissions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Permissions for {rolePermissions.find(r => r.id === selectedRole)?.name}
                </h3>
                {hasChanges(selectedRole) && (
                  <button
                    onClick={() => saveRolePermissions(selectedRole)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  {Object.keys(permissionCategories).map((category: string) => {
                    const categoryPermissions = permissionCategories[category];
                    return (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryPermissions.map((permission: Permission) => {
                          const isChecked = getRolePermissionIds(selectedRole).indexOf(permission.id) !== -1;
                          return (
                            <label
                              key={permission.id}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(selectedRole, permission.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Guard: {permission.guard_name}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No role selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a role from the list to manage its permissions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionSetup;
