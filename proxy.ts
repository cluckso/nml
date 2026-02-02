import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
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
