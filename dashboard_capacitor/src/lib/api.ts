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
    public statusCode: number,
    public body?: unknown
  ) {
    super(sanitizeApiMessage(message, statusCode))
    this.name = 'ApiError'
  }
}

/** Never surface Next.js HTML 404 pages (or other HTML blobs) in the UI. */
export function sanitizeApiMessage(raw: string, status?: number): string {
  const trimmed = (raw || '').trim()
  if (!trimmed) return status ? `Request failed (${status})` : 'Request failed'
  const looksLikeHtml =
    /^<!DOCTYPE\s+html/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /<title[\s>]/i.test(trimmed) ||
    /<\/?(head|body|script|meta)\b/i.test(trimmed)
  if (looksLikeHtml) {
    if (status === 404) {
      return 'This feature is not available on the server yet. Try again after updating, or tap Retry.'
    }
    return status ? `Server error (${status}). Please try again.` : 'Something went wrong. Please try again.'
  }
  return trimmed.length > 280 ? `${trimmed.slice(0, 277)}…` : trimmed
}

async function parseError(res: Response): Promise<ApiError> {
  const contentType = res.headers.get('content-type') || ''
  let message = await res.text()
  let body: unknown
  const maybeJson =
    contentType.includes('application/json') ||
    (message.trim().startsWith('{') && message.trim().endsWith('}'))
  if (maybeJson) {
    try {
      body = JSON.parse(message)
      if (body && typeof body === 'object') {
        const obj = body as { error?: unknown; message?: unknown }
        if (typeof obj.error === 'string' && obj.error) message = obj.error
        else if (typeof obj.message === 'string' && obj.message) message = obj.message
      }
    } catch {
      // keep text — sanitizeApiMessage strips HTML
    }
  }
  return new ApiError(message || `Request failed (${res.status})`, res.status, body)
}

export type ActivationStatus = {
  businessId: string | null
  onboardingComplete: boolean
  needsTrialStart: boolean
  needsOnboarding: boolean
  planType?: string | null
  prefill: {
    industry: string | null
    name: string | null
    city: string | null
    serviceAreas: string[]
    businessHours: { open: string; close: string; days: string[] } | null
    phoneNumber: string | null
    ownerPhone: string | null
  } | null
}

/** Prefer /api/activation; fall back to dashboard on any non-auth failure. */
export async function getActivation(): Promise<ActivationStatus> {
  try {
    const res = await request('api/activation')
    if (res.status === 401) throw new ApiError('Unauthorized', 401)
    if (res.ok) {
      return res.json() as Promise<ActivationStatus>
    }
    // 404 (not deployed), 500, or HTML — never block login behind activation alone
    console.warn('[API] activation failed, falling back to dashboard', res.status)
    return await getActivationFromDashboard()
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 401) throw e
    console.warn('[API] activation error, falling back to dashboard', e)
    return getActivationFromDashboard()
  }
}

async function getActivationFromDashboard(): Promise<ActivationStatus> {
  const res = await request('api/dashboard')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  const data = await res.json()
  const business = data.business as
    | {
        id?: string
        onboardingComplete?: boolean
        name?: string
        industry?: string | null
        phoneNumber?: string | null
        primaryForwardingNumber?: string | null
      }
    | null
    | undefined

  if (!business?.id) {
    return {
      businessId: null,
      onboardingComplete: false,
      needsTrialStart: true,
      needsOnboarding: false,
      prefill: null,
    }
  }

  // Legacy dashboard (before onboardingComplete was added): don't block existing shops
  const complete =
    business.onboardingComplete === undefined ? true : !!business.onboardingComplete
  return {
    businessId: business.id,
    onboardingComplete: complete,
    needsTrialStart: false,
    needsOnboarding: !complete,
    prefill: {
      industry: business.industry ?? null,
      name: business.name ?? null,
      city: null,
      serviceAreas: [],
      businessHours: null,
      phoneNumber: business.primaryForwardingNumber ?? business.phoneNumber ?? null,
      ownerPhone: null,
    },
  }
}

export async function getDashboard() {
  const res = await request('api/dashboard')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
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
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getCall(id: string) {
  const res = await request(`api/calls/${encodeURIComponent(id)}`)
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json() as Promise<{ call: Record<string, unknown> }>
}

export async function getSettings() {
  const res = await request('api/settings')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function patchSettings(body: Record<string, unknown>) {
  const res = await request('api/settings', { method: 'PATCH', body: JSON.stringify(body) })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getAppointments(opts: { from?: string; to?: string; status?: string } = {}) {
  const params: Record<string, string> = {}
  if (opts.from) params.from = opts.from
  if (opts.to) params.to = opts.to
  if (opts.status) params.status = opts.status
  const res = await request('api/appointments', { params: Object.keys(params).length ? params : undefined })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function createAppointment(body: {
  callerName?: string
  callerPhone?: string
  callerEmail?: string
  scheduledAt: string
  durationMinutes?: number
  issueDescription?: string
  notes?: string
}) {
  const res = await request('api/appointments', { method: 'POST', body: JSON.stringify(body) })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function cancelAppointment(id: string) {
  const res = await request(`api/appointments/${id}`, { method: 'DELETE' })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
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

export async function startTrial(body: {
  businessPhone: string
  smsConsent?: boolean
  funnelIndustry?: string
  contactName?: string
  contactEmail?: string
}) {
  const eligibility = await request('api/trial/eligibility', {
    method: 'POST',
    body: JSON.stringify({ businessPhone: body.businessPhone }),
  })
  if (!eligibility.ok) throw await parseError(eligibility)

  const res = await request('api/trial/start', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json() as Promise<{ url?: string }>
}

export async function completeOnboarding(body: {
  industry: string
  businessInfo: Record<string, unknown>
}) {
  const res = await request('api/onboarding', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function acceptTerms() {
  const res = await request('api/user/accept-terms', { method: 'POST' })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getReferrals() {
  const res = await request('api/referrals')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function getAgency() {
  const res = await request('api/agency')
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function createAgency(name: string) {
  const res = await request('api/agency', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

export async function startAgencyConnect() {
  const res = await request('api/agency/connect', { method: 'POST' })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json() as Promise<{ url?: string }>
}

export async function deleteAccount() {
  const res = await request('api/account/delete', { method: 'DELETE' })
  if (res.status === 401) throw new ApiError('Unauthorized', 401)
  if (!res.ok) throw await parseError(res)
  return res.json()
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
  if (!res.ok) throw await parseError(res)
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
  if (!res.ok) throw await parseError(res)
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
  if (!res.ok) throw new ApiError(data.error || 'Checkout failed', res.status, data)
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
  if (!res.ok) throw new ApiError(data.error || 'Could not open billing portal', res.status, data)
  if (!data.url) throw new ApiError('Billing portal did not return a URL', 500)
  return data.url
}
