"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { confirmEmailValueLine } from "@/lib/trial-marketing"
import { getEmailConfirmRedirectUrl } from "@/lib/auth-redirect"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import { BrandMark } from "@/components/brand/BrandMark"

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [resending, setResending] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const supabase = createClient()

  const handleResend = async () => {
    if (!email?.trim()) return
    setResending(true)
    setResendError(null)
    setResendDone(false)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: getEmailConfirmRedirectUrl(),
      },
    })
    setResending(false)
    if (error) {
      setResendError(error.message)
    } else {
      setResendDone(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandMark className="mb-4 justify-center" />
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            One quick step — then you can forward your line and test with real calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What to do next</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your email inbox{email ? ` for ${email}` : ""}.</li>
              <li>Find the message from CallGrabbr (subject: &quot;Confirm your signup&quot; or similar).</li>
              <li>Click the confirmation link in that email.</li>
              <li>Sign in with your password — {confirmEmailValueLine()}</li>
            </ol>
          </div>

          <p className="text-sm text-muted-foreground">
            Didn&apos;t get the email? Check your spam or junk folder. If it&apos;s not there, you can resend the confirmation email.
          </p>

          {email?.trim() && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : resendDone ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Email sent again
                  </>
                ) : (
                  "Resend confirmation email"
                )}
              </Button>
              {resendError && (
                <p className="text-sm text-destructive">{resendError}</p>
              )}
              {resendDone && (
                <p className="text-sm text-muted-foreground">
                  Check your inbox (and spam) for the new link.
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Already confirmed? Sign in to continue.
            </p>
            <Button asChild className="w-full">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
