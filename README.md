# Dynamic Roles Next.js Client

A comprehensive Next.js client package for interfacing with the Dynamic Roles Laravel backend API. This package provides TypeScript types, API client, and React hooks for managing roles, permissions, menus, URLs, and cache/health monitoring.

## Installation

```bash
npm install @anwar/dynamic-roles-nextjs
# or
yarn add @anwar/dynamic-roles-nextjs
```

## Quick Start

### 1. Setup the Client

First, configure the API client in your Next.js app:

```typescript
// lib/dynamic-roles.ts
import { createClient } from '@anwar/dynamic-roles-nextjs';

const client = createClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  authToken: () => {
    // Return your auth token here
    // This can be from localStorage, cookies, or any auth provider
    return localStorage.getItem('auth_token') || '';
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default client;
```

### 2. Use React Hooks

```typescript
// components/PermissionsList.tsx
import { usePermissions, useRoles } from '@anwar/dynamic-roles-nextjs';

export default function PermissionsList() {
  const { permissions, loading, error, refetch } = usePermissions();
  const { roles } = useRoles();

  if (loading) return <div>Loading permissions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Permissions</h2>
      <ul>
        {permissions.map(permission => (
          <li key={permission.id}>{permission.name}</li>
        ))}
      </ul>
      
      <h2>User Roles</h2>
      <ul>
        {roles.map(role => (
          <li key={role.id}>{role.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Available Hooks

### usePermissions()
Get user's permissions with loading and error states.

```typescript
const { permissions, loading, error, refetch } = usePermissions();
```

### useRoles()
Get user's roles with loading and error states.

```typescript
const { roles, loading, error, refetch } = useRoles();
```

### useMenus()
Get dynamic menus for the authenticated user.

```typescript
const { menus, loading, error, refetch } = useMenus();
```

### useUrls(page?, perPage?)
Get paginated URLs with permission management.

```typescript
const { urls, loading, error, pagination, refetch } = useUrls(1, 20);
```

### usePermissionCheck()
Check if user has specific permissions.

```typescript
const { checkPermission, checkRole, loading } = usePermissionCheck();

// Check permission
const hasPermission = await checkPermission('edit-posts');

// Check role
const hasRole = await checkRole('admin');
```

### usePermissionLogs(page?, perPage?)
Get paginated permission check logs.

```typescript
const { logs, loading, error, pagination, refetch } = usePermissionLogs(1, 15);
```

### useCache()
Manage cache operations.

```typescript
const { clearCache, clearUserCache, getStats, loading, error } = useCache();

// Clear all cache
await clearCache();

// Clear specific user cache
await clearUserCache(userId);

// Get cache statistics
const stats = await getStats();
```

### useHealthCheck()
Monitor API health status.

```typescript
const { health, loading, error, refetch } = useHealthCheck();

console.log(health.status); // 'healthy' | 'unhealthy'
console.log(health.database); // database connection status
console.log(health.cache); // cache status
```

## API Client Usage

You can also use the API client directly for more advanced operations:

```typescript
import { getClient } from '@anwar/dynamic-roles-nextjs';

const client = getClient();

// Create a new URL
const newUrl = await client.createUrl({
  url: '/api/posts',
  method: 'GET',
  name: 'List Posts',
  description: 'Get all posts',
  is_active: true,
});

// Assign permissions to URL
await client.assignUrlPermissions(newUrl.id, [1, 2, 3]); // permission IDs

// Create menu item
const menu = await client.createMenu({
  name: 'posts',
  label: 'Posts',
  url: '/posts',
  icon: 'file-text',
  sort_order: 1,
  is_active: true,
});
```

## TypeScript Support

This package is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  Role, 
  Permission, 
  DynamicMenu, 
  DynamicUrl,
  User,
  ApiResponse,
  PaginatedResponse 
} from '@anwar/dynamic-roles-nextjs';

// All API responses are properly typed
const roles: Role[] = await client.getUserRoles();
const menus: DynamicMenu[] = await client.getMenus();
```

## Configuration Options

```typescript
interface DynamicRolesConfig {
  apiBaseUrl: string;                    // Backend API base URL
  authToken?: string | (() => string);   // Auth token or function to get token
  apiVersion?: string;                   // API version (default: 'v1')
  timeout?: number;                      // Request timeout (default: 10000)
  retryAttempts?: number;               // Retry attempts (default: 3)
  headers?: Record<string, string>;     // Additional headers
  cache?: {
    enabled?: boolean;                   // Enable client-side caching
    ttl?: number;                       // Cache TTL in ms (default: 5 minutes)
  };
}
```

## Error Handling

All hooks provide error states and the API client throws typed errors:

```typescript
import { ApiError } from '@anwar/dynamic-roles-nextjs';

try {
  const permissions = await client.getUserPermissions();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  }
}
```

## Next.js App Router Example

```typescript
// app/dashboard/page.tsx
'use client';

import { usePermissions, useMenus } from '@anwar/dynamic-roles-nextjs';

export default function Dashboard() {
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { menus, loading: menusLoading } = useMenus();

  if (permissionsLoading || menusLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Render navigation based on user menus */}
      <nav>
        {menus.map(menu => (
          <a key={menu.id} href={menu.url}>
            {menu.icon && <span className={`icon-${menu.icon}`} />}
            {menu.label}
          </a>
        ))}
      </nav>

      {/* Conditional rendering based on permissions */}
      {permissions.some(p => p.name === 'manage-users') && (
        <div>
          <h2>User Management</h2>
          {/* User management components */}
        </div>
      )}
    </div>
  );
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Anwar** - [anwar@gunma.com](mailto:anwar@gunma.com)

## Support

For support, email anwar@gunma.com or create an issue in the repository.
