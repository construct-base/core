import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Guest middleware - simple Vue Router guard
 * Redirects authenticated users away from guest-only pages (login, register)
 */
export default function guestMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Check localStorage for auth token
  const token = localStorage.getItem('auth_token')
  const user = localStorage.getItem('auth_user')

  if (token && user) {
    // User is authenticated, redirect to dashboard or home
    const redirectTo = localStorage.getItem('redirectTo') || '/'
    localStorage.removeItem('redirectTo')
    next(redirectTo)
  } else {
    // User is not authenticated, allow access to guest pages
    next()
  }
}