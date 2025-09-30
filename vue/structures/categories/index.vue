<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategories } from './composable'
import type { Category } from './types'

const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories()

onMounted(() => {
  fetchCategories()
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'active', label: 'Active' },
  { key: 'created_at', label: 'Created' },
  {
    key: 'actions',
    label: 'Actions'
  }
]

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedItem = ref<Category | null>(null)

const handleEdit = (item: Category) => {
  selectedItem.value = item
  showEditModal.value = true
}

const handleDelete = (item: Category) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (selectedItem.value) {
    try {
      await deleteCategory(selectedItem.value.id)
      showDeleteModal.value = false
      selectedItem.value = null
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Categories">
        <template #right>
          <UButton @click="showAddModal = true" icon="i-lucide-plus">
            Add Category
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :rows="categories"
        :columns="columns"
        :loading="loading"
      >
        <template #active-data="{ row }">
          <UBadge :color="row.active ? 'green' : 'gray'">
            {{ row.active ? 'Yes' : 'No' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              size="xs"
              color="primary"
              variant="ghost"
              icon="i-lucide-pencil"
              @click="handleEdit(row)"
            />
            <UButton
              size="xs"
              color="red"
              variant="ghost"
              icon="i-lucide-trash"
              @click="handleDelete(row)"
            />
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>

  <!-- Add Modal -->
  <UModal v-model="showAddModal" title="Add Category">
    <div class="p-4">
      <p class="text-sm text-gray-500">Form implementation needed</p>
    </div>
  </UModal>

  <!-- Edit Modal -->
  <UModal v-model="showEditModal" title="Edit Category">
    <div class="p-4">
      <p class="text-sm text-gray-500">Form implementation needed</p>
    </div>
  </UModal>

  <!-- Delete Modal -->
  <UModal v-model="showDeleteModal" title="Delete Category">
    <div class="p-4 space-y-4">
      <p class="text-sm">
        Are you sure you want to delete this category? This action cannot be undone.
      </p>
      <div class="flex justify-end gap-2">
        <UButton
          color="gray"
          variant="ghost"
          @click="showDeleteModal = false"
        >
          Cancel
        </UButton>
        <UButton
          color="red"
          @click="confirmDelete"
          :loading="loading"
        >
          Delete
        </UButton>
      </div>
    </div>
  </UModal>
</template>