import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { isSuccessResponse } from '../types'
import type {
  MediaItem,
  MediaListItem,
  CreateMediaRequest,
  UpdateMediaRequest,
  ShareMediaRequest,
  FolderContentsRequest,
  MediaQueryParams,
  FileUploadProgress,
  BreadcrumbItem,
  MediaViewMode
} from '../types/media'
import type { PaginatedResponse } from '../types'

export const useMedia = () => {
  const api = useApi()

  // Custom upload method since useApi doesn't provide one
  const uploadRequest = async <T>(endpoint: string, formData: FormData, options?: {
    onUploadProgress?: (event: ProgressEvent) => void
  }): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const headers = api.getAuthHeaders()
      // Remove Content-Type to let browser set it for multipart/form-data
      delete headers['Content-Type']

      const response = await fetch(api.buildURL(endpoint), {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' }
    }
  }

  // State
  const loading = ref(false)
  const uploadProgress = ref<FileUploadProgress[]>([])
  const currentFolder = ref<MediaItem | null>(null)
  const breadcrumbs = ref<BreadcrumbItem[]>([{ name: 'Home', path: '/' }])
  const viewMode = ref<MediaViewMode>({ type: 'grid', size: 'medium' })
  const selectedItems = ref<number[]>([])

  // Computed
  const isUploading = computed(() => uploadProgress.value.some(p => p.status === 'uploading'))
  const hasSelection = computed(() => selectedItems.value.length > 0)

  // API Methods
  const fetchMedia = async (params?: MediaQueryParams): Promise<PaginatedResponse<MediaListItem>> => {
    // Convert QueryParams to Record<string, string> for API
    const apiParams: Record<string, string> | undefined = params ?
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : undefined

    const response = await api.getList<MediaListItem>('/api/media', apiParams)

    if (isSuccessResponse(response) && 'data' in response) {
      const items = Array.isArray(response.data) ? response.data : []
      const pagination = 'pagination' in response && response.pagination
        ? response.pagination
        : {
            total: items.length,
            page: 1,
            page_size: items.length,
            total_pages: 1
          }

      return { data: items, pagination }
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch media')
    }
  }

  const fetchAllMedia = async (): Promise<MediaListItem[]> => {
    const response = await api.get<MediaListItem[]>('/api/media/all')

    if (isSuccessResponse(response) && response.data) {
      return Array.isArray(response.data) ? response.data : []
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch all media')
    }
  }

  const fetchMediaItem = async (id: number): Promise<MediaItem> => {
    const response = await api.get<MediaItem>(`/api/media/${id}`)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch media item')
    }
  }

  const createFolder = async (name: string, description?: string, parentId?: number): Promise<MediaItem> => {
    console.log('useMedia createFolder called with:', { name, description, parentId })

    const requestData = {
      name,
      description: description || '',
      parent_id: parentId,
      type: 'folder'
    }
    console.log('Request data:', requestData)

    const response = await api.post<MediaItem>('/api/media/folders', requestData)
    console.log('API response:', response)

    if (isSuccessResponse(response) && response.data) {
      console.log('Success! Returning data:', response.data)
      return response.data
    } else {
      console.error('API call failed:', response)
      throw new Error('error' in response ? response.error : 'Failed to create folder')
    }
  }

  const getFolderContents = async (folderId?: number, params?: FolderContentsRequest): Promise<PaginatedResponse<MediaListItem>> => {
    const endpoint = folderId ? `/api/media/${folderId}/contents` : '/api/media/root'

    // Convert QueryParams to Record<string, string> for API
    const apiParams: Record<string, string> | undefined = params ?
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : undefined

    const response = await api.getList<MediaListItem>(endpoint, apiParams)

    if (isSuccessResponse(response) && 'data' in response) {
      const items = Array.isArray(response.data) ? response.data : []
      const pagination = 'pagination' in response && response.pagination
        ? response.pagination
        : {
            total: items.length,
            page: 1,
            page_size: items.length,
            total_pages: 1
          }

      return { data: items, pagination }
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch folder contents')
    }
  }

  const uploadFile = async (file: File, parentId?: number, onProgress?: (progress: number) => void): Promise<MediaItem> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('type', 'file')
    if (parentId) {
      formData.append('parent_id', parentId.toString())
    }

    // Add to upload progress tracking
    const progressItem: FileUploadProgress = {
      file,
      progress: 0,
      status: 'uploading'
    }
    uploadProgress.value.push(progressItem)

    try {
      const response = await uploadRequest<MediaItem>('/api/media', formData, {
        onUploadProgress: (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total)
            progressItem.progress = progress
            onProgress?.(progress)
          }
        }
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Upload failed')
      }

      progressItem.status = 'success'
      progressItem.progress = 100

      // Remove from progress after 2 seconds
      setTimeout(() => {
        const index = uploadProgress.value.indexOf(progressItem)
        if (index > -1) {
          uploadProgress.value.splice(index, 1)
        }
      }, 2000)

      return response.data
    } catch (error) {
      progressItem.status = 'error'
      progressItem.error = error instanceof Error ? error.message : 'Upload failed'
      throw error
    }
  }

  const uploadMultipleFiles = async (files: File[], parentId?: number): Promise<MediaItem[]> => {
    const promises = files.map(file => uploadFile(file, parentId))
    return Promise.all(promises)
  }

  const updateMedia = async (id: number, data: UpdateMediaRequest): Promise<MediaItem> => {
    if (data.file) {
      const formData = new FormData()
      if (data.name) formData.append('name', data.name)
      if (data.description) formData.append('description', data.description)
      formData.append('file', data.file)

      const response = await uploadRequest<MediaItem>(`/api/media/${id}`, formData)

      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update media')
      }
    } else {
      const response = await api.put<MediaItem>(`/api/media/${id}`, data)

      if (isSuccessResponse(response) && response.data) {
        return response.data
      } else {
        throw new Error('error' in response ? response.error : 'Failed to update media')
      }
    }
  }

  const updateMediaFile = async (id: number, file: File): Promise<MediaItem> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await uploadRequest<MediaItem>(`/api/media/${id}/file`, formData)

    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.error || 'Failed to update media file')
    }
  }

  const removeMediaFile = async (id: number): Promise<MediaItem> => {
    const response = await api.delete<MediaItem>(`/api/media/${id}/file`)

    if (isSuccessResponse(response) && response.data) {
      return response.data
    } else {
      throw new Error('error' in response ? response.error : 'Failed to remove media file')
    }
  }

  const deleteMedia = async (id: number): Promise<void> => {
    const response = await api.delete<void>(`/api/media/${id}`)

    if (!isSuccessResponse(response)) {
      throw new Error('error' in response ? response.error : 'Failed to delete media')
    }
  }

  const shareItems = async (itemIds: number[], userIds?: number[], roleIds?: number[]): Promise<void> => {
    const response = await api.post<void>('/api/media/share', {
      item_ids: itemIds,
      user_ids: userIds,
      role_ids: roleIds
    })

    if (!isSuccessResponse(response)) {
      throw new Error('error' in response ? response.error : 'Failed to share items')
    }
  }

  const getSharedItems = async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<MediaListItem>> => {
    // Convert QueryParams to Record<string, string> for API
    const apiParams: Record<string, string> | undefined = params ?
      Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : undefined

    const response = await api.getList<MediaListItem>('/api/media/shared', apiParams)

    if (isSuccessResponse(response) && 'data' in response) {
      const items = Array.isArray(response.data) ? response.data : []
      const pagination = 'pagination' in response && response.pagination
        ? response.pagination
        : {
            total: items.length,
            page: 1,
            page_size: items.length,
            total_pages: 1
          }

      return { data: items, pagination }
    } else {
      throw new Error('error' in response ? response.error : 'Failed to fetch shared items')
    }
  }

  // Navigation helpers
  const navigateToFolder = async (folderId?: number): Promise<void> => {
    if (folderId) {
      const folder = await fetchMediaItem(folderId)
      currentFolder.value = folder
      updateBreadcrumbs(folder)
    } else {
      currentFolder.value = null
      breadcrumbs.value = [{ name: 'Home', path: '/' }]
    }
  }

  const updateBreadcrumbs = (folder: MediaItem): void => {
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

  // Selection helpers
  const toggleSelection = (id: number): void => {
    const index = selectedItems.value.indexOf(id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(id)
    }
  }

  const selectAll = (items: MediaListItem[]): void => {
    selectedItems.value = items.map(item => item.id)
  }

  const clearSelection = (): void => {
    selectedItems.value = []
  }

  const isSelected = (id: number): boolean => {
    return selectedItems.value.includes(id)
  }

  // View mode helpers
  const setViewMode = (type: 'grid' | 'list', size?: 'small' | 'medium' | 'large'): void => {
    viewMode.value = {
      type,
      size: size || viewMode.value.size
    }
  }

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string, type: string): string => {
    if (type === 'folder') return 'i-lucide-folder'

    if (mimeType.startsWith('image/')) return 'i-lucide-image'
    if (mimeType.startsWith('video/')) return 'i-lucide-video'
    if (mimeType.startsWith('audio/')) return 'i-lucide-music'
    if (mimeType.includes('pdf')) return 'i-lucide-file-text'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'i-lucide-file-text'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'i-lucide-file-spreadsheet'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'i-lucide-presentation'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'i-lucide-archive'

    return 'i-lucide-file'
  }

  const getFileColor = (mimeType: string, type: string): string => {
    if (type === 'folder') return 'text-blue-500'

    if (mimeType.startsWith('image/')) return 'text-green-500'
    if (mimeType.startsWith('video/')) return 'text-purple-500'
    if (mimeType.startsWith('audio/')) return 'text-pink-500'
    if (mimeType.includes('pdf')) return 'text-red-500'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-600'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'text-orange-500'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'text-yellow-600'

    return 'text-gray-500'
  }

  const canPreview = (mimeType: string): boolean => {
    return mimeType.startsWith('image/') ||
           mimeType.includes('pdf') ||
           mimeType.startsWith('text/') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/')
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString()
  }

  return {
    // State
    loading,
    uploadProgress,
    currentFolder,
    breadcrumbs,
    viewMode,
    selectedItems,

    // Computed
    isUploading,
    hasSelection,

    // API Methods
    fetchMedia,
    fetchAllMedia,
    fetchMediaItem,
    createFolder,
    getFolderContents,
    uploadFile,
    uploadMultipleFiles,
    updateMedia,
    updateMediaFile,
    removeMediaFile,
    deleteMedia,
    shareItems,
    getSharedItems,

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

    // Utilities
    formatFileSize,
    getFileIcon,
    getFileColor,
    canPreview,
    formatDate,
    formatDateTime
  }
}