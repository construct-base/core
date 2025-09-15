import { getCurrentInstance } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface PageMeta {
  title?: string
  description?: string
  layout?: string
  middleware?: string | string[]
  requiresAuth?: boolean
  roles?: string[]
  transition?: string | false
  keepAlive?: boolean
  alias?: string | string[]
  redirect?: string | RouteLocationNormalized
  [key: string]: any
}

/**
 * Define page metadata (Nuxt-style)
 * This should be called at the top level of a page component
 */
export function definePageMeta(meta: PageMeta): void {
  const instance = getCurrentInstance()

  if (!instance) {
    console.warn('definePageMeta() can only be called inside a component setup')
    return
  }

  // In a real implementation, this would be processed at build time
  // For now, we'll store it on the component instance for runtime access
  if (instance.type) {
    (instance.type as any).__pageMeta = meta
  }

  // Also try to update route meta if possible
  if (instance.proxy?.$route) {
    Object.assign(instance.proxy.$route.meta, meta)
  }
}

/**
 * Access page metadata
 */
export function usePageMeta(): PageMeta {
  const instance = getCurrentInstance()

  if (!instance) {
    return {}
  }

  // Try to get from component type first
  const componentMeta = (instance.type as any).__pageMeta || {}

  // Merge with route meta
  const routeMeta = instance.proxy?.$route?.meta || {}

  return {
    ...routeMeta,
    ...componentMeta
  }
}

/**
 * Helper to set page title
 */
export function usePageTitle(title?: string) {
  const meta = usePageMeta()

  const pageTitle = title || meta.title

  if (pageTitle && typeof document !== 'undefined') {
    document.title = pageTitle
  }

  return pageTitle
}

/**
 * Helper to manage page transitions
 */
export function usePageTransition() {
  const meta = usePageMeta()

  return {
    name: meta.transition || 'page',
    mode: 'out-in'
  }
}