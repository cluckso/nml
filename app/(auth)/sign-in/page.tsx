"use client"

import { useState, Suspense, useEffect, useRef } from "react"
import { analytics } from "@heycatch/sdk"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { validateEmail, validatePasswordSignIn } from "@/lib/utils"
import { loadFunnelTrialContext } from "@/lib/funnel/funnel-trial-bridge"
import { signInPageDescription, trialNavCtaLabel } from "@/lib/trial-marketing"
import { getSafeRedirectPath } from "@/lib/safe-redirect"
import { resolvePostAuthRedirect } from "@/lib/auth-redirect"
import { getRememberMePreference, setRememberMePreference } from "@/lib/auth-session"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout"

const AUTH_NEXT_KEY = "callgrabbr_auth_next"

function readStoredNext(): string | null {
  try {
    return getSafeRedirectPath(sessionStorage.getItem(AUTH_NEXT_KEY))
  } catch {
    return null
  }
}

function clearStoredNext() {
  try {
    sessionStorage.removeItem(AUTH_NEXT_KEY)
  } catch {
    // ignore
  }
}

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checkingEmailConfirm, setCheckingEmailConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmAttempted = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const emailConfirmed = message === "email-confirmed"

  useEffect(() => {
    setStaySignedIn(getRememberMePreference())
  }, [])

  useEffect(() => {
    const next = getSafeRedirectPath(searchParams.get("next"))
    if (next) {
      try {
        sessionStorage.setItem(AUTH_NEXT_KEY, next)
      } catch {
        // ignore
      }
    }
    const ctx = loadFunnelTrialContext()
    if (ctx?.contactEmail) setEmail(ctx.contactEmail)
  }, [searchParams])

  // After a successful confirm redirect, drop any stale error from a double-exchange race.
  useEffect(() => {
    if (emailConfirmed) setError(null)
  }, [emailConfirmed])

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code || emailConfirmed || confirmAttempted.current) return

    confirmAttempted.current = true
    let cancelled = false
    setCheckingEmailConfirm(true)
    setError(null)

    async function identifyConfirmedSignup(client: ReturnType<typeof createClient>) {
      const { data } = await client.auth.getUser()
      if (!data.user) return
      analytics.setIdentity(
        data.user.id,
        { email: data.user.email ?? undefined },
        { signup_date: data.user.created_at }
      )
      analytics.trackEvent("confirmed_email")
      // Ensure Prisma user exists, then enqueue first-visit re-engagement email.
      void fetch("/api/user/first-visit-email", { method: "POST" }).catch(() => {})
    }

    function continueAfterConfirm() {
      const dest = resolvePostAuthRedirect(
        searchParams.get("next"),
        readStoredNext(),
        "/trial/start"
      )
      clearStoredNext()
      router.replace(dest)
      router.refresh()
      setCheckingEmailConfirm(false)
    }

    async function handleEmailConfirm() {
      const authClient = createClient()
      const { error: exchangeError } = await authClient.auth.exchangeCodeForSession(code!)
      if (cancelled) return

      if (exchangeError) {
        // Code may already be consumed by a prior attempt in the same navigation (Strict Mode).
        // If we already have a session, stay signed in and continue setup.
        const { data } = await authClient.auth.getSession()
        if (data.session) {
          await identifyConfirmedSignup(authClient)
          if (cancelled) return
          continueAfterConfirm()
          return
        }
        setError(
          "This confirmation link is invalid or has expired. Sign in below or request a new confirmation email."
        )
        setCheckingEmailConfirm(false)
        // Strip used/invalid code so refresh doesn't re-trigger.
        router.replace("/sign-in")
        return
      }

      await identifyConfirmedSignup(authClient)
      if (cancelled) return

      setError(null)
      continueAfterConfirm()
    }

    void handleEmailConfirm()

    return () => {
      cancelled = true
    }
  }, [searchParams, router, emailConfirmed])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailResult = validateEmail(email)
    if (emailResult.ok === false) {
      setError(emailResult.error)
      return
    }
    const passwordResult = validatePasswordSignIn(password)
    if (passwordResult.ok === false) {
      setError(passwordResult.error)
      return
    }

    setLoading(true)
    setRememberMePreference(staySignedIn)
    const authClient = createClient({ rememberMe: staySignedIn, forceNew: true })
    const { data, error } = await authClient.auth.signInWithPassword({
      email: emailResult.email,
      password: password.trim(),
    })

    if (error) {
      const status = (error as { status?: number }).status
      const code = (error as { code?: string }).code
      if (status === 429 || code === "over_email_send_limit") {
        setError("Too many attempts. Please wait a few minutes and try again.")
      } else if (
        code === "invalid_credentials" ||
        (error.message && error.message.toLowerCase().includes("invalid"))
      ) {
        setError("Invalid email or password. Please try again or reset your password.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      if (data.user) {
        analytics.setIdentity(data.user.id, { email: data.user.email ?? emailResult.email })
      }
      const next = resolvePostAuthRedirect(searchParams.get("next"), readStoredNext(), "/dashboard")
      clearStoredNext()
      router.push(next)
      router.refresh()
    }
  }

  if (checkingEmailConfirm) {
    return (
      <AuthSplitLayout>
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Confirming your email…</p>
        </div>
      </AuthSplitLayout>
    )
  }

  // Prefer success copy; never show confirm-link error alongside email-confirmed.
  const showConfirmError = !!error && !emailConfirmed

  return (
    <AuthSplitLayout>
      <div>
        <div className="mb-5">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            Sign in to CallGrabbr
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{signInPageDescription()}</p>
        </div>
        <form onSubmit={handleSignIn} className="space-y-4">
          {emailConfirmed && (
            <div className="bg-primary/10 text-primary text-sm p-3 rounded-md">
              Email confirmed — continuing setup…
            </div>
          )}
          {message && message !== "email-confirmed" && (
            <div className="bg-primary/10 text-primary text-sm p-3 rounded-md">
              {message === "account-deleted"
                ? "Your account was deleted. You can sign up again anytime."
                : message}
            </div>
          )}
          {showConfirmError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              maxLength={255}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={18} />
                ) : (
                  <Eye aria-hidden="true" size={18} />
                )}
              </button>
            </div>
          </div>
          <label htmlFor="stay-signed-in" className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              id="stay-signed-in"
              checked={staySignedIn}
              onCheckedChange={(checked) => setStaySignedIn(checked === true)}
            />
            <span className="text-sm text-muted-foreground">Stay signed in</span>
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href={`/sign-up?next=${encodeURIComponent("/trial/start")}`}
            className="text-primary hover:underline"
          >
            {trialNavCtaLabel()}
          </a>
        </p>
      </div>
    </AuthSplitLayout>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthSplitLayout>
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </AuthSplitLayout>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
