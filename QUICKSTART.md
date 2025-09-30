# Construct Framework - Quick Start

## Installation

```bash
make install
```

## Commands

| Command | Description |
|---------|-------------|
| `construct dev` | Start development (Go + Vue) |
| `construct build` | Build production app |
| `construct start` | Run production server |
| `construct --help` | Show help |
| `construct --version` | Show version |

## Development

```bash
# Start dev servers
construct dev

# Access:
# Vue UI:  http://localhost:3100
# Go API:  http://localhost:8100
```

## Production

```bash
# Build
construct build

# Deploy
./construct
# OR
construct start
```

## Project Structure

```
construct/
├── cmd/construct/    # CLI (Cobra)
├── api/             # Go API modules
├── core/            # Go framework
├── app/models/      # Go models
├── public/          # Built Vue app
├── vue/             # Vue source
│   ├── pages/       # Auto-routed
│   ├── layouts/     # Middleware
│   └── components/  # Vue components
└── main.go          # Go entry
```

## Key Features

- ✅ Layout-based auth middleware
- ✅ File-based routing
- ✅ Type-safe API client
- ✅ Persistent authentication
- ✅ Single binary deployment
- ✅ Hot reload in dev

## Common Tasks

### Create a New Page
```bash
# Create file
touch vue/src/pages/products.vue

# Auto-routed to /products
```

### Add API Endpoint
```typescript
// vue/src/api/client.ts
async getProducts() {
  return this.request('/api/products')
}
```

### Add Store
```typescript
// vue/src/stores/products.ts
export const useProductsStore = defineStore('products', {
  state: () => ({ products: [] }),
  actions: {
    async fetch() {
      const res = await apiClient.getProducts()
      this.products = res.data
    }
  }
})
```

## Environment

```bash
# .env
PORT=8100
DB_DRIVER=sqlite
DB_NAME=construct.db
JWT_SECRET=your-secret
```

## URLs

| Path | Description |
|------|-------------|
| `/` | Vue Dashboard |
| `/users` | Vue page (SPA routing) |
| `/api/*` | Go API endpoints |
| `/storage/*` | File storage |

## Documentation

- [CLI Reference](CLI.md)
- [Architecture](vue/FRAMEWORK.md)
- [Deployment](DEPLOYMENT.md)
- [Full Guide](vue/COMPLETE.md)

## Help

```bash
construct --help
```

---

**One framework. One command. One binary.** 🚀