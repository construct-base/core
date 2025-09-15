import type { App } from 'vue'
import type { Config } from '@core/config/define'

// UI Library configurations
export interface UILibraryConfig {
  name: string
  install: (app: App, config: Config) => Promise<void>
  dependencies: string[]
  cssFramework: 'tailwindcss' | 'unocss' | 'css-in-js' | 'scss'
  components?: Record<string, any>
}

// Nuxt UI configuration
const nuxtUIConfig: UILibraryConfig = {
  name: 'nuxt-ui',
  cssFramework: 'tailwindcss',
  dependencies: ['@nuxt/ui', '@headlessui/vue', '@heroicons/vue'],
  async install(app: App, config: Config) {
    // Nuxt UI requires specific setup for non-Nuxt environments
    console.log('🎨 Installing Nuxt UI components')

    // In a real implementation, you'd import and configure Nuxt UI here
    // For now, we'll just set up the basic structure
    app.provide('ui-library', 'nuxt-ui')
    app.provide('ui-config', config.ui)
  }
}

// Shadcn/ui configuration
const shadcnConfig: UILibraryConfig = {
  name: 'shadcn',
  cssFramework: 'tailwindcss',
  dependencies: ['@radix-ui/vue', 'class-variance-authority', 'clsx', 'tailwind-merge'],
  async install(app: App, config: Config) {
    console.log('🎨 Installing Shadcn/UI components')

    // Auto-import shadcn components
    app.provide('ui-library', 'shadcn')
    app.provide('ui-config', config.ui)

    // Setup global component prefix if specified
    if (config.ui.components.prefix) {
      app.config.globalProperties.$uiPrefix = config.ui.components.prefix
    }
  }
}

// Headless UI configuration
const headlessUIConfig: UILibraryConfig = {
  name: 'headless-ui',
  cssFramework: 'tailwindcss',
  dependencies: ['@headlessui/vue', '@heroicons/vue'],
  async install(app: App, config: Config) {
    console.log('🎨 Installing Headless UI components')

    // Import and register Headless UI components
    const {
      Dialog,
      Disclosure,
      Menu,
      Popover,
      RadioGroup,
      Switch,
      Tab,
      Combobox,
      Listbox
    } = await import('@headlessui/vue')

    // Register components globally
    app.component('HDialog', Dialog)
    app.component('HDisclosure', Disclosure)
    app.component('HMenu', Menu)
    app.component('HPopover', Popover)
    app.component('HRadioGroup', RadioGroup)
    app.component('HSwitch', Switch)
    app.component('HTab', Tab)
    app.component('HCombobox', Combobox)
    app.component('HListbox', Listbox)

    app.provide('ui-library', 'headless-ui')
    app.provide('ui-config', config.ui)
  }
}

// Additional UI libraries can be added here when needed
// They should use dynamic imports to avoid dependency resolution issues

// Registry of available UI libraries - core libraries only for now
const uiLibraries: Record<string, UILibraryConfig> = {
  'nuxt-ui': nuxtUIConfig,
  'shadcn': shadcnConfig,
  'headless-ui': headlessUIConfig
  // Additional libraries can be added when their dependencies are installed
}

// Main UI library installer
export async function installUILibrary(app: App, config: Config): Promise<void> {
  const libraryName = config.ui.library
  const library = uiLibraries[libraryName]

  if (!library) {
    console.warn(`❌ UI library '${libraryName}' not found. Available libraries:`, Object.keys(uiLibraries))
    console.log('📦 Falling back to Headless UI')
    await headlessUIConfig.install(app, config)
    return
  }

  try {
    await library.install(app, config)
    console.log(`✅ UI library '${libraryName}' installed successfully`)
  } catch (error) {
    console.error(`❌ Failed to install UI library '${libraryName}':`, error)
    console.log('📦 Falling back to Headless UI')
    await headlessUIConfig.install(app, config)
  }
}

// Get library configuration
export function getUILibraryConfig(libraryName: string): UILibraryConfig | null {
  return uiLibraries[libraryName] || null
}

// Get all available libraries
export function getAvailableUILibrariesList(): string[] {
  return Object.keys(uiLibraries)
}

// Check if library requires specific dependencies
export function getRequiredDependencies(libraryName: string): string[] {
  const library = uiLibraries[libraryName]
  return library ? library.dependencies : []
}

// Generate package.json dependencies based on selected UI library
export function generateDependencies(libraryName: string): Record<string, string> {
  const library = uiLibraries[libraryName]
  if (!library) return {}

  const deps: Record<string, string> = {}

  library.dependencies.forEach(dep => {
    // You can specify exact versions here or use 'latest'
    switch (dep) {
      case '@nuxt/ui':
        deps[dep] = '^3.0.0'
        break
      case '@headlessui/vue':
        deps[dep] = '^1.7.0'
        break
      case '@heroicons/vue':
        deps[dep] = '^2.0.0'
        break
      case '@radix-ui/vue':
        deps[dep] = '^1.0.0'
        break
      case 'quasar':
        deps[dep] = '^2.14.0'
        break
      case 'vuetify':
        deps[dep] = '^3.4.0'
        break
      case 'primevue':
        deps[dep] = '^3.45.0'
        break
      default:
        deps[dep] = 'latest'
    }
  })

  return deps
}