# ✅ Construct Framework - Setup Complete!

## What We Built

**Construct** is now a true full-stack framework where Vue and Go work as one system:

### ✅ Features Implemented

1. **Layout-Based Middleware**
   - `layouts/default.vue` - Authenticated routes (requires login)
   - `layouts/auth.vue` - Guest routes (login/register pages)
   - Automatic auth checking and redirects

2. **Persistent Authentication**
   - Token stored in localStorage
   - Auto-restores on page refresh
   - Validates token with backend on init

3. **Single Binary Deployment**
   - Vue builds to `../public/`
   - Go serves static files + API
   - One process, one port (8100)

4. **Production-Ready Build**
   - Code splitting (vendor chunk)
   - Optimized bundle sizes
   - No source maps in prod
   - Gzip-friendly output

## How It Works

### Development (Two Processes)
```bash
# Terminal 1: Go API
go run main.go  # Port 8100

# Terminal 2: Vue Dev Server
cd vue && bun run dev  # Port 3100 (proxies /api to Go)

# OR use convenience script
./run.sh
```

### Production (Single Binary)
```bash
# 1. Build Vue SPA
cd vue && bun run build  # → outputs to ../public/

# 2. Build Go binary
cd .. && go build -o construct main.go

# 3. Run everything from one binary
./construct  # Serves both Vue (/) and API (/api) on port 8100
```

## Request Flow

```
Browser → Go Server (port 8100)
          ↓
      ┌───────────────────┐
      │ Path starts with  │
      │ /api ?           │──Yes──→ API Handler (Go modules)
      └───────────────────┘
          ↓ No
      ┌───────────────────┐
      │ File exists in    │──Yes──→ Serve file (JS, CSS, images)
      │ public/ ?         │
      └───────────────────┘
          ↓ No
      ┌───────────────────┐
      │ Serve index.html  │────────→ Vue Router handles route
      └───────────────────┘
```

## Examples

| URL | Handler | Result |
|-----|---------|--------|
| `/` | SPA | `public/index.html` → Vue renders Dashboard |
| `/users` | SPA | `public/index.html` → Vue Router → Users page |
| `/assets/index.js` | SPA | Serves `public/assets/index.js` |
| `/api/users` | API | Go returns JSON |
| `/storage/avatar.jpg` | Storage | Go serves file from storage/ |

## File Structure

```
construct/
├── main.go                  # Go entry point (serves SPA + API)
├── api/                     # Go modules (HMVC)
├── core/                    # Go framework core
├── app/models/              # Go models
├── public/                  # ← Built Vue app (Git ignored)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js
│   │   ├── vendor-xxx.js
│   │   └── index-xxx.css
│   └── logo.svg
└── vue/                     # Vue source code
    ├── src/
    │   ├── layouts/         # Layout + middleware
    │   │   ├── default.vue  # Auth required
    │   │   └── auth.vue     # Guest only
    │   ├── pages/           # Auto-routed pages
    │   ├── components/      # Vue components
    │   ├── composables/     # Composables (useAuth, etc)
    │   ├── stores/          # Pinia stores
    │   └── api/client.ts    # API client
    └── construct.config.ts  # Framework config
```

## Key Files Modified

### 1. `main.go` - SPA Handler Added
```go
// setupSPARoutes serves Vue app from public/
func (app *App) setupSPARoutes() {
    // Serves static files (JS, CSS, images)
    // Falls back to index.html for SPA routes
    app.router.GET("/*catchall", spaHandler)
}
```

### 2. `vue/vite.config.ts` - Build to `../public`
```typescript
build: {
  outDir: '../public',  // ← Outputs here
  emptyOutDir: true,
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['vue', 'vue-router', 'pinia']
      }
    }
  }
}
```

### 3. `vue/src/layouts/` - Middleware System
- **default.vue**: Checks `isAuthenticated`, redirects to `/login` if not
- **auth.vue**: Checks `isAuthenticated`, redirects to `/` if already logged in

### 4. `vue/src/main.ts` - Route Organization
```typescript
// Auth routes use AuthLayout
{ path: '/login', component: AuthLayout, children: [...] }

// Protected routes use DefaultLayout
{ path: '/', component: DefaultLayout, children: [
  { path: '', component: () => import('./pages/index.vue') },
  { path: 'users', component: () => import('./pages/users.vue') },
  ...
]}
```

## Deployment Commands

### Quick Deploy
```bash
# Using CLI (recommended)
construct build && construct start

# Or manually
cd vue && bun run build && cd .. && go build -o construct && ./construct
```

### Docker (Future)
```dockerfile
FROM node:20 AS frontend
WORKDIR /app/vue
COPY vue/ ./
RUN npm install -g bun && bun install && bun run build

FROM golang:1.23 AS backend
WORKDIR /app
COPY . .
COPY --from=frontend /app/public ./public
RUN go build -o construct

FROM debian:bookworm-slim
COPY --from=backend /app/construct .
EXPOSE 8100
CMD ["./construct"]
```

## Testing

### 1. Test Build
```bash
cd vue && bun run build
ls ../public  # Should see index.html, assets/, logo.svg
```

### 2. Test Go Server
```bash
go run main.go
# Open http://localhost:8100
# Should see Vue app
# API at http://localhost:8100/api/users
```

### 3. Test SPA Routing
```bash
# With server running:
# Visit http://localhost:8100/users
# Should load Vue, not 404
```

## Configuration

### Environment Variables
```bash
# .env file
PORT=8100
DB_DRIVER=sqlite
DB_NAME=construct.db
JWT_SECRET=your-secret-key

# Vue API URL (auto-detected)
# Dev: http://localhost:8100
# Prod: '' (same origin)
```

### Framework Config
See `vue/construct.config.ts` for all options.

## What's Next?

Future enhancements:
- [ ] SSR/SSG support
- [ ] Auto-generate TypeScript types from Go models
- [ ] CLI tool (`construct generate user`)
- [ ] Hot reload integration
- [ ] WebSocket state sync
- [ ] Offline support
- [ ] i18n

## Summary

You now have a **production-ready full-stack framework**:

✅ **One command to develop**: `construct dev`
✅ **One command to build**: `construct build`
✅ **One binary to deploy**: `./construct`
✅ **One port to expose**: `8100`

That's Construct! 🚀