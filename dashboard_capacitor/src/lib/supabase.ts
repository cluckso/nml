import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loadAppConfig } from './config'

let client: SupabaseClient | null = null
let initPromise: Promise<SupabaseClient> | null = null

export async function getSupabase(): Promise<SupabaseClient> {
  if (client) return client
  if (!initPromise) {
    initPromise = loadAppConfig().then((config) => {
      client = createClient(config.supabaseUrl, config.supabaseAnonKey)
      return client
    })
  }
  return initPromise
}
