import { useRouter } from 'vue-router'

/**
 * Navigation composable - provides Nuxt-like navigation helpers
 */
export function useNavigation() {
  const router = useRouter()

  /**
   * Navigate to a different route
   */
  const navigateTo = (to: string | { path?: string; query?: any; params?: any; hash?: string }) => {
    if (typeof to === 'string') {
      return router.push(to)
    }
    return router.push(to)
  }

  /**
   * Navigate and replace current route
   */
  const navigateReplace = (to: string | { path?: string; query?: any; params?: any; hash?: string }) => {
    if (typeof to === 'string') {
      return router.replace(to)
    }
    return router.replace(to)
  }

  /**
   * Go back in history
   */
  const navigateBack = () => {
    return router.back()
  }

  return {
    navigateTo,
    navigateReplace,
    navigateBack,
    router
  }
}