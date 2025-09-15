import type { Router } from 'vue-router'

// Import core middleware
import authMiddleware from './auth'
import guestMiddleware from './guest'
import publicMiddleware from './public'
import adminMiddleware from './admin'
import loadingMiddleware from './loading'

export interface MiddlewareConfig {
  global?: string[]
  named?: Record<string, string>
}

// Middleware registry
const middlewareRegistry = {
  auth: authMiddleware,
  guest: guestMiddleware,
  public: publicMiddleware,
  admin: adminMiddleware,
  loading: loadingMiddleware
}

/**
 * Register middleware with Vue Router
 */
export function registerMiddleware(router: Router, config: MiddlewareConfig) {
  // Register global middleware
  if (config.global) {
    config.global.forEach(name => {
      if (middlewareRegistry[name]) {
        router.beforeEach(middlewareRegistry[name])
      } else {
        console.warn(`Global middleware '${name}' not found`)
      }
    })
  }

  // Register named middleware (these are applied per route via meta)
  router.beforeEach((to, from, next) => {
    // Check if route has middleware defined in meta
    const middlewareNames = to.meta?.middleware as string[] | string | undefined

    if (!middlewareNames) {
      next()
      return
    }

    const middlewares = Array.isArray(middlewareNames)
      ? middlewareNames
      : [middlewareNames]

    // Execute middleware in sequence
    const executeMiddleware = (index: number) => {
      if (index >= middlewares.length) {
        next()
        return
      }

      const middlewareName = middlewares[index]
      const middleware = middlewareRegistry[middlewareName]

      if (!middleware) {
        console.warn(`Named middleware '${middlewareName}' not found`)
        executeMiddleware(index + 1)
        return
      }

      middleware(to, from, (route) => {
        if (route === undefined || route === true) {
          executeMiddleware(index + 1)
        } else {
          next(route)
        }
      })
    }

    executeMiddleware(0)
  })

  console.log('✅ Middleware registered successfully')
}

/**
 * Add a custom middleware to the registry
 */
export function addMiddleware(name: string, middleware: Function) {
  middlewareRegistry[name] = middleware
}

export { middlewareRegistry }