import type {
  LoginRequest,
  LoginResponseData,
  AuthResponseData,
  User,
  RegisterRequest,
  UserCreateRequest,
  UserUpdateRequest,
  ApiResponse,
  ApiListResponse,
  QueryParams,
  Role,
  Permission,
  Media
} from '../types'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8100'
    this.loadTokenFromStorage()
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
      localStorage.removeItem('auth_user')
    }
  }

  public getToken(): string | null {
    return this.token
  }

  private getHeaders(additionalHeaders: Record<string, string | undefined> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': 'api',
    }

    // Add additional headers and remove undefined values
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      if (value !== undefined) {
        headers[key] = value
      } else {
        delete headers[key]
      }
    })

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
      return {
        success: false,
        error: errorData.error || errorData.message || 'Login failed'
      }
    }

    const data = await response.json() as LoginResponseData

    // Set token in API client (localStorage handled by auth store)
    if (data.accessToken) {
      this.setToken(data.accessToken)
    }

    // Transform the user data to match User interface
    const role = data.extend?.role || { id: data.role_id, name: data.role_name }
    const user: User = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      phone: data.phone,
      email: data.email,
      role_id: data.role_id,
      role,
      roles: [role], // Single role as array for role checking
      avatar_url: data.avatar_url,
      last_login: data.last_login,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    }

    return {
      success: true,
      data: {
        user,
        token: data.accessToken,
        extend: data.extend
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      this.clearToken()
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.token) {
      return {
        success: false,
        error: 'No authentication token available'
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/api/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get profile' }))
        if (response.status === 401) {
          this.clearToken()
        }
        return {
          success: false,
          error: errorData.error || errorData.message || 'Failed to get profile'
        }
      }

      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user'
      }
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: QueryParams): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    const headers = isFormData
      ? this.getHeaders({ 'Content-Type': undefined })
      : this.getHeaders()

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: isFormData ? data as FormData : (data ? JSON.stringify(data) : undefined)
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    const headers = isFormData
      ? this.getHeaders({ 'Content-Type': undefined })
      : this.getHeaders()

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data as FormData : (data ? JSON.stringify(data) : undefined)
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    return this.handleResponse<T>(response)
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed'
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // User management methods
  async getUsers(params?: QueryParams): Promise<ApiListResponse<User>> {
    try {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${this.baseURL}/api/users${queryString}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()

      // API returns { data: [...], pagination: {...} }
      if (data && Array.isArray(data.data)) {
        return {
          success: true,
          data: data.data,
          pagination: data.pagination || {
            total: data.data.length,
            page: 1,
            page_size: data.data.length,
            total_pages: 1
          }
        }
      }

      return {
        success: false,
        error: 'Invalid response format'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      }
    }
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.get<User>(`/api/users/${id}`)
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse<User>> {
    return this.post<User>('/api/users', userData)
  }

  async updateUser(id: number, userData: UserUpdateRequest): Promise<ApiResponse<User>> {
    return this.put<User>(`/api/users/${id}`, userData)
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/users/${id}`)
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponseData>> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Registration failed' }))
      return {
        success: false,
        error: errorData.error || errorData.message || 'Registration failed'
      }
    }

    const data = await response.json() as LoginResponseData

    // Store the token and user data
    if (data.accessToken) {
      this.setToken(data.accessToken)
    }

    // Transform the user data to match User interface
    const role = data.extend?.role || { id: data.role_id, name: data.role_name }
    const user: User = {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      phone: data.phone,
      email: data.email,
      role_id: data.role_id,
      role,
      roles: [role], // Single role as array for role checking
      avatar_url: data.avatar_url,
      last_login: data.last_login,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    }

    return {
      success: true,
      data: {
        user,
        token: data.accessToken,
        extend: data.extend
      }
    }
  }

  // Roles management methods
  async getRoles(params?: QueryParams): Promise<ApiListResponse<Role>> {
    return this.get<Role[]>('/api/roles', params)
  }

  async getRole(id: number): Promise<ApiResponse<Role>> {
    return this.get<Role>(`/api/roles/${id}`)
  }

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Role>> {
    return this.post<Role>('/api/roles', roleData)
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.put<Role>(`/api/roles/${id}`, roleData)
  }

  async deleteRole(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/roles/${id}`)
  }

  // Permissions management methods
  async getPermissions(params?: QueryParams): Promise<ApiListResponse<Permission>> {
    return this.get<Permission[]>('/api/permissions', params)
  }

  async getPermission(id: number): Promise<ApiResponse<Permission>> {
    return this.get<Permission>(`/api/permissions/${id}`)
  }

  async createPermission(permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Permission>> {
    return this.post<Permission>('/api/permissions', permissionData)
  }

  async updatePermission(id: number, permissionData: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return this.put<Permission>(`/api/permissions/${id}`, permissionData)
  }

  async deletePermission(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/permissions/${id}`)
  }

  // Media management methods
  async getMedia(params?: QueryParams): Promise<ApiListResponse<Media>> {
    return this.get<Media[]>('/api/media', params)
  }

  async getMediaItem(id: number): Promise<ApiResponse<Media>> {
    return this.get<Media>(`/api/media/${id}`)
  }

  async uploadMedia(file: FormData): Promise<ApiResponse<Media>> {
    return this.post<Media>('/api/media/upload', file)
  }

  async updateMedia(id: number, mediaData: Partial<Media>): Promise<ApiResponse<Media>> {
    return this.put<Media>(`/api/media/${id}`, mediaData)
  }

  async deleteMedia(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/media/${id}`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing
export { ApiClient }