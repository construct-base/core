<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar>
        <template #left>
          <!-- Breadcrumb Navigation -->
          <UBreadcrumb :items="breadcrumbItems" />
        </template>

        <template #right>
          <!-- View Mode Toggle -->
          <div class="flex items-center space-x-2">
            <div class="flex">
              <UButton
                :variant="viewMode.type === 'grid' ? 'solid' : 'ghost'"
                icon="i-lucide-grid"
                @click="setViewMode('grid')"
                class="rounded-r-none"
                size="sm"
              />
              <UButton
                :variant="viewMode.type === 'list' ? 'solid' : 'ghost'"
                icon="i-lucide-list"
                @click="setViewMode('list')"
                class="rounded-l-none border-l-0"
                size="sm"
              />
            </div>

            <!-- Upload Button -->
            <UButton
              icon="i-lucide-upload"
              label="Upload"
              @click="showUploadModal = true"
            />

            <!-- New Folder Button -->
            <UButton
              icon="i-lucide-folder-plus"
              variant="outline"
              label="New Folder"
              @click="showCreateFolderModal = true"
            />

            <!-- Share Button (when items selected) -->
            <UButton
              v-if="hasSelection"
              icon="i-lucide-share"
              color="primary"
              variant="outline"
              :label="`Share (${selectedItems.length})`"
              @click="showShareModal = true"
            />

            <!-- Delete Button (when items selected) -->
            <UButton
              v-if="hasSelection"
              icon="i-lucide-trash"
              color="red"
              variant="outline"
              :label="`Delete (${selectedItems.length})`"
              @click="confirmDelete"
            />
          </div>
        </template>
      </UDashboardNavbar>

      <!-- Search Bar -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search files and folders..."
          class="w-full max-w-sm"
          @input="handleSearch"
        />
      </div>

      <!-- Upload Progress -->
      <div v-if="uploadProgress.length > 0" class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="space-y-2">
          <div v-for="(upload, index) in uploadProgress" :key="index" class="flex items-center space-x-3">
            <UIcon :name="getFileIcon(upload.file.type, 'file')" :class="getFileColor(upload.file.type, 'file')" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ upload.file.name }}
              </p>
              <UProgress
                :value="upload.progress"
                :color="upload.status === 'error' ? 'red' : upload.status === 'success' ? 'green' : 'primary'"
                class="w-full mt-1"
              />
            </div>
            <div class="text-sm text-gray-500">
              {{ upload.progress }}%
            </div>
            <UBadge
              :color="upload.status === 'error' ? 'red' : upload.status === 'success' ? 'green' : 'yellow'"
              :label="upload.status"
            />
          </div>
        </div>
      </div>

      <!-- Media Grid/List -->
      <div class="p-4">
        <!-- Grid View -->
        <div
          v-if="viewMode.type === 'grid'"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="group relative cursor-pointer"
            @click="handleItemClick(item)"
            @contextmenu.prevent="showContextMenu($event, item)"
          >
            <!-- Selection Checkbox -->
            <div class="absolute top-2 left-2 z-10">
              <UCheckbox
                :model-value="isSelected(item.id)"
                @update:model-value="toggleSelection(item.id)"
                @click.stop
              />
            </div>

            <!-- Share Indicator -->
            <div v-if="item.is_shared" class="absolute top-2 right-2 z-10">
              <UIcon name="i-lucide-share" class="w-4 h-4 text-blue-500" />
            </div>

            <!-- Item Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200 p-4">
              <!-- Thumbnail/Icon -->
              <div class="flex justify-center mb-3">
                <div v-if="item.file?.thumbnail_url" class="w-16 h-16">
                  <img
                    :src="item.file.thumbnail_url"
                    :alt="item.name"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
                <UIcon
                  v-else
                  :name="getFileIcon(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type)"
                  :class="[getFileColor(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type), 'w-16 h-16']"
                />
              </div>

              <!-- Name -->
              <p class="text-sm font-medium text-gray-900 dark:text-white text-center truncate" :title="item.name">
                {{ item.name }}
              </p>

              <!-- Type & Size Info -->
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                <span v-if="item.type === 'folder'">
                  {{ item.child_count || 0 }} items
                </span>
                <span v-else>
                  {{ item.file ? formatFileSize(item.file.size) : formatFileSize(item.size || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-1">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="group flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
            @click="handleItemClick(item)"
            @contextmenu.prevent="showContextMenu($event, item)"
          >
            <!-- Selection Checkbox -->
            <UCheckbox
              :model-value="isSelected(item.id)"
              @update:model-value="toggleSelection(item.id)"
              @click.stop
              class="mr-3"
            />

            <!-- Icon -->
            <UIcon
              :name="getFileIcon(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type)"
              :class="[getFileColor(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type), 'w-5 h-5 mr-3']"
            />

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ item.name }}
              </p>
            </div>

            <!-- Type -->
            <div class="w-20 text-sm text-gray-500 dark:text-gray-400 text-center">
              {{ item.type === 'folder' ? 'Folder' : (item.mime_type || item.file?.content_type || 'Unknown').split('/')[0] }}
            </div>

            <!-- Size -->
            <div class="w-24 text-sm text-gray-500 dark:text-gray-400 text-right">
              {{ item.type === 'folder' ? `${item.child_count || 0} items` : formatFileSize(item.file?.size || item.size || 0) }}
            </div>

            <!-- Modified Date -->
            <div class="w-32 text-sm text-gray-500 dark:text-gray-400 text-right">
              {{ formatDate(item.updated_at) }}
            </div>

            <!-- Share Indicator -->
            <div class="w-8 flex justify-center">
              <UIcon v-if="item.is_shared" name="i-lucide-share" class="w-4 h-4 text-blue-500" />
            </div>

            <!-- Actions -->
            <div class="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton
                icon="i-lucide-more-horizontal"
                variant="ghost"
                size="sm"
                @click.stop="showContextMenu($event, item)"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && filteredItems.length === 0"
          class="text-center py-12"
        >
          <UIcon name="i-lucide-folder-open" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ searchQuery ? 'No files found' : 'This folder is empty' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'Upload files or create a new folder to get started' }}
          </p>
          <div class="space-x-3">
            <UButton
              v-if="!searchQuery"
              icon="i-lucide-upload"
              label="Upload Files"
              @click="showUploadModal = true"
            />
            <UButton
              v-if="!searchQuery"
              icon="i-lucide-folder-plus"
              variant="outline"
              label="New Folder"
              @click="showCreateFolderModal = true"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-gray-400" />
      </div>
    </UDashboardPanel>

    <!-- Upload Modal -->
    <UModal
      v-model:open="showUploadModal"
      title="Upload Files"
      description="Select and upload files to the current folder"
    >
      <UButton label="Upload" icon="i-lucide-upload" />

      <template #body>
        <div class="space-y-4">
          <!-- File Upload Component -->
          <UFileUpload
            v-model="selectedFiles"
            multiple
            class="w-full min-h-48"
            accept="*/*"
            :dropzone="true"
          />
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton
            variant="outline"
            label="Cancel"
            @click="close"
          />
          <UButton
            :disabled="selectedFiles.length === 0 || isUploading"
            :loading="isUploading"
            label="Upload"
            @click="handleUpload"
          />
        </div>
      </template>
    </UModal>

    <!-- Create Folder Modal -->
    <UModal
      v-model:open="showCreateFolderModal"
      title="Create New Folder"
      description="Create a new folder in the current location"
    >
      <UButton label="New Folder" icon="i-lucide-folder-plus" />

      <template #body>
        <UForm :state="createFolderForm" @submit="handleCreateFolder">
          <div class="space-y-4">
            <UFormField label="Folder Name" required>
              <UInput
                v-model="createFolderForm.name"
                placeholder="Enter folder name"
                autofocus
              />
            </UFormField>

            <UFormField label="Description">
              <UTextarea
                v-model="createFolderForm.description"
                placeholder="Optional description"
                :rows="3"
              />
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton
            variant="outline"
            label="Cancel"
            @click="close"
          />
          <UButton
            :loading="loading"
            label="Create Folder"
            @click="handleCreateFolder"
          />
        </div>
      </template>
    </UModal>

    <!-- Share Modal -->
    <UModal
      v-model:open="showShareModal"
      title="Share Items"
      description="Grant access to selected files and folders"
    >
      <UButton label="Share" icon="i-lucide-share" />

      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Share {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} with users or roles
          </p>

          <UFormField label="Users">
            <USelectMenu
              v-model="shareForm.userIds"
              multiple
              :options="userOptions"
              placeholder="Select users"
            />
          </UFormField>

          <UFormField label="Roles">
            <USelectMenu
              v-model="shareForm.roleIds"
              multiple
              :options="roleOptions"
              placeholder="Select roles"
            />
          </UFormField>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end space-x-3">
          <UButton
            variant="outline"
            label="Cancel"
            @click="close"
          />
          <UButton
            :loading="loading"
            label="Share"
            @click="handleShare"
          />
        </div>
      </template>
    </UModal>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.show"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
    >
      <button
        v-if="contextMenu.item?.type === 'folder'"
        @click="handleItemClick(contextMenu.item)"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
      >
        <UIcon name="i-lucide-folder-open" class="w-4 h-4" />
        <span>Open</span>
      </button>

      <button
        v-if="contextMenu.item && contextMenu.item.type === 'file' && canPreview(contextMenu.item.mime_type || contextMenu.item.file?.content_type || '')"
        @click="previewItem(contextMenu.item)"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
      >
        <UIcon name="i-lucide-eye" class="w-4 h-4" />
        <span>Preview</span>
      </button>

      <button
        v-if="contextMenu.item?.file?.url"
        @click="downloadItem(contextMenu.item)"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
      >
        <UIcon name="i-lucide-download" class="w-4 h-4" />
        <span>Download</span>
      </button>

      <button
        @click="shareItem(contextMenu.item)"
        class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
      >
        <UIcon name="i-lucide-share" class="w-4 h-4" />
        <span>Share</span>
      </button>

      <hr class="my-1 border-gray-200 dark:border-gray-600">

      <button
        @click="deleteItem(contextMenu.item)"
        class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
      >
        <UIcon name="i-lucide-trash" class="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>

    <!-- Click outside to close context menu -->
    <div
      v-if="contextMenu.show"
      @click="contextMenu.show = false"
      class="fixed inset-0 z-40"
    />
  </UDashboardPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast, useHead } from '#imports'
import { useMedia } from '@/composables/useMedia'
import { useUsers } from '@/composables/useUsers'
import { useRoles } from '@/composables/useRoles'
import type { MediaListItem, MediaItem } from '@/types/media'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// Composables
const {
  loading,
  uploadProgress,
  currentFolder,
  breadcrumbs,
  viewMode,
  selectedItems,
  isUploading,
  hasSelection,
  fetchMedia,
  createFolder,
  getFolderContents,
  uploadMultipleFiles,
  deleteMedia,
  shareItems,
  navigateToFolder,
  toggleSelection,
  clearSelection,
  isSelected,
  setViewMode,
  formatFileSize,
  getFileIcon,
  getFileColor,
  canPreview,
  formatDate
} = useMedia()

const { fetchUsers } = useUsers()
const { fetchRoles } = useRoles()

// State
const items = ref<MediaListItem[]>([])
const searchQuery = ref('')
const showUploadModal = ref(false)
const showCreateFolderModal = ref(false)
const showShareModal = ref(false)
const selectedFiles = ref<File[]>([])

// Context menu
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  item: null as MediaListItem | null
})

// Forms
const createFolderForm = ref({
  name: '',
  description: ''
})

const shareForm = ref({
  userIds: [] as number[],
  roleIds: [] as number[]
})

// Options for sharing
const userOptions = ref<Array<{ label: string; value: number }>>([])
const roleOptions = ref<Array<{ label: string; value: number }>>([])

// Computed
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value

  const query = searchQuery.value.toLowerCase()
  return items.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
})

const breadcrumbItems = computed(() => {
  return breadcrumbs.value.map(crumb => ({
    label: crumb.name,
    icon: crumb.name === 'Home' ? 'i-lucide-home' : 'i-lucide-folder',
    click: () => navigateToFolder(crumb.id)
  }))
})

// Methods
const loadItems = async (folderId?: number) => {
  try {
    loading.value = true
    const response = await getFolderContents(folderId)
    items.value = response.data || []
  } catch (error) {
    toast.add({
      title: 'Error loading items',
      description: error instanceof Error ? error.message : 'Failed to load items',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

const handleItemClick = async (item: MediaListItem) => {
  if (item.type === 'folder') {
    await navigateToFolder(item.id)
    await loadItems(item.id)
    router.push(`/media/${item.id}`)
  } else {
    // Handle file click - could open preview or download
    if (canPreview(item.mime_type || item.file?.content_type || '')) {
      previewItem(item)
    } else if (item.file?.url) {
      downloadItem(item)
    }
  }
}

const handleSearch = () => {
  // Implement search if needed - currently using client-side filtering
}


const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    await uploadMultipleFiles(selectedFiles.value, currentFolder.value?.id)

    toast.add({
      title: 'Upload complete',
      description: `${selectedFiles.value.length} file(s) uploaded successfully`,
      color: 'green'
    })

    showUploadModal.value = false
    selectedFiles.value = []
    await loadItems(currentFolder.value?.id)
  } catch (error) {
    toast.add({
      title: 'Upload failed',
      description: error instanceof Error ? error.message : 'Failed to upload files',
      color: 'red'
    })
  }
}

const handleCreateFolder = async () => {
  if (!createFolderForm.value.name) return

  try {
    await createFolder(
      createFolderForm.value.name,
      createFolderForm.value.description,
      currentFolder.value?.id
    )

    toast.add({
      title: 'Folder created',
      description: `Folder "${createFolderForm.value.name}" created successfully`,
      color: 'green'
    })

    showCreateFolderModal.value = false
    createFolderForm.value = { name: '', description: '' }
    await loadItems(currentFolder.value?.id)
  } catch (error) {
    toast.add({
      title: 'Failed to create folder',
      description: error instanceof Error ? error.message : 'Failed to create folder',
      color: 'red'
    })
  }
}

const handleShare = async () => {
  if (shareForm.value.userIds.length === 0 && shareForm.value.roleIds.length === 0) {
    toast.add({
      title: 'No recipients selected',
      description: 'Please select at least one user or role to share with',
      color: 'orange'
    })
    return
  }

  try {
    await shareItems(
      selectedItems.value,
      shareForm.value.userIds.length > 0 ? shareForm.value.userIds : undefined,
      shareForm.value.roleIds.length > 0 ? shareForm.value.roleIds : undefined
    )

    toast.add({
      title: 'Items shared',
      description: `${selectedItems.value.length} item(s) shared successfully`,
      color: 'green'
    })

    showShareModal.value = false
    shareForm.value = { userIds: [], roleIds: [] }
    clearSelection()
    await loadItems(currentFolder.value?.id)
  } catch (error) {
    toast.add({
      title: 'Failed to share items',
      description: error instanceof Error ? error.message : 'Failed to share items',
      color: 'red'
    })
  }
}

const confirmDelete = () => {
  if (confirm(`Are you sure you want to delete ${selectedItems.value.length} item(s)?`)) {
    handleDelete()
  }
}

const handleDelete = async () => {
  try {
    await Promise.all(selectedItems.value.map(id => deleteMedia(id)))

    toast.add({
      title: 'Items deleted',
      description: `${selectedItems.value.length} item(s) deleted successfully`,
      color: 'green'
    })

    clearSelection()
    await loadItems(currentFolder.value?.id)
  } catch (error) {
    toast.add({
      title: 'Failed to delete items',
      description: error instanceof Error ? error.message : 'Failed to delete items',
      color: 'red'
    })
  }
}

const showContextMenu = (event: MouseEvent, item: MediaListItem) => {
  event.preventDefault()
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    item
  }
}

const shareItem = (item: MediaListItem | null) => {
  if (!item) return
  selectedItems.value = [item.id]
  showShareModal.value = true
  contextMenu.value.show = false
}

const deleteItem = async (item: MediaListItem | null) => {
  if (!item) return

  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    try {
      await deleteMedia(item.id)
      toast.add({
        title: 'Item deleted',
        description: `"${item.name}" deleted successfully`,
        color: 'green'
      })
      await loadItems(currentFolder.value?.id)
    } catch (error) {
      toast.add({
        title: 'Failed to delete item',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        color: 'red'
      })
    }
  }
  contextMenu.value.show = false
}

const previewItem = (item: MediaListItem | null) => {
  if (!item || !item.file?.url) return

  // Open preview in new window/tab
  window.open(item.file.url, '_blank')
  contextMenu.value.show = false
}

const downloadItem = (item: MediaListItem | null) => {
  if (!item || !item.file?.url) return

  // Create download link
  const link = document.createElement('a')
  link.href = item.file.url
  link.download = item.file.original_filename || item.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  contextMenu.value.show = false
}

const loadShareOptions = async () => {
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      fetchUsers(),
      fetchRoles()
    ])

    userOptions.value = usersResponse.data.map(user => ({
      label: user.email,
      value: user.id
    }))

    roleOptions.value = rolesResponse.roles.map(role => ({
      label: role.name,
      value: role.id
    }))
  } catch (error) {
    console.error('Failed to load share options:', error)
  }
}

// Handle route changes
const handleRouteChange = async () => {
  const folderId = route.params.id ? parseInt(route.params.id as string) : undefined

  if (folderId) {
    await navigateToFolder(folderId)
    await loadItems(folderId)
  } else {
    await navigateToFolder()
    await loadItems()
  }
}

// Initialize
onMounted(async () => {
  await handleRouteChange()
  await loadShareOptions()
})

// Watch for route changes
watch(() => route.params.id, handleRouteChange)

// Page title
useHead({
  title: computed(() => {
    if (currentFolder.value) {
      return `${currentFolder.value.name} - Media`
    }
    return 'Media'
  })
})
</script>