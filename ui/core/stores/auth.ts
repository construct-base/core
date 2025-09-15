import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@core/api/client'
import type { User, LoginRequest, RegisterRequest } from '@core/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isGuest = computed(() => !isAuthenticated.value)
  const userRole = computed(() => user.value?.role_name || '')
  const userId = computed(() => user.value?.id)

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
    }
  }

  const getCurrentUser = async (): Promise<boolean> => {
    if (!apiClient.getToken()) return false

    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getCurrentUser()

      if (response.success && response.data) {
        user.value = response.data
        return true
      } else {
        await logout()
        return false
      }
    } catch (err: any) {
      error.value = err.message
      if (err.status === 401) {
        await logout()
      }
      return false
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

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isGuest,
    userRole,
    userId,

    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
    initAuth,
    clearError,
    updateUser
  }
})