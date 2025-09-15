import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Guest middleware
 * Redirects authenticated users away from guest-only pages (login, register)
 */
export default function guestMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    // Redirect authenticated users to dashboard or home
    const redirectTo = localStorage.getItem('redirectTo') || '/dashboard'
    localStorage.removeItem('redirectTo')

    next({ path: redirectTo })
    return
  }

  next()
}