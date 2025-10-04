export interface Post {
  id: number
  title: string
  content: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface PostCreateRequest {
  title: string
  content: string
  published: boolean
}

export interface PostUpdateRequest {
  title: string
  content: string
  published: boolean
}
