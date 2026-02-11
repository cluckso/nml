"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Public SMS opt-in form for Twilio toll-free verification.
 * Must be on a publicly accessible page so reviewers can see the opt-in workflow.
 */
export function PublicSmsOptInForm() {
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) return
    setStatus("submitting")
    try {
      const res = await fetch("/api/sms-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone.trim() || undefined, consent: true }),
      })
      if (res.ok) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <section className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6 mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-1">SMS Opt-In</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to receive SMS from NeverMissLead-AI (call alerts, lead notifications, account updates).
      </p>

      {status === "success" ? (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          Thank you. You have opted in to receive SMS messages. Message and data rates may apply. Reply STOP to opt out anytime.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="public-sms-phone">Phone number (optional for this form)</Label>
            <Input
              id="public-sms-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === "submitting"}
              className="max-w-xs"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={status === "submitting"}
              className="mt-1 rounded"
              required
            />
            <span className="text-sm">
              I agree to receive SMS/text messages from NeverMissLead-AI regarding call alerts, lead notifications, and account updates.
              Message and data rates may apply. Reply <strong>STOP</strong> to opt out, <strong>HELP</strong> for help.
              This consent is not a condition of purchase. I have read the{" "}
              <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and{" "}
              <Link href="/terms" className="text-primary underline">Terms of Service</Link>.
            </span>
          </label>
          {status === "error" && (
            <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
          )}
          <Button type="submit" disabled={!consent || status === "submitting"}>
            {status === "submitting" ? "Submitting…" : "Subscribe to SMS"}
          </Button>
        </form>
      )}
    </section>
  )
}
