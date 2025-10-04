/**
 * Base HTTP Client
 * Provides core HTTP functionality with X-Api-Key authentication
 * Used by both core client (framework features) and useApi (app modules)
 */

export interface HttpClientConfig {
  baseURL?: string
  apiKey?: string
  headers?: Record<string, string>
}

export class HttpClient {
  protected baseURL: string
  protected apiKey: string
  protected defaultHeaders: Record<string, string>

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8100'
    this.apiKey = config.apiKey || 'api'
    this.defaultHeaders = config.headers || {}
  }

  /**
   * Get base headers with API key
   */
  protected getBaseHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': this.apiKey,
      ...this.defaultHeaders,
      ...additionalHeaders
    }
  }

  /**
   * Build full URL with query params
   */
  protected buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseURL}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Generic request method
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string>
  ): Promise<Response> {
    const url = this.buildURL(endpoint, params)

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getBaseHeaders(),
        ...(options.headers || {})
      }
    }

    return fetch(url, config)
  }

  /**
   * HTTP Methods
   */
  protected async get(endpoint: string, params?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'GET' }, params)
  }

  protected async post(endpoint: string, data?: unknown, params?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }, params)
  }

  protected async put(endpoint: string, data?: unknown, params?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }, params)
  }

  protected async delete(endpoint: string, params?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, { method: 'DELETE' }, params)
  }

  protected async patch(endpoint: string, data?: unknown, params?: Record<string, string>): Promise<Response> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }, params)
  }
}
