import { ref, computed, inject, readonly } from 'vue'
import { getUILibraryConfig, getAvailableUILibrariesList } from '@core/plugins/ui-library'
import type { UIConfig } from '@core/config/define'

export function useUI() {
  // Injected from the UI library plugin
  const currentLibrary = inject<string>('ui-library', 'headless-ui')
  const uiConfig = inject<UIConfig>('ui-config')

  // State
  const theme = ref(uiConfig?.theme || 'light')
  const availableLibraries = getAvailableUILibrariesList()

  // Computed
  const isDark = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
  })

  const isLight = computed(() => !isDark.value)

  const libraryConfig = computed(() => {
    return getUILibraryConfig(currentLibrary)
  })

  const colors = computed(() => {
    return {
      primary: uiConfig?.customization?.colors?.primary || '#3b82f6',
      secondary: uiConfig?.customization?.colors?.secondary || '#6b7280',
      accent: uiConfig?.customization?.colors?.accent || '#8b5cf6',
      error: uiConfig?.customization?.colors?.error || '#ef4444',
      warning: uiConfig?.customization?.colors?.warning || '#f59e0b',
      info: uiConfig?.customization?.colors?.info || '#06b6d4',
      success: uiConfig?.customization?.colors?.success || '#10b981'
    }
  })

  // Actions
  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme

    // Apply theme to document
    if (newTheme === 'dark' || (newTheme === 'auto' && isDark.value)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Store preference
    localStorage.setItem('ui-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const applyCustomColors = (customColors: Record<string, string>) => {
    const root = document.documentElement

    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }

  // Component helpers based on current library
  const getComponentName = (baseName: string): string => {
    const prefix = uiConfig?.components?.prefix || ''

    switch (currentLibrary) {
      case 'nuxt-ui':
        return `U${baseName}`
      case 'shadcn':
        return prefix ? `${prefix}${baseName}` : baseName
      case 'headless-ui':
        return `H${baseName}`
      case 'quasar':
        return `Q${baseName}`
      case 'vuetify':
        return `V${baseName}`
      case 'prime-vue':
        return `P${baseName}`
      default:
        return baseName
    }
  }

  const getButtonComponent = () => {
    switch (currentLibrary) {
      case 'nuxt-ui':
        return 'UButton'
      case 'headless-ui':
        return 'button' // Custom styled button
      case 'quasar':
        return 'QBtn'
      case 'vuetify':
        return 'VBtn'
      case 'prime-vue':
        return 'PButton'
      default:
        return 'button'
    }
  }

  const getInputComponent = () => {
    switch (currentLibrary) {
      case 'nuxt-ui':
        return 'UInput'
      case 'headless-ui':
        return 'input' // Custom styled input
      case 'quasar':
        return 'QInput'
      case 'vuetify':
        return 'VTextField'
      case 'prime-vue':
        return 'PInputText'
      default:
        return 'input'
    }
  }

  const getCardComponent = () => {
    switch (currentLibrary) {
      case 'nuxt-ui':
        return 'UCard'
      case 'headless-ui':
        return 'div' // Custom styled card
      case 'quasar':
        return 'QCard'
      case 'vuetify':
        return 'VCard'
      case 'prime-vue':
        return 'PCard'
      default:
        return 'div'
    }
  }

  const getModalComponent = () => {
    switch (currentLibrary) {
      case 'nuxt-ui':
        return 'UModal'
      case 'headless-ui':
        return 'HDialog'
      case 'quasar':
        return 'QDialog'
      case 'vuetify':
        return 'VDialog'
      case 'prime-vue':
        return 'PDialog'
      default:
        return 'div'
    }
  }

  // Initialize theme from localStorage
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('ui-theme') as 'light' | 'dark' | 'auto'
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme(uiConfig?.theme || 'light')
    }
  }

  // Auto-initialize theme
  if (typeof window !== 'undefined') {
    initializeTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'auto') {
        setTheme('auto') // Re-apply auto theme
      }
    })
  }

  return {
    // State
    currentLibrary,
    theme: readonly(theme),
    availableLibraries,
    uiConfig,

    // Computed
    isDark,
    isLight,
    libraryConfig,
    colors,

    // Actions
    setTheme,
    toggleTheme,
    applyCustomColors,
    initializeTheme,

    // Component helpers
    getComponentName,
    getButtonComponent,
    getInputComponent,
    getCardComponent,
    getModalComponent
  }
}

// UI library specific classes and utilities
export function useUIClasses() {
  const { currentLibrary, colors } = useUI()

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary') => {
    switch (currentLibrary) {
      case 'nuxt-ui':
        return {
          primary: 'bg-primary-500 hover:bg-primary-600 text-white',
          secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
          outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
          ghost: 'text-primary-500 hover:bg-primary-50'
        }[variant]

      case 'shadcn':
      case 'headless-ui':
        return {
          primary: `bg-[${colors.value.primary}] hover:opacity-90 text-white px-4 py-2 rounded-md font-medium transition-opacity`,
          secondary: `bg-[${colors.value.secondary}] hover:opacity-90 text-white px-4 py-2 rounded-md font-medium transition-opacity`,
          outline: `border border-[${colors.value.primary}] text-[${colors.value.primary}] hover:bg-[${colors.value.primary}] hover:text-white px-4 py-2 rounded-md font-medium transition-all`,
          ghost: `text-[${colors.value.primary}] hover:bg-[${colors.value.primary}]/10 px-4 py-2 rounded-md font-medium transition-all`
        }[variant]

      default:
        return ''
    }
  }

  const getCardClasses = () => {
    switch (currentLibrary) {
      case 'shadcn':
      case 'headless-ui':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6'

      default:
        return ''
    }
  }

  const getInputClasses = () => {
    switch (currentLibrary) {
      case 'shadcn':
      case 'headless-ui':
        return 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'

      default:
        return ''
    }
  }

  return {
    getButtonClasses,
    getCardClasses,
    getInputClasses
  }
}