"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Copy, Check } from "lucide-react"

interface ReferralStats {
  referralCode: string
  referralLink: string
  total: number
  converted: number
  earnedCents: number
}

export function ReferralCard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) setStats(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyLink = async () => {
    if (!stats?.referralLink) return
    await navigator.clipboard.writeText(stats.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null
  if (!stats) return null

  const earned = (stats.earnedCents / 100).toFixed(0)

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Refer a contractor, earn $50
        </CardTitle>
        <CardDescription>
          Share your link. When they subscribe, you get $50 credit on your next bill.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input readOnly value={stats.referralLink} className="text-sm" />
          <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy referral link">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="font-bold text-lg">{stats.total}</p>
            <p className="text-muted-foreground">Referred</p>
          </div>
          <div>
            <p className="font-bold text-lg">{stats.converted}</p>
            <p className="text-muted-foreground">Subscribed</p>
          </div>
          <div>
            <p className="font-bold text-lg text-primary">${earned}</p>
            <p className="text-muted-foreground">Earned</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Your code: {stats.referralCode}</p>
      </CardContent>
    </Card>
  )
}
