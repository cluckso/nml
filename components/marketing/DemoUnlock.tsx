"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, ArrowRight, Check } from "lucide-react"

const DEMO_NUMBER = process.env.NEXT_PUBLIC_DEMO_NUMBER || "(555) 123-4567"

const BUSINESS_TYPES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Auto Repair",
  "Handyman",
  "Cleaning",
  "Landscaping",
  "Other",
]

interface DemoUnlockProps {
  className?: string
}

export function DemoUnlock({ className = "" }: DemoUnlockProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [consent, setConsent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid phone number")
      return
    }
    if (!businessType) {
      setError("Please select your business type")
      return
    }
    if (!consent) {
      setError("Please agree to receive the demo result message")
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch("/api/demo/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, businessType }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Something went wrong. Please try again.")
        return
      }
      
      setUnlocked(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (unlocked) {
    return (
      <Card className={`border-primary/50 bg-primary/5 ${className}`}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Call the demo</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-background rounded-xl p-6 border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Demo number:</p>
            <p className="text-3xl font-bold text-primary tracking-wide">{DEMO_NUMBER}</p>
          </div>
          
          <div className="text-left space-y-3">
            <p className="font-medium">How to test:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
              <li>Call the number above</li>
              <li>Pretend you&apos;re a customer with a job request</li>
              <li>Example: &quot;I need a plumber for a leak under my kitchen sink&quot;</li>
              <li>The AI will collect your info like a real call</li>
              <li>You&apos;ll receive an SMS with your &quot;lead&quot; summary</li>
            </ol>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>Demo calls are limited to 60 seconds</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-border/50 bg-card/50 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center mb-4">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Test the AI that answers your calls</CardTitle>
        <p className="text-muted-foreground mt-2">
          See exactly what your customers would experience. We&apos;ll text you the lead summary after.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-name">Your name</Label>
            <Input
              id="demo-name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-phone">Phone number</Label>
            <Input
              id="demo-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll text you the demo result to this number
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-business">Business type</Label>
            <select
              id="demo-business"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={loading}
            >
              <option value="">Select your industry...</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="demo-consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="demo-consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to receive exactly one SMS with my demo call result (sent after I call). Standard messaging rates may apply.
            </Label>
          </div>
          
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
            {loading ? "Unlocking..." : "Unlock demo number"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
