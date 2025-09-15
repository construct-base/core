import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Authentication middleware
 * Redirects to login if user is not authenticated
 */
export default function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Get auth composable (will be auto-imported)
  const { isAuthenticated, user } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']

  // Check if route requires authentication
  const requiresAuth = !publicRoutes.includes(to.path) && !to.meta?.public

  if (requiresAuth && !isAuthenticated.value) {
    // Store the intended destination
    localStorage.setItem('redirectTo', to.fullPath)

    // Redirect to login
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // Check for role-based access
  if (to.meta?.roles && user.value) {
    const userRoles = user.value.roles || []
    const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles]

    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or home
      next({ path: '/unauthorized' })
      return
    }
  }

  next()
}