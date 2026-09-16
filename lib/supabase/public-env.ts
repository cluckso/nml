/**
 * Browser-safe Supabase env. Next.js only inlines NEXT_PUBLIC_* when the
 * identifier appears as a static member access — do not use process.env[name].
 *
 * Dashboard now labels the client key "publishable"; this app historically
 * used ANON_KEY. Accept either.
 */
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  )
}

export function hasSupabaseBrowserConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}
