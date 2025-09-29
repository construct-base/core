<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Permissions Management">
        <template #trailing>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="isCreateModalOpen = true"
          >
            Add Permission
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Search and Filters -->
        <div class="flex items-center gap-4">
          <UInput
            v-model="store.searchQuery"
            placeholder="Search permissions..."
            icon="i-lucide-search"
            class="flex-1"
          />
          <USelect
            v-model="store.resourceFilter"
            :options="[{ label: 'All Resources', value: '' }, ...store.resourceOptions]"
            placeholder="Filter by Resource"
            class="w-48"
          />
          <USelect
            v-model="store.actionFilter"
            :options="[{ label: 'All Actions', value: '' }, ...store.actionOptions]"
            placeholder="Filter by Action"
            class="w-48"
          />
        </div>

        <!-- Permissions Grouped by Resource -->
        <div v-if="store.loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
          <p class="text-gray-500 dark:text-gray-400">
            Loading permissions...
          </p>
        </div>

        <div v-else-if="store.error" class="p-8 text-center">
          <UIcon name="i-lucide-alert-circle" class="h-6 w-6 mx-auto mb-2 text-red-500 dark:text-red-400" />
          <p class="text-red-500 dark:text-red-400">
            {{ store.error }}
          </p>
          <UButton class="mt-4" @click="() => store.fetchPermissions()">
            Try Again
          </UButton>
        </div>

        <div v-else class="space-y-6">
          <div v-for="(permissions, resource) in store.groupedPermissions" :key="resource" class="space-y-3">
            <!-- Resource Header -->
            <div class="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <UIcon name="i-lucide-folder" class="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {{ resource }}
              </h3>
              <UBadge size="sm" color="neutral">
                {{ permissions.length }} {{ permissions.length === 1 ? 'permission' : 'permissions' }}
              </UBadge>
            </div>

            <!-- Permissions List -->
            <div class="space-y-1">
              <div
                v-for="permission in permissions"
                :key="permission.id"
                class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700"
              >
                <div class="flex items-center gap-3">
                  <!-- Action Badge -->
                  <UBadge :color="store.getPermissionColor(permission.action)" size="xs">
                    <UIcon :name="getActionIcon(permission.action)" class="h-3 w-3 mr-1" />
                    {{ permission.action }}
                  </UBadge>

                  <!-- Permission Info -->
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {{ permission.resource_type }}
                    </span>
                    <span v-if="permission.description" class="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      • {{ permission.description }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-edit"
                    @click="handleEdit(permission)"
                  />
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash"
                    @click="handleDelete(permission)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="Object.keys(store.groupedPermissions).length === 0" class="p-12 text-center">
            <UIcon name="i-lucide-key" class="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No permissions found
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first permission.
            </p>
            <UButton color="primary" @click="isCreateModalOpen = true">
              Add Permission
            </UButton>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="store.pagination.total_pages > 1" class="flex justify-center">
          <UPagination
            v-model="store.pagination.page"
            :total="store.pagination.total"
            :page-count="store.pagination.page_size"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Create/Edit Permission Modal -->
  <UModal
    v-model:open="isCreateModalOpen"
    :title="editingPermission ? 'Edit Permission' : 'Create New Permission'"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField label="Action" required>
          <UInput
            v-model="permissionForm.action"
            placeholder="Enter action (e.g., create, read, update, delete)"
            required
          />
        </UFormField>

        <UFormField label="Resource Type" required>
          <UInput
            v-model="permissionForm.resource_type"
            placeholder="Enter resource type (e.g., user, post, role)"
            required
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="permissionForm.description"
            placeholder="Enter permission description (optional)"
            :rows="3"
          />
        </UFormField>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="closeModal"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="store.loading"
          >
            {{ editingPermission ? 'Update Permission' : 'Create Permission' }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>

  <!-- Delete Confirmation Modal -->
  <UModal
    v-model:open="isDeleteModalOpen"
    title="Delete Permission"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-gray-900 font-medium">
              Are you sure you want to delete this permission?
            </p>
            <p class="text-gray-500 text-sm mt-1">
              This action cannot be undone. Roles with this permission will lose access.
            </p>
            <div v-if="permissionToDelete" class="mt-3 p-3 bg-gray-50 rounded-md">
              <p class="font-medium">
                {{ store.formatPermissionName(permissionToDelete) }}
              </p>
              <p v-if="permissionToDelete.description" class="text-sm text-gray-600">
                {{ permissionToDelete.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            @click="isDeleteModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            :loading="store.loading"
            @click="confirmDelete"
          >
            Delete Permission
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePermissionsStore } from '../stores/permissions'
import type { Permission } from '../types'

// Store
const store = usePermissionsStore()

// Modal states
const isCreateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingPermission = ref<Permission | null>(null)
const permissionToDelete = ref<Permission | null>(null)

// Form data
const permissionForm = ref({
  action: '',
  resource_type: '',
  description: ''
})

// Helper functions
const getActionIcon = (action: string) => {
  const icons: Record<string, string> = {
    'create': 'i-lucide-plus',
    'read': 'i-lucide-eye',
    'update': 'i-lucide-edit',
    'delete': 'i-lucide-trash',
    'manage': 'i-lucide-settings',
    'admin': 'i-lucide-shield',
    'list': 'i-lucide-list',
    'view': 'i-lucide-eye',
    'edit': 'i-lucide-edit-3'
  }
  return icons[action.toLowerCase()] || 'i-lucide-key'
}

// Event handlers
const handleEdit = (permission: Permission) => {
  editingPermission.value = permission
  permissionForm.value = {
    action: permission.action,
    resource_type: permission.resource_type,
    description: permission.description || ''
  }
  isCreateModalOpen.value = true
}

const handleDelete = (permission: Permission) => {
  permissionToDelete.value = permission
  isDeleteModalOpen.value = true
}

const handlePageChange = (page: number) => {
  store.setPage(page)
}

const handleSubmit = async () => {
  try {
    if (editingPermission.value) {
      await store.updatePermission(editingPermission.value.id, {
        name: `${permissionForm.value.action}_${permissionForm.value.resource_type}`,
        action: permissionForm.value.action,
        resource_type: permissionForm.value.resource_type,
        description: permissionForm.value.description || undefined
      })
    } else {
      await store.createPermission({
        name: `${permissionForm.value.action}_${permissionForm.value.resource_type}`,
        action: permissionForm.value.action,
        resource_type: permissionForm.value.resource_type,
        description: permissionForm.value.description || undefined
      })
    }

    closeModal()
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: `Permission ${editingPermission.value ? 'updated' : 'created'} successfully`,
      color: 'success'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: `Failed to ${editingPermission.value ? 'update' : 'create'} permission`,
      color: 'error'
    })
  }
}

const confirmDelete = async () => {
  if (!permissionToDelete.value) return

  try {
    await store.deletePermission(permissionToDelete.value.id)
    isDeleteModalOpen.value = false
    permissionToDelete.value = null

    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Permission deleted successfully',
      color: 'success'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete permission',
      color: 'error'
    })
  }
}

const closeModal = () => {
  isCreateModalOpen.value = false
  editingPermission.value = null
  permissionForm.value = {
    action: '',
    resource_type: '',
    description: ''
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await store.fetchPermissions()
  } catch (error) {
    console.error('Failed to load permissions:', error)
  }
})
</script>