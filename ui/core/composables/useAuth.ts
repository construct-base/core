import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@core/api/client'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@core/types'

// Global state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isGuest = computed(() => !isAuthenticated.value)

  // Actions
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.login(credentials)

      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token
        apiClient.setToken(response.data.token)

        return true
      }

      error.value = response.message || 'Login failed'
      return false
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.register(userData)

      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token
        apiClient.setToken(response.data.token)

        return true
      }

      error.value = response.message || 'Registration failed'
      return false
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true

    try {
      await apiClient.logout()
    } catch (err) {
      console.warn('Logout API call failed:', err)
    } finally {
      user.value = null
      token.value = null
      apiClient.clearToken()
      loading.value = false

      // Redirect to login page
      await router.push('/login')
    }
  }

  const getCurrentUser = async (): Promise<void> => {
    if (!apiClient.getToken()) return

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getCurrentUser()

      if (response.success && response.data) {
        user.value = response.data
      } else {
        // Token is invalid, clear it
        await logout()
      }
    } catch (err: any) {
      error.value = err.message
      // If unauthorized, clear token
      if (err.status === 401) {
        await logout()
      }
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiClient.refreshToken()

      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token
        apiClient.setToken(response.data.token)
        return true
      }

      return false
    } catch (err) {
      await logout()
      return false
    }
  }

  // Initialize auth state from storage
  const initAuth = async (): Promise<void> => {
    const storedToken = apiClient.getToken()

    if (storedToken) {
      token.value = storedToken
      await getCurrentUser()
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    isGuest,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
    initAuth,
    clearError
  }
}