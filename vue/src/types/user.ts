// User types (mirrors core/app/users/model.go)

import type { Role } from './authorization'
import type { Attachment } from './media'

export interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  role_id: number
  role_name?: string  // From API response
  role?: Role
  roles?: Role[]
  avatar?: Attachment
  avatar_url?: string
  password?: string
  last_login?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

// User API request types
export interface UserCreateRequest {
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  password: string
  role_id?: number
}

export interface UserUpdateRequest {
  first_name?: string
  last_name?: string
  username?: string
  phone?: string
  email?: string
  role_id?: number
}

export interface UserUpdatePasswordRequest {
  password: string
}