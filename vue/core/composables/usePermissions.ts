import { isPaginatedResponse, isSuccessResponse } from '@/types'
import { useApi } from '~/core/composables/useApi'
import type { Permission, QueryParams } from '../types'

/**
 * Pure data operations composable for permissions
 * This provides API interaction methods without state management
 * The store will use this composable internally
 */
export function usePermissions() {
  const api = useApi()

  // API operations
  const fetchPermissions = async (params?: QueryParams) => {
    // Convert QueryParams to Record<string, string> for API
    const apiParams: Record<string, string> | undefined = params ?
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : undefined

    const response = await api.getList<Permission>('/api/authorization/permissions', apiParams)

    if (isPaginatedResponse(response)) {
      return { permissions: response.data, pagination: response.pagination }
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch permissions')
    }
  }

  const fetchPermission = async (id: number): Promise<Permission> => {
    const response = await api.get<Permission>(`/api/authorization/permissions/${id}`)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch permission')
    }
  }

  const createPermission = async (permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> => {
    const response = await api.post<Permission>('/api/authorization/permissions', permissionData)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error('error' in response ? response.error : 'Failed to create permission')
    }
  }

  const updatePermission = async (id: number, permissionData: Partial<Permission>): Promise<Permission> => {
    const response = await api.put<Permission>(`/api/authorization/permissions/${id}`, permissionData)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error('error' in response ? response.error : 'Failed to update permission')
    }
  }

  const deletePermission = async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/api/authorization/permissions/${id}`)

    if (!isSuccessResponse(response)) {
      throw new Error('error' in response ? response.error : 'Failed to delete permission')
    }
  }

  // Utility functions for UI components
  const getPermissionColor = (permissionAction?: string): 'success' | 'info' | 'warning' | 'error' | 'primary' | 'neutral' => {
    const colors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'primary' | 'neutral'> = {
      'create': 'success',
      'read': 'info',
      'update': 'warning',
      'delete': 'error',
      'manage': 'primary',
      'admin': 'error'
    }
    return colors[permissionAction?.toLowerCase() || ''] || 'neutral'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPermissionName = (permission: Permission) => {
    return `${permission.action} ${permission.resource_type}`
  }

  const groupPermissionsByResource = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {}
    permissions.forEach(permission => {
      const groupKey = permission.resource_type || 'Undefined'
      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }
      grouped[groupKey].push(permission)
    })
    return grouped
  }

  return {
    // API operations
    fetchPermissions,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,

    // Utilities
    getPermissionColor,
    formatDate,
    formatDateTime,
    formatPermissionName,
    groupPermissionsByResource
  }
}