import { API_BASE_URL } from '../env'

export type AppConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
  apiBaseUrl: string
}

let cached: AppConfig | null = null

function fromViteEnv(): AppConfig | null {
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
  const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''
  if (!supabaseUrl || !supabaseAnonKey) return null
  return { supabaseUrl, supabaseAnonKey, apiBaseUrl: API_BASE_URL }
}

async function fromApi(): Promise<AppConfig> {
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/public-config`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Could not load app config (${res.status})`)
  }
  const data = (await res.json()) as { supabaseUrl?: string; supabaseAnonKey?: string }
  const supabaseUrl = data.supabaseUrl?.trim() ?? ''
  const supabaseAnonKey = data.supabaseAnonKey?.trim() ?? ''
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('App config response was incomplete')
  }
  return { supabaseUrl, supabaseAnonKey, apiBaseUrl: API_BASE_URL }
}

/** Resolve Supabase config from Vite env or production API fallback. */
export async function loadAppConfig(): Promise<AppConfig> {
  if (cached) return cached
  const envConfig = fromViteEnv()
  if (envConfig) {
    cached = envConfig
    return cached
  }
  cached = await fromApi()
  return cached
}
