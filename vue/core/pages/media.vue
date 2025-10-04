<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Media Management">
        <template #trailing>
          <div class="flex items-center gap-2">
            <!-- View Toggle -->
            <UFieldGroup size="sm" orientation="horizontal">
              <UButton :variant="store.viewMode.type === 'grid' ? 'solid' : 'ghost'" icon="i-lucide-grid"
                @click="store.setViewMode('grid')" />
              <UButton :variant="store.viewMode.type === 'list' ? 'solid' : 'ghost'" icon="i-lucide-list"
                @click="store.setViewMode('list')" />
            </UFieldGroup>

            <!-- New Folder Button -->
            <UButton variant="outline" icon="i-lucide-folder-plus" @click="showCreateFolderModal = true">
              New Folder
            </UButton>

            <!-- Upload Button -->
            <UButton color="primary" icon="i-lucide-upload" @click="showUploadModal = true">
              Upload
            </UButton>

            <!-- Share Button (when items selected) -->
            <UButton v-if="store.hasSelection" color="info" variant="outline" icon="i-lucide-share"
              @click="showShareModal = true">
              Share ({{ store.selectedItems.length }})
            </UButton>

            <!-- Delete Button (when items selected) -->
            <UButton v-if="store.hasSelection" color="error" variant="outline" icon="i-lucide-trash"
              @click="handleBulkDelete">
              Delete ({{ store.selectedItems.length }})
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <!-- Breadcrumb Navigation -->
        <UBreadcrumb :items="store.breadcrumbItems" />

        <!-- Search Bar -->
        <div class="flex items-center gap-4">
          <UInput v-model="store.searchQuery" placeholder="Search media files..." icon="i-lucide-search" class="flex-1" />
        </div>

        <!-- Upload Progress -->
        <div v-if="store.uploadProgress.length > 0" class="space-y-2">
          <h4 class="font-medium text-gray-900 dark:text-white">Uploading...</h4>
          <div v-for="(upload, index) in store.uploadProgress" :key="index" class="flex items-center space-x-3">
            <UIcon :name="store.getFileIcon(upload.file.type, 'file')" :class="store.getFileColor(upload.file.type, 'file')" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ upload.file.name }}
              </p>
              <UProgress
                :value="upload.progress"
                :color="upload.status === 'error' ? 'error' : upload.status === 'success' ? 'success' : 'primary'"
                class="w-full mt-1"
              />
            </div>
            <div class="text-sm text-gray-500">{{ upload.progress }}%</div>
            <UBadge
              :color="upload.status === 'error' ? 'error' : upload.status === 'success' ? 'success' : 'warning'"
              :label="upload.status"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.loading" class="p-8 text-center">
          <UIcon name="i-lucide-loader-2" class="animate-spin h-6 w-6 mx-auto mb-2 text-gray-500 dark:text-gray-400" />
          <p class="text-gray-500 dark:text-gray-400">Loading media...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="store.error" class="p-8 text-center">
          <UIcon name="i-lucide-alert-circle" class="h-6 w-6 mx-auto mb-2 text-red-500 dark:text-red-400" />
          <p class="text-red-500 dark:text-red-400 mb-4">{{ store.error }}</p>
          <UButton @click="() => loadItems()" variant="outline">Try Again</UButton>
        </div>

        <!-- Grid View -->
        <div v-else-if="store.viewMode.type === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div v-for="item in store.filteredItems" :key="item.id" class="group relative cursor-pointer"
            @click="handleItemClick(item)" @contextmenu.prevent="showContextMenu($event, item)">

            <!-- Selection Checkbox -->
            <div class="absolute top-2 left-2 z-10">
              <UCheckbox :model-value="store.isSelected(item.id)" @update:model-value="store.toggleSelection(item.id)"
                @click.stop />
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
                  <img :src="item.file.thumbnail_url" :alt="item.name" class="w-full h-full object-cover rounded" />
                </div>
                <UIcon v-else :name="store.getFileIcon(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type)"
                  :class="[store.getFileColor(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type), 'w-16 h-16']" />
              </div>

              <!-- Name -->
              <p class="text-sm font-medium text-gray-900 dark:text-white text-center truncate" :title="item.name">
                {{ item.name }}
              </p>

              <!-- Type & Size Info -->
              <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                <span v-if="item.type === 'folder'">{{ item.child_count || 0 }} items</span>
                <span v-else>{{ store.formatFileSize(item.file?.size || item.size || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-1">
          <div v-for="item in store.filteredItems" :key="item.id"
            class="group flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
            @click="handleItemClick(item)" @contextmenu.prevent="showContextMenu($event, item)">

            <!-- Selection Checkbox -->
            <UCheckbox :model-value="store.isSelected(item.id)" @update:model-value="store.toggleSelection(item.id)"
              @click.stop class="mr-3" />

            <!-- Icon -->
            <UIcon :name="store.getFileIcon(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type)"
              :class="[store.getFileColor(item.mime_type || item.file?.content_type || 'application/octet-stream', item.type), 'w-5 h-5 mr-3']" />

            <!-- Name -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.name }}</p>
            </div>

            <!-- Type -->
            <div class="w-20 text-sm text-gray-500 dark:text-gray-400 text-center">
              {{ item.type === 'folder' ? 'Folder' : (item.mime_type || item.file?.content_type || 'Unknown').split('/')[0] }}
            </div>

            <!-- Size -->
            <div class="w-24 text-sm text-gray-500 dark:text-gray-400 text-right">
              {{ item.type === 'folder' ? `${item.child_count || 0} items` : store.formatFileSize(item.file?.size || item.size || 0) }}
            </div>

            <!-- Modified Date -->
            <div class="w-32 text-sm text-gray-500 dark:text-gray-400 text-right">
              {{ store.formatDate(item.updated_at) }}
            </div>

            <!-- Share Indicator -->
            <div class="w-8 flex justify-center">
              <UIcon v-if="item.is_shared" name="i-lucide-share" class="w-4 h-4 text-blue-500" />
            </div>

            <!-- Actions -->
            <div class="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UButton icon="i-lucide-more-horizontal" variant="ghost" size="sm" @click.stop="showContextMenu($event, item)" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!store.loading && store.filteredItems.length === 0" class="text-center py-12">
          <UIcon name="i-lucide-folder-open" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ store.searchQuery ? 'No files found' : 'This folder is empty' }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ store.searchQuery ? 'Try adjusting your search terms' : 'Upload files or create a new folder to get started' }}
          </p>
          <div class="space-x-3">
            <UButton v-if="!store.searchQuery" icon="i-lucide-upload" label="Upload Files" @click="showUploadModal = true" />
            <UButton v-if="!store.searchQuery" icon="i-lucide-folder-plus" variant="outline" label="New Folder"
              @click="showCreateFolderModal = true" />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Upload Modal -->
  <UModal v-model:open="showUploadModal" title="Upload Files">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Select files to upload to {{ store.currentFolder?.name || 'the root folder' }}
        </p>

        <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <UIcon name="i-lucide-upload" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drop files here or click to browse
          </p>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="*/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <UButton variant="outline" @click="() => fileInput?.click()">
            Choose Files
          </UButton>
        </div>

        <!-- Selected Files List -->
        <div v-if="selectedFiles.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Selected Files ({{ selectedFiles.length }})
          </h4>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
            >
              <span class="truncate">{{ file.name }}</span>
              <UButton
                size="xs"
                variant="ghost"
                icon="i-lucide-x"
                @click="removeFile(index)"
              />
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="store.uploadProgress.length > 0" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Upload Progress
          </h4>
          <div class="space-y-1">
            <div
              v-for="progress in store.uploadProgress"
              :key="progress.file.name"
              class="space-y-1"
            >
              <div class="flex justify-between text-xs">
                <span class="truncate">{{ progress.file.name }}</span>
                <span>{{ progress.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div
                  class="h-1 rounded-full transition-all duration-300"
                  :class="{
                    'bg-blue-500': progress.status === 'uploading',
                    'bg-success-500': progress.status === 'success',
                    'bg-error-500': progress.status === 'error'
                  }"
                  :style="{ width: progress.progress + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end space-x-3">
        <UButton variant="outline" @click="close">
          Cancel
        </UButton>
        <UButton
          :disabled="selectedFiles.length === 0 || store.isUploading"
          :loading="store.isUploading"
          @click="handleUpload"
        >
          Upload {{ selectedFiles.length > 0 ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}` : '' }}
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Create Folder Modal -->
  <UModal v-model:open="showCreateFolderModal" title="Create New Folder">
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Create a new folder in {{ store.currentFolder?.name || 'the root folder' }}
        </p>

        <form @submit.prevent="handleCreateFolder" class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Folder Name *
            </label>
            <UInput
              v-model="createFolderForm.name"
              placeholder="Enter folder name"
              required
              autofocus
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <UTextarea
              v-model="createFolderForm.description"
              placeholder="Optional description"
              :rows="3"
              class="w-full"
            />
          </div>
        </form>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end space-x-3">
        <UButton variant="outline" @click="close">
          Cancel
        </UButton>
        <UButton
          :disabled="!createFolderForm.name.trim()"
          :loading="store.loading"
          @click="handleCreateFolder"
        >
          Create Folder
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Share Modal -->
  <UModal v-model:open="showShareModal" title="Share Items">
    <template #body>
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-share" class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-gray-900 dark:text-gray-100 font-medium">
              Share {{ store.selectedItems.length }} item{{ store.selectedItems.length > 1 ? 's' : '' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Grant access to selected files and folders with users or roles
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Users
            </label>
            <USelect
              v-model="shareForm.userIds"
              multiple
              :options="userOptions"
              placeholder="Select users to share with"
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Roles
            </label>
            <USelect
              v-model="shareForm.roleIds"
              multiple
              :options="roleOptions"
              placeholder="Select roles to share with"
              class="w-full"
            />
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p class="text-xs text-blue-800 dark:text-blue-200">
              <UIcon name="i-lucide-info" class="w-3 h-3 inline mr-1" />
              Selected users and roles will get read access to the shared items
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-end space-x-3">
        <UButton variant="outline" @click="close">
          Cancel
        </UButton>
        <UButton
          :disabled="shareForm.userIds.length === 0 && shareForm.roleIds.length === 0"
          :loading="store.loading"
          @click="handleShare"
        >
          Share Items
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Context Menu -->
  <div v-if="contextMenu.show" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    class="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">

    <button v-if="contextMenu.item?.type === 'folder'" @click="handleItemClick(contextMenu.item)"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
      <UIcon name="i-lucide-folder-open" class="w-4 h-4" />
      <span>Open</span>
    </button>

    <button v-if="contextMenu.item && contextMenu.item.type === 'file' && store.canPreview(contextMenu.item.mime_type || contextMenu.item.file?.content_type || '')"
      @click="previewItem(contextMenu.item)"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
      <UIcon name="i-lucide-eye" class="w-4 h-4" />
      <span>Preview</span>
    </button>

    <button v-if="contextMenu.item?.file?.url" @click="downloadItem(contextMenu.item)"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
      <UIcon name="i-lucide-download" class="w-4 h-4" />
      <span>Download</span>
    </button>

    <button @click="shareItem(contextMenu.item)"
      class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
      <UIcon name="i-lucide-share" class="w-4 h-4" />
      <span>Share</span>
    </button>

    <hr class="my-1 border-gray-200 dark:border-gray-600">

    <button @click="deleteItem(contextMenu.item)"
      class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2">
      <UIcon name="i-lucide-trash" class="w-4 h-4" />
      <span>Delete</span>
    </button>
  </div>

  <!-- Click outside to close context menu -->
  <div v-if="contextMenu.show" @click="contextMenu.show = false" class="fixed inset-0 z-40" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaStore } from '@/stores/media'
import { useUsers } from '@/composables/useUsers'
import { useRoles } from '@/composables/useRoles'
import type { MediaListItem } from '@/types/media'

const route = useRoute()
const router = useRouter()
const store = useMediaStore()

// Simple toast implementation (replace with your preferred toast library)
const toast = {
  add: (options: { title: string; description: string; color: string }) => {
    console.log(`${options.color.toUpperCase()}: ${options.title} - ${options.description}`)
    // You can replace this with a proper toast library like vue-toastification
  }
}

// Composables for sharing
const { fetchUsers } = useUsers()
const { fetchRoles } = useRoles()

// State
const showUploadModal = ref(false)
const showCreateFolderModal = ref(false)
const showShareModal = ref(false)
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

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

// Methods
const loadItems = async (folderId?: number) => {
  if (folderId) {
    await store.getFolderContents(folderId)
  } else {
    await store.fetchMedia()
  }
}

const handleItemClick = async (item: MediaListItem) => {
  if (item.type === 'folder') {
    await store.navigateToFolder(item.id)
    router.push(`/media/${item.id}`)
  } else {
    // Handle file click - preview or download
    if (store.canPreview(item.file?.content_type || '')) {
      previewItem(item)
    } else if (item.file?.url) {
      downloadItem(item)
    }
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    await store.uploadMultipleFiles(selectedFiles.value, store.currentFolder?.id)

    toast.add({
      title: 'Upload complete',
      description: `${selectedFiles.value.length} file(s) uploaded successfully`,
      color: 'success'
    })

    showUploadModal.value = false
    selectedFiles.value = []
  } catch (error) {
    toast.add({
      title: 'Upload failed',
      description: error instanceof Error ? error.message : 'Failed to upload files',
      color: 'error'
    })
  }
}

const handleCreateFolder = async () => {
  if (!createFolderForm.value.name) return

  try {
    const newFolder = await store.createFolder(
      createFolderForm.value.name,
      createFolderForm.value.description,
      store.currentFolder?.id
    )

    console.log('Created folder:', newFolder)
    console.log('Current items:', store.items)

    toast.add({
      title: 'Folder created',
      description: `Folder "${createFolderForm.value.name}" created successfully`,
      color: 'success'
    })

    showCreateFolderModal.value = false
    createFolderForm.value = { name: '', description: '' }
  } catch (error) {
    toast.add({
      title: 'Failed to create folder',
      description: error instanceof Error ? error.message : 'Failed to create folder',
      color: 'error'
    })
  }
}

const handleShare = async () => {
  if (shareForm.value.userIds.length === 0 && shareForm.value.roleIds.length === 0) {
    toast.add({
      title: 'No recipients selected',
      description: 'Please select at least one user or role to share with',
      color: 'warning'
    })
    return
  }

  try {
    await store.shareItems(
      store.selectedItems,
      shareForm.value.userIds.length > 0 ? shareForm.value.userIds : undefined,
      shareForm.value.roleIds.length > 0 ? shareForm.value.roleIds : undefined
    )

    toast.add({
      title: 'Items shared',
      description: `${store.selectedItems.length} item(s) shared successfully`,
      color: 'success'
    })

    showShareModal.value = false
    shareForm.value = { userIds: [], roleIds: [] }
    store.clearSelection()
  } catch (error) {
    toast.add({
      title: 'Failed to share items',
      description: error instanceof Error ? error.message : 'Failed to share items',
      color: 'error'
    })
  }
}

const handleBulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${store.selectedItems.length} item(s)?`)) {
    handleDelete()
  }
}

const handleDelete = async () => {
  try {
    await Promise.all(store.selectedItems.map(id => store.deleteMedia(id)))

    toast.add({
      title: 'Items deleted',
      description: `${store.selectedItems.length} item(s) deleted successfully`,
      color: 'success'
    })

    store.clearSelection()
  } catch (error) {
    toast.add({
      title: 'Failed to delete items',
      description: error instanceof Error ? error.message : 'Failed to delete items',
      color: 'error'
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
  store.selectedItems = [item.id]
  showShareModal.value = true
  contextMenu.value.show = false
}

const deleteItem = async (item: MediaListItem | null) => {
  if (!item) return

  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    try {
      await store.deleteMedia(item.id)
      toast.add({
        title: 'Item deleted',
        description: `"${item.name}" deleted successfully`,
        color: 'success'
      })
    } catch (error) {
      toast.add({
        title: 'Failed to delete item',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        color: 'error'
      })
    }
  }
  contextMenu.value.show = false
}

const previewItem = (item: MediaListItem | null) => {
  if (!item || !item.file?.url) return
  window.open(item.file.url, '_blank')
  contextMenu.value.show = false
}

const downloadItem = (item: MediaListItem | null) => {
  if (!item || !item.file?.url) return

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

    userOptions.value = usersResponse.users.map((user: any) => ({
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
    await store.navigateToFolder(folderId)
  } else {
    await store.navigateToFolder()
  }
}

// Initialize
onMounted(async () => {
  await handleRouteChange()
  await loadShareOptions()
})

// Watch for route changes
watch(() => route.params.id, handleRouteChange)

// Page title - using document.title for Vue
watch(() => store.currentFolder, (folder) => {
  if (folder) {
    document.title = `${folder.name} - Media`
  } else {
    document.title = 'Media'
  }
}, { immediate: true })
</script>