import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import type { useAuth } from '../composables/useAuth'
import type { useRouter, useRoute } from 'vue-router'

export interface MiddlewareContext {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
  next: NavigationGuardNext
  redirect: (path: string, query?: Record<string, any>) => void
  abort: (statusCode?: number, statusMessage?: string) => void
  navigate: (path: string, options?: NavigateOptions) => void
  $fetch: typeof fetch
  auth: ReturnType<typeof useAuth>
  router: ReturnType<typeof useRouter>
  route: ReturnType<typeof useRoute>
}

export interface NavigateOptions {
  replace?: boolean
  redirectCode?: number
  external?: boolean
}

export type Middleware = (context: MiddlewareContext) => void | Promise<void>

export interface MiddlewareDefinition {
  name: string
  path?: string
  handler: Middleware
  global?: boolean
  order?: number
}