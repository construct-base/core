export {
  configManager,
  getConfig,
  getVueConfig,
  getViteConfig,
  getGoConfig,
  getApiUrl,
  getUIUrl
} from './config/manager'

export type { Config } from './config/define'

// Default configuration
export const defaultConfig = {
  name: 'construct-app',
  version: '1.0.0',

  server: {
    api: {
      url: 'http://localhost:8100'
    },
    ui: {
      port: 3100,
      host: 'localhost',
      ssr: false,
      spa: true
    }
  },

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

  ui: {
    library: 'nuxt-ui' as const,
    theme: 'light' as const,
    css: 'tailwindcss' as const,
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
        accent: '#8b5cf6',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        success: '#10b981'
      }
    }
  },

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

  pages: {
    dir: 'app/pages',
    auto: true,
    middleware: ['auth.global.ts'],
    layouts: {
      default: 'default',
      admin: 'admin',
      auth: 'auth'
    }
  },

  build: {
    transpile: ['@nuxt/ui'],
    analyze: false,
    extractCSS: true
  },

  generate: {
    dir: 'dist',
    fallback: '404.html',
    routes: []
  },

  dev: {
    hmr: true,
    https: false,
    overlay: true
  },

  assets: {
    baseURL: '/storage',
    maxSize: 10485760, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]
  },

  plugins: [
    { src: '~/plugins/api.client.ts', mode: 'client' as const },
    { src: '~/plugins/auth.client.ts', mode: 'client' as const }
  ],

  middleware: {
    global: ['auth'],
    named: {
      admin: '~/middleware/admin.ts',
      guest: '~/middleware/guest.ts'
    }
  },

  imports: {
    dirs: [
      'core/composables',
      'core/utils',
      'app/composables',
      'app/utils'
    ]
  },

  typescript: {
    strict: true,
    typeCheck: 'build' as const
  },

  pwa: {
    enabled: false,
    manifest: {
      name: 'Construct App',
      shortName: 'Construct',
      description: 'Built with Construct Framework',
      icon: '/icon.png'
    }
  },

  runtimeConfig: {
    public: {
      apiUrl: 'http://localhost:8100',
      appName: 'Construct App'
    }
  }
}
 