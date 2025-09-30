/**
 * Construct Framework Configuration
 *
 * This file configures the integration between Construct Vue and Base Go.
 * Convention over configuration - most apps won't need to change these.
 */

export default {
  // Backend API configuration
  api: {
    // Base URL for Go backend (auto-detected in dev)
    baseURL: process.env.VITE_API_URL || 'http://localhost:8100',

    // API endpoints (Go backend routes)
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      roles: '/api/roles',
      permissions: '/api/permissions',
      media: '/api/media',
      storage: '/storage'
    },

    // Request timeout (ms)
    timeout: 30000,

    // Enable request/response logging in dev
    debug: import.meta.env.DEV
  },

  // Authentication configuration
  auth: {
    // Where to redirect after login
    loginRedirect: '/',

    // Where to redirect when not authenticated
    logoutRedirect: '/login',

    // Token storage key
    tokenKey: 'auth_token',

    // User data storage key
    userKey: 'auth_user',

    // Token refresh threshold (minutes before expiry)
    refreshThreshold: 5
  },

  // Layout middleware configuration
  layouts: {
    // Default layout for pages (requires auth)
    default: 'default',

    // Guest layout (redirects if authenticated)
    auth: 'auth',

    // Public layout (no auth required)
    public: 'public'
  },

  // Router configuration
  router: {
    // Router mode
    mode: 'history',

    // Base path
    base: '/',

    // Scroll behavior
    scrollBehavior: 'smooth'
  },

  // Build configuration
  build: {
    // Output directory (relative to vue/)
    outDir: '../public',

    // Asset optimization
    optimize: {
      // Code splitting strategy
      chunks: {
        vendor: ['vue', 'vue-router', 'pinia'],
        ui: ['@nuxt/ui']
      },

      // Drop console in production
      dropConsole: true,

      // Enable source maps in dev only
      sourcemap: import.meta.env.DEV
    }
  },

  // Development server configuration
  server: {
    port: 3100,
    host: 'localhost',

    // Proxy configuration for Go backend
    proxy: {
      '/api': 'http://localhost:8100',
      '/storage': 'http://localhost:8100',
      '/ws': {
        target: 'http://localhost:8100',
        ws: true
      }
    }
  },

  // UI/UX configuration
  ui: {
    // Nuxt UI theme colors
    colors: {
      primary: 'indigo',
      neutral: 'slate'
    },

    // Toast notification defaults
    toast: {
      position: 'top-right',
      duration: 5000
    }
  }
}