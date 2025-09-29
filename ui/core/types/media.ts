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

export interface UpdateMediaRequest {
  name?: string
  description?: string
  parent_id?: number
  is_shared?: boolean
  file?: File
}

export interface ShareMediaRequest {
  item_ids: number[]
  user_ids?: number[]
  role_ids?: number[]
}

export interface FolderContentsRequest {
  folder_id?: number
  search?: string
  type?: 'file' | 'folder'
  page?: number
  limit?: number
}

export interface MediaViewMode {
  type: 'grid' | 'list'
  size: 'small' | 'medium' | 'large'
}

export interface BreadcrumbItem {
  id?: number
  name: string
  path: string
}

export interface FileUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export interface MediaShare {
  id: number
  media_id: number
  user_id?: number
  role_id?: number
  permission: 'read' | 'write' | 'delete'
  created_at: string
  updated_at: string
}

export type MediaSortBy = 'name' | 'type' | 'size' | 'created_at' | 'updated_at'
export type MediaSortOrder = 'asc' | 'desc'

export interface MediaQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: 'file' | 'folder'
  sort_by?: MediaSortBy
  sort_order?: MediaSortOrder
  parent_id?: number
}