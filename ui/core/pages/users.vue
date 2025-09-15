<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <p class="text-gray-600">Manage system users and their roles</p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Add User
      </UButton>
    </div>

    <!-- Filters -->
    <UCard>
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search users..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
         />
        <USelectMenu
          v-model="selectedRole"
          :options="roleOptions"
          placeholder="Filter by role"
          class="w-48"
          @change="onRoleFilter"
        />
        <UButton
          variant="outline"
          icon="i-heroicons-arrow-path"
          @click="refreshUsers"
        >
          Refresh
        </UButton>
      </div>
    </UCard>

    <!-- Users Table -->
    <UCard>
      <UTable
        :columns="columns"
        :rows="usersStore.users"
        :loading="usersStore.loading"
        :empty-state="{
          icon: 'i-heroicons-users',
          label: 'No users found',
          description: 'Get started by creating a new user.'
        }"
      >
        <!-- User column with avatar and info -->
        <template #user-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :text="row.first_name?.charAt(0) || 'U'"
              :src="row.avatar_url"
              size="sm"
            />
            <div>
              <div class="font-medium">{{ row.first_name }} {{ row.last_name }}</div>
              <div class="text-sm text-gray-500">@{{ row.username }}</div>
            </div>
          </div>
        </template>

        <!-- Role column with badge -->
        <template #role-data="{ row }">
          <UBadge
            :color="getRoleColor(row.role?.name)"
            variant="soft"
          >
            {{ row.role?.name || 'No role' }}
          </UBadge>
        </template>

        <!-- Status column -->
        <template #status-data="{ row }">
          <UBadge
            :color="row.last_login ? 'green' : 'gray'"
            variant="soft"
          >
            {{ row.last_login ? 'Active' : 'Inactive' }}
          </UBadge>
        </template>

        <!-- Actions column -->
        <template #actions-data="{ row }">
          <div class="flex gap-1">
            <UButton
              variant="ghost"
              size="sm"
              icon="i-heroicons-pencil-square"
              @click="editUser(row)"
            />
            <UButton
              variant="ghost"
              size="sm"
              color="error"
              icon="i-heroicons-trash"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <template v-if="usersStore.pagination.last_page > 1" #footer>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Showing {{ usersStore.pagination.from }} to {{ usersStore.pagination.to }}
            of {{ usersStore.pagination.total }} users
          </div>
          <UPagination
            v-model="currentPage"
            :page-count="usersStore.pagination.last_page"
            :total="usersStore.pagination.total"
            @update:model-value="onPageChange"
          />
        </div>
      </template>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Delete</h3>
        </template>

        <p>Are you sure you want to delete <strong>{{ userToDelete?.first_name }} {{ userToDelete?.last_name }}</strong>?</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="showDeleteModal = false">
              Cancel
            </UButton>
            <UButton
              color="error"
              :loading="usersStore.loading"
              @click="deleteUser"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
 
// Page metadata - requires admin role
layout({ use: 'default', middleware: ['auth', 'admin'] })

const usersStore = useUsersStore()

// Table configuration
const columns = [
  { key: 'user', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
]

// Search and filters
const searchQuery = ref('')
const selectedRole = ref(null)
const currentPage = ref(1)

// Modal states
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)

// Role filter options
const roleOptions = [
  { label: 'All Roles', value: null },
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'User', value: 'user' }
]

// Methods
const refreshUsers = async () => {
  await usersStore.fetchUsers({
    page: currentPage.value,
    search: searchQuery.value,
    role: selectedRole.value
  })
}
 

const onRoleFilter = () => {
  currentPage.value = 1
  refreshUsers()
}

const onPageChange = (page: number) => {
  currentPage.value = page
  refreshUsers()
}

const editUser = (user: User) => {
  // Navigate to edit page or open edit modal
  console.log('Edit user:', user)
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  const success = await usersStore.deleteUser(userToDelete.value.id)
  if (success) {
    showDeleteModal.value = false
    userToDelete.value = null
  }
}

const getRoleColor = (roleName?: string) => {
  const colorMap: Record<string, string> = {
    admin: 'red',
    manager: 'blue',
    user: 'green',
  }
  return colorMap[roleName?.toLowerCase() || ''] || 'gray'
}

// Initialize data
onMounted(() => {
  refreshUsers()
})
</script>