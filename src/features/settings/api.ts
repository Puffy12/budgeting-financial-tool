import { fetchApi } from '../../lib/apiClient'

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
