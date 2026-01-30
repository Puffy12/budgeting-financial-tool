/**
 * Transaction Hooks
 * React Query hooks for transaction operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api'
import { queryKeys } from '../lib/queryClient'
import type { Transaction } from '../types'
import { toast } from 'sonner'

interface TransactionFilters {
  month?: number
  year?: number
  type?: 'income' | 'expense'
  categoryId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface CreateTransactionData {
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  date?: string
  notes?: string
}

/**
 * Hook to fetch transactions with optional filters
 */
export function useTransactions(userId: string, filters?: TransactionFilters) {
  return useQuery({
    queryKey: queryKeys.transactions(userId, filters),
    queryFn: () => transactionsApi.getAll(userId, filters),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(userId: string, transactionId: string) {
  return useQuery({
    queryKey: queryKeys.transaction(userId, transactionId),
    queryFn: () => transactionsApi.getById(userId, transactionId),
    enabled: !!userId && !!transactionId,
  })
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateTransactionData }) =>
      transactionsApi.create(userId, data),
    onSuccess: (newTransaction, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'monthly'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'comparison'] })
      toast.success('Transaction created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create transaction', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      transactionId,
      data,
    }: {
      userId: string
      transactionId: string
      data: Partial<Transaction>
    }) => transactionsApi.update(userId, transactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'monthly'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'comparison'] })
      toast.success('Transaction updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update transaction', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, transactionId }: { userId: string; transactionId: string }) =>
      transactionsApi.delete(userId, transactionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSummary(variables.userId) })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'monthly'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'comparison'] })
      toast.success('Transaction deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete transaction', {
        description: error.message,
      })
    },
  })
}
