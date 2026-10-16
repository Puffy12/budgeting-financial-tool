import type { AuthLoginResponse, AuthValidateResponse, PinLoginResult } from '../../types'
import { fetchApi, getApiToken } from '../../lib/apiClient'

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

  register: (name: string, pin: string) =>
    fetchApi<AuthLoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    }),

  changePin: (currentPin: string, newPin: string) =>
    fetchApi<AuthLoginResponse>('/auth/change-pin', {
      method: 'PUT',
      body: JSON.stringify({ currentPin, newPin }),
      headers: getApiToken() ? { Authorization: `Bearer ${getApiToken()}` } : {},
    }),
}
