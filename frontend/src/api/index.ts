import type { User, Category, Transaction, RecurringTransaction, Summary, MonthlyData, ComparisonData, PinLoginResult, AuthLoginResponse, AuthValidateResponse } from '../types'

const API_BASE = '/api'

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || error.message || 'API request failed')
  }
  
  return response.json()
}

// Auth API
export const authApi = {
  login: (name: string, pin: string) =>
    fetchApi<PinLoginResult>('/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    }),

  setPin: (userId: string, pin: string) =>
    fetchApi<AuthLoginResponse>('/auth/set-pin', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  validateToken: (token: string) =>
    fetchApi<AuthValidateResponse>('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
}

// Users API
export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),
  
  getById: (userId: string) => fetchApi<User>(`/users/${userId}`),
  
  create: (name: string, pin: string) => 
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    }),
  
  update: (userId: string, name: string) =>
    fetchApi<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  
  delete: (userId: string) =>
    fetchApi<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
    }),
  
  getSummary: (userId: string, params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      if (params.month !== undefined) searchParams.append('month', String(params.month))
      if (params.year !== undefined) searchParams.append('year', String(params.year))
    }
    const query = searchParams.toString()
    return fetchApi<Summary>(`/users/${userId}/stats/summary${query ? `?${query}` : ''}`)
  },
  
  getMonthlyStats: (userId: string, months = 6) =>
    fetchApi<MonthlyData[]>(`/users/${userId}/stats/monthly?months=${months}`),
  
  getComparison: (userId: string, months = 12, params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams()
    searchParams.append('months', String(months))
    if (params) {
      if (params.month !== undefined) searchParams.append('month', String(params.month))
      if (params.year !== undefined) searchParams.append('year', String(params.year))
    }
    return fetchApi<ComparisonData[]>(`/users/${userId}/stats/comparison?${searchParams.toString()}`)
  },
}

// Categories API
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

// Transactions API
export const transactionsApi = {
  getAll: (userId: string, params?: {
    month?: number
    year?: number
    type?: 'income' | 'expense'
    categoryId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return fetchApi<{ transactions: Transaction[]; total: number; limit: number; offset: number }>(
      `/users/${userId}/transactions${query ? `?${query}` : ''}`
    )
  },
  
  getById: (userId: string, transactionId: string) =>
    fetchApi<Transaction>(`/users/${userId}/transactions/${transactionId}`),
  
  create: (userId: string, data: {
    amount: number
    type: 'income' | 'expense'
    categoryId: string
    date?: string
    notes?: string
  }) =>
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

// Recurring API
export const recurringApi = {
  getAll: (userId: string, params?: { type?: 'income' | 'expense'; isActive?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    const query = searchParams.toString()
    return fetchApi<RecurringTransaction[]>(
      `/users/${userId}/recurring${query ? `?${query}` : ''}`
    )
  },
  
  getById: (userId: string, recurringId: string) =>
    fetchApi<RecurringTransaction>(`/users/${userId}/recurring/${recurringId}`),
  
  create: (userId: string, data: {
    name: string
    amount: number
    type: 'income' | 'expense'
    categoryId: string
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
    startDate?: string
    notes?: string
  }) =>
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

// Export/Import API
export const exportApi = {
  exportAll: (userId: string) =>
    fetchApi<unknown>(`/users/${userId}/export`),
  
  exportMonth: (userId: string, year: number, month: number) =>
    fetchApi<unknown>(`/users/${userId}/export/month/${year}/${month}`),
  
  exportYear: (userId: string, year: number) =>
    fetchApi<unknown>(`/users/${userId}/export/year/${year}`),
  
  import: (userId: string, data: unknown, mode: 'merge' | 'replace' = 'merge') =>
    fetchApi<{ message: string; imported: { categories: number; transactions: number; recurring: number } }>(
      `/users/${userId}/import`,
      {
        method: 'POST',
        body: JSON.stringify({ data, mode }),
      }
    ),
}
