import { defineConfig } from './core/config/define'

export default defineConfig({
  // Framework meta
  name: 'construct-app',
  version: '1.0.0',

  // Server configuration
  server: {
    api: {
      url: 'http://localhost:8100'  // Where the Go API is running
    },
    ui: {
      port: 3100,
      host: 'localhost',
      ssr: false,
      spa: true
    }
  },

  // Authentication & Security
  auth: {
    providers: {
      local: true,
      google: false,
      github: false
    },
    redirects: {
      login: '/login',
      logout: '/',
      register: '/register'
    }
  },

  // UI Framework configuration
  ui: {
    library: 'nuxt-ui',
    theme: 'light',
    css: 'tailwindcss',
    components: {
      auto: true,
      dirs: [
        '~/core/components',
        '~/app/components'
      ]
    },
    customization: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#8b5cf6'
      }
    }
  },

  // Modules configuration
  modules: {
    enabled: [
      'authentication',
      'authorization',
      'users',
      'media',
      'translation',
      'scheduler'
    ]
  },

  // Pages and routing
  pages: {
    dir: 'app/pages',
    auto: true,
    middleware: [
      // Global middleware
      'auth.global.ts'
    ],
    layouts: {
      default: 'default',
      admin: 'admin',
      auth: 'auth'
    }
  },

  // Build configuration
  build: {
    transpile: ['@nuxt/ui'],
    analyze: false,
    extractCSS: true
  },

  // Generate configuration
  generate: {
    dir: 'dist',
    fallback: '404.html',
    routes: []
  },

  // Development configuration
  dev: {
    hmr: true,
    https: false,
    overlay: true
  },

  // Assets configuration (for UI)
  assets: {
    baseURL: '/storage',  // Where uploaded files are accessible
    maxSize: 10485760,    // 10MB limit for client-side validation
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Plugins
  plugins: [
    { src: '~/plugins/api.client.ts', mode: 'client' },
    { src: '~/plugins/auth.client.ts', mode: 'client' }
  ],

  // Middleware
  middleware: {
    global: ['auth'],
    named: {
      admin: '~/middleware/admin.ts',
      guest: '~/middleware/guest.ts'
    }
  },

  // Auto-imports
  imports: {
    dirs: [
      'core/composables',
      'core/utils',
      'app/composables',
      'app/utils'
    ]
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: 'build'
  },

  // PWA configuration
  pwa: {
    enabled: false,
    manifest: {
      name: 'Construct App',
      shortName: 'Construct',
      description: 'Built with Construct Framework',
      icon: '/icon.png'
    }
  },

  // Runtime configuration
  runtimeConfig: {
    public: {
      apiUrl: 'http://localhost:8100',
      appName: 'Construct App'
    }
  }
})