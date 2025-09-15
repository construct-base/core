import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Public middleware - simple Vue Router guard
 * Allows access to everyone (no authentication required)
 */
export default function publicMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Public pages are accessible to everyone
  next()
}