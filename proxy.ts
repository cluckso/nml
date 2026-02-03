import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Set MAINTENANCE_MODE=true or 1 in env to show 503 for all traffic (webhooks and /api/health still work). */
const MAINTENANCE_HTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Site temporarily unavailable</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#e5e5e5;text-align:center;padding:1rem;}h1{font-size:1.5rem;}p{color:#a3a3a3;}</style></head>
<body><div><h1>Site temporarily unavailable</h1><p>We'll be back shortly. Thanks for your patience.</p></div></body>
</html>
`

export async function proxy(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE === "true" || process.env.MAINTENANCE_MODE === "1"
  if (maintenance) {
    const path = request.nextUrl.pathname
    const allow = path.startsWith("/api/webhooks") || path === "/api/health"
    if (!allow) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "300" },
      })
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth if Supabase isn't configured — prevents hang when env vars are missing or invalid
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  let user: { id: string } | null = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Timeout so a hanging Supabase request doesn't block the page (e.g. wrong URL, paused project)
    const userPromise = supabase.auth.getUser()
    const timeoutMs = 5000
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("getUser timeout")), timeoutMs)
    )
    const { data } = await Promise.race([userPromise, timeoutPromise]).catch(() => ({ data: { user: null } })) as { data: { user: { id: string } | null } }
    user = data?.user ?? null
  } catch (_err) {
    // If Supabase fails (network, invalid config, etc.), continue without auth so the page can load
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/pricing", "/sign-in", "/sign-up", "/confirm-email", "/api/webhooks", "/api/test", "/api/health", "/docs", "/privacy", "/terms"]
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && (request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up" || request.nextUrl.pathname === "/confirm-email")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
