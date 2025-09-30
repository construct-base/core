import { useApi } from './useApi'
import type { Role, Permission, QueryParams } from '../types'

/**
 * Pure data operations composable for roles
 * This provides API interaction methods without state management
 * The store will use this composable internally
 */
export function useRoles() {
  const api = useApi()

  // API operations
  const fetchRoles = async (params?: QueryParams) => {
    const response = await api.getList<Role>('/api/authorization/roles', params)

    if (response.success && 'data' in response) {
      const roles = Array.isArray(response.data) ? response.data : []
      const pagination = 'pagination' in response && response.pagination
        ? response.pagination
        : {
            total: roles.length,
            page: 1,
            page_size: roles.length,
            total_pages: 1
          }

      return { roles, pagination }
    } else {
      throw new Error(response.error || 'Failed to fetch roles')
    }
  }

  const fetchRole = async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/api/authorization/roles/${id}`)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to fetch role')
    }
  }

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
    const response = await api.post<Role>('/api/authorization/roles', roleData)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to create role')
    }
  }

  const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/api/authorization/roles/${id}`, roleData)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to update role')
    }
  }

  const deleteRole = async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/api/authorization/roles/${id}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete role')
    }
  }

  const fetchRolePermissions = async (roleId: number): Promise<Permission[]> => {
    const response = await api.get<Permission[]>(`/api/authorization/roles/${roleId}/permissions`)

    if (response.success && response.data) {
      return Array.isArray(response.data) ? response.data : []
    } else {
      throw new Error(response.error || 'Failed to fetch role permissions')
    }
  }

  // Permission assignment operations
  const assignPermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    const response = await api.post<void>(`/api/authorization/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to assign permissions')
    }
  }

  const removePermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    const response = await api.delete<void>(`/api/authorization/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to remove permissions')
    }
  }

  const syncPermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    const response = await api.put<void>(`/api/authorization/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to sync permissions')
    }
  }

  // Utility functions for UI components
  const getRoleColor = (roleName?: string) => {
    const colors: Record<string, string> = {
      'admin': 'error',
      'owner': 'warning',
      'user': 'info',
      'member': 'info',
      'moderator': 'success',
      'editor': 'warning',
      'viewer': 'neutral'
    }
    return colors[roleName?.toLowerCase() || ''] || 'neutral'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPermissionCount = (role: Role) => {
    return role.permission_count || role.permissions?.length || 0
  }

  return {
    // API operations
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    fetchRolePermissions,

    // Permission operations
    assignPermissions,
    removePermissions,
    syncPermissions,

    // Utilities
    getRoleColor,
    formatDate,
    formatDateTime,
    getPermissionCount
  }
}