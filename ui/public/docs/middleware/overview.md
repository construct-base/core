# Middleware System

Construct provides a flexible middleware system for route protection and navigation guards, similar to Nuxt's middleware but adapted for Vue Router.

## Available Middleware

### `auth`
Protects routes that require authentication. Redirects unauthenticated users to login.

```typescript
// Usage in pages
layout({"use": "default", "middleware": ["auth"]})
```

### `guest`
For authentication pages (login, register). Redirects authenticated users away.

```typescript
// Usage in authentication pages
layout({"use": "default", "middleware": ["guest"]})
```

### `public`
Allows access to both authenticated and unauthenticated users. For public pages like about, landing.

```typescript
// Usage in public pages
layout({"use": "default", "middleware": ["public"]})
```

### `admin`
Restricts access to admin users only. Checks user role permissions.

```typescript
// Usage in admin pages
layout({"use": "admin", "middleware": ["admin"]})
```

## How to Use Middleware

### In Pages
Use the `layout()` function in your page's script setup:

```vue
<script setup lang="ts">
// Protect with authentication
layout({"use": "default", "middleware": ["auth"]})

// Multiple middleware (executed in order)
layout({"use": "default", "middleware": ["auth", "admin"]})
</script>
```

### Global Middleware
Configure in `config.ts` for application-wide middleware:

```typescript
export default defineConstructConfig({
  middleware: {
    global: ['loading'], // Applied to all routes
    named: {
      // Named middleware for specific use cases
    }
  }
})
```

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
  const { user } = useAuth()

  if (!user.value?.subscription?.active) {
    next('/subscription/upgrade')
    return
  }

  next()
}
```

Register in `core/middleware/index.ts`:

```typescript
import subscriptionMiddleware from './subscription'

const middlewareRegistry = {
  // ... existing middleware
  subscription: subscriptionMiddleware
}
```

## Middleware Execution Order

1. **Global middleware** (from config)
2. **Page middleware** (from layout function)
3. Multiple middleware execute sequentially

## Best Practices

- Use `public` for landing, about, documentation pages
- Use `guest` only for login/register pages
- Use `auth` for protected user content
- Use `admin` for administrative functions
- Create custom middleware for specific business logic (subscriptions, permissions, etc.)