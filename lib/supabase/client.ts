import { createBrowserClient } from "@supabase/ssr"
import { getRememberMePreference, PERSISTENT_SESSION_MAX_AGE } from "@/lib/auth-session"

let browserClient: ReturnType<typeof createBrowserClient> | null = null
let clientRememberMe: boolean | null = null

type CreateClientOptions = {
  rememberMe?: boolean
  forceNew?: boolean
}

export function createClient(options?: CreateClientOptions) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
