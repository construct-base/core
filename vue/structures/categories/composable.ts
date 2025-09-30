import { ref } from 'vue'
import { apiClient } from '@core/api/client'
import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/types/category'

export function useCategories() {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.get('/categories')
      categories.value = response.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createCategory = async (data: CategoryCreateRequest) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.post('/categories', data)
      await fetchCategories()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id: number, data: CategoryUpdateRequest) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.put('/categories/' + id, data)
      await fetchCategories()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await apiClient.delete('/categories/' + id)
      await fetchCategories()
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}