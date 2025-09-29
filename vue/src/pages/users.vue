<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Users Management">
        <template #trailing>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="isCreateModalOpen = true"
          >
            Add User
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
            placeholder="Search users..."
            icon="i-lucide-search"
            class="flex-1"
          />
          <USelect
            v-model="store.roleFilter"
            :options="rolesStore.roleOptions"
            placeholder="Filter by role"
            class="w-48"
          />
        </div>

        <!-- Users Table -->
        <UCard>
          <div v-if="store.loading" class="p-8 text-center">
            <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2" />
            <p class="text-gray-500">
              Loading users...
            </p>
          </div>

          <div v-else-if="store.error" class="p-8 text-center">
            <UIcon name="i-lucide-alert-circle" class="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p class="text-red-500">
              {{ store.error }}
            </p>
            <UButton class="mt-4" @click="() => store.fetchUsers()">
              Try Again
            </UButton>
          </div>

          <UTable
            v-else
            :data="store.filteredUsers"
            :columns="columns"
            :loading="store.loading"
            @select="handleUserSelect"
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

  <!-- Create/Edit User Modal -->
  <UModal
    v-model:open="isCreateModalOpen"
    :title="editingUser ? 'Edit User' : 'Create New User'"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="First Name" required>
            <UInput
              v-model="userForm.first_name"
              placeholder="Enter first name"
              required
            />
          </UFormField>

          <UFormField label="Last Name" required>
            <UInput
              v-model="userForm.last_name"
              placeholder="Enter last name"
              required
            />
          </UFormField>
        </div>

        <UFormField label="Username" required>
          <UInput
            v-model="userForm.username"
            placeholder="Enter username"
            required
          />
        </UFormField>

        <UFormField label="Email" required>
          <UInput
            v-model="userForm.email"
            type="email"
            placeholder="Enter email"
            required
          />
        </UFormField>

        <UFormField label="Phone">
          <UInput
            v-model="userForm.phone"
            placeholder="Enter phone number"
          />
        </UFormField>

        <UFormField v-if="!editingUser" label="Password" required>
          <UInput
            v-model="userForm.password"
            type="password"
            placeholder="Enter password"
            :required="!editingUser"
          />
        </UFormField>

        <UFormField label="Role">
          <USelect
            v-model="userForm.role_id"
            :options="rolesStore.roleOptions"
            placeholder="Select role"
          />
        </UFormField>
      </form>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="outline"
          @click="close"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ editingUser ? 'Update' : 'Create' }} User
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useUsersStore } from '../stores/users'
import { useRolesStore } from '../stores/roles'
import type { User, UserCreateRequest, UserUpdateRequest } from '../types'
import type { CellContext, ColumnDef } from '@tanstack/table-core'

type TableColumn<T> = ColumnDef<T>
  
// Use the stores directly
const store = useUsersStore()
const rolesStore = useRolesStore()

// Modal and form state
const isCreateModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const submitting = ref(false)

const userForm = ref<UserCreateRequest & { role_id?: number }>({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role_id: undefined
})

// Table columns (TanStack Table format for Nuxt UI)
const columns: TableColumn<User>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    enableSorting: false,
    cell: ({ row }: CellContext<User, unknown>) => h('UAvatar', {
      src: row.original.avatar_url,
      alt: `${row.original.first_name} ${row.original.last_name}`,
      size: 'sm'
    })
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    cell: ({ row }: CellContext<User, unknown>) => h('div', [
      h('p', { class: 'font-medium' }, `${row.original.first_name} ${row.original.last_name}`),
      h('p', { class: 'text-sm text-gray-500' }, row.original.username)
    ])
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
    cell: ({ row }: CellContext<User, unknown>) => row.original.email
  },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
    cell: ({ row }: CellContext<User, unknown>) => h('UBadge', {
      color: store.getRoleColor(row.original.role_name || row.original.role?.name),
      variant: 'subtle'
    }, () => row.original.role_name || row.original.role?.name || 'No Role')
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    enableSorting: true,
    cell: ({ row }: CellContext<User, unknown>) => store.formatDate(row.original.created_at)
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }: CellContext<User, unknown>) => h('UDropdown', {
      items: [
        [{ label: 'Edit', icon: 'i-lucide-edit', click: () => editUser(row.original) }],
        [{ label: 'Delete', icon: 'i-lucide-trash', click: () => handleDeleteUser(row.original), color: 'red' }]
      ]
    }, () => h('UButton', {
      color: 'neutral',
      variant: 'ghost',
      icon: 'i-lucide-more-horizontal'
    }))
  }
]


// Helper function to reset form
const resetForm = () => {
  userForm.value = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role_id: undefined
  }
}

const handleUserSelect = (row: { original: User }) => {
  console.log('Selected user:', row.original)
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    password: '',
    role_id: user.role_id
  }
  isCreateModalOpen.value = true
}

const handleDeleteUser = async (user: User) => {
  if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
    return
  }

  try {
    await store.deleteUser(user.id)
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'User deleted successfully',
      color: 'success'
    })
  } catch (err) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Failed to delete user',
      color: 'error'
    })
  }
}

const handleSubmit = async () => {
  submitting.value = true

  try {
    if (editingUser.value) {
      const updateData: UserUpdateRequest = {
        first_name: userForm.value.first_name,
        last_name: userForm.value.last_name,
        username: userForm.value.username,
        email: userForm.value.email,
        phone: userForm.value.phone,
        role_id: userForm.value.role_id
      }
      await store.updateUser(editingUser.value.id, updateData)
    } else {
      await store.createUser(userForm.value as UserCreateRequest)
    }

    closeModal()
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: `User ${editingUser.value ? 'updated' : 'created'} successfully`,
      color: 'success'
    })
  } catch (err) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Failed to save user',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  isCreateModalOpen.value = false
  editingUser.value = null
  resetForm()
}

const handlePageChange = async (page: number) => {
  try {
    await store.setPage(page)
  } catch {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to load page',
      color: 'error'
    })
  }
}


// Lifecycle
onMounted(async () => {
  try {
    await store.fetchUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
  }
})
</script>