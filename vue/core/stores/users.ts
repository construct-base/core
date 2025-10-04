import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUsers } from '../composables/useUsers'
import type { User, UserCreateRequest, UserUpdateRequest, QueryParams } from '../types'

export const useUsersStore = defineStore('users', () => {
  // Get the composable with API operations
  const usersApi = useUsers()

  // State
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 1
  })

  // Search and filters
  const searchQuery = ref('')
  const roleFilter = ref('')

  // Getters
  const totalUsers = computed(() => pagination.value.total)
  const hasUsers = computed(() => users.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Filtered users based on search and role filter
  const filteredUsers = computed(() => {
    let filtered = users.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((user: User) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
      )
    }

    if (roleFilter.value) {
      filtered = filtered.filter((user: User) =>
        (user.role_name === roleFilter.value) ||
        (user.role?.name === roleFilter.value)
      )
    }

    return filtered
  })

  // Role options for filtering
  const roleOptions = computed(() => {
    const roles = [...new Set(users.value.map((user: User) => user.role_name || user.role?.name).filter(Boolean))] as string[]
    return roles.map((role: string) => ({ label: role, value: role }))
  })

  // Actions - using the composable internally
  const fetchUsers = async (params?: QueryParams): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await usersApi.fetchUsers(params)
      users.value = result.users
      pagination.value = result.pagination
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id: number): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const user = await usersApi.fetchUser(id)
      selectedUser.value = user
      return user
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      return null
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData: UserCreateRequest): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const newUser = await usersApi.createUser(userData)
      users.value.push(newUser)
      pagination.value.total += 1
      return newUser
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: number, userData: UserUpdateRequest): Promise<User | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedUser = await usersApi.updateUser(id, userData)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      if (selectedUser.value?.id === id) {
        selectedUser.value = updatedUser
      }
      return updatedUser
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update user'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await usersApi.deleteUser(id)
      users.value = users.value.filter(user => user.id !== id)
      if (selectedUser.value?.id === id) {
        selectedUser.value = null
      }
      pagination.value.total -= 1
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user'
      return false
    } finally {
      loading.value = false
    }
  }

  // Helper actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setRoleFilter = (role: string) => {
    roleFilter.value = role
  }

  const setPage = async (page: number): Promise<void> => {
    await fetchUsers({ page, page_size: pagination.value.page_size })
  }

  const setPerPage = async (perPage: number): Promise<void> => {
    await fetchUsers({ page: 1, page_size: perPage })
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedUser = () => {
    selectedUser.value = null
  }

  const clearFilters = () => {
    searchQuery.value = ''
    roleFilter.value = ''
  }

  // Expose utility functions from composable
  const { getRoleColor, formatDate, formatDateTime, getUserDisplayName, getUserInitials } = usersApi

  return {
    // State
    users,
    selectedUser,
    loading,
    error,
    pagination,
    searchQuery,
    roleFilter,

    // Getters
    totalUsers,
    hasUsers,
    isLoading,
    filteredUsers,
    roleOptions,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    setSearchQuery,
    setRoleFilter,
    setPage,
    setPerPage,
    clearError,
    clearSelectedUser,
    clearFilters,

    // Utilities from composable
    getRoleColor,
    formatDate,
    formatDateTime,
    getUserDisplayName,
    getUserInitials
  }
})