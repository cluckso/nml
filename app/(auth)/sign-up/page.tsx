"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { validateEmail, validatePasswordSignUp } from "@/lib/utils"
import { loadFunnelTrialContext } from "@/lib/funnel/funnel-trial-bridge"
import { getSafeRedirectPath } from "@/lib/safe-redirect"
import { TERMS_ACCEPTED_STORAGE_KEY } from "@/lib/user-legal"
import { LegalConsentCheckbox } from "@/components/legal/LegalConsentCheckbox"

const AUTH_NEXT_KEY = "callgrabbr_auth_next"

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}

function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const ref = searchParams.get("ref")
    const agency = searchParams.get("agency")
    const next = getSafeRedirectPath(searchParams.get("next"))
    if (next) {
      try {
        sessionStorage.setItem(AUTH_NEXT_KEY, next)
      } catch {
        // ignore
      }
    }
    if (ref) {
      try {
        sessionStorage.setItem("callgrabbr_referral", ref.toUpperCase())
      } catch {
        // ignore storage errors
      }
    }
    if (agency) {
      try {
        sessionStorage.setItem("callgrabbr_agency", agency.toUpperCase())
      } catch {
        // ignore storage errors
      }
    }
    const ctx = loadFunnelTrialContext()
    if (ctx?.contactEmail) setEmail(ctx.contactEmail)
  }, [searchParams])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailResult = validateEmail(email)
    if (emailResult.ok === false) {
      setError(emailResult.error)
      return
    }
    const passwordResult = validatePasswordSignUp(password)
    if (passwordResult.ok === false) {
      setError(passwordResult.error)
      return
    }
    if (!agreedToLegal) {
      setError("Please agree to the Terms of Service and Privacy Policy to create an account.")
      return
    }

    setLoading(true)
    const baseUrl =
      (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")) ||
      (typeof window !== "undefined" ? window.location.origin : "")
    let redirectPath = "/dashboard"
    try {
      const stored = getSafeRedirectPath(sessionStorage.getItem(AUTH_NEXT_KEY))
      if (stored) redirectPath = stored
    } catch {
      // ignore
    }
    const emailRedirectTo = baseUrl ? `${baseUrl}${redirectPath}` : undefined

    const { error } = await supabase.auth.signUp({
      email: emailResult.email,
      password: password.trim(),
      options: emailRedirectTo ? { emailRedirectTo } : {},
    })

    if (error) {
      const status = (error as { status?: number }).status
      if (status === 429) {
        setError("Too many sign-up attempts. Please wait a few minutes and try again.")
      } else if (status === 500) {
        setError("Our auth service had an error. Please try again in a moment. If it keeps happening, check your Supabase project's Auth settings (email templates, SMTP) or contact support.")
      } else if (status === 400) {
        setError(error.message || "Invalid request. Check your email and password, or try signing in if you already have an account.")
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      try {
        sessionStorage.setItem(TERMS_ACCEPTED_STORAGE_KEY, "1")
      } catch {
        // ignore
      }
      void fetch("/api/user/accept-terms", { method: "POST" }).catch(() => {
        // PersistTermsConsent will retry after email confirmation
      })
      router.push(`/confirm-email?email=${encodeURIComponent(emailResult.email)}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your CallGrabbr account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, with at least one letter and one number
              </p>
            </div>
            <LegalConsentCheckbox
              id="signup-legal-consent"
              checked={agreedToLegal}
              onChange={setAgreedToLegal}
              variant="compact"
            />
            <Button type="submit" className="w-full" disabled={loading || !agreedToLegal}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary hover:underline">
              Sign in
            </a>
            {" "}·{" "}
            <a href="/sign-up?next=%2Ftrial%2Fstart" className="text-primary hover:underline">
              Start free trial
            </a>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            If you see &quot;too many attempts&quot;, wait a few minutes. After signing up, check your email (and spam) for the confirmation link.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
