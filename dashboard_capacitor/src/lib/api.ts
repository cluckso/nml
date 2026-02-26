import { API_BASE_URL } from '../env'

const base = API_BASE_URL.replace(/\/$/, '') + '/'

async function getToken(): Promise<string | null> {
  const { supabase } = await import('./supabase')
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request(
  path: string,
  opts: RequestInit & { params?: Record<string, string> } = {}
): Promise<Response> {
  const { params, ...init } = opts
  const url = params && Object.keys(params).length
    ? base + path + '?' + new URLSearchParams(params).toString()
    : base + path
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return fetch(url, { ...init, headers })
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function getDashboard() {
  const res = await request('api/dashboard')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function getCalls(opts: { page?: number; limit?: number; search?: string; emergency?: boolean } = {}) {
  const params: Record<string, string> = {
    page: String(opts.page ?? 1),
    limit: String(opts.limit ?? 20),
  }
  if (opts.search) params.search = opts.search
  if (opts.emergency) params.emergency = 'true'
  const res = await request('api/calls', { params })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function getSettings() {
  const res = await request('api/settings')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function patchSettings(body: Record<string, unknown>) {
  const res = await request('api/settings', { method: 'PATCH', body: JSON.stringify(body) })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function getAppointments(opts: { from?: string; to?: string; status?: string } = {}) {
  const params: Record<string, string> = {}
  if (opts.from) params.from = opts.from
  if (opts.to) params.to = opts.to
  if (opts.status) params.status = opts.status
  const res = await request('api/appointments', { params: Object.keys(params).length ? params : undefined })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function cancelAppointment(id: string) {
  const res = await request(`api/appointments/${id}`, { method: 'DELETE' })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
}
