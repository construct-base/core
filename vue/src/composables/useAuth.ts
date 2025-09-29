import { ref, computed } from 'vue'
import { apiClient } from '@/api/client'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { isSuccessResponse, isErrorResponse } from '@/types'

// Global auth state
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isGuest = computed(() => !isAuthenticated.value)
  const userRole = computed(() => user.value?.role?.name || '')
  const userId = computed(() => user.value?.id)

  // Helper function to save auth data to localStorage
  const saveAuthToStorage = (userData: User, authToken: string) => {
    try {
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } catch (error) {
      console.warn('Failed to save auth data to localStorage:', error)
    }
  }

  // Helper function to load auth data from localStorage
  const loadAuthFromStorage = () => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        apiClient.setToken(storedToken)
        return true
      }
    } catch (error) {
      console.warn('Failed to load auth data from localStorage:', error)
      clearAuth()
    }
    return false
  }

  // Helper function to clear auth data
  const clearAuth = () => {
    user.value = null
    token.value = null
    apiClient.clearToken()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // Actions
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.login(credentials)

      if (isSuccessResponse(response) && response.data) {
        // Update state
        user.value = response.data.user
        token.value = response.data.token

        // Ensure API client has the token (it should already be set during login)
        apiClient.setToken(response.data.token)

        // Persist to localStorage
        saveAuthToStorage(response.data.user, response.data.token)

        console.log('✅ User logged in successfully:', response.data.user.email)
        return true
      } else {
        error.value = isErrorResponse(response) ? (response.error || 'Login failed') : 'Login failed'
        console.error('❌ Login failed:', isErrorResponse(response) ? response.error : 'Unknown error')
        return false
      }
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : String(err)) || 'Login failed'
      console.error('❌ Login failed:', err instanceof Error ? err.message : String(err))
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (registrationData: RegisterRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.register(registrationData)

      if (isSuccessResponse(response) && response.data) {
        // Update state
        user.value = response.data.user
        token.value = response.data.token

        // Ensure API client has the token
        apiClient.setToken(response.data.token)

        // Persist to localStorage
        saveAuthToStorage(response.data.user, response.data.token)

        console.log('✅ User registered successfully:', response.data.user.email)
        return true
      } else {
        error.value = isErrorResponse(response) ? (response.error || 'Registration failed') : 'Registration failed'
        console.error('❌ Registration failed:', isErrorResponse(response) ? response.error : 'Unknown error')
        return false
      }
    } catch (err: unknown) {
      error.value = (err instanceof Error ? err.message : String(err)) || 'Registration failed'
      console.error('❌ Registration failed:', err instanceof Error ? err.message : String(err))
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true

    try {
      await apiClient.logout()
      console.log('✅ User logged out successfully')
    } catch (err) {
      console.warn('⚠️ Logout API call failed:', err)
    } finally {
      clearAuth()
      loading.value = false
    }
  }

  const initAuth = async (): Promise<void> => {
    loading.value = true

    try {
      // Try to load from localStorage first
      if (loadAuthFromStorage()) {
        // Validate the token by fetching current user
        const response = await apiClient.getCurrentUser()

        if (isSuccessResponse(response) && response.data) {
          user.value = response.data
          console.log('✅ Auth restored from storage:', response.data.email)
        } else {
          // Token is invalid, clear auth
          clearAuth()
          console.log('⚠️ Token validation failed, clearing auth')
        }
      }
    } catch (err) {
      console.warn('⚠️ Auth initialization failed:', err)
      clearAuth()
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Getters
    isAuthenticated,
    isGuest,
    userRole,
    userId,

    // Actions
    login,
    register,
    logout,
    initAuth,
    clearError
  }
}