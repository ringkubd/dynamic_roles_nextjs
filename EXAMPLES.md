# Example Usage

This directory contains example usage of the Dynamic Roles Next.js client package.

## Basic Setup

```typescript
// lib/dynamic-roles.ts
import { createClient } from '@anwar/dynamic-roles-nextjs';

const client = createClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  authToken: () => {
    return localStorage.getItem('auth_token') || '';
  },
});

export default client;
```

## Component Examples

### Permission Guard Component

```typescript
// components/PermissionGuard.tsx
import { usePermissions } from '@anwar/dynamic-roles-nextjs';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { permissions, loading } = usePermissions();

  if (loading) return <div>Checking permissions...</div>;

  const hasPermission = permissions.some(p => p.name === permission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
```

### Dynamic Navigation

```typescript
// components/DynamicNav.tsx
import { useMenus } from '@anwar/dynamic-roles-nextjs';
import Link from 'next/link';

export default function DynamicNav() {
  const { menus, loading, error } = useMenus();

  if (loading) return <nav>Loading navigation...</nav>;
  if (error) return <nav>Error loading navigation</nav>;

  return (
    <nav className="flex space-x-4">
      {menus.map(menu => (
        <Link 
          key={menu.id} 
          href={menu.url || '#'}
          className="px-3 py-2 text-blue-600 hover:text-blue-800"
        >
          {menu.icon && <span className={`icon-${menu.icon} mr-2`} />}
          {menu.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Usage in Pages

```typescript
// pages/admin/users.tsx
import { usePermissions, usePermissionCheck } from '@anwar/dynamic-roles-nextjs';
import PermissionGuard from '../../components/PermissionGuard';

export default function UsersPage() {
  const { checkPermission } = usePermissionCheck();

  const handleDeleteUser = async (userId: number) => {
    const canDelete = await checkPermission('delete-users');
    
    if (!canDelete) {
      alert('You do not have permission to delete users');
      return;
    }

    // Proceed with deletion
    console.log('Deleting user:', userId);
  };

  return (
    <div>
      <h1>User Management</h1>
      
      <PermissionGuard permission="view-users">
        <div>
          {/* User list component */}
          <p>User list goes here...</p>
        </div>
      </PermissionGuard>

      <PermissionGuard 
        permission="create-users"
        fallback={<p>You cannot create users</p>}
      >
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Create User
        </button>
      </PermissionGuard>
    </div>
  );
}
```
