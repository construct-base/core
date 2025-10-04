import { isErrorResponse, isPaginatedResponse, isSuccessResponse } from '@/types'
import { useApi } from '~/core/composables/useApi'
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
    // Convert QueryParams to Record<string, string> for API
    const apiParams: Record<string, string> | undefined = params ?
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : undefined

    const response = await api.getList<Role>('/api/authorization/roles', apiParams)

    if (isPaginatedResponse(response)) {
      return { roles: response.data, pagination: response.pagination }
    } else {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to fetch roles') : 'Failed to fetch roles')
    }
  }

  const fetchRole = async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/api/authorization/roles/${id}`)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to fetch role') : 'Failed to fetch role')
    }
  }

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
    const response = await api.post<Role>('/api/authorization/roles', roleData)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to create role') : 'Failed to create role')
    }
  }

  const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/api/authorization/roles/${id}`, roleData)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to update role') : 'Failed to update role')
    }
  }

  const deleteRole = async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/api/authorization/roles/${id}`)

    if (!isSuccessResponse(response)) {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to delete role') : 'Failed to delete role')
    }
  }

  const fetchRolePermissions = async (roleId: number): Promise<Permission[]> => {
    const response = await api.get<Permission[]>(`/api/authorization/roles/${roleId}/permissions`)

    if (isSuccessResponse(response) && response.data) {
      return Array.isArray(response.data) ? response.data : []
    } else {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to fetch role permissions') : 'Failed to fetch role permissions')
    }
  }

  // Permission assignment operations
  const assignPermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    const response = await api.post<void>(`/api/authorization/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })

    if (!isSuccessResponse(response)) {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to assign permissions') : 'Failed to assign permissions')
    }
  }

  const removePermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    // The backend expects individual permission IDs in the URL path
    // DELETE /api/authorization/roles/:id/permissions/:permissionId
    const promises = permissionIds.map(async (permissionId) => {
      const response = await api.delete<void>(`/api/authorization/roles/${roleId}/permissions/${permissionId}`)
      
      if (!isSuccessResponse(response)) {
        throw new Error(isErrorResponse(response) ? (response.error || `Failed to remove permission ${permissionId}`) : `Failed to remove permission ${permissionId}`)
      }
    })

    await Promise.all(promises)
  }

  const syncPermissions = async (roleId: number, permissionIds: number[]): Promise<void> => {
    const response = await api.put<void>(`/api/authorization/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    })

    if (!isSuccessResponse(response)) {
      throw new Error(isErrorResponse(response) ? (response.error || 'Failed to sync permissions') : 'Failed to sync permissions')
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