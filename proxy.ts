import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-env"
import { getSafeRedirectPath } from "@/lib/safe-redirect"

/** Origins allowed for CORS (Capacitor app, local dev). API routes accept Bearer token from these. */
const CORS_ORIGINS = ["https://localhost", "capacitor://localhost", "http://localhost", "http://localhost:3000"]

function corsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-API-Key",
    "Access-Control-Max-Age": "86400",
  }
}

/** Exact-match public paths (home only — do not use startsWith("/") ). */
const PUBLIC_EXACT = new Set([
  "/",
  "/pricing",
  "/sign-in",
  "/sign-up",
  "/confirm-email",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/sms-terms",
  "/about",
  "/blog",
  "/compare",
  "/changelog",
  "/integrations/zapier",
  "/start",
  "/sitemap.xml",
  "/robots.txt",
])

/** Prefix public paths (marketing + docs). */
const PUBLIC_PREFIXES = [
  "/docs",
  "/guides",
  "/blog/",
  "/for/",
  "/funnel/",
  "/cls/",
  "/integrations/",
]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, "") || pathname.startsWith(prefix)
  )
}

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
    const allow =
      path.startsWith("/api/webhooks") ||
      path === "/api/health" ||
      path === "/api/articles-webhook"
    if (!allow) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "300" },
      })
    }
  }

  // CORS preflight for API (Capacitor / mobile app)
  const path = request.nextUrl.pathname
  if (request.method === "OPTIONS" && path.startsWith("/api/")) {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(request.headers.get("origin")),
    })
  }

  // Do not redirect API routes to sign-in; let the route return 401 if Bearer token is missing/invalid
  if (path.startsWith("/api/")) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip auth if Supabase isn't configured — prevents hang when env vars are missing or invalid
  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()
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

  const isPublicRoute = isPublicPath(path)

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    const returnTo = `${path}${request.nextUrl.search}`
    url.pathname = "/sign-in"
    url.search = ""
    if (returnTo && returnTo !== "/") {
      url.searchParams.set("next", returnTo)
    }
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  // Bounce signed-in users off sign-in/sign-up only (not forgot/reset/confirm).
  // Allow confirm-code exchange to proceed when ?code= is present.
  const hasConfirmCode = !!request.nextUrl.searchParams.get("code")
  if (
    user &&
    (path === "/sign-in" || path === "/sign-up") &&
    !hasConfirmCode
  ) {
    const url = request.nextUrl.clone()
    const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"))
    if (next) {
      try {
        const dest = new URL(next, request.nextUrl.origin)
        url.pathname = dest.pathname
        url.search = dest.search
      } catch {
        url.pathname = "/dashboard"
        url.search = ""
      }
    } else {
      url.pathname = "/dashboard"
      url.search = ""
    }
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
