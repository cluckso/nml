"use client"

import { useState, Suspense, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { validateEmail, validatePasswordSignIn } from "@/lib/utils"
import { loadFunnelTrialContext } from "@/lib/funnel/funnel-trial-bridge"
import { signInPageDescription, trialNavCtaLabel } from "@/lib/trial-marketing"
import { getSafeRedirectPath } from "@/lib/safe-redirect"
import { getRememberMePreference, setRememberMePreference } from "@/lib/auth-session"
import { Checkbox } from "@/components/ui/checkbox"

const AUTH_NEXT_KEY = "callgrabbr_auth_next"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checkingEmailConfirm, setCheckingEmailConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

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

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) return

    let cancelled = false
    setCheckingEmailConfirm(true)

    async function handleEmailConfirm() {
      const authClient = createClient()
      const { error: exchangeError } = await authClient.auth.exchangeCodeForSession(code!)
      if (cancelled) return

      if (exchangeError) {
        setError("This confirmation link is invalid or has expired. Sign in below or request a new confirmation email.")
        setCheckingEmailConfirm(false)
        return
      }

      await authClient.auth.signOut()
      if (cancelled) return

      router.replace("/sign-in?message=email-confirmed")
      router.refresh()
      setCheckingEmailConfirm(false)
    }

    void handleEmailConfirm()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

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
    const { error } = await authClient.auth.signInWithPassword({
      email: emailResult.email,
      password: password.trim(),
    })

    if (error) {
      const status = (error as { status?: number }).status
      const code = (error as { code?: string }).code
      if (status === 429 || code === "over_email_send_limit") {
        setError("Too many attempts. Please wait a few minutes and try again.")
      } else if (code === "invalid_credentials" || (error.message && error.message.toLowerCase().includes("invalid"))) {
        setError("Invalid email or password. Please try again or reset your password.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      let next: string | null = null
      try {
        next = getSafeRedirectPath(sessionStorage.getItem(AUTH_NEXT_KEY))
        sessionStorage.removeItem(AUTH_NEXT_KEY)
      } catch {
        // ignore
      }
      if (!next) next = getSafeRedirectPath(searchParams.get("next"))
      router.push(next ?? "/dashboard")
      router.refresh()
    }
  }

  if (checkingEmailConfirm) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Confirming your email…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>{signInPageDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {message && (
              <div className="bg-primary/10 text-primary text-sm p-3 rounded-md">
                {message === "account-deleted"
                  ? "Your account was deleted. You can sign up again anytime."
                  : message === "email-confirmed"
                    ? "Your email is confirmed. Sign in with your password to continue."
                    : message}
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
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
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href={`/sign-up?next=${encodeURIComponent("/trial/start")}`} className="text-primary hover:underline">
              {trialNavCtaLabel()}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
