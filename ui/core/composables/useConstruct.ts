import { ref, reactive, computed } from 'vue'
import { getConfig, getVueConfig, getApiUrl } from '@core/config'
import type { Config } from '@core/config/define'

// Global config state
const config = ref<Config | null>(null)
const configLoaded = ref(false)
const configError = ref<string | null>(null)

export function useConstruct() {
  // Load configuration
  const loadConstructConfig = async (): Promise<void> => {
    try {
      configError.value = null
      config.value = await getConfig()
      configLoaded.value = true
    } catch (error: any) {
      configError.value = error.message || 'Failed to load configuration'
      console.error('Failed to load Construct config:', error)
    }
  }

  // Computed properties for easy access
  const appName = computed(() => config.value?.name || 'Construct App')
  const appVersion = computed(() => config.value?.version || '1.0.0')
  const isDevelopment = computed(() => import.meta.env.DEV || process.env.NODE_ENV === 'development')
  const isProduction = computed(() => import.meta.env.PROD || process.env.NODE_ENV === 'production')

  const serverConfig = computed(() => config.value?.server)
  const databaseConfig = computed(() => config.value?.database)
  const authConfig = computed(() => config.value?.auth)
  const uiConfig = computed(() => config.value?.ui)
  const modulesConfig = computed(() => config.value?.modules)

  // API URLs
  const apiUrl = computed(async () => {
    if (config.value) {
      return `http://${config.value.server.api.host}:${config.value.server.api.port}`
    }
    return await getApiUrl()
  })

  const uiUrl = computed(() => {
    if (config.value) {
      return `http://${config.value.server.ui.host}:${config.value.server.ui.port}`
    }
    return 'http://localhost:3100'
  })

  // Module helpers
  const hasModule = (moduleName: string): boolean => {
    if (!config.value) return false
    return [
      ...(config.value.modules.core || []),
      ...(config.value.modules.app || [])
    ].includes(moduleName)
  }

  const getCoreModules = computed(() => config.value?.modules.core || [])
  const getAppModules = computed(() => config.value?.modules.app || [])

  // Feature flags
  const isFeatureEnabled = (feature: string): boolean => {
    // You can extend this to check feature flags from config
    switch (feature) {
      case 'auth':
        return !!config.value?.auth
      case 'pwa':
        return !!config.value?.pwa?.enabled
      default:
        return false
    }
  }

  // Theme helpers
  const theme = computed(() => config.value?.ui?.theme || 'light')
  const primaryColor = computed(() => config.value?.runtimeConfig?.public?.primaryColor || '#3b82f6')

  // Storage helpers
  const storageProvider = computed(() => config.value?.storage?.provider || 'local')
  const storageConfig = computed(() => config.value?.storage)

  // Email helpers
  const emailProvider = computed(() => config.value?.email?.provider || 'smtp')
  const emailConfig = computed(() => config.value?.email)

  // Runtime config helpers
  const getPublicConfig = (key: string, defaultValue?: any) => {
    return config.value?.runtimeConfig?.public?.[key] ?? defaultValue
  }

  const getPrivateConfig = (key: string, defaultValue?: any) => {
    // Note: Private config should only be accessible on server-side
    // This is just for type safety, actual private values won't be exposed to client
    return defaultValue
  }

  // Initialize on first use
  if (!configLoaded.value && !configError.value) {
    loadConstructConfig()
  }

  return {
    // State
    config: readonly(config),
    configLoaded: readonly(configLoaded),
    configError: readonly(configError),

    // Actions
    loadConfig: loadConstructConfig,

    // Computed
    appName,
    appVersion,
    isDevelopment,
    isProduction,
    serverConfig,
    databaseConfig,
    authConfig,
    uiConfig,
    modulesConfig,
    apiUrl,
    uiUrl,
    getCoreModules,
    getAppModules,
    theme,
    primaryColor,
    storageProvider,
    storageConfig,
    emailProvider,
    emailConfig,

    // Helpers
    hasModule,
    isFeatureEnabled,
    getPublicConfig,
    getPrivateConfig
  }
}

// Configuration validation
export function useConfigValidation() {
  const validateConfig = (config: Config): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required fields
    if (!config.name) errors.push('App name is required')
    if (!config.version) errors.push('App version is required')

    // Server configuration
    if (!config.server?.api?.port) errors.push('API port is required')
    if (!config.server?.ui?.port) errors.push('UI port is required')

    if (config.server?.api?.port === config.server?.ui?.port) {
      errors.push('API and UI ports must be different')
    }

    // Database configuration
    if (!config.database?.driver) errors.push('Database driver is required')

    // Auth configuration
    if (config.auth?.jwt?.secret === 'change_me_in_production_super_secret_key') {
      errors.push('JWT secret should be changed from default value')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    validateConfig
  }
}