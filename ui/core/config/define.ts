// UI-focused configuration types for Construct framework

export interface ServerConfig {
    ui: {
      port: number
      host: string
      ssr: boolean
      spa: boolean
    }
    api: {
      host: string
      port: number
      url: string  // Just the API URL the UI should connect to
    }
  }

  export interface AuthConfig {
    providers: {
      local: boolean
      google: boolean
      github: boolean
      [key: string]: boolean
    }
    redirects: {
      login: string
      logout: string
      register: string
    }
  }
  
  export interface UIConfig {
    library: 'nuxt-ui' | 'shadcn' | 'headless-ui' | 'quasar' | 'vuetify' | 'prime-vue'
    theme: 'light' | 'dark' | 'auto'
    css: 'tailwindcss' | 'unocss'
    components: {
      auto: boolean
      dirs: string[]
      prefix?: string  // Component prefix (e.g., 'U' for UButton, 'Sh' for ShButton)
    }
    customization: {
      colors?: {
        primary?: string
        secondary?: string
        accent?: string
        error?: string
        warning?: string
        info?: string
        success?: string
      }
      fonts?: {
        sans?: string
        serif?: string
        mono?: string
      }
      spacing?: Record<string, string>
      borderRadius?: Record<string, string>
    }
  }
  
  export interface ModulesConfig {
    enabled: string[]  // Just list of enabled modules for UI features
  }
  
  export interface PagesConfig {
    dir: string
    auto: boolean
    middleware: string[]
    layouts: Record<string, string>
  }
  
  export interface BuildConfig {
    transpile: string[]
    analyze: boolean
    extractCSS: boolean
  }
  
  export interface GenerateConfig {
    dir: string
    fallback: string
    routes: string[]
  }
  
  export interface DevConfig {
    hmr: boolean
    https: boolean
    overlay: boolean
  }
  
  export interface AssetsConfig {
    baseURL: string  // Where UI can access uploaded files
    maxSize: number  // For client-side validation
    allowedTypes: string[]  // For client-side validation
  }
  
  export interface PluginConfig {
    src: string
    mode?: 'client' | 'all'  // Removed server mode since this is UI config
  }

  export interface MiddlewareConfig {
    global: string[]
    named: Record<string, string>
  }

  export interface ImportsConfig {
    dirs: string[]
  }

  export interface TypeScriptConfig {
    strict: boolean
    typeCheck: 'build' | 'dev' | boolean
  }

  export interface PWAConfig {
    enabled: boolean
    manifest?: {
      name: string
      shortName: string
      description: string
      icon?: string
    }
  }

  export interface RuntimeConfig {
    public: {
      apiUrl: string
      appName: string
      [key: string]: any
    }
  }
  
  export interface Config {
    // Framework meta
    name: string
    version: string

    // Core configuration
    server: ServerConfig
    auth: AuthConfig
    ui: UIConfig
    modules: ModulesConfig
    pages: PagesConfig

    // Build & development
    build: BuildConfig
    generate: GenerateConfig
    dev: DevConfig

    // Features
    assets: AssetsConfig

    // Framework features
    plugins: PluginConfig[]
    middleware: MiddlewareConfig
    imports: ImportsConfig
    typescript: TypeScriptConfig
    pwa: PWAConfig
    runtimeConfig: RuntimeConfig
  }
  
  // Configuration definition function
  export function defineConfig(config: Config): Config {
    return config
  }
  
  // Helper functions for config validation and processing
  export function validateConfig(config: Config): { valid: boolean; errors: string[] } {
    const errors: string[] = []
  
    // Validate required fields
    if (!config.name) errors.push('Config name is required')
    if (!config.version) errors.push('Config version is required')
  
    // Validate server ports
    if (config.server.api.port === config.server.ui.port) {
      errors.push('API and UI ports must be different')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  // Configuration transformer for different targets
  export function transformConfigForTarget(config: Config, target: 'go' | 'vue' | 'vite') {
    switch (target) {
      case 'vue':
        return transformForVue(config)
      case 'vite':
        return transformForVite(config)
      default:
        return config
    }
  }
  
  function transformForVue(config: Config) {
    return {
      app: {
        name: config.name,
        version: config.version
      },
      ui: config.ui,
      auth: config.auth,
      api: {
        baseURL: config.server.api.url
      },
      assets: config.assets
    }
  }

  function transformForVite(config: Config) {
    return {
      server: {
        port: config.server.ui.port,
        host: config.server.ui.host,
        proxy: {
          '/api': {
            target: config.server.api.url,
            changeOrigin: true,
            secure: false
          },
          '/storage': {
            target: config.server.api.url,
            changeOrigin: true,
            secure: false
          }
        }
      },
      build: config.build,
      define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(config.server.api.url)
      }
    }
  }
  
  // Export the config loader
  export async function loadConfig(): Promise<Config> {
    try {
      // Try to load from config.ts
      const config = await import('../../config.ts')
      const constructConfig = config.default || config
  
      // Validate the config
      const validation = validateConfig(constructConfig)
      if (!validation.valid) {
        console.error('❌ Configuration validation failed:')
        validation.errors.forEach(error => console.error(`  - ${error}`))
        throw new Error('Invalid configuration')
      }
  
      console.log('✅ Construct configuration loaded successfully')
      return constructConfig
    } catch (error) {
      console.error('❌ Failed to load construct.config.ts:', error)
      throw error
    }
  }