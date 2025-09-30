// Authentication types (mirrors core/app/authentication/model.go)

import type { User } from './user'
import type { Role, Permission } from './authorization'

// Authentication request types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  password: string
}

// Authentication response types
export interface LoginResponseData {
  id: number
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  role_id: number
  role_name: string
  avatar_url?: string
  last_login?: string
  created_at?: string
  updated_at?: string
  accessToken: string
  extend?: {
    role?: Role
    permissions?: Permission[]
    [key: string]: unknown
  }
}

export interface AuthResponseData {
  user: User
  token: string
  extend?: Record<string, unknown>
}

// Auth state management
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: string | null
}