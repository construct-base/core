export interface Post {
  id: number
  title: string
  content: string
  published: boolean
  category_id: number
  created_at: string
  updated_at: string
}

export interface PostCreateRequest {
  title: string
  content: string
  published: boolean
  category_id: number
}

export interface PostUpdateRequest {
  title: string
  content: string
  published: boolean
  category_id: number
}
