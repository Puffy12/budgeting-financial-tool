/**
 * User Hooks
 * React Query hooks for user and stats operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import { queryKeys } from '../lib/queryClient'
import { toast } from 'sonner'

/**
 * Hook to fetch all users
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: usersApi.getAll,
  })
}

/**
 * Hook to fetch a single user
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch user's financial summary
 */
export function useUserSummary(userId: string) {
  return useQuery({
    queryKey: queryKeys.userSummary(userId),
    queryFn: () => usersApi.getSummary(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for summary data
  })
}

/**
 * Hook to fetch monthly stats
 */
export function useMonthlyStats(userId: string, months = 6) {
  return useQuery({
    queryKey: queryKeys.userMonthlyStats(userId, months),
    queryFn: () => usersApi.getMonthlyStats(userId, months),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch comparison data
 */
export function useComparison(userId: string, months = 12) {
  return useQuery({
    queryKey: queryKeys.userComparison(userId, months),
    queryFn: () => usersApi.getComparison(userId, months),
    enabled: !!userId,
  })
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ name, pin }: { name: string; pin: string }) => usersApi.create(name, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User created successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      usersApi.update(userId, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.userId) })
      toast.success('User updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update user', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', {
        description: error.message,
      })
    },
  })
}
