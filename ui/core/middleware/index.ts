import type { Router } from 'vue-router'
import authMiddleware from './auth'
import guestMiddleware from './guest'
import adminMiddleware from './admin'

/**
 * Simple middleware registration
 * Routes with middleware: 'auth' require authentication
 * Routes with middleware: 'guest' are for unauthenticated users only
 * Routes with middleware: 'admin' require admin role
 * Everything else is public
 */
export function registerMiddleware(router: Router) {
  router.beforeEach((to, from, next) => {
    const middleware = to.meta?.middleware as string | string[] | undefined

    // No middleware = public route
    if (!middleware) {
      next()
      return
    }

    // Get middleware name
    const middlewareName = Array.isArray(middleware) ? middleware[0] : middleware

    // Execute appropriate middleware
    switch (middlewareName) {
      case 'auth':
        authMiddleware(to, from, next)
        break
      case 'guest':
        guestMiddleware(to, from, next)
        break
      case 'admin':
        adminMiddleware(to, from, next)
        break
      default:
        // Unknown middleware, allow access
        next()
    }
  })
}