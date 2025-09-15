# Middleware System

Construct provides a simple middleware system for route protection based on localStorage authentication state. The system follows a simple principle: **routes with middleware require authentication, everything else is public**.

## Available Middleware

### `auth`
Protects routes that require authentication. Checks localStorage for `auth_token` and `auth_user`. Redirects unauthenticated users to login.

```typescript
// Usage in pages
layout({"use": "default", "middleware": ["auth"]})
```

### `guest`
For authentication pages (login, register). Redirects authenticated users to the dashboard or intended destination.

```typescript
// Usage in authentication pages
layout({"use": "auth", "middleware": ["guest"]})
```

### `admin`
Restricts access to admin users only. Checks both authentication and user role (admin, owner, super_admin).

```typescript
// Usage in admin pages
layout({"use": "admin", "middleware": ["admin"]})
```

### **No Middleware = Public**
Routes without middleware are public and accessible to everyone.

```typescript
// Public pages (no middleware needed)
layout({"use": "default"})
```

## How Authentication Works

### localStorage-Based Auth
The middleware system checks localStorage for authentication:

```javascript
// What the middleware checks
const token = localStorage.getItem('auth_token')
const user = localStorage.getItem('auth_user')

// If both exist → user is authenticated
// If either is missing → user is not authenticated
```

### Auth Data Structure
```javascript
// localStorage.getItem('auth_token')
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// localStorage.getItem('auth_user')
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role": {
    "id": 1,
    "name": "Owner"
  }
}
```

## Usage Examples

### Protected User Page
```vue
<script setup lang="ts">
// Requires authentication
layout({"use": "default", "middleware": ["auth"]})

// This page is only accessible to authenticated users
const { user } = useAuth()
</script>

<template>
  <div>
    <h1>Welcome, {{ user?.first_name }}!</h1>
  </div>
</template>
```

### Admin Page
```vue
<script setup lang="ts">
// Requires authentication + admin role
layout({"use": "admin", "middleware": ["admin"]})

// Only admins/owners can access this
</script>

<template>
  <div>
    <h1>Admin Dashboard</h1>
  </div>
</template>
```

### Public Page
```vue
<script setup lang="ts">
// No middleware = public access
layout({"use": "default"})

// Everyone can access this page
</script>

<template>
  <div>
    <h1>About Us</h1>
    <p>This page is accessible to everyone</p>
  </div>
</template>
```

### Authentication Pages
```vue
<script setup lang="ts">
// Redirects authenticated users away
layout({"use": "auth", "middleware": ["guest"]})

// If user is already logged in, they'll be redirected to dashboard
</script>

<template>
  <div>
    <h1>Login</h1>
    <!-- Login form -->
  </div>
</template>
```

## Middleware Flow

1. **No middleware**: Allow access (public page)
2. **`auth` middleware**: Check localStorage → login if missing
3. **`guest` middleware**: Check localStorage → redirect away if present
4. **`admin` middleware**: Check auth + role → redirect if insufficient

## Creating Custom Middleware

Create new middleware in `core/middleware/`:

```typescript
// core/middleware/subscription.ts
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export default function subscriptionMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Check localStorage for auth
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')

  if (!token || !userStr) {
    next('/auth/login')
    return
  }

  try {
    const user = JSON.parse(userStr)
    if (!user.subscription?.active) {
      next('/subscription/upgrade')
      return
    }
    next()
  } catch (error) {
    next('/auth/login')
  }
}
```

Register in `core/middleware/index.ts`:

```typescript
import subscriptionMiddleware from './subscription'

export function registerMiddleware(router: Router) {
  router.beforeEach((to, from, next) => {
    const middleware = to.meta?.middleware as string | string[] | undefined

    if (!middleware) {
      next() // Public route
      return
    }

    const middlewareName = Array.isArray(middleware) ? middleware[0] : middleware

    switch (middlewareName) {
      case 'auth':
        authMiddleware(to, from, next)
        break
      case 'guest':
        guestMiddleware(to, from, next)
        break
      case 'admin':
        adminMiddleware(to, from, next)
        break
      case 'subscription':
        subscriptionMiddleware(to, from, next)
        break
      default:
        next() // Unknown middleware, allow access
    }
  })
}
```

## Best Practices

### Security
- **Always validate on the backend**: Frontend middleware is for UX only
- **Check token expiration**: Implement token refresh logic
- **Clear sensitive data**: Remove localStorage on logout

### Route Organization
- **Public routes**: No middleware (landing, about, docs)
- **Auth routes**: Use `guest` middleware (login, register)
- **User routes**: Use `auth` middleware (profile, dashboard)
- **Admin routes**: Use `admin` middleware (admin panel)

### Performance
- **Minimize middleware logic**: Keep checks simple and fast
- **Cache auth state**: Use reactive stores instead of localStorage reads
- **Lazy load admin components**: Only load when needed

## Debugging Middleware

Check the browser console for middleware execution:

```javascript
// Enable debug mode in development
if (import.meta.env.DEV) {
  console.log('Route:', to.path, 'Middleware:', middleware)
  console.log('Auth state:', { token: !!token, user: !!user })
}
```

Common issues:
- **Redirect loops**: Check that login page has `guest` middleware
- **Admin access denied**: Verify user role in localStorage
- **Public pages requiring auth**: Remove middleware declaration