import { ref, reactive, toRefs } from 'vue'
import { apiClient } from '@core/api/client'
import type { ApiResponse, ApiListResponse, QueryParams } from '@core/types'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiListState<T> {
  data: T[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  } | null
}

export function useApi() {
  // Generic API call composable
  const useApiCall = <TData, TParams extends any[] = []>(
    apiCall: (...params: TParams) => Promise<ApiResponse<TData>>
  ) => {
    const state = reactive<ApiState<TData>>({
      data: null,
      loading: false,
      error: null
    })

    const execute = async (...params: TParams): Promise<TData | null> => {
      state.loading = true
      state.error = null

      try {
        const response = await apiCall(...params)

        if (response.success) {
          state.data = response.data || null
          return response.data || null
        } else {
          state.error = response.message || 'API call failed'
          return null
        }
      } catch (err: any) {
        state.error = err.message || 'API call failed'
        return null
      } finally {
        state.loading = false
      }
    }

    const reset = () => {
      state.data = null
      state.loading = false
      state.error = null
    }

    return {
      ...toRefs(state),
      execute,
      reset
    }
  }

  // List API call composable with pagination
  const useApiList = <TItem, TParams extends any[] = []>(
    apiCall: (...params: TParams) => Promise<ApiListResponse<TItem>>
  ) => {
    const state = reactive<ApiListState<TItem>>({
      data: [],
      loading: false,
      error: null,
      pagination: null
    })

    const execute = async (...params: TParams): Promise<TItem[]> => {
      state.loading = true
      state.error = null

      try {
        const response = await apiCall(...params)

        if ('data' in response && 'pagination' in response) {
          // Paginated response
          state.data = response.data || []
          state.pagination = response.pagination
          return response.data || []
        } else if ('success' in response && response.success) {
          // Success response with data
          state.data = (response.data as TItem[]) || []
          return (response.data as TItem[]) || []
        } else {
          state.error = 'message' in response ? response.message || 'API call failed' : 'API call failed'
          return []
        }
      } catch (err: any) {
        state.error = err.message || 'API call failed'
        return []
      } finally {
        state.loading = false
      }
    }

    const reset = () => {
      state.data = []
      state.loading = false
      state.error = null
      state.pagination = null
    }

    const loadMore = async (...params: TParams): Promise<TItem[]> => {
      if (!state.pagination || state.pagination.page >= state.pagination.totalPages) {
        return []
      }

      const nextPage = state.pagination.page + 1
      const newParams = [...params] as TParams

      // Assume first parameter contains query params
      if (newParams[0] && typeof newParams[0] === 'object') {
        newParams[0] = { ...newParams[0], page: nextPage }
      } else {
        newParams[0] = { page: nextPage } as TParams[0]
      }

      state.loading = true

      try {
        const response = await apiCall(...newParams)

        if ('data' in response && 'pagination' in response) {
          state.data.push(...(response.data || []))
          state.pagination = response.pagination
          return response.data || []
        }

        return []
      } catch (err: any) {
        state.error = err.message || 'Failed to load more data'
        return []
      } finally {
        state.loading = false
      }
    }

    return {
      ...toRefs(state),
      execute,
      reset,
      loadMore
    }
  }

  return {
    useApiCall,
    useApiList
  }
}

// Specific API composables
export function useUsers() {
  const { useApiList, useApiCall } = useApi()

  const usersList = useApiList((params?: QueryParams) => apiClient.getUsers(params))
  const userDetail = useApiCall((id: number) => apiClient.getUser(id))
  const userCreate = useApiCall((userData: any) => apiClient.createUser(userData))
  const userUpdate = useApiCall((id: number, userData: any) => apiClient.updateUser(id, userData))
  const userDelete = useApiCall((id: number) => apiClient.deleteUser(id))

  return {
    usersList,
    userDetail,
    userCreate,
    userUpdate,
    userDelete
  }
}

export function useMedia() {
  const { useApiList, useApiCall } = useApi()

  const mediaList = useApiList((params?: QueryParams) => apiClient.getAttachments(params))
  const mediaUpload = useApiCall((file: File, modelType?: string, modelId?: number) =>
    apiClient.uploadFile(file, modelType, modelId)
  )
  const mediaDelete = useApiCall((id: number) => apiClient.deleteAttachment(id))

  return {
    mediaList,
    mediaUpload,
    mediaDelete
  }
}

// Upload composable with progress
export function useFileUpload() {
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const upload = async (
    file: File,
    modelType?: string,
    modelId?: number,
    onProgress?: (progress: number) => void
  ) => {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      // Note: Fetch API doesn't support upload progress natively
      // For progress tracking, you might want to use XMLHttpRequest
      const result = await apiClient.uploadFile(file, modelType, modelId)

      if (result.success && result.data) {
        progress.value = 100
        return result.data
      } else {
        error.value = result.message || 'Upload failed'
        return null
      }
    } catch (err: any) {
      error.value = err.message || 'Upload failed'
      return null
    } finally {
      uploading.value = false
    }
  }

  const reset = () => {
    uploading.value = false
    progress.value = 0
    error.value = null
  }

  return {
    uploading: readonly(uploading),
    progress: readonly(progress),
    error: readonly(error),
    upload,
    reset
  }
}