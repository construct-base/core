import { ref } from 'vue'
import { apiClient } from '@core/api/client'
import type { Post, PostCreateRequest, PostUpdateRequest } from '@/types/post'

export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/posts')
      posts.value = response.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createPost = async (data: PostCreateRequest) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.post('/posts', data)
      await fetchPosts()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updatePost = async (id: number, data: PostUpdateRequest) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.put('/posts/' + id, data)
      await fetchPosts()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deletePost = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete('/posts/' + id)
      await fetchPosts()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  }
}
