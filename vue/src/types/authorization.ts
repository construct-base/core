// Authorization types - Roles and Permissions (mirrors core/app/authorization/model.go)

export interface Role {
  id: number
  name: string
  description?: string
  is_system?: boolean
  permissions?: Permission[]
  permission_count?: number
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: number
  name: string
  description?: string
  resource_type: string
  action: string
  created_at?: string
  updated_at?: string
}