# Dynamic Roles Next.js Client

A comprehensive Next.js client package for interfacing with the Dynamic Roles Laravel backend API. This package provides TypeScript types, API client, and React hooks for managing roles, permissions, menus, URLs, and cache/health monitoring.

## Installation

```bash
npm install @ringkubd/dynamic-roles-nextjs
# or
yarn add @ringkubd/dynamic-roles-nextjs
```

## Features

- 🔐 **Complete Permission Management** - Hooks for users, roles, permissions, and URLs
- 🔑 **Dual Authentication Support** - Token-based and session-based (Laravel Sanctum) authentication
- 🛡️ **Automatic CSRF Protection** - Built-in CSRF token management for session authentication
- 🎛️ **Interactive Role Editor** - React component for managing role permissions
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🚀 **TypeScript First** - Full type safety and IntelliSense support
- 🔌 **Easy Integration** - Simple hooks-based API for React/Next.js
- 📊 **Cache Management** - Built-in caching with health monitoring
- 🎨 **Customizable UI** - Style with your own CSS or use included classes
- 🌐 **Laravel Integration** - Works seamlessly with Dynamic Roles Laravel package
- 🔄 **Auto-retry Logic** - Automatic token refresh and request retry on authentication errors

## Quick Start

### 1. Setup the Client

The package supports both **token-based** and **session-based** authentication (like Laravel Sanctum). Choose the method that fits your backend setup:

#### Option A: Token-Based Authentication

```typescript
// lib/dynamic-roles.ts
import { createTokenClient } from '@ringkubd/dynamic-roles-nextjs';

const client = await createTokenClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default client;
```

#### Option B: Session-Based Authentication (Laravel Sanctum)

```typescript
// lib/dynamic-roles.ts
import { createSanctumClient } from '@ringkubd/dynamic-roles-nextjs';

const client = await createSanctumClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  sessionAuth: {
    csrfTokenUrl: '/sanctum/csrf-cookie',
    csrfCookieName: 'XSRF-TOKEN',
    csrfHeaderName: 'X-XSRF-TOKEN',
    withCredentials: true,
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default client;
```

#### Option C: Manual Configuration

```typescript
// lib/dynamic-roles.ts
import { createClient } from '@ringkubd/dynamic-roles-nextjs';

const client = await createClient({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  authMethod: 'session', // or 'token'
  sessionAuth: {
    csrfTokenUrl: '/sanctum/csrf-cookie',
    csrfCookieName: 'XSRF-TOKEN',
    csrfHeaderName: 'X-XSRF-TOKEN',
    withCredentials: true,
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export default client;
```

### 2. Authentication

#### Token-Based Authentication

```typescript
// For token-based auth, handle login and token storage
const client = await createTokenClient({ /* config */ });

// Login and automatically store token
try {
  const response = await client.login({
    email: 'user@example.com',
    password: 'password'
  });
  console.log('Login successful:', response);
} catch (error) {
  console.error('Login failed:', error);
}

// Token is automatically included in subsequent requests
const permissions = await client.getUserPermissions();
```

#### Session-Based Authentication (Laravel Sanctum)

```typescript
// For session-based auth, CSRF tokens are handled automatically
const client = await createSanctumClient({ /* config */ });

// Login with credentials (no token storage needed)
try {
  const response = await client.login({
    email: 'user@example.com',
    password: 'password'
  });
  console.log('Login successful:', response);
} catch (error) {
  console.error('Login failed:', error);
}

// All requests automatically include CSRF tokens and cookies
const permissions = await client.getUserPermissions();

// Logout clears session
await client.logout();
```

### 3. Use React Hooks

```typescript
// components/PermissionsList.tsx
import { usePermissions, useRoles } from '@ringkubd/dynamic-roles-nextjs';

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

## Components

### RolePermissionSetup

A comprehensive React component for managing role permissions with an interactive UI.

```typescript
import { RolePermissionSetup } from '@ringkubd/dynamic-roles-nextjs';

function AdminPanel() {
  const handleSave = (roleId: number, permissionIds: number[]) => {
    console.log(`Role ${roleId} updated with permissions:`, permissionIds);
    // Show success message
  };

  const handleError = (error: string) => {
    console.error('Error updating permissions:', error);
    // Show error message
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Role Management</h1>
      <RolePermissionSetup 
        onSave={handleSave}
        onError={handleError}
        className="bg-white rounded-lg shadow"
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `className` | `string` | Additional CSS classes for styling | `''` |
| `onSave` | `(roleId: number, permissionIds: number[]) => void` | Callback when permissions are saved | `undefined` |
| `onError` | `(error: string) => void` | Callback when an error occurs | `undefined` |

#### Features

- **Role Selection**: Click on any role to view and edit its permissions
- **Permission Categories**: Permissions are automatically grouped by category (user, admin, content, etc.)
- **Real-time Changes**: See unsaved changes with visual indicators
- **Bulk Operations**: Select all/none buttons for each permission category
- **Loading States**: Built-in loading and error handling
- **Responsive Design**: Works on desktop and mobile devices

## API Client Usage

You can also use the API client directly for more advanced operations:

```typescript
import { getClient } from '@ringkubd/dynamic-roles-nextjs';

const client = getClient();

// Authentication methods
await client.login({ email: 'user@example.com', password: 'password' });
await client.logout();

// For session-based auth, refresh CSRF tokens
await client.refreshSession();

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

### Authentication Methods

The client provides several authentication-related methods:

```typescript
// Initialize session (for session-based auth)
await client.initializeSession();

// Login with credentials
const response = await client.login({
  email: 'user@example.com',
  password: 'password'
});

// Logout and clear authentication
await client.logout();

// For token-based auth
client.setAuthToken('your-token-here');
client.removeAuthToken();

// For session-based auth
await client.refreshSession(); // Refresh CSRF tokens
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
} from '@ringkubd/dynamic-roles-nextjs';

// All API responses are properly typed
const roles: Role[] = await client.getUserRoles();
const menus: DynamicMenu[] = await client.getMenus();
```

## Authentication Methods

This package supports two authentication methods:

### Token-Based Authentication
- Uses `Authorization: Bearer {token}` headers
- Tokens stored in localStorage/sessionStorage
- Perfect for API-only backends

### Session-Based Authentication (Laravel Sanctum)
- Uses cookies and CSRF tokens
- Automatic CSRF token management
- Perfect for Laravel SPA authentication
- Supports automatic token refresh on 419 errors

## Configuration Options

```typescript
interface DynamicRolesConfig {
  apiBaseUrl: string;                    // Backend API base URL
  authMethod?: 'token' | 'session';     // Authentication method (default: 'token')
  apiVersion?: string;                   // API version (default: 'v1')
  timeout?: number;                      // Request timeout (default: 10000)
  retryAttempts?: number;               // Retry attempts (default: 3)
  headers?: Record<string, string>;     // Additional headers
  sessionAuth?: {                       // Session auth configuration (for Sanctum)
    csrfTokenUrl?: string;              // CSRF token endpoint (default: '/sanctum/csrf-cookie')
    csrfCookieName?: string;            // CSRF cookie name (default: 'XSRF-TOKEN')
    csrfHeaderName?: string;            // CSRF header name (default: 'X-XSRF-TOKEN')
    withCredentials?: boolean;          // Include credentials (default: true)
    sanctumPath?: string;               // Sanctum path prefix (default: '/sanctum')
  };
  cache?: {
    enabled?: boolean;                   // Enable client-side caching
    ttl?: number;                       // Cache TTL in ms (default: 5 minutes)
  };
}
```

## Error Handling

All hooks provide error states and the API client throws typed errors:

```typescript
import { ApiError } from '@ringkubd/dynamic-roles-nextjs';

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

## Laravel Sanctum Setup

For Laravel Sanctum integration, ensure your Laravel backend is properly configured:

### 1. Laravel Backend Configuration

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),

// Add your Next.js domain to stateful domains
'stateful' => [
    'localhost:3000',
    'your-frontend-domain.com',
],
```

### 2. CORS Configuration

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000', 'https://your-frontend-domain.com'],
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
'supports_credentials' => true,
```

### 3. Session Configuration

```php
// config/session.php
'domain' => env('SESSION_DOMAIN', null), // Set to your domain
'same_site' => 'lax', // Important for cross-domain cookies
```

### 4. Environment Variables

```env
SESSION_DOMAIN=.your-domain.com
SANCTUM_STATEFUL_DOMAINS=localhost:3000,your-frontend-domain.com
```

## Next.js App Router Example

```typescript
// app/dashboard/page.tsx
'use client';

import { usePermissions, useMenus } from '@ringkubd/dynamic-roles-nextjs';

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

### Complete Login Example with Sanctum

```typescript
// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { getClient } from '@ringkubd/dynamic-roles-nextjs';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const client = getClient();
      await client.login(credentials);
      
      // Redirect to dashboard or refresh the page
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Laravel Blade Views (Alternative to Next.js)

The Dynamic Roles Laravel package also includes traditional Blade views for applications that don't use API-only architecture. This provides a complete web interface for managing roles and permissions.

### Available Routes

Once you enable web routes in your Laravel application, you'll have access to:

```php
// Dashboard with statistics
/dynamic-roles

// Role management
/dynamic-roles/roles                    // List all roles
/dynamic-roles/roles/{role}            // View role details
/dynamic-roles/roles/{role}/edit       // Edit role permissions

// Permission management  
/dynamic-roles/permissions             // List all permissions

// URL management
/dynamic-roles/urls                    // Manage route permissions
/dynamic-roles/urls/{id}              // View URL details
/dynamic-roles/urls/{id}/edit         // Edit URL permissions

// Menu management
/dynamic-roles/menus                  // Manage dynamic menus
/dynamic-roles/menus/{id}             // View menu details

// Cache management
/dynamic-roles/cache                  // View cache statistics
/dynamic-roles/cache/clear            // Clear cache operations
```

### Configuration

Enable web routes in your Laravel configuration:

```php
// config/dynamic-roles.php
return [
    'enable_api_routes' => true,    // For Next.js integration
    'enable_web_routes' => true,    // For Blade views
    // ...other config
];
```

### Features

- **Dashboard**: Overview with role/permission statistics
- **Role Permission Editor**: Interactive checkboxes for assigning permissions
- **Responsive Design**: Modern Tailwind CSS styling
- **Permission Categories**: Organized permission groups
- **Real-time Feedback**: Success/error messages
- **Cache Management**: Clear cache with statistics

### Accessing the Interface

After installation, simply navigate to `/dynamic-roles` in your Laravel application to access the management interface. Make sure you're authenticated and have the necessary permissions to access these routes.

```php
// Add middleware to your routes if needed
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dynamic roles routes will be automatically registered
});
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

**Anwar Jahid** - [ajr.jahid@gmail.com](mailto:ajr.jahid@gmail.com)

## Support

For support, email ajr.jahid@gmail.com or create an issue in the repository.
