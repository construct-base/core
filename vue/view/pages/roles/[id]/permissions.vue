<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRolesStore } from '@/stores/roles'
import { usePermissionsStore } from '@/stores/permissions'
import type { Permission } from '@/types'

const route = useRoute()
const router = useRouter()
const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const toast = useToast()

const roleId = computed(() => parseInt(route.params.id as string))
const role = ref(rolesStore.roles.find(r => r.id === roleId.value))
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const selectedPermissionIds = ref<number[]>([])

// Group permissions by resource type
const groupedPermissions = computed(() => {
  let filtered = permissionsStore.permissions

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((permission: Permission) =>
      permission.action.toLowerCase().includes(query) ||
      permission.resource_type.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query)
    )
  }

  // Group by resource type
  const groups: Record<string, Permission[]> = {}
  filtered.forEach((permission: Permission) => {
    if (!groups[permission.resource_type]) {
      groups[permission.resource_type] = []
    }
    groups[permission.resource_type].push(permission)
  })

  return groups
})

// Toggle permission
const togglePermission = (permissionId: number) => {
  const index = selectedPermissionIds.value.indexOf(permissionId)
  if (index > -1) {
    selectedPermissionIds.value.splice(index, 1)
  } else {
    selectedPermissionIds.value.push(permissionId)
  }
}

// Check if permission is selected
const isPermissionSelected = (permissionId: number) => {
  return selectedPermissionIds.value.includes(permissionId)
}

// Toggle all permissions for a resource type
const toggleResourceType = (resourceType: string) => {
  const permissions = groupedPermissions.value[resourceType]
  const allSelected = permissions.every(p => isPermissionSelected(p.id))

  if (allSelected) {
    // Deselect all
    permissions.forEach(p => {
      const index = selectedPermissionIds.value.indexOf(p.id)
      if (index > -1) {
        selectedPermissionIds.value.splice(index, 1)
      }
    })
  } else {
    // Select all
    permissions.forEach(p => {
      if (!isPermissionSelected(p.id)) {
        selectedPermissionIds.value.push(p.id)
      }
    })
  }
}

// Check if all permissions for a resource type are selected
const isResourceTypeSelected = (resourceType: string) => {
  const permissions = groupedPermissions.value[resourceType]
  return permissions.every(p => isPermissionSelected(p.id))
}

// Check if some permissions for a resource type are selected
const isResourceTypeIndeterminate = (resourceType: string) => {
  const permissions = groupedPermissions.value[resourceType]
  const selectedCount = permissions.filter(p => isPermissionSelected(p.id)).length
  return selectedCount > 0 && selectedCount < permissions.length
}

// Save permissions
const savePermissions = async () => {
  saving.value = true

  try {
    await rolesStore.syncPermissions(roleId.value, selectedPermissionIds.value)

    toast.add({
      title: 'Success',
      description: 'Permissions updated successfully',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update permissions',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    saving.value = false
  }
}

// Load data
onMounted(async () => {
  loading.value = true

  try {
    // Load role if not in store
    if (!role.value) {
      await rolesStore.fetchRole(roleId.value)
      role.value = rolesStore.roles.find(r => r.id === roleId.value)
    }

    // Load all available permissions
    if (permissionsStore.permissions.length === 0) {
      await permissionsStore.fetchPermissions()
    }

    // Fetch role permissions
    const rolePermissions = await rolesStore.fetchRolePermissions(roleId.value)
    selectedPermissionIds.value = rolePermissions.map(p => p.id)
  } catch (error) {
    console.error('Failed to load data:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load role permissions',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="`${role?.name || 'Role'} Permissions`">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            @click="router.push('/roles')"
          />
        </template>

        <template #right>
          <UButton
            label="Save Changes"
            icon="i-lucide-save"
            :loading="saving"
            @click="savePermissions"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Role info card -->
        <UCard v-if="role">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-semibold">{{ role.name }}</h2>
              <p v-if="role.description" class="text-sm text-muted mt-1">
                {{ role.description }}
              </p>
            </div>
            <UBadge v-if="role.is_system" color="blue" variant="subtle">
              System Role
            </UBadge>
          </div>
        </UCard>

        <!-- Search -->
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search permissions..."
          class="max-w-md"
        />

        <!-- Summary -->
        <div class="flex items-center justify-between p-4 bg-elevated rounded-lg">
          <div>
            <p class="text-sm font-medium">
              {{ selectedPermissionIds.length }} permission{{ selectedPermissionIds.length !== 1 ? 's' : '' }} selected
            </p>
            <p class="text-xs text-muted mt-1">
              out of {{ permissionsStore.permissions.length }} total permissions
            </p>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2" />
          <p class="text-muted">Loading permissions...</p>
        </div>

        <!-- Permissions grouped by resource type -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard
            v-for="(permissions, resourceType) in groupedPermissions"
            :key="resourceType"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UCheckbox
                    :model-value="isResourceTypeSelected(resourceType)"
                    :indeterminate="isResourceTypeIndeterminate(resourceType)"
                    @update:model-value="toggleResourceType(resourceType)"
                  />
                  <h3 class="font-semibold text-sm uppercase">
                    {{ resourceType }}
                  </h3>
                </div>
                <UBadge color="gray" variant="subtle" size="xs">
                  {{ permissions.filter(p => isPermissionSelected(p.id)).length }}/{{ permissions.length }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="permission in permissions"
                :key="permission.id"
                class="flex items-start justify-between gap-3"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <UBadge
                      :color="permissionsStore.getPermissionColor(permission.action)"
                      size="xs"
                      variant="subtle"
                    >
                      {{ permission.action }}
                    </UBadge>
                    <span class="text-sm font-medium truncate">{{ permission.name }}</span>
                  </div>
                  <p v-if="permission.description" class="text-xs text-muted">
                    {{ permission.description }}
                  </p>
                </div>

                <USwitch
                  :model-value="isPermissionSelected(permission.id)"
                  @update:model-value="togglePermission(permission.id)"
                />
              </div>
            </div>
          </UCard>

          <!-- Empty state -->
          <div
            v-if="Object.keys(groupedPermissions).length === 0"
            class="col-span-full text-center py-12"
          >
            <UIcon name="i-lucide-search-x" class="h-12 w-12 mx-auto mb-3 text-muted" />
            <p class="text-muted">No permissions found</p>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>