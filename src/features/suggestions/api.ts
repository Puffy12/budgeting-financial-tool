import { fetchApi } from '../../lib/apiClient'

export interface MonthlyBudget {
  id: string
  userId: string
  year: number
  month: number
  amount: number
  createdAt: string
  updatedAt: string
}

export const budgetsApi = {
  list: (userId: string) => fetchApi<MonthlyBudget[]>(`/users/${userId}/budgets`),

  save: (userId: string, data: { year: number; month: number; amount: number }) =>
    fetchApi<MonthlyBudget>(`/users/${userId}/budgets`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
