import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import type { Middleware, MiddlewareContext } from './types'
import { useAuth } from '../composables/useAuth'
import { useRouter, useRoute } from 'vue-router'

/**
 * Adapter to convert new Nuxt-style middleware to old Vue Router guards
 */
export function adaptMiddleware(middleware: Middleware) {
  return (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    let actionTaken = false

    // Create context for new middleware - get fresh instances each time
    const context: MiddlewareContext = {
      to,
      from,
      next,
      auth: useAuth(),  // This gets fresh auth state
      router: useRouter(),
      route: useRoute(),
      $fetch: fetch,
      redirect: (path: string, query?: Record<string, any>) => {
        actionTaken = true
        next({ path, query })
      },
      abort: (statusCode?: number, statusMessage?: string) => {
        actionTaken = true
        console.error(`Middleware aborted: ${statusCode} - ${statusMessage}`)
        next(false)
      },
      navigate: (path: string, options?: any) => {
        actionTaken = true
        if (options?.external) {
          window.location.href = path
        } else if (options?.replace) {
          next({ path, replace: true })
        } else {
          next({ path })
        }
      }
    }

    // Execute middleware
    try {
      const result = middleware(context)

      // Handle async middleware
      if (result instanceof Promise) {
        result.then(() => {
          // If middleware didn't call redirect/abort, continue
          if (!actionTaken) {
            next()
          }
        }).catch(error => {
          console.error('Middleware error:', error)
          next(false)
        })
      } else {
        // Sync middleware completed
        // If middleware didn't call redirect/abort, continue
        if (!actionTaken) {
          next()
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      next(false)
    }
  }
}