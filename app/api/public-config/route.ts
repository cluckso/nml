import { NextResponse } from "next/server"

/** Public client config for Capacitor/mobile apps (anon key is safe to expose). */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

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
