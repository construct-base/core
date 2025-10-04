export interface MediaItem {
  id: number
  name: string
  type: 'file' | 'folder'
  mime_type: string
  description: string
  parent_id?: number
  parent?: MediaListItem
  children?: MediaListItem[]
  size: number
  owner_id: number
  is_shared: boolean
  share_token?: string
  file?: {
    id: number
    filename: string
    original_filename: string
    size: number
    content_type: string
    url: string
    thumbnail_url?: string
  }
  path: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface MediaListItem {
  id: number
  name: string
  type: 'file' | 'folder'
  mime_type: string
  description: string
  parent_id?: number
  size: number
  owner_id: number
  is_shared: boolean
  share_token?: string
  file?: {
    id: number
    filename: string
    original_filename: string
    size: number
    content_type: string
    url: string
    thumbnail_url?: string
  }
  path: string
  child_count?: number
  created_at: string
  updated_at: string
}

export interface CreateMediaRequest {
  name: string
  type: 'file' | 'folder'
  description?: string
  parent_id?: number
  file?: File
}

export interface CreateFolderRequest {
  name: string
  description?: string
  parent_id?: number
}

export interface UpdateMediaRequest {
  name?: string
  type?: 'file' | 'folder'
  description?: string
  file?: File
}

export interface ShareMediaRequest {
  media_id: number
  user_ids?: number[]
  role_ids?: number[]
  permissions: string[] // ['read', 'update', 'delete']
}

export interface MediaShareResponse {
  id: number
  media_id: number
  user_id?: number
  role_id?: number
  permissions: string
  created_at: string
}

export interface FileUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface MediaQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface BreadcrumbItem {
  id?: number
  name: string
  path: string
}

export interface MediaUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  result?: MediaItem
}

export interface MediaViewMode {
  type: 'grid' | 'list'
  size: 'small' | 'medium' | 'large'
}