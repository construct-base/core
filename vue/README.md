# Construct Vue Framework

> The frontend framework for **Construct** - A modern full-stack framework combining Vue 3 + Base Go.

## Philosophy

Construct Vue brings together the best of both worlds:
- **Vue's reactive UI** - Component-based, modern, developer-friendly
- **Go's robust backend** - Fast, type-safe, concurrent, scalable

They work as **one cohesive framework**, not separate frontend/backend apps.

## Quick Start

### Development
```bash
# Start both Vue (3100) and Go (8100)
cd .. && ./run.sh

# Or start Vue only
bun run dev
```

### Production Build
```bash
# Build Vue SPA → outputs to ../public/
bun run build

# Go serves ../public/ with nginx or built-in server
```

## Architecture

### Convention over Configuration

#### 1. **Layouts = Middleware**
Layouts automatically handle authentication and routing:

```vue
<!-- layouts/default.vue - Requires authentication -->
<script setup>
import { useAuth } from '@/composables/useAuth'
const { isAuthenticated } = useAuth()

onMounted(() => {
  if (!isAuthenticated.value) router.push('/login')
})
</script>
```

Pages inherit layout middleware based on route configuration.

#### 2. **File-Based Routing**
```
pages/users.vue              → /users
pages/users/[id].vue         → /users/:id
pages/roles/[id]/permissions.vue → /roles/:id/permissions
```

#### 3. **Type-Safe API Client**
```typescript
import { apiClient } from '@/api/client'

// TypeScript knows the response type from Go models
const users = await apiClient.getUsers()
```

#### 4. **Persistent Authentication**
```typescript
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, login, logout } = useAuth()

// Login persists to localStorage
await login({ email, password })

// Auto-restores on page refresh
onMounted(() => initAuth())
```

## Integration with Base Go

### Authentication Flow
```
Vue Login Form
    ↓
POST /api/auth/login (Go)
    ↓
JWT Token + User Data
    ↓
Store in localStorage
    ↓
Include in all API requests (Authorization: Bearer <token>)
```

### API Endpoints (Go Backend)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/roles` - List roles
- `POST /api/roles/:id/permissions` - Sync role permissions
- `GET /storage/:path` - Serve uploaded files

## Configuration

See `construct.config.ts` for all framework configuration options.

## Building for Production

```bash
# 1. Build Vue app
cd vue && bun run build

# 2. Build Go binary
cd .. && go build -o construct main.go

# 3. Run (Go serves public/)
./construct

# OR use nginx to serve public/ and proxy /api to Go
```

## License

MIT