import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usePermissions } from '../composables/usePermissions'
import type { Permission, QueryParams } from '../types'

export const usePermissionsStore = defineStore('permissions', () => {
  // Get the composable with API operations
  const permissionsApi = usePermissions()

  // State
  const permissions = ref<Permission[]>([])
  const selectedPermission = ref<Permission | null>(null)
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
  const resourceFilter = ref('')
  const actionFilter = ref('')

  // Getters
  const totalPermissions = computed(() => pagination.value.total)
  const hasPermissions = computed(() => permissions.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Filtered permissions based on search and filters
  const filteredPermissions = computed(() => {
    let filtered = permissions.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((permission: Permission) =>
        permission.action.toLowerCase().includes(query) ||
        permission.resource_type.toLowerCase().includes(query) ||
        permission.description?.toLowerCase().includes(query)
      )
    }

    if (resourceFilter.value) {
      filtered = filtered.filter((permission: Permission) =>
        permission.resource_type === resourceFilter.value
      )
    }

    if (actionFilter.value) {
      filtered = filtered.filter((permission: Permission) =>
        permission.action === actionFilter.value
      )
    }

    return filtered
  })

  // Permission options for selects
  const permissionOptions = computed(() =>
    permissions.value.map(permission => ({
      label: permissionsApi.formatPermissionName(permission),
      value: permission.id
    }))
  )

  // Resource and action options for filters
  const resourceOptions = computed(() => {
    const resources = [...new Set(permissions.value.map(p => p.resource_type))]
    return resources.map(resource => ({
      label: resource.charAt(0).toUpperCase() + resource.slice(1),
      value: resource
    }))
  })

  const actionOptions = computed(() => {
    const actions = [...new Set(permissions.value.map(p => p.action))]
    return actions.map(action => ({
      label: action,
      value: action
    }))
  })

  // Grouped permissions by resource
  const groupedPermissions = computed(() =>
    permissionsApi.groupPermissionsByResource(filteredPermissions.value)
  )

  const getPermissionById = computed(() => (id: number) =>
    permissions.value.find(permission => permission.id === id)
  )

  const getPermissionByName = computed(() => (action: string, resource: string) =>
    permissions.value.find(permission =>
      permission.action.toLowerCase() === action.toLowerCase() &&
      permission.resource_type.toLowerCase() === resource.toLowerCase()
    )
  )

  // Actions - using the composable internally
  const fetchPermissions = async (params?: QueryParams): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await permissionsApi.fetchPermissions(params)
      permissions.value = result.permissions
      pagination.value = result.pagination
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch permissions'
    } finally {
      loading.value = false
    }
  }

  const fetchPermission = async (id: number): Promise<Permission | null> => {
    loading.value = true
    error.value = null

    try {
      const permission = await permissionsApi.fetchPermission(id)
      selectedPermission.value = permission
      return permission
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch permission'
      return null
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission | null> => {
    loading.value = true
    error.value = null

    try {
      const newPermission = await permissionsApi.createPermission(permissionData)
      permissions.value.push(newPermission)
      pagination.value.total += 1
      return newPermission
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create permission'
      return null
    } finally {
      loading.value = false
    }
  }

  const updatePermission = async (id: number, permissionData: Partial<Permission>): Promise<Permission | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedPermission = await permissionsApi.updatePermission(id, permissionData)
      const index = permissions.value.findIndex(permission => permission.id === id)
      if (index !== -1) {
        permissions.value[index] = updatedPermission
      }
      if (selectedPermission.value?.id === id) {
        selectedPermission.value = updatedPermission
      }
      return updatedPermission
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update permission'
      return null
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await permissionsApi.deletePermission(id)
      permissions.value = permissions.value.filter(permission => permission.id !== id)
      if (selectedPermission.value?.id === id) {
        selectedPermission.value = null
      }
      pagination.value.total -= 1
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete permission'
      return false
    } finally {
      loading.value = false
    }
  }

  // Helper actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setResourceFilter = (resource: string) => {
    resourceFilter.value = resource
  }

  const setActionFilter = (action: string) => {
    actionFilter.value = action
  }

  const setPage = async (page: number): Promise<void> => {
    await fetchPermissions({ page, page_size: pagination.value.page_size })
  }

  const setPerPage = async (perPage: number): Promise<void> => {
    await fetchPermissions({ page: 1, page_size: perPage })
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedPermission = () => {
    selectedPermission.value = null
  }

  const clearFilters = () => {
    searchQuery.value = ''
    resourceFilter.value = ''
    actionFilter.value = ''
  }

  // Expose utility functions from composable
  const { getPermissionColor, formatDate, formatDateTime, formatPermissionName, groupPermissionsByResource } = permissionsApi

  return {
    // State
    permissions,
    selectedPermission,
    loading,
    error,
    pagination,
    searchQuery,
    resourceFilter,
    actionFilter,

    // Getters
    totalPermissions,
    hasPermissions,
    isLoading,
    filteredPermissions,
    permissionOptions,
    resourceOptions,
    actionOptions,
    groupedPermissions,
    getPermissionById,
    getPermissionByName,

    // Actions
    fetchPermissions,
    fetchPermission,
    createPermission,
    updatePermission,
    deletePermission,
    setSearchQuery,
    setResourceFilter,
    setActionFilter,
    setPage,
    setPerPage,
    clearError,
    clearSelectedPermission,
    clearFilters,

    // Utilities from composable
    getPermissionColor,
    formatDate,
    formatDateTime,
    formatPermissionName,
    groupPermissionsByResource
  }
})