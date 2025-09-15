import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '../api/client'
import type { User, LoginRequest, LoginResponse } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isGuest = computed(() => !isAuthenticated.value)
  const userRole = computed(() => user.value?.role?.name || '')
  const userId = computed(() => user.value?.id)

  // Actions
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.login(credentials)

      // Transform response to User type
      user.value = {
        id: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        username: response.username,
        phone: response.phone,
        email: response.email,
        role_id: response.role_id,
        role: response.extend?.role || { id: response.role_id, name: response.role_name || 'User' },
        avatar_url: response.avatar_url,
        last_login: response.last_login
      }

      token.value = response.accessToken

      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.register(userData)

      // Transform response to User type
      user.value = {
        id: response.id,
        first_name: response.first_name,
        last_name: response.last_name,
        username: response.username,
        phone: response.phone,
        email: response.email,
        role_id: response.role_id,
        role: response.extend?.role || { id: response.role_id, name: response.role_name || 'User' },
        avatar_url: response.avatar_url,
        last_login: response.last_login
      }

      token.value = response.accessToken

      return true
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

      // Clear localStorage
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')

      loading.value = false
    }
  }

  const getCurrentUser = async (): Promise<boolean> => {
    if (!apiClient.getToken()) return false

    loading.value = true
    error.value = null

    try {
      const userData = await apiClient.getCurrentUser()

      if (userData) {
        user.value = userData
        return true
      } else {
        await logout()
        return false
      }
    } catch (err: any) {
      error.value = err.message
      await logout()
      return false
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiClient.refreshToken()

      if (response) {
        // Transform response to User type
        user.value = {
          id: response.id,
          first_name: response.first_name,
          last_name: response.last_name,
          username: response.username,
          phone: response.phone,
          email: response.email,
          role_id: response.role_id,
          role: response.extend?.role || { id: response.role_id, name: response.role_name || 'User' },
          avatar_url: response.avatar_url,
          last_login: response.last_login
        }

        token.value = response.accessToken
        return true
      }

      return false
    } catch (err) {
      await logout()
      return false
    }
  }

  const initAuth = async (): Promise<void> => {
    // Try to restore from localStorage first
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        apiClient.setToken(storedToken)

        // Verify the token is still valid by fetching current user
        await getCurrentUser()
      } catch (err) {
        console.warn('Failed to restore auth from localStorage:', err)
        // Clear invalid data
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
        user.value = null
        token.value = null
        apiClient.clearToken()
      }
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