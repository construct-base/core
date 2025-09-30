<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePosts } from './composable'
import type { Post } from './types'

const { posts, loading, fetchPosts, createPost, updatePost, deletePost } = usePosts()

onMounted(() => {
  fetchPosts()
})

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'content', label: 'Content' },
  { key: 'published', label: 'Published' },
  { key: 'category_id', label: 'Category' },
  { key: 'created_at', label: 'Created' },
  {
    key: 'actions',
    label: 'Actions'
  }
]

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedItem = ref<Post | null>(null)

const handleEdit = (item: Post) => {
  selectedItem.value = item
  showEditModal.value = true
}

const handleDelete = (item: Post) => {
  selectedItem.value = item
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (selectedItem.value) {
    try {
      await deletePost(selectedItem.value.id)
      showDeleteModal.value = false
      selectedItem.value = null
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Posts">
        <template #right>
          <UButton @click="showAddModal = true" icon="i-lucide-plus">
            Add Post
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :rows="posts"
        :columns="columns"
        :loading="loading"
      >
        <template #published-data="{ row }">
          <UBadge :color="row.published ? 'green' : 'gray'">
            {{ row.published ? 'Published' : 'Draft' }}
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
  <UModal v-model="showAddModal" title="Add Post">
    <div class="p-4">
      <p class="text-sm text-gray-500">Form implementation needed</p>
    </div>
  </UModal>

  <!-- Edit Modal -->
  <UModal v-model="showEditModal" title="Edit Post">
    <div class="p-4">
      <p class="text-sm text-gray-500">Form implementation needed</p>
    </div>
  </UModal>

  <!-- Delete Modal -->
  <UModal v-model="showDeleteModal" title="Delete Post">
    <div class="p-4 space-y-4">
      <p class="text-sm">
        Are you sure you want to delete this post? This action cannot be undone.
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