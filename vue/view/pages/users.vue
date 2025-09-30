<script setup lang="ts">
import { useTemplateRef, h, ref, watch, resolveComponent, onMounted } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { User } from '../types'
import { useUsersStore } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'
import UsersAddModal from '@/components/users/UsersAddModal.vue'
import UsersDeleteModal from '@/components/users/UsersDeleteModal.vue'

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')
const store = useUsersStore()
const rolesStore = useRolesStore()

// Modal states
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const addModalKey = ref(0)
const deleteModalKey = ref(0)

// Table state
const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

// Pagination
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

// Get row action items
function getRowItems(row: Row<User>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Edit user',
      icon: 'i-lucide-edit',
      onSelect() {
        editUser(row.original)
      }
    },
    {
      label: 'View details',
      icon: 'i-lucide-eye'
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete user',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        handleDeleteUser(row.original)
      }
    }
  ]
}

// Table columns
const columns: TableColumn<User>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, {
          src: row.original.avatar_url,
          alt: `${row.original.first_name} ${row.original.last_name}`,
          size: 'lg'
        }),
        h('div', undefined, [
          h('p', { class: 'font-medium text-highlighted' }, `${row.original.first_name} ${row.original.last_name}`),
          h('p', { class: '' }, `@${row.original.username}`)
        ])
      ])
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Email',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    filterFn: 'equals',
    cell: ({ row }) => {
      const roleName = row.original.role_name || row.original.role?.name || 'No Role'
      const color = store.getRoleColor(roleName)

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => roleName)
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => store.formatDate(row.original.created_at)
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

// Role filter
const roleFilter = ref('all')

watch(() => roleFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const roleColumn = table.value.tableApi.getColumn('role')
  if (!roleColumn) return

  if (newVal === 'all') {
    roleColumn.setFilterValue(undefined)
  } else {
    roleColumn.setFilterValue(newVal)
  }
})

// CRUD operations
const editUser = (user: User) => {
  editingUser.value = user
  addModalKey.value++ // Force re-render
}

const handleDeleteUser = (user: User) => {
  userToDelete.value = user
  deleteModalKey.value++ // Force re-render
}

const handleModalSuccess = () => {
  editingUser.value = null
  userToDelete.value = null
}

const handleBulkDelete = () => {
  const selectedCount = table?.value?.tableApi?.getFilteredSelectedRowModel().rows.length || 0
  if (selectedCount > 0) {
    deleteModalKey.value++
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      store.fetchUsers(),
      rolesStore.fetchRoles()
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Users Management">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UsersAddModal :key="addModalKey" :user="editingUser" @success="handleModalSuccess" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('email')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter emails..."
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <UsersDeleteModal
            :key="deleteModalKey"
            :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0"
            :user="userToDelete"
            @success="handleModalSuccess"
          >
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </UsersDeleteModal>

          <USelect
            v-model="roleFilter"
            :items="[
              { label: 'All', value: 'all' },
              ...rolesStore.roleOptions.map(r => ({ label: r.label, value: r.label }))
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter role"
            class="min-w-28"
          />

          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="store.users"
        :columns="columns"
        :loading="store.loading"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>