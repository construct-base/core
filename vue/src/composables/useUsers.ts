import { useApi } from './useApi'
import type { User, UserCreateRequest, UserUpdateRequest, QueryParams } from '../types'

/**
 * Pure data operations composable for users
 * This provides API interaction methods without state management
 * The store will use this composable internally
 */
export function useUsers() {
  const api = useApi()

  // API operations
  const fetchUsers = async (params?: QueryParams) => {
    const response = await api.getList<User>('/api/users', params)

    if (response.success && 'data' in response) {
      const users = Array.isArray(response.data) ? response.data : []
      const pagination = 'pagination' in response && response.pagination
        ? response.pagination
        : {
            total: users.length,
            page: 1,
            page_size: users.length,
            total_pages: 1
          }

      return { users, pagination }
    } else {
      throw new Error(response.error || 'Failed to fetch users')
    }
  }

  const fetchUser = async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/users/${id}`)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to fetch user')
    }
  }

  const createUser = async (userData: UserCreateRequest): Promise<User> => {
    const response = await api.post<User>('/api/users', userData)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to create user')
    }
  }

  const updateUser = async (id: number, userData: UserUpdateRequest): Promise<User> => {
    const response = await api.put<User>(`/api/users/${id}`, userData)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to update user')
    }
  }

  const deleteUser = async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/api/users/${id}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user')
    }
  }

  // Utility functions for UI components
  const getRoleColor = (role?: string) => {
    const colors: Record<string, string> = {
      'admin': 'error',
      'owner': 'warning',
      'user': 'info',
      'member': 'info',
      'moderator': 'success',
      'editor': 'warning'
    }
    return colors[role?.toLowerCase() || ''] || 'neutral'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getUserDisplayName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim() || user.username
  }

  const getUserInitials = (user: User) => {
    const firstName = user.first_name.charAt(0).toUpperCase()
    const lastName = user.last_name.charAt(0).toUpperCase()
    return `${firstName}${lastName}` || user.username.charAt(0).toUpperCase()
  }

  return {
    // API operations
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,

    // Utilities
    getRoleColor,
    formatDate,
    formatDateTime,
    getUserDisplayName,
    getUserInitials
  }
}