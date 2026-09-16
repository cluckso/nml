import { NextResponse } from "next/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-env"

/** Public client config for Capacitor/mobile apps (anon key is safe to expose). */
export async function GET() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 })
  }

  return NextResponse.json(
    { supabaseUrl, supabaseAnonKey },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  )
}
