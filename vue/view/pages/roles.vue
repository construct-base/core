<script setup lang="ts">
import { useTemplateRef, h, ref, resolveComponent, onMounted } from 'vue'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import { useRouter } from 'vue-router'
import type { Role } from '../types'
import { useRolesStore } from '@/stores/roles'
import RolesAddModal from '@/components/roles/RolesAddModal.vue'
import RolesDeleteModal from '@/components/roles/RolesDeleteModal.vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const router = useRouter()
const table = useTemplateRef('table')
const store = useRolesStore()

// Modal states
const editingRole = ref<Role | null>(null)
const roleToDelete = ref<Role | null>(null)
const addModalKey = ref(0)
const deleteModalKey = ref(0)

// Table state
const columnFilters = ref([{
  id: 'name',
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
function getRowItems(row: Row<Role>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Manage permissions',
      icon: 'i-lucide-key',
      onSelect() {
        router.push(`/roles/${row.original.id}/permissions`)
      }
    },
    {
      label: 'Edit role',
      icon: 'i-lucide-edit',
      onSelect() {
        editRole(row.original)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete role',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        handleDeleteRole(row.original)
      }
    }
  ]
}

// Table columns
const columns: TableColumn<Role>[] = [
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
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Name',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => h('div', { class: 'text-gray-600 text-sm' },
      row.original.description || 'No description'
    )
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => h('div', { class: 'text-sm' },
      `${store.getPermissionCount(row.original)} permissions`
    )
  },
  {
    accessorKey: 'is_system',
    header: 'Type',
    cell: ({ row }) => {
      if (row.original.is_system) {
        return h(UBadge, { color: 'blue', variant: 'subtle' }, () => 'System')
      }
      return h(UBadge, { color: 'gray', variant: 'subtle' }, () => 'Custom')
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ row }) => store.formatDate(row.original.created_at || '')
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

// CRUD operations
const editRole = (role: Role) => {
  editingRole.value = role
  addModalKey.value++ // Force re-render
}

const handleDeleteRole = (role: Role) => {
  roleToDelete.value = role
  deleteModalKey.value++ // Force re-render
}

const handleModalSuccess = () => {
  editingRole.value = null
  roleToDelete.value = null
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

<template>
  <UDashboardPanel id="roles">
    <template #header>
      <UDashboardNavbar title="Roles Management">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <RolesAddModal :key="addModalKey" :role="editingRole" @success="handleModalSuccess" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="(table?.tableApi?.getColumn('name')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter roles..."
          @update:model-value="table?.tableApi?.getColumn('name')?.setFilterValue($event)"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <RolesDeleteModal
            :key="deleteModalKey"
            :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0"
            :role="roleToDelete"
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
          </RolesDeleteModal>

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
        :data="store.roles"
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