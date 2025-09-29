import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useMedia } from '../composables/useMedia'
import type { MediaListItem, MediaItem, UpdateMediaRequest, MediaQueryParams, BreadcrumbItem, FileUploadProgress } from '../types/media'
import type { Pagination } from '../types'

interface MediaViewMode {
  type: 'grid' | 'list'
  size: 'small' | 'medium' | 'large'
}

export const useMediaStore = defineStore('media', () => {
  const mediaApi = useMedia()

  // State
  const items = ref<MediaListItem[]>([])
  const currentItem = ref<MediaItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  // Navigation state
  const currentFolder = ref<MediaItem | null>(null)
  const breadcrumbs = ref<BreadcrumbItem[]>([{ name: 'Home', path: '/' }])

  // UI state
  const viewMode = ref<MediaViewMode>({ type: 'grid', size: 'medium' })
  const selectedItems = ref<number[]>([])
  const uploadProgress = ref<FileUploadProgress[]>([])

  // Pagination
  const pagination = ref<Pagination>({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  })

  // Computed
  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value

    const query = searchQuery.value.toLowerCase()
    return items.value.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  })

  const isUploading = computed(() => uploadProgress.value.some(p => p.status === 'uploading'))
  const hasSelection = computed(() => selectedItems.value.length > 0)

  const breadcrumbItems = computed(() => {
    return breadcrumbs.value.map(crumb => ({
      label: crumb.name,
      icon: crumb.name === 'Home' ? 'i-lucide-home' : 'i-lucide-folder',
      click: () => navigateToFolder(crumb.id)
    }))
  })

  // Actions
  const fetchMedia = async (params?: MediaQueryParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaApi.fetchMedia(params)
      items.value = Array.isArray(response.data) ? response.data : []
      if (response.pagination) {
        pagination.value = response.pagination
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch media'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchMediaItem = async (id: number): Promise<MediaItem | null> => {
    loading.value = true
    error.value = null

    try {
      const item = await mediaApi.fetchMediaItem(id)
      currentItem.value = item
      return item
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch media item'
      currentItem.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const getFolderContents = async (folderId?: number, params?: MediaQueryParams) => {
    loading.value = true
    error.value = null

    try {
      const response = await mediaApi.getFolderContents(folderId, params)
      items.value = Array.isArray(response.data) ? response.data : []
      if (response.pagination) {
        pagination.value = response.pagination
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch folder contents'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const createFolder = async (name: string, description?: string, parentId?: number): Promise<MediaItem | null> => {
    loading.value = true
    error.value = null

    console.log('Store createFolder called with:', { name, description, parentId })

    try {
      console.log('Calling mediaApi.createFolder...')
      const newFolder = await mediaApi.createFolder(name, description, parentId)
      console.log('mediaApi.createFolder returned:', newFolder)

      items.value.push({
        ...newFolder,
        child_count: 0
      })
      pagination.value.total += 1
      return newFolder
    } catch (err) {
      console.error('Error in store createFolder:', err)
      error.value = err instanceof Error ? err.message : 'Failed to create folder'
      return null
    } finally {
      loading.value = false
    }
  }

  const uploadFile = async (file: File, parentId?: number, onProgress?: (progress: number) => void): Promise<MediaItem | null> => {
    error.value = null

    // Add to upload progress tracking
    const progressItem: FileUploadProgress = {
      file,
      progress: 0,
      status: 'uploading'
    }
    uploadProgress.value.push(progressItem)

    try {
      const newItem = await mediaApi.uploadFile(file, parentId, (progress) => {
        progressItem.progress = progress
        onProgress?.(progress)
      })

      progressItem.status = 'success'
      progressItem.progress = 100

      // Add to items list
      items.value.push(newItem)
      pagination.value.total += 1

      // Remove from progress after delay
      setTimeout(() => {
        const index = uploadProgress.value.indexOf(progressItem)
        if (index > -1) {
          uploadProgress.value.splice(index, 1)
        }
      }, 2000)

      return newItem
    } catch (err) {
      progressItem.status = 'error'
      progressItem.error = err instanceof Error ? err.message : 'Upload failed'
      error.value = err instanceof Error ? err.message : 'Failed to upload file'
      return null
    }
  }

  const uploadMultipleFiles = async (files: File[], parentId?: number): Promise<MediaItem[]> => {
    const promises = files.map(file => uploadFile(file, parentId))
    const results = await Promise.all(promises)
    return results.filter((item): item is MediaItem => item !== null)
  }

  const updateMedia = async (id: number, data: UpdateMediaRequest): Promise<MediaItem | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedItem = await mediaApi.updateMedia(id, data)

      // Update in items list
      const index = items.value.findIndex(item => item.id === id)
      if (index > -1) {
        items.value[index] = { ...items.value[index], ...updatedItem }
      }

      // Update current item if it's the same
      if (currentItem.value?.id === id) {
        currentItem.value = updatedItem
      }

      return updatedItem
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update media'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteMedia = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await mediaApi.deleteMedia(id)

      // Remove from items list
      const index = items.value.findIndex(item => item.id === id)
      if (index > -1) {
        items.value.splice(index, 1)
        pagination.value.total -= 1
      }

      // Clear current item if it's the same
      if (currentItem.value?.id === id) {
        currentItem.value = null
      }

      // Remove from selection
      const selectionIndex = selectedItems.value.indexOf(id)
      if (selectionIndex > -1) {
        selectedItems.value.splice(selectionIndex, 1)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete media'
      return false
    } finally {
      loading.value = false
    }
  }

  const shareItems = async (itemIds: number[], userIds?: number[], roleIds?: number[]): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await mediaApi.shareItems(itemIds, userIds, roleIds)

      // Update shared status for items
      itemIds.forEach(id => {
        const item = items.value.find(item => item.id === id)
        if (item) {
          (item as any).is_shared = true
        }
      })

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to share items'
      return false
    } finally {
      loading.value = false
    }
  }

  // Navigation
  const navigateToFolder = async (folderId?: number) => {
    if (folderId) {
      const folder = await fetchMediaItem(folderId)
      if (folder) {
        currentFolder.value = folder
        updateBreadcrumbs(folder)
        await getFolderContents(folderId)
      }
    } else {
      currentFolder.value = null
      breadcrumbs.value = [{ name: 'Home', path: '/' }]
      await fetchMedia()
    }
  }

  const updateBreadcrumbs = (folder: MediaItem) => {
    const crumbs: BreadcrumbItem[] = [{ name: 'Home', path: '/' }]

    if (folder.parent) {
      // Build parent breadcrumbs recursively
      const buildParentCrumbs = (parent: MediaItem): BreadcrumbItem[] => {
        const parentCrumbs: BreadcrumbItem[] = []
        if (parent.parent) {
          parentCrumbs.push(...buildParentCrumbs(parent.parent))
        }
        parentCrumbs.push({
          id: parent.id,
          name: parent.name,
          path: `/media/${parent.id}`
        })
        return parentCrumbs
      }

      crumbs.push(...buildParentCrumbs(folder.parent))
    }

    crumbs.push({
      id: folder.id,
      name: folder.name,
      path: `/media/${folder.id}`
    })

    breadcrumbs.value = crumbs
  }

  // Selection management
  const toggleSelection = (id: number) => {
    const index = selectedItems.value.indexOf(id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(id)
    }
  }

  const selectAll = () => {
    selectedItems.value = items.value.map(item => item.id)
  }

  const clearSelection = () => {
    selectedItems.value = []
  }

  const isSelected = (id: number): boolean => {
    return selectedItems.value.includes(id)
  }

  // View mode management
  const setViewMode = (type: 'grid' | 'list', size?: 'small' | 'medium' | 'large') => {
    viewMode.value = {
      type,
      size: size || viewMode.value.size
    }
  }

  // Search
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  // Pagination
  const setPage = async (page: number) => {
    pagination.value.page = page
    await fetchMedia({ page, limit: pagination.value.page_size })
  }

  const setPageSize = async (pageSize: number) => {
    pagination.value.page_size = pageSize
    pagination.value.page = 1
    await fetchMedia({ page: 1, limit: pageSize })
  }

  // Clear errors
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    searchQuery,
    currentFolder,
    breadcrumbs,
    viewMode,
    selectedItems,
    uploadProgress,
    pagination,

    // Computed
    filteredItems,
    isUploading,
    hasSelection,
    breadcrumbItems,

    // Actions
    fetchMedia,
    fetchMediaItem,
    getFolderContents,
    createFolder,
    uploadFile,
    uploadMultipleFiles,
    updateMedia,
    deleteMedia,
    shareItems,

    // Navigation
    navigateToFolder,
    updateBreadcrumbs,

    // Selection
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,

    // View mode
    setViewMode,

    // Search
    setSearchQuery,

    // Pagination
    setPage,
    setPageSize,

    // Error handling
    clearError,

    // Utility functions from composable
    formatFileSize: mediaApi.formatFileSize,
    getFileIcon: mediaApi.getFileIcon,
    getFileColor: mediaApi.getFileColor,
    canPreview: mediaApi.canPreview,
    formatDate: mediaApi.formatDate,
    formatDateTime: mediaApi.formatDateTime
  }
})