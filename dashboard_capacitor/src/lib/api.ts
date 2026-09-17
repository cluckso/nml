import { API_BASE_URL } from '../env'

const base = API_BASE_URL.replace(/\/$/, '') + '/'

async function getToken(): Promise<string | null> {
  const { getSupabase } = await import('./supabase')
  const supabase = await getSupabase()
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

export async function savePushToken(token: string): Promise<void> {
  try {
    const response = await request('api/push-token', {
      method: 'POST',
      body: JSON.stringify({ token, platform: 'android' }),
    })
    if (!response.ok) {
      console.warn('[API] Failed to save push token:', await response.text())
    }
  } catch (error) {
    console.error('[API] Save push token error:', error)
  }
}

export type PublicPlan = {
  planType: string
  name: string
  description: string
  price: number
  includedMinutes: number
  badge: string | null
  popular: boolean
  subtitle: string
  features: string[]
}

export type PublicPricing = {
  marketing: {
    headline: string
    categoryLine: string
    sub: string
    primaryCta: string
    trialSummary: string
  }
  trial: { days: number; minutes: number; noCardRequired: boolean }
  overageRatePerMin: number
  billing: { processor: string; merchantOfRecord: string; playDisclosure: string }
  plans: PublicPlan[]
}

export async function getPublicPricing(): Promise<PublicPricing> {
  const res = await request('api/public-pricing')
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export type BillingSummary = {
  businessId: string | null
  hasPaidPlan: boolean
  canManage: boolean
  subscriptionStatus: string | null
  trial: {
    isOnTrial: boolean
    minutesUsed: number
    minutesRemaining: number
    isExhausted: boolean
    isExpired: boolean
    daysRemaining: number | null
  } | null
  plan: {
    planType: string
    name: string
    price: number
    includedMinutes: number
  } | null
  usage: {
    minutesUsed: number
    minutesIncluded: number
    overageMinutes: number
    overageRatePerMin: number
  } | null
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const res = await request('api/billing/summary')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw new ApiError(await res.text(), res.status)
  return res.json()
}

export async function createCheckout(planType: string, playExternalTransactionToken?: string) {
  const res = await request('api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      planType,
      source: 'android',
      playExternalTransactionToken: playExternalTransactionToken || undefined,
    }),
  })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  const data = (await res.json()) as { url?: string; error?: string }
  if (!res.ok) throw new ApiError(data.error || 'Checkout failed', res.status)
  if (!data.url) throw new ApiError('Checkout did not return a URL', 500)
  return data.url
}

export async function createBillingPortal() {
  const res = await request('api/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ source: 'android' }),
  })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  const data = (await res.json()) as { url?: string; error?: string }
  if (!res.ok) throw new ApiError(data.error || 'Could not open billing portal', res.status)
  if (!data.url) throw new ApiError('Billing portal did not return a URL', 500)
  return data.url
}
