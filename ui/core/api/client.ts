import type { LoginRequest, LoginResponse, User } from '../types'

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

  private getHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Api-Key': 'api',
      ...additionalHeaders
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Login failed')
    }

    const data = await response.json() as LoginResponse

    // Store the token and user data
    if (data.accessToken) {
      this.setToken(data.accessToken)
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        role: data.extend?.role || { id: data.role_id, name: data.role_name },
        avatar_url: data.avatar_url
      }))
    }

    return data
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

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null

    try {
      const response = await fetch(`${this.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken()
        }
        return null
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  async register(userData: any): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Registration failed')
    }

    const data = await response.json() as LoginResponse

    // Store the token and user data
    if (data.accessToken) {
      this.setToken(data.accessToken)
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        role: data.extend?.role || { id: data.role_id, name: data.role_name },
        avatar_url: data.avatar_url
      }))
    }

    return data
  }

  async refreshToken(): Promise<LoginResponse | null> {
    if (!this.token) return null

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        this.clearToken()
        return null
      }

      const data = await response.json() as LoginResponse

      if (data.accessToken) {
        this.setToken(data.accessToken)
      }

      return data
    } catch (error) {
      console.error('Failed to refresh token:', error)
      this.clearToken()
      return null
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing
export { ApiClient }