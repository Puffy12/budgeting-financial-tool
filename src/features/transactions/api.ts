import type { Transaction } from '../../types'
import { fetchApi } from '../../lib/apiClient'

export interface TransactionQuery {
  month?: number
  year?: number
  type?: 'income' | 'expense'
  categoryId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface TransactionWrite {
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  date?: string
  notes?: string
}

export const transactionsApi = {
  getAll: (userId: string, params?: TransactionQuery) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString()
    return fetchApi<{ transactions: Transaction[]; total: number; limit: number; offset: number }>(
      `/users/${userId}/transactions${query ? `?${query}` : ''}`
    )
  },

  getById: (userId: string, transactionId: string) =>
    fetchApi<Transaction>(`/users/${userId}/transactions/${transactionId}`),

  create: (userId: string, data: TransactionWrite) =>
    fetchApi<Transaction>(`/users/${userId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (userId: string, transactionId: string, data: Partial<Transaction>) =>
    fetchApi<Transaction>(`/users/${userId}/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (userId: string, transactionId: string) =>
    fetchApi<{ message: string }>(`/users/${userId}/transactions/${transactionId}`, {
      method: 'DELETE',
    }),
}
