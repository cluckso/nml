"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const baseUrl =
      (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")) ||
      (typeof window !== "undefined" ? window.location.origin : "")
    const emailRedirectTo = baseUrl ? `${baseUrl}/dashboard` : undefined

    const { error } = await supabase.auth.signUp({
      email,
      password,
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
      router.push(`/confirm-email?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your NeverMissLead-AI account</CardDescription>
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
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary hover:underline">
              Sign in
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
