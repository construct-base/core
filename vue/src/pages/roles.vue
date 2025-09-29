<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Roles Management">
        <template #trailing>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="isCreateModalOpen = true"
          >
            Add Role
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Search -->
        <div class="flex items-center gap-4">
          <UInput
            v-model="store.searchQuery"
            placeholder="Search roles..."
            icon="i-lucide-search"
            class="flex-1"
          />
        </div>

        <!-- Roles Table -->
        <UCard>
          <div v-if="store.loading" class="p-8 text-center">
            <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2" />
            <p class="text-gray-500">
              Loading roles...
            </p>
          </div>

          <div v-else-if="store.error" class="p-8 text-center">
            <UIcon name="i-lucide-alert-circle" class="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p class="text-red-500">
              {{ store.error }}
            </p>
            <UButton class="mt-4" @click="() => store.fetchRoles()">
              Try Again
            </UButton>
          </div>

          <UTable
            v-else
            :data="store.filteredRoles"
            :columns="columns"
            :loading="store.loading"
            @select="handleRoleSelect"
          />
        </UCard>

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

  <!-- Create/Edit Role Modal -->
  <UModal
    v-model:open="isCreateModalOpen"
    :title="editingRole ? 'Edit Role' : 'Create New Role'"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField label="Role Name" required>
          <UInput
            v-model="roleForm.name"
            placeholder="Enter role name"
            required
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="roleForm.description"
            placeholder="Enter role description (optional)"
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
            {{ editingRole ? 'Update Role' : 'Create Role' }}
          </UButton>
        </div>
      </form>
    </template>
  </UModal>

  <!-- Delete Confirmation Modal -->
  <UModal
    v-model:open="isDeleteModalOpen"
    title="Delete Role"
  >
    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-gray-900 font-medium">
              Are you sure you want to delete this role?
            </p>
            <p class="text-gray-500 text-sm mt-1">
              This action cannot be undone. Users with this role will need to be reassigned.
            </p>
            <div v-if="roleToDelete" class="mt-3 p-3 bg-gray-50 rounded-md">
              <p class="font-medium">
                {{ roleToDelete.name }}
              </p>
              <p v-if="roleToDelete.description" class="text-sm text-gray-600">
                {{ roleToDelete.description }}
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
            Delete Role
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Manage Permissions Modal -->
  <UModal
    v-model:open="isPermissionsModalOpen"
    :title="`Manage Permissions - ${permissionsRole?.name || ''}`"
    :size="'xl'"
  >
    <template #body>
      <div class="space-y-6">
        <div v-if="permissionsStore.loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2" />
          <p class="text-gray-500">
            Loading permissions...
          </p>
        </div>

        <div v-else class="space-y-4">
          <!-- Search permissions -->
          <UInput
            v-model="permissionSearchQuery"
            placeholder="Search permissions..."
            icon="i-lucide-search"
          />

          <!-- Permissions list -->
          <div class="max-h-96 overflow-y-auto border rounded-lg">
            <div v-for="permission in filteredAvailablePermissions" :key="permission.id" class="p-3 border-b last:border-b-0">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <UBadge :color="permissionsStore.getPermissionColor(permission.action)" size="xs">
                      {{ permission.action }}
                    </UBadge>
                    <span class="font-medium">{{ permission.resource_type }}</span>
                  </div>
                  <p v-if="permission.description" class="text-sm text-gray-500 mt-1">
                    {{ permission.description }}
                  </p>
                </div>
                <UCheckbox
                  :model-value="selectedPermissionIds.includes(permission.id)"
                  @update:model-value="togglePermission(permission.id)"
                />
              </div>
            </div>
          </div>

          <!-- Save changes -->
          <div class="flex justify-end gap-3 pt-4">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="closePermissionsModal"
            >
              Cancel
            </UButton>
            <UButton
              :loading="store.loading"
              @click="savePermissions"
            >
              Save Changes
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRolesStore } from '../stores/roles'
import { usePermissionsStore } from '../stores/permissions'
import type { Role, Permission } from '../types'
import type { CellContext, ColumnDef } from '@tanstack/table-core'

// Store
const store = useRolesStore()
const permissionsStore = usePermissionsStore()

// Modal states
const isCreateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isPermissionsModalOpen = ref(false)
const editingRole = ref<Role | null>(null)
const roleToDelete = ref<Role | null>(null)
const permissionsRole = ref<Role | null>(null)

// Permissions management state
const selectedPermissionIds = ref<number[]>([])
const permissionSearchQuery = ref('')

// Form data
const roleForm = ref({
  name: '',
  description: ''
})

// Table columns
const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    cell: ({ row }: CellContext<Role, unknown>) => h('div', { class: 'font-medium' }, row.original.name)
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: false,
    cell: ({ row }: CellContext<Role, unknown>) => h('div', { class: 'text-gray-600' },
      row.original.description || 'No description'
    )
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    enableSorting: false,
    cell: ({ row }: CellContext<Role, unknown>) => h('div', { class: 'text-sm' },
      `${store.getPermissionCount(row.original)} permissions`
    )
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    enableSorting: true,
    cell: ({ row }: CellContext<Role, unknown>) => store.formatDate(row.original.created_at || '')
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }: CellContext<Role, unknown>) => h('div', { class: 'flex items-center gap-2' }, [
      h('UButton', {
        size: 'xs',
        color: 'gray',
        variant: 'ghost',
        icon: 'i-lucide-key',
        onClick: () => handleManagePermissions(row.original)
      }),
      h('UButton', {
        size: 'xs',
        color: 'gray',
        variant: 'ghost',
        icon: 'i-lucide-edit',
        onClick: () => handleEdit(row.original)
      }),
      h('UButton', {
        size: 'xs',
        color: 'red',
        variant: 'ghost',
        icon: 'i-lucide-trash',
        onClick: () => handleDelete(row.original)
      })
    ])
  }
]

// Computed properties
const filteredAvailablePermissions = computed(() => {
  let filtered = permissionsStore.permissions

  if (permissionSearchQuery.value) {
    const query = permissionSearchQuery.value.toLowerCase()
    filtered = filtered.filter((permission: Permission) =>
      permission.action.toLowerCase().includes(query) ||
      permission.resource_type.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Event handlers
const handleRoleSelect = (row: any) => {
  store.selectedRole = row.original || row
}

const handleEdit = (role: Role) => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || ''
  }
  isCreateModalOpen.value = true
}

const handleDelete = (role: Role) => {
  roleToDelete.value = role
  isDeleteModalOpen.value = true
}

const handleManagePermissions = async (role: Role) => {
  permissionsRole.value = role
  permissionSearchQuery.value = ''

  // Load all available permissions if not already loaded
  if (permissionsStore.permissions.length === 0) {
    await permissionsStore.fetchPermissions()
  }

  // Fetch the actual permissions for this role
  try {
    const rolePermissions = await store.fetchRolePermissions(role.id)
    selectedPermissionIds.value = rolePermissions.map(p => p.id)
  } catch (error) {
    console.error('Failed to fetch role permissions:', error)
    selectedPermissionIds.value = []
  }

  isPermissionsModalOpen.value = true
}

const handlePageChange = (page: number) => {
  store.setPage(page)
}

const handleSubmit = async () => {
  try {
    if (editingRole.value) {
      await store.updateRole(editingRole.value.id, {
        name: roleForm.value.name,
        description: roleForm.value.description || undefined
      })
    } else {
      await store.createRole({
        name: roleForm.value.name,
        description: roleForm.value.description || undefined
      })
    }

    closeModal()
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: `Role ${editingRole.value ? 'updated' : 'created'} successfully`,
      color: 'success'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: `Failed to ${editingRole.value ? 'update' : 'create'} role`,
      color: 'error'
    })
  }
}

const confirmDelete = async () => {
  if (!roleToDelete.value) return

  try {
    await store.deleteRole(roleToDelete.value.id)
    isDeleteModalOpen.value = false
    roleToDelete.value = null

    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Role deleted successfully',
      color: 'success'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete role',
      color: 'error'
    })
  }
}

const closeModal = () => {
  isCreateModalOpen.value = false
  editingRole.value = null
  roleForm.value = {
    name: '',
    description: ''
  }
}

// Permissions management handlers
const togglePermission = (permissionId: number) => {
  const index = selectedPermissionIds.value.indexOf(permissionId)
  if (index > -1) {
    selectedPermissionIds.value.splice(index, 1)
  } else {
    selectedPermissionIds.value.push(permissionId)
  }
}

const savePermissions = async () => {
  if (!permissionsRole.value) return

  try {
    await store.syncPermissions(permissionsRole.value.id, selectedPermissionIds.value)
    closePermissionsModal()

    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Permissions updated successfully',
      color: 'success'
    })
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update permissions',
      color: 'error'
    })
  }
}

const closePermissionsModal = () => {
  isPermissionsModalOpen.value = false
  permissionsRole.value = null
  selectedPermissionIds.value = []
  permissionSearchQuery.value = ''
}

// Lifecycle
onMounted(async () => {
  try {
    await store.fetchRoles()
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
})
</script>