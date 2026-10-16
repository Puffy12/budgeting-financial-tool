import type { Frequency, RecurringTransaction, Transaction } from '../../types'
import { fetchApi } from '../../lib/apiClient'

export interface RecurringWrite {
  name: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  frequency: Frequency
  startDate?: string
  notes?: string
}

export const recurringApi = {
  getAll: (userId: string, params?: { type?: 'income' | 'expense'; isActive?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchApi<RecurringTransaction[]>(`/users/${userId}/recurring${query ? `?${query}` : ''}`)
  },

  getById: (userId: string, recurringId: string) =>
    fetchApi<RecurringTransaction>(`/users/${userId}/recurring/${recurringId}`),

  create: (userId: string, data: RecurringWrite) =>
    fetchApi<RecurringTransaction>(`/users/${userId}/recurring`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (userId: string, recurringId: string, data: Partial<RecurringTransaction>) =>
    fetchApi<RecurringTransaction>(`/users/${userId}/recurring/${recurringId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (userId: string, recurringId: string) =>
    fetchApi<{ message: string }>(`/users/${userId}/recurring/${recurringId}`, {
      method: 'DELETE',
    }),

  process: (userId: string, recurringId: string) =>
    fetchApi<{ message: string; transaction: Transaction }>(
      `/users/${userId}/recurring/${recurringId}/process`,
      { method: 'POST' }
    ),
}
