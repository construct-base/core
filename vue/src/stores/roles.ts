import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRoles } from '../composables/useRoles'
import type { Role, QueryParams } from '../types'

export const useRolesStore = defineStore('roles', () => {
  // Get the composable with API operations
  const rolesApi = useRoles()

  // State
  const roles = ref<Role[]>([])
  const selectedRole = ref<Role | null>(null)
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

  // Getters
  const totalRoles = computed(() => pagination.value.total)
  const hasRoles = computed(() => roles.value.length > 0)
  const isLoading = computed(() => loading.value)

  // Filtered roles based on search
  const filteredRoles = computed(() => {
    let filtered = roles.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((role: Role) =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  // Role options for selects
  const roleOptions = computed(() =>
    roles.value.map(role => ({
      label: role.name,
      value: role.id
    }))
  )

  const getRoleById = computed(() => (id: number) =>
    roles.value.find(role => role.id === id)
  )

  const getRoleByName = computed(() => (name: string) =>
    roles.value.find(role => role.name.toLowerCase() === name.toLowerCase())
  )

  // Actions - using the composable internally
  const fetchRoles = async (params?: QueryParams): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const result = await rolesApi.fetchRoles(params)
      roles.value = result.roles
      pagination.value = result.pagination
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch roles'
    } finally {
      loading.value = false
    }
  }

  const fetchRole = async (id: number): Promise<Role | null> => {
    loading.value = true
    error.value = null

    try {
      const role = await rolesApi.fetchRole(id)
      selectedRole.value = role
      return role
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch role'
      return null
    } finally {
      loading.value = false
    }
  }

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role | null> => {
    loading.value = true
    error.value = null

    try {
      const newRole = await rolesApi.createRole(roleData)
      roles.value.push(newRole)
      pagination.value.total += 1
      return newRole
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create role'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedRole = await rolesApi.updateRole(id, roleData)
      const index = roles.value.findIndex(role => role.id === id)
      if (index !== -1) {
        roles.value[index] = updatedRole
      }
      if (selectedRole.value?.id === id) {
        selectedRole.value = updatedRole
      }
      return updatedRole
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update role'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await rolesApi.deleteRole(id)
      roles.value = roles.value.filter(role => role.id !== id)
      if (selectedRole.value?.id === id) {
        selectedRole.value = null
      }
      pagination.value.total -= 1
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete role'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchRolePermissions = async (roleId: number) => {
    loading.value = true
    error.value = null

    try {
      return await rolesApi.fetchRolePermissions(roleId)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch role permissions'
      return []
    } finally {
      loading.value = false
    }
  }

  // Helper actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setPage = async (page: number): Promise<void> => {
    await fetchRoles({ page, page_size: pagination.value.page_size })
  }

  const setPerPage = async (perPage: number): Promise<void> => {
    await fetchRoles({ page: 1, page_size: perPage })
  }

  const clearError = () => {
    error.value = null
  }

  const clearSelectedRole = () => {
    selectedRole.value = null
  }

  const clearFilters = () => {
    searchQuery.value = ''
  }

  // Permission assignment actions
  const assignPermissions = async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await rolesApi.assignPermissions(roleId, permissionIds)
      // Refresh the role to get updated permissions
      await fetchRole(roleId)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to assign permissions'
      return false
    } finally {
      loading.value = false
    }
  }

  const removePermissions = async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await rolesApi.removePermissions(roleId, permissionIds)
      // Refresh the role to get updated permissions
      await fetchRole(roleId)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to remove permissions'
      return false
    } finally {
      loading.value = false
    }
  }

  const syncPermissions = async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await rolesApi.syncPermissions(roleId, permissionIds)
      // Refresh the role to get updated permissions
      await fetchRole(roleId)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to sync permissions'
      return false
    } finally {
      loading.value = false
    }
  }

  // Expose utility functions from composable
  const { getRoleColor, formatDate, formatDateTime, getPermissionCount } = rolesApi

  return {
    // State
    roles,
    selectedRole,
    loading,
    error,
    pagination,
    searchQuery,

    // Getters
    totalRoles,
    hasRoles,
    isLoading,
    filteredRoles,
    roleOptions,
    getRoleById,
    getRoleByName,

    // Actions
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    fetchRolePermissions,
    setSearchQuery,
    setPage,
    setPerPage,
    clearError,
    clearSelectedRole,
    clearFilters,

    // Permission assignment actions
    assignPermissions,
    removePermissions,
    syncPermissions,

    // Utilities from composable
    getRoleColor,
    formatDate,
    formatDateTime,
    getPermissionCount
  }
})