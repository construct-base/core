import { ref, computed } from 'vue'
import type { ApiResponse } from '@/types'

/**
 * Nuxt-like useFetch composable
 * Base HTTP client with X-Api-Key authentication
 * Used by core framework features (no Bearer token)
 *
 * @example
 * const { data, error, loading, execute } = useFetch('/api/endpoint')
 * await execute()
 */

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  immediate?: boolean
  baseURL?: string
  apiKey?: string
}

export function useFetch<T = any>(url: string, options: UseFetchOptions = {}) {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    params,
    immediate = false,
    baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8100',
    apiKey = 'api'
  } = options

  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const buildURL = (endpoint: string, queryParams?: Record<string, string | number | boolean>): string => {
    const fullURL = new URL(`${baseURL}${endpoint}`)

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullURL.searchParams.append(key, String(value))
        }
      })
    }

    return fullURL.toString()
  }

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': apiKey,
      ...customHeaders
    }

    // Remove Content-Type for FormData
    if (body instanceof FormData) {
      delete headers['Content-Type']
    }

    return headers
  }

  const execute = async (): Promise<ApiResponse<T>> => {
    loading.value = true
    error.value = null

    try {
      const fetchURL = buildURL(url, params)

      const config: RequestInit = {
        method,
        headers: getHeaders()
      }

      if (body && method !== 'GET') {
        config.body = body instanceof FormData ? body : JSON.stringify(body)
      }

      const response = await fetch(fetchURL, config)
      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || `HTTP ${response.status}`
        error.value = errorMessage
        return {
          success: false,
          error: errorMessage
        }
      }

      // Handle different response formats
      if (responseData.data !== undefined) {
        data.value = responseData.data
      } else {
        data.value = responseData
      }

      return {
        success: true,
        data: data.value,
        message: responseData.message
      }
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

  // Execute immediately if requested
  if (immediate) {
    execute()
  }

  return {
    data: computed(() => data.value),
    error: computed(() => error.value),
    loading: computed(() => loading.value),
    execute,
    refresh: execute // Alias for Nuxt compatibility
  }
}
