export interface Category {
  id: number
  name: string
  description: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryCreateRequest {
  name: string
  description: string
  active: boolean
  
}

export interface CategoryUpdateRequest {
  name?: string
  description?: string
  active?: boolean
  
}