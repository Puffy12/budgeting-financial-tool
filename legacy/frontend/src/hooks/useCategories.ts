/**
 * Category Hooks
 * React Query hooks for category operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api'
import { queryKeys } from '../lib/queryClient'
import type { Category } from '../types'
import { toast } from 'sonner'

interface CreateCategoryData {
  name: string
  type: 'income' | 'expense'
  icon?: string
}

/**
 * Hook to fetch all categories for a user
 */
export function useCategories(userId: string) {
  return useQuery({
    queryKey: queryKeys.categories(userId),
    queryFn: () => categoriesApi.getAll(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch a single category
 */
export function useCategory(userId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.category(userId, categoryId),
    queryFn: () => categoriesApi.getById(userId, categoryId),
    enabled: !!userId && !!categoryId,
  })
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateCategoryData }) =>
      categoriesApi.create(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(variables.userId) })
      toast.success('Category created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create category', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      categoryId,
      data,
    }: {
      userId: string
      categoryId: string
      data: Partial<Category>
    }) => categoriesApi.update(userId, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(variables.userId) })
      toast.success('Category updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update category', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, categoryId }: { userId: string; categoryId: string }) =>
      categoriesApi.delete(userId, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories(variables.userId) })
      toast.success('Category deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete category', {
        description: error.message,
      })
    },
  })
}
