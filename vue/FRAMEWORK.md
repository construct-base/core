# Construct Framework Architecture

## Vision
Construct is a full-stack framework combining Vue 3 (frontend) with Base Go (backend) as one cohesive system.

## Architecture

### Frontend (Construct Vue)
- **Location**: `vue/` directory
- **Build Output**: `../public/` (served by nginx or Go in production)
- **Dev Server**: Port 3100 with proxy to Go backend
- **Features**:
  - File-based routing (pages/)
  - Layout system with middleware (layouts/)
  - Auto-imports (components, composables)
  - Type-safe API client
  - SSR-ready (future)

### Backend (Base Go)
- **Location**: Root directory
- **Port**: 8100
- **Serves**:
  - `/api/*` - RESTful API endpoints
  - `/storage/*` - File storage
  - `/ws` - WebSocket connections
  - `/health` - Health checks

### Integration Points

#### 1. API Client (Type-Safe)
```typescript
// Frontend automatically gets types from Go models
import { apiClient } from '@/api/client'

const users = await apiClient.getUsers()
// users is typed as User[] from Go models
```

#### 2. Authentication Flow
```
Login → Go JWT → Vue stores token → All requests include token
```

#### 3. File Storage
```
Vue uploads → Go processes → ActiveStorage pattern → S3/Local
```

#### 4. Real-time (WebSocket)
```
Vue connects to /ws → Go hub → Bidirectional events
```

### Development Workflow

#### Starting Development
```bash
# From root directory
./run.sh  # Starts both Go API (8100) and Vue UI (3100)
```

#### Building for Production
```bash
# Build Vue SPA
cd vue && bun run build  # Outputs to ../public/

# Build Go binary
go build -o construct main.go

# Deploy
# Nginx serves public/ and proxies /api to Go
# OR Go serves public/ directly
```

### Directory Structure
```
construct/
├── api/              # Go modules (HMVC)
├── app/
│   └── models/       # Go models (shared with Vue types)
├── core/             # Go framework core
├── vue/              # Frontend framework
│   ├── src/
│   │   ├── pages/    # Auto-routed pages
│   │   ├── layouts/  # Layout + middleware
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/   # Pinia state
│   │   └── types/    # TypeScript types (mirrored from Go)
│   └── public/       # Static assets
└── public/           # Built Vue app (served by nginx/Go)
```

### Convention over Configuration

#### Layouts automatically handle middleware:
- `layouts/default.vue` → Auth required (redirects to /login)
- `layouts/auth.vue` → Guest only (redirects to / if logged in)
- `layouts/public.vue` → No auth required

#### Pages automatically routed:
- `pages/users.vue` → `/users`
- `pages/users/[id].vue` → `/users/:id`
- `pages/roles/[id]/permissions.vue` → `/roles/:id/permissions`

#### API client automatically configured:
- Token management
- Request/response interceptors
- Error handling
- Type safety from Go models

### Future Enhancements
- [ ] SSR/SSG support (pre-render for SEO)
- [ ] Hot module replacement with Go watch
- [ ] Automatic type generation from Go models
- [ ] CLI tool for scaffolding (like `rails g` or `artisan make`)
- [ ] WebSocket auto-reconnect and state sync
- [ ] Optimistic UI updates
- [ ] Offline support with service workers