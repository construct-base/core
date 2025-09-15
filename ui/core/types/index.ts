// TypeScript types that mirror Go models

// Base response types
export interface ErrorResponse {
  error: string
  success: boolean
  details?: any
}

export interface SuccessResponse<T = any> {
  message?: string
  success: boolean
  data?: T
}

export interface Pagination {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PaginatedResponse<T = any> {
  data: T
  pagination: Pagination
}

// User related types - matches Go UserResponse
export interface User {
  id: number
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  role_id: number
  role: Role
  avatar_url: string
  last_login: string
}

export interface UserCreateRequest {
  first_name: string
  last_name: string
  username: string
  phone?: string
  email: string
  password: string
}

export interface UserUpdateRequest {
  first_name?: string
  last_name?: string
  username?: string
  phone?: string
  email?: string
}

export interface UserUpdatePasswordRequest {
  old_password: string
  new_password: string
}

export interface UserModelResponse {
  id: number
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
}

// Role types
export interface Role {
  id: number
  name: string
  description?: string
  permissions?: Permission[]
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: number
  name: string
  description?: string
  resource: string
  action: string
  created_at?: string
  updated_at?: string
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  username: string
  password: string
  phone?: string
}

// Actual login response from API
export interface LoginResponse {
  id: number
  first_name: string
  last_name: string
  username: string
  phone: string
  email: string
  role_id: number
  role_name: string
  avatar_url: string
  last_login: string
  accessToken: string
  exp: number
  extend: {
    role: {
      id: number
      name: string
    }
    user_id: number
  }
}

export interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    token: string
    extend?: any
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

// Media/Attachment types
export interface Attachment {
  id: number
  filename: string
  original_filename: string
  mime_type: string
  size: number
  url: string
  model_type: string
  model_id: number
  created_at?: string
  updated_at?: string
}

export interface MediaUploadResponse {
  success: boolean
  data?: Attachment
  error?: string
}

// API Client types
export interface ApiClientConfig {
  baseUrl: string
  timeout: number
  apiKey?: string
  token?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: any
}

// Request/Response wrappers
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse
export type ApiListResponse<T = any> = PaginatedResponse<T[]> | ErrorResponse

// Type guards for API responses
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true
}

export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.success === false
}

// Common query parameters
export interface QueryParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}

// WebSocket types
export interface WebSocketMessage {
  type: string
  data: any
  timestamp?: string
}

export interface WebSocketConnection {
  id: string
  connected: boolean
  lastActivity?: string
}

// Translation types
export interface Translation {
  id: number
  key: string
  value: string
  locale: string
  namespace?: string
  created_at?: string
  updated_at?: string
}

export interface TranslationCreateRequest {
  key: string
  value: string
  locale: string
  namespace?: string
}

export interface TranslationUpdateRequest {
  value: string
}

// Scheduler types
export interface ScheduledJob {
  id: number
  name: string
  schedule: string
  status: 'active' | 'inactive' | 'running' | 'failed'
  last_run?: string
  next_run?: string
  created_at?: string
  updated_at?: string
}

// Generic types for flexibility
export type ID = number | string
export type Timestamp = string
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray
export interface JSONObject {
  [key: string]: JSONValue
}
export interface JSONArray extends Array<JSONValue> {}

// Utility types
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type Required<T> = {
  [P in keyof T]-?: T[P]
}

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>