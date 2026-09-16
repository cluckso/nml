import { createBrowserClient } from "@supabase/ssr"
import { getRememberMePreference, PERSISTENT_SESSION_MAX_AGE } from "@/lib/auth-session"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-env"

let browserClient: ReturnType<typeof createBrowserClient> | null = null
let clientRememberMe: boolean | null = null

type CreateClientOptions = {
  rememberMe?: boolean
  forceNew?: boolean
}

export function createClient(options?: CreateClientOptions) {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in nml-main/.env"
    )
  }

  if (typeof window === "undefined") {
    return createBrowserClient(url, key)
  }

  const rememberMe = options?.rememberMe ?? getRememberMePreference()
  if (!browserClient || clientRememberMe !== rememberMe || options?.forceNew) {
    browserClient = createBrowserClient(url, key, {
      isSingleton: false,
      cookieOptions: rememberMe
        ? { path: "/", maxAge: PERSISTENT_SESSION_MAX_AGE }
        : { path: "/" },
    })
    clientRememberMe = rememberMe
  }

  return browserClient
}
