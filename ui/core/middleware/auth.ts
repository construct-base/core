import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Authentication middleware - simple Vue Router guard
 * Redirects to login if user is not authenticated
 */
export default function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Check localStorage for auth token
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')

  if (!token || !user) {
    // Save intended destination
    localStorage.setItem('redirectTo', to.fullPath)
    // Redirect to login
    next('/auth/login')
  } else {
    // User is authenticated, proceed
    next()
  }
}