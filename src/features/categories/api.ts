import type { Category } from '../../types'
import { fetchApi } from '../../lib/apiClient'

export const categoriesApi = {
  getAll: (userId: string) =>
    fetchApi<Category[]>(`/users/${userId}/categories`),

  getById: (userId: string, categoryId: string) =>
    fetchApi<Category>(`/users/${userId}/categories/${categoryId}`),

  create: (userId: string, data: { name: string; type: 'income' | 'expense'; icon?: string }) =>
    fetchApi<Category>(`/users/${userId}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (userId: string, categoryId: string, data: Partial<Category>) =>
    fetchApi<Category>(`/users/${userId}/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (userId: string, categoryId: string) =>
    fetchApi<{ message: string }>(`/users/${userId}/categories/${categoryId}`, {
      method: 'DELETE',
    }),
}
