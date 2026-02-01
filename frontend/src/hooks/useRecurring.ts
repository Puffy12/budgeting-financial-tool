/**
 * Recurring Transaction Hooks
 * React Query hooks for recurring transaction operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recurringApi } from '../api'
import { queryKeys } from '../lib/queryClient'
import type { RecurringTransaction, Frequency } from '../types'
import { toast } from 'sonner'

interface RecurringFilters {
  type?: 'income' | 'expense'
  isActive?: boolean
}

interface CreateRecurringData {
  name: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  frequency: Frequency
  startDate?: string
  notes?: string
}

/**
 * Hook to fetch recurring transactions with optional filters
 */
export function useRecurring(userId: string, filters?: RecurringFilters) {
  return useQuery({
    queryKey: queryKeys.recurring(userId, filters),
    queryFn: () => recurringApi.getAll(userId, filters),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch a single recurring transaction
 */
export function useRecurringItem(userId: string, recurringId: string) {
  return useQuery({
    queryKey: queryKeys.recurringItem(userId, recurringId),
    queryFn: () => recurringApi.getById(userId, recurringId),
    enabled: !!userId && !!recurringId,
  })
}

/**
 * Hook to create a new recurring transaction
 */
export function useCreateRecurring() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateRecurringData }) =>
      recurringApi.create(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      toast.success('Recurring transaction created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create recurring transaction', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update a recurring transaction
 */
export function useUpdateRecurring() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      recurringId,
      data,
    }: {
      userId: string
      recurringId: string
      data: Partial<RecurringTransaction>
    }) => recurringApi.update(userId, recurringId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      toast.success('Recurring transaction updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update recurring transaction', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete a recurring transaction
 */
export function useDeleteRecurring() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, recurringId }: { userId: string; recurringId: string }) =>
      recurringApi.delete(userId, recurringId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      toast.success('Recurring transaction deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete recurring transaction', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to manually process a recurring transaction
 */
export function useProcessRecurring() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, recurringId }: { userId: string; recurringId: string }) =>
      recurringApi.process(userId, recurringId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurring', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      toast.success('Transaction processed successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to process recurring transaction', {
        description: error.message,
      })
    },
  })
}
