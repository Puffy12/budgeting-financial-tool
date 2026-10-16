export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let currentAuthToken: string | null = null

export function setApiToken(token: string | null) {
  currentAuthToken = token
}

export function getApiToken(): string | null {
  return currentAuthToken
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (currentAuthToken && !endpoint.startsWith('/auth/')) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
  })

  if (!response.ok) {
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const message = error.error || error.message || 'API request failed'
    throw new ApiError(message, response.status)
  }

  return response.json()
}
