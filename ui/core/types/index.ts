// Common API types
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  }
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  [key: string]: any
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

// User types
export interface User {
  id: number
  email: string
  name?: string
  avatar?: string
  roles?: Role[]
  permissions?: string[]
  created_at: string
  updated_at: string
}

// Role types
export interface Role {
  id: number
  name: string
  description?: string
  color?: string
  permissions?: Permission[]
  permission_count?: number
  users_count?: number
  created_at: string
  updated_at: string
}

// Permission types
export interface Permission {
  id: number
  name: string
  description?: string
  resource_type: string
  action: string
  scope?: string
  created_at: string
  updated_at: string
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  validation?: (value: any) => string | null
}

export interface FormState {
  [key: string]: any
}

// Navigation types
export interface NavigationItem {
  label: string
  to?: string
  href?: string
  icon?: string
  badge?: string | number
  children?: NavigationItem[]
  exact?: boolean
  target?: string
}

// Notification types
export interface Notification {
  id?: string
  title: string
  description?: string
  color?: 'primary' | 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  icon?: string
  timeout?: number
  actions?: Array<{
    label: string
    onClick?: () => void
    color?: string
    variant?: string
  }>
}

// Table types
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any, row: any) => string
  component?: any
}

export interface TableSort {
  column: string
  direction: 'asc' | 'desc'
}

// Export media types
export * from './media'