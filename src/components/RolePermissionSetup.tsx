import React, { useState, useEffect } from 'react';
import { useRoles, usePermissions } from '../hooks';
import { getClient } from '../client';
import { Role, Permission, User } from '../types';

interface RolePermissionSetupProps {
  className?: string;
  onSave?: (roleId: number, permissionIds: number[]) => void;
  onError?: (error: string) => void;
}

interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export const RolePermissionSetup: React.FC<RolePermissionSetupProps> = ({
  className = '',
  onSave,
  onError
}) => {
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const { permissions, loading: permissionsLoading, error: permissionsError } = usePermissions();
  
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RoleWithPermissions[]>([]);
  const [permissionChanges, setPermissionChanges] = useState<Record<number, number[]>>({});
  const [saving, setSaving] = useState(false);
  const [loadingRolePermissions, setLoadingRolePermissions] = useState(false);

  const client = getClient();

  // Load role permissions when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!roles.length) return;
      
      setLoadingRolePermissions(true);
      try {
        const rolesWithPermissions: RoleWithPermissions[] = await Promise.all(
          roles.map(async (role) => {
            try {
              const rolePerms = await client.getRolePermissions(role.id);
              return { ...role, permissions: rolePerms };
            } catch (error) {
              console.error(`Failed to load permissions for role ${role.id}:`, error);
              return { ...role, permissions: [] };
            }
          })
        );
        setRolePermissions(rolesWithPermissions);
      } catch (error) {
        console.error('Failed to load role permissions:', error);
        onError?.('Failed to load role permissions');
      } finally {
        setLoadingRolePermissions(false);
      }
    };

    loadData();
  }, [roles, client, onError]);

  const getRolePermissionIds = (roleId: number): number[] => {
    if (permissionChanges[roleId]) {
      return permissionChanges[roleId];
    }
    const role = rolePermissions.find(r => r.id === roleId);
    return role?.permissions.map(p => p.id) || [];
  };

  const handlePermissionToggle = (roleId: number, permissionId: number) => {
    const currentPermissions = getRolePermissionIds(roleId);
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    setPermissionChanges(prev => ({
      ...prev,
      [roleId]: newPermissions
    }));
  };

  const saveRolePermissions = async (roleId: number) => {
    if (!permissionChanges[roleId]) return;

    setSaving(true);
    try {
      await client.assignRolePermissions(roleId, { permission_ids: permissionChanges[roleId] });
      
      // Update local state
      setRolePermissions(prev => 
        prev.map(role => 
          role.id === roleId 
            ? { 
                ...role, 
                permissions: permissions.filter(p => permissionChanges[roleId].includes(p.id))
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
      console.error('Failed to save role permissions:', error);
      onError?.(error.message || 'Failed to save role permissions');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (roleId: number) => {
    return permissionChanges[roleId] !== undefined;
  };

  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
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
                  {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryPermissions.map((permission) => {
                          const isChecked = getRolePermissionIds(selectedRole).includes(permission.id);
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
                  ))}
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
