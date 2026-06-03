/**
 * Thin fetch wrapper around the backend API.
 * Base URL is env-driven (VITE_API_URL) so the app can target Docker later without code changes.
 */

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

/** Error carrying the backend HTTP status and parsed `{ message, details }` payload. */
export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface BackendError {
  message?: string
  details?: unknown
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Unable to reach the server. Is the backend running?', 0)
  }

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const body = (data ?? {}) as BackendError
    const message =
      typeof body.message === 'string'
        ? body.message
        : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, body.details)
  }

  return data as T
}

/** Extract a user-facing message from an unknown thrown value. */
export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong.',
): string => (error instanceof ApiError ? error.message : fallback)

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
