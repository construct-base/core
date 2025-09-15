import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Public middleware
 * Allows access to both authenticated and unauthenticated users
 * Used for pages like about, landing, etc.
 */
export default function publicMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Always allow access - no restrictions
  next()
}