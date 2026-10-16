import type { ComparisonData, MonthlyData, Summary, User } from '../../types'
import { fetchApi } from '../../lib/apiClient'

export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),

  getById: (userId: string) => fetchApi<User>(`/users/${userId}`),

  update: (userId: string, name: string) =>
    fetchApi<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  delete: (userId: string) =>
    fetchApi<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
      headers: { 'X-Confirm-Delete': 'true' },
    }),

  getSummary: (userId: string, params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.month !== undefined) searchParams.append('month', String(params.month))
    if (params?.year !== undefined) searchParams.append('year', String(params.year))
    const query = searchParams.toString()
    return fetchApi<Summary>(`/users/${userId}/stats/summary${query ? `?${query}` : ''}`)
  },

  getMonthlyStats: (userId: string, months = 6, params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('months', String(months))
    if (params?.month !== undefined) searchParams.append('month', String(params.month))
    if (params?.year !== undefined) searchParams.append('year', String(params.year))
    return fetchApi<MonthlyData[]>(`/users/${userId}/stats/monthly?${searchParams.toString()}`)
  },

  getComparison: (userId: string, months = 12, params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('months', String(months))
    if (params?.month !== undefined) searchParams.append('month', String(params.month))
    if (params?.year !== undefined) searchParams.append('year', String(params.year))
    return fetchApi<ComparisonData[]>(`/users/${userId}/stats/comparison?${searchParams.toString()}`)
  },
}
