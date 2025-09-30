<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { usePermissionsStore } from '@/stores/permissions'
import type { Role, Permission } from '@/types'

const props = defineProps<{
  role?: Role | null
}>()

const emit = defineEmits<{
  success: []
}>()

const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const toast = useToast()

const open = ref(false)
const loading = ref(false)
const searchQuery = ref('')
const selectedPermissionIds = ref<number[]>([])

// Watch for role prop to open modal and load permissions
watch(() => props.role, async (role) => {
  if (role) {
    open.value = true
    loading.value = true

    try {
      // Load all available permissions if not already loaded
      if (permissionsStore.permissions.length === 0) {
        await permissionsStore.fetchPermissions()
      }

      // Fetch role permissions
      const rolePermissions = await rolesStore.fetchRolePermissions(role.id)
      selectedPermissionIds.value = rolePermissions.map(p => p.id)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      selectedPermissionIds.value = []
    } finally {
      loading.value = false
    }
  }
}, { immediate: true })

// Watch open state to reset when closed
watch(open, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
    selectedPermissionIds.value = []
  }
})

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

// Save permissions
const savePermissions = async () => {
  if (!props.role) return

  loading.value = true

  try {
    await rolesStore.syncPermissions(props.role.id, selectedPermissionIds.value)

    toast.add({
      title: 'Success',
      description: 'Permissions updated successfully',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    open.value = false
    emit('success')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to update permissions',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Manage Permissions - ${role?.name || ''}`"
    :ui="{ width: 'sm:max-w-2xl' }"
  >
    <slot />

    <template #body>
      <div class="space-y-4">
        <!-- Search -->
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search permissions..."
          class="w-full"
        />

        <!-- Loading state -->
        <div v-if="loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2" />
          <p class="text-gray-500">Loading permissions...</p>
        </div>

        <!-- Permissions grouped by resource type -->
        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="(permissions, resourceType) in groupedPermissions"
            :key="resourceType"
            class="border border-default rounded-lg p-4"
          >
            <h3 class="font-semibold text-sm uppercase text-gray-700 mb-3">
              {{ resourceType }}
            </h3>

            <div class="space-y-2">
              <div
                v-for="permission in permissions"
                :key="permission.id"
                class="flex items-center justify-between py-2 border-b border-default last:border-b-0"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <UBadge
                      :color="permissionsStore.getPermissionColor(permission.action)"
                      size="xs"
                      variant="subtle"
                    >
                      {{ permission.action }}
                    </UBadge>
                    <span class="text-sm font-medium">{{ permission.name }}</span>
                  </div>
                  <p v-if="permission.description" class="text-xs text-gray-500 mt-1">
                    {{ permission.description }}
                  </p>
                </div>

                <USwitch
                  :model-value="isPermissionSelected(permission.id)"
                  @update:model-value="togglePermission(permission.id)"
                />
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="Object.keys(groupedPermissions).length === 0" class="text-center py-8 text-gray-500">
            <UIcon name="i-lucide-search-x" class="h-8 w-8 mx-auto mb-2" />
            <p>No permissions found</p>
          </div>
        </div>

        <!-- Summary -->
        <div class="pt-4 border-t border-default">
          <p class="text-sm text-gray-600">
            <span class="font-medium">{{ selectedPermissionIds.length }}</span>
            permission{{ selectedPermissionIds.length !== 1 ? 's' : '' }} selected
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Save Changes"
            color="primary"
            variant="solid"
            :loading="loading"
            @click="savePermissions"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>