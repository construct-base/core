import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Loading middleware
 * Shows/hides global loading state during route transitions
 */
export default function loadingMiddleware(
  _to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // TODO: Implement global loading state when needed
  // For now, just continue navigation
  console.log('Loading middleware:', { from: from.name, to: _to.name })

  next()
}