import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

/**
 * Admin middleware - simple Vue Router guard
 * Ensures user has admin role before accessing admin routes
 */
export default function adminMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Check localStorage for auth
  const token = localStorage.getItem('auth_token')
  const userStr = localStorage.getItem('auth_user')

  if (!token || !userStr) {
    // Not authenticated
    localStorage.setItem('redirectTo', to.fullPath)
    next('/auth/login')
    return
  }

  try {
    const user = JSON.parse(userStr)
    const roleName = user.role?.name?.toLowerCase()

    // Check if user has admin or owner role
    if (roleName === 'admin' || roleName === 'owner' || roleName === 'super_admin') {
      // User has admin role, proceed
      next()
    } else {
      // User doesn't have admin role
      next('/unauthorized')
    }
  } catch (error) {
    // Error parsing user data
    console.error('Error parsing user data:', error)
    next('/auth/login')
  }
}