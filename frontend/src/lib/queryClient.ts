/**
 * React Query Client Configuration
 * Centralized configuration for TanStack Query
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Query keys for cache management
export const queryKeys = {
  // Users
  users: ['users'] as const,
  user: (userId: string) => ['users', userId] as const,
  userSummary: (userId: string) => ['users', userId, 'summary'] as const,
  userMonthlyStats: (userId: string, months?: number) => ['users', userId, 'monthly', months] as const,
  userComparison: (userId: string, months?: number) => ['users', userId, 'comparison', months] as const,
  
  // Categories
  categories: (userId: string) => ['categories', userId] as const,
  category: (userId: string, categoryId: string) => ['categories', userId, categoryId] as const,
  
  // Transactions
  transactions: <T extends object>(userId: string, filters?: T) => 
    filters ? ['transactions', userId, filters] as const : ['transactions', userId] as const,
  transaction: (userId: string, transactionId: string) => ['transactions', userId, transactionId] as const,
  
  // Recurring
  recurring: <T extends object>(userId: string, filters?: T) => 
    filters ? ['recurring', userId, filters] as const : ['recurring', userId] as const,
  recurringItem: (userId: string, recurringId: string) => ['recurring', userId, recurringId] as const,
}
