import { getApiUrl, getConfig } from '@core/config'
import type {
  ApiResponse,
  ApiListResponse,
  ApiError,
  QueryParams,
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserUpdatePasswordRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  Attachment,
  Translation,
  TranslationCreateRequest,
  TranslationUpdateRequest,
  ScheduledJob,
  Role,
  Permission
} from '@core/types'

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private timeout: number = 30000

  constructor() {
    this.baseURL = this.getBaseURL()
    this.loadTokenFromStorage()
  }

  private getBaseURL(): string {
    // Use the API URL from config or environment
    return import.meta.env.VITE_API_URL || 'http://localhost:8100'
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  public setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  public clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  public getToken(): string | null {
    return this.token
  }

  private async createHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }

    // Add API key from config
    try {
      const config = await getConfig()
      if (config.auth?.apiKey) {
        headers['X-API-Key'] = config.auth.apiKey
      }
    } catch (error) {
      console.warn('Failed to get API config:', error)
    }

    // Add auth token
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private buildURL(endpoint: string, params?: QueryParams): string {
    const url = new URL(endpoint, this.baseURL)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorDetails: any = null

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        errorDetails = errorData
      } catch {
        // Response is not JSON, use default message
      }

      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails
      }

      // Handle 401 errors
      if (response.status === 401) {
        this.clearToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      throw apiError
    }

    return response.json()
  }

  // Generic request methods
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: QueryParams
  ): Promise<T> {
    const url = this.buildURL(endpoint, params)
    const headers = await this.createHeaders(options.headers as Record<string, string>)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      throw error
    }
  }

  private async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, params)
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Authentication API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.post('/api/auth/login', credentials)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.post('/api/auth/register', userData)
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/api/auth/logout')
    this.clearToken()
    return response
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse> {
    return this.post('/api/auth/forgot-password', request)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse> {
    return this.post('/api/auth/reset-password', request)
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.post('/api/auth/refresh')
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get('/api/auth/me')
  }

  // User management API
  async getUsers(params?: QueryParams): Promise<ApiListResponse<User>> {
    return this.get('/api/users', params)
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.get(`/api/users/${id}`)
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return this.post('/api/users', userData)
  }

  async updateUser(id: number, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.put(`/api/users/${id}`, userData)
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    return this.delete(`/api/users/${id}`)
  }

  async updateUserPassword(id: number, passwordData: UserUpdatePasswordRequest): Promise<ApiResponse> {
    return this.put(`/api/users/${id}/password`, passwordData)
  }

  // Role and Permission API
  async getRoles(params?: QueryParams): Promise<ApiListResponse<Role>> {
    return this.get('/api/roles', params)
  }

  async getRole(id: number): Promise<ApiResponse<Role>> {
    return this.get(`/api/roles/${id}`)
  }

  async getPermissions(params?: QueryParams): Promise<ApiListResponse<Permission>> {
    return this.get('/api/permissions', params)
  }

  // Media API
  async uploadFile(file: File, modelType?: string, modelId?: number): Promise<ApiResponse<Attachment>> {
    const formData = new FormData()
    formData.append('file', file)
    if (modelType) formData.append('model_type', modelType)
    if (modelId) formData.append('model_id', modelId.toString())

    // For file uploads, we don't set Content-Type to let browser set multipart boundary
    const headers = await this.createHeaders()
    delete headers['Content-Type']

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(this.buildURL('/api/media/upload'), {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return this.handleResponse<ApiResponse<Attachment>>(response)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      throw error
    }
  }

  async getAttachments(params?: QueryParams): Promise<ApiListResponse<Attachment>> {
    return this.get('/api/media', params)
  }

  async deleteAttachment(id: number): Promise<ApiResponse> {
    return this.delete(`/api/media/${id}`)
  }

  // Translation API
  async getTranslations(params?: QueryParams): Promise<ApiListResponse<Translation>> {
    return this.get('/api/translations', params)
  }

  async getTranslation(id: number): Promise<ApiResponse<Translation>> {
    return this.get(`/api/translations/${id}`)
  }

  async createTranslation(translationData: TranslationCreateRequest): Promise<ApiResponse<Translation>> {
    return this.post('/api/translations', translationData)
  }

  async updateTranslation(id: number, translationData: TranslationUpdateRequest): Promise<ApiResponse<Translation>> {
    return this.put(`/api/translations/${id}`, translationData)
  }

  async deleteTranslation(id: number): Promise<ApiResponse> {
    return this.delete(`/api/translations/${id}`)
  }

  // Scheduler API
  async getScheduledJobs(params?: QueryParams): Promise<ApiListResponse<ScheduledJob>> {
    return this.get('/api/scheduler/jobs', params)
  }

  async getScheduledJob(id: number): Promise<ApiResponse<ScheduledJob>> {
    return this.get(`/api/scheduler/jobs/${id}`)
  }

  async runScheduledJob(id: number): Promise<ApiResponse> {
    return this.post(`/api/scheduler/jobs/${id}/run`)
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health')
  }

  // Generic CRUD operations for custom endpoints
  async fetchList<T>(endpoint: string, params?: QueryParams): Promise<ApiListResponse<T>> {
    return this.get(endpoint, params)
  }

  async fetchItem<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.get(endpoint)
  }

  async createItem<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.post(endpoint, data)
  }

  async updateItem<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.put(endpoint, data)
  }

  async deleteItem(endpoint: string): Promise<ApiResponse> {
    return this.delete(endpoint)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing or custom instances
export { ApiClient }

// Export convenience functions
export const api = {
  // Auth
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  register: (userData: RegisterRequest) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),

  // Users
  getUsers: (params?: QueryParams) => apiClient.getUsers(params),
  getUser: (id: number) => apiClient.getUser(id),
  createUser: (userData: UserCreateRequest) => apiClient.createUser(userData),
  updateUser: (id: number, userData: UserUpdateRequest) => apiClient.updateUser(id, userData),
  deleteUser: (id: number) => apiClient.deleteUser(id),

  // Media
  uploadFile: (file: File, modelType?: string, modelId?: number) =>
    apiClient.uploadFile(file, modelType, modelId),

  // Health
  healthCheck: () => apiClient.healthCheck(),

  // Generic
  get: <T>(endpoint: string, params?: QueryParams) => apiClient.fetchList<T>(endpoint, params),
  post: <T>(endpoint: string, data?: any) => apiClient.createItem<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => apiClient.updateItem<T>(endpoint, data),
  delete: (endpoint: string) => apiClient.deleteItem(endpoint),
}