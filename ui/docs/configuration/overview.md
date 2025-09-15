# Configuration

Construct uses a unified configuration system through `config.ts`, similar to `nuxt.config.ts` but designed for our Vue + Vite architecture.

## Configuration File

The main configuration file is located at `ui/config.ts`:

```typescript
// config.ts
export default defineConstructConfig({
  // Server configuration
  server: {
    api: { port: 8001 },  // Base Go API port
    ui: { port: 3100 }    // Construct UI port
  },

  // Core modules to include
  modules: {
    core: ['authentication', 'users', 'authorization']
  },

  // Page routing configuration
  pages: {
    dir: 'app/pages',     // Pages directory
    auto: true            // Enable auto-routing
  },

  // UI library configuration
  ui: {
    library: 'nuxt-ui',   // Primary UI library
    theme: 'auto'         // Theme: 'light', 'dark', 'auto'
  },

  // Middleware configuration
  middleware: {
    global: ['loading'],  // Global middleware
    named: {}            // Named middleware mappings
  }
})
```

## Configuration Options

### Server
Configure API and UI server ports:

```typescript
server: {
  api: {
    port: 8001,
    baseURL: 'http://localhost:8001'
  },
  ui: {
    port: 3100,
    host: '0.0.0.0'  // For external access
  }
}
```

### Modules
Enable/disable core framework modules:

```typescript
modules: {
  core: [
    'authentication',   // Login/logout functionality
    'users',           // User management
    'authorization',   // Role-based permissions
    'file-upload',     // File handling
    'websocket'        // Real-time features
  ]
}
```

### Pages
Control routing behavior:

```typescript
pages: {
  dir: 'app/pages',           // Pages directory
  auto: true,                 // Auto-routing enabled
  extensions: ['.vue'],       // File extensions to process
  exclude: ['**/components/**'] // Patterns to exclude
}
```

### UI Library
Configure the UI framework:

```typescript
ui: {
  library: 'nuxt-ui',    // Options: 'nuxt-ui', 'shadcn', 'custom'
  theme: 'auto',         // Options: 'light', 'dark', 'auto'
  css: {
    tailwind: true,      // Enable Tailwind CSS
    customCSS: ['~/assets/css/custom.css']
  }
}
```

### Build Options
Vite and build configuration:

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
  minify: 'terser'
}
```

## Environment Variables

Create `.env` files for environment-specific configuration:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8001
VITE_WEBSOCKET_URL=ws://localhost:8001/ws
VITE_APP_NAME=Construct App
```

Access in config:

```typescript
export default defineConstructConfig({
  server: {
    api: {
      port: parseInt(process.env.VITE_API_PORT || '8001')
    }
  }
})
```

## TypeScript Support

Configuration is fully typed with IntelliSense support:

```typescript
import type { ConstructConfig } from '@core/types/config'

const config: ConstructConfig = {
  // Full type safety and auto-completion
}
```

## Runtime Configuration

Access configuration at runtime:

```typescript
// In composables or components
const config = useRuntimeConfig()
console.log(config.server.api.port)
```