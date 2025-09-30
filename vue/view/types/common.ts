// Common types and utilities for Construct API integration

// Base response types
export interface ErrorResponse {
  error: string
  success: boolean
  details?: Record<string, unknown>
}

export interface SuccessResponse<T = unknown> {
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

export interface PaginatedResponse<T = unknown> {
  success: boolean
  data: T
  pagination: Pagination
  message?: string
}

// Request/Response wrappers
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse
export type ApiListResponse<T = unknown> = PaginatedResponse<T[]> | ErrorResponse

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
  [key: string]: unknown
}

// Utility types
export type ID = number | string
export type Timestamp = string