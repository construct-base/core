import { getCurrentInstance } from 'vue'
import type { Router } from 'vue-router'

/**
 * Get router instance
 */
function getRouter(): Router | null {
  const instance = getCurrentInstance()
  if (!instance) {
    console.warn('navigateTo called outside of component context')
    return null
  }
  return instance.appContext.config.globalProperties.$router as Router
}

/**
 * Navigate to a different route
 * Nuxt-like helper for navigation
 */
export function navigateTo(to: string | { path?: string; query?: any; params?: any; hash?: string }) {
  const router = getRouter()
  if (!router) return Promise.resolve()

  if (typeof to === 'string') {
    return router.push(to)
  }

  return router.push(to)
}

/**
 * Navigate and replace current route
 */
export function navigateReplace(to: string | { path?: string; query?: any; params?: any; hash?: string }) {
  const router = getRouter()
  if (!router) return Promise.resolve()

  if (typeof to === 'string') {
    return router.replace(to)
  }

  return router.replace(to)
}

/**
 * Go back in history
 */
export function navigateBack() {
  const router = getRouter()
  if (!router) return Promise.resolve()

  return router.back()
}