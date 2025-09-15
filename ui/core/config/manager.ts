import { loadConfig, transformConfigForTarget, type Config } from './define'

class ConfigManager {
  private static instance: ConfigManager
  private config: Config | null = null

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  async getConfig(): Promise<Config> {
    if (this.config) {
      return this.config
    }

    try {
      this.config = await loadConfig()
      return this.config
    } catch (error) {
      console.error('Failed to load construct config:', error)
      throw error
    }
  }

  async getVueConfig() {
    const config = await this.getConfig()
    return transformConfigForTarget(config, 'vue')
  }

  async getViteConfig() {
    const config = await this.getConfig()
    return transformConfigForTarget(config, 'vite')
  }

  async getGoConfig() {
    const config = await this.getConfig()
    return transformConfigForTarget(config, 'go')
  }

  async getApiUrl(): Promise<string> {
    const config = await this.getConfig()
    return config.server.api.url
  }

  async getUIUrl(): Promise<string> {
    const config = await this.getConfig()
    return `http://${config.server.ui.host}:${config.server.ui.port}`
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production' || import.meta.env.PROD
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development' || import.meta.env.DEV
  }
}

export const configManager = ConfigManager.getInstance()

export async function getConfig(): Promise<Config> {
  return configManager.getConfig()
}

export async function getVueConfig() {
  return configManager.getVueConfig()
}

export async function getViteConfig() {
  return configManager.getViteConfig()
}

export async function getGoConfig() {
  return configManager.getGoConfig()
}

export async function getApiUrl(): Promise<string> {
  return configManager.getApiUrl()
}

export async function getUIUrl(): Promise<string> {
  return configManager.getUIUrl()
}