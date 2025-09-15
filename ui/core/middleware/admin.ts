import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Admin middleware
 * Ensures user has admin role before accessing admin routes
 */
export default function adminMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { isAuthenticated, user, hasRole } = useAuth()

  // First check if user is authenticated
  if (!isAuthenticated.value) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // Check if user has admin role
  if (!hasRole('admin') && !hasRole('super_admin')) {
    // Show notification
    const { showNotification } = useNotification()
    showNotification({
      type: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to access this area.'
    })

    // Redirect to dashboard
    next({ path: '/dashboard' })
    return
  }

  next()
}