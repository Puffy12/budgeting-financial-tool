export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

let currentAuthToken: string | null = null

export function setApiToken(token: string | null) {
  currentAuthToken = token
}

export function getApiToken(): string | null {
  return currentAuthToken
}

export function rejectedToken(event: Event): string | null {
  return event instanceof CustomEvent && typeof event.detail === 'string' ? event.detail : null
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = endpoint.startsWith('/auth/') ? null : currentAuthToken
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string> | undefined),
    },
  })

  if (!response.ok) {
    // Name the token the server refused. A request sent without one says nothing about the stored sign-in.
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: token }))
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    const message = error.error || error.message || 'API request failed'
    throw new ApiError(message, response.status)
  }

  return response.json()
}
