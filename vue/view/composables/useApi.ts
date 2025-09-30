import { ref, computed } from 'vue'
import type { ApiResponse, ApiListResponse } from '../types'

interface UseApiOptions {
  baseURL?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string>
}

export function useApi(options: UseApiOptions = {}) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const baseURL = computed(() => {
    // In development, use relative URLs to leverage Vite proxy
    // In production, use the full API URL
    if (import.meta.env.DEV) {
      return options.baseURL || ''
    }
    return options.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8100'
  })

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': 'api'
    }

    // Add Bearer token if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  const buildURL = (endpoint: string, params?: Record<string, string>): string => {
    // In development with empty baseURL, use relative URLs
    if (baseURL.value === '') {
      if (!params || Object.keys(params).length === 0) {
        return endpoint
      }

      const urlParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value)
      })

      return `${endpoint}?${urlParams.toString()}`
    }

    // For production with full baseURL, use absolute URLs
    const url = new URL(`${baseURL.value}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return url.toString()
  }

  const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    try {
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      // For paginated responses, preserve the whole structure
      if (data.pagination) {
        return {
          success: true,
          data: data.data,
          pagination: data.pagination,
          message: data.message
        }
      }

      // For regular responses, extract data
      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to parse response'
      }
    }
  }

  const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
    loading.value = true
    error.value = null

    try {
      const {
        method = 'GET',
        body,
        headers: customHeaders = {},
        params
      } = options

      const url = buildURL(endpoint, params)
      const headers = { ...getAuthHeaders(), ...customHeaders }

      // Handle FormData
      const isFormData = body instanceof FormData
      if (isFormData) {
        delete headers['Content-Type'] // Let browser set multipart boundary
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        ...(body && { body: isFormData ? body : JSON.stringify(body) })
      }

      const response = await fetch(url, fetchOptions)
      const result = await handleResponse<T>(response)

      if (!result.success) {
        error.value = result.error || 'Request failed'
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      error.value = errorMessage

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Convenience methods
  const get = <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params })

  const post = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'POST', body })

  const put = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body })

  const del = <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' })

  const patch = <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body })

  // List helper for paginated responses
  const getList = <T>(endpoint: string, params?: Record<string, string>) =>
    request<T[]>(endpoint, { method: 'GET', params }) as Promise<ApiListResponse<T>>

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Methods
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    getList,
    clearError,

    // Utilities
    baseURL,
    buildURL,
    getAuthHeaders
  }
}