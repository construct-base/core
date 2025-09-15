import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@core/api/client'
import type { User, UserCreateRequest, UserUpdateRequest, UserUpdatePasswordRequest, PaginatedResponse, ApiResponse } from '@core/types'

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1
  })

  // Getters
  const totalUsers = computed(() => pagination.value.total)
  const hasUsers = computed(() => users.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Actions
  const fetchUsers = async (params?: Record<string, any>): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getUsers(params) as ApiListResponse<User>

      if ('data' in response && Array.isArray(response.data)) {
        users.value = response.data
        if ('pagination' in response && response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        error.value = 'error' in response ? response.error : 'Failed to fetch users'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id: number): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getUser(id) as ApiResponse<User>

      if (isSuccessResponse(response) && response.data) {
        selectedUser.value = response.data
        return response.data
      } else if (isErrorResponse(response)) {
        error.value = response.error
      }
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      return null
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: UserCreateRequest): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.createUser(userData) as ApiResponse<User>

      if (isSuccessResponse(response) && response.data) {
        users.value.push(response.data)
        pagination.value.total += 1
        return response.data
      } else if (isErrorResponse(response)) {
        error.value = response.error
      }
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to create user'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, userData: UserUpdateRequest): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.updateUser(id, userData) as ApiResponse<User>

      if (isSuccessResponse(response) && response.data) {
        const index = users.value.findIndex(user => user.id === id)
        if (index !== -1) {
          users.value[index] = response.data
        }
        if (selectedUser.value?.id === id) {
          selectedUser.value = response.data
        }
        return response.data
      } else if (isErrorResponse(response)) {
        error.value = response.error
      }
      return null
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await apiClient.deleteUser(id)

      users.value = users.value.filter(user => user.id !== id)
      if (selectedUser.value?.id === id) {
        selectedUser.value = null
      }
      pagination.value.total -= 1
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete user'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateUserPassword = async (id: number, passwordData: UserUpdatePasswordRequest): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await apiClient.updateUserPassword(id, passwordData)
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update password'
      return false
    } finally {
      loading.value = false
    }
  }

  const searchUsers = async (query: string): Promise<void> => {
    await fetchUsers({ search: query })
  }

  const filterByRole = async (roleId: number): Promise<void> => {
    await fetchUsers({ role_id: roleId })
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedUser = () => {
    selectedUser.value = null
  }

  const setPage = async (page: number): Promise<void> => {
    await fetchUsers({ page })
  }

  const setPerPage = async (perPage: number): Promise<void> => {
    await fetchUsers({ per_page: perPage, page: 1 })
  }

  return {
    // State
    users,
    selectedUser,
    loading,
    error,
    pagination,

    // Getters
    totalUsers,
    hasUsers,
    isLoading,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserPassword,
    searchUsers,
    filterByRole,
    clearError,
    clearSelectedUser,
    setPage,
    setPerPage
  }
})