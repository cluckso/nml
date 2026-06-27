"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Copy, Check, Users, Phone, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AgencyData {
  id: string
  name: string
  inviteCode: string
  inviteLink: string
  commissionPercent: number
  clients: Array<{
    id: string
    name: string
    industry: string
    plan: string | null
    subscriptionStatus: string | null
    status: string
    commissionCentsTotal: number
    joinedAt: string
  }>
  stats: {
    totalClients: number
    activeSubscriptions: number
    callsThisMonth: number
    leadsThisMonth: number
    totalCommissionCents: number
    estimatedMonthlyCommissionCents: number
  }
}

export function AgencyDashboardClient() {
  const [agency, setAgency] = useState<AgencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [agencyName, setAgencyName] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch("/api/agency")
      .then((r) => r.json())
      .then((data) => setAgency(data.agency))
      .catch(() => setError("Failed to load agency data"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const createAgency = async () => {
    if (!agencyName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: agencyName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create agency")
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create agency")
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async () => {
    if (!agency?.inviteLink) return
    await navigator.clipboard.writeText(agency.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading partner portal…</div>
  }

  if (!agency) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Become a CallGrabbr Partner
          </CardTitle>
          <CardDescription>
            Manage client accounts, track aggregate performance, and earn recurring commission on every subscription (default 20%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Input
            placeholder="Your agency name"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
          />
          <Button onClick={createAgency} disabled={creating || !agencyName.trim()} className="w-full">
            {creating ? "Creating…" : "Activate Partner Portal"}
          </Button>
          <ul className="text-sm text-muted-foreground space-y-2 pt-2">
            <li>• Invite clients with a unique link</li>
            <li>• See calls and leads across all clients</li>
            <li>• Track commission earnings</li>
          </ul>
        </CardContent>
      </Card>
    )
  }

  const stats = agency.stats

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{agency.name}</h1>
          <p className="text-muted-foreground text-sm">Partner Portal · {agency.commissionPercent}% commission</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Users className="h-4 w-4" /> Clients
            </div>
            <p className="text-2xl font-bold">{stats.totalClients}</p>
            <p className="text-xs text-muted-foreground">{stats.activeSubscriptions} subscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Phone className="h-4 w-4" /> Calls
            </div>
            <p className="text-2xl font-bold">{stats.callsThisMonth}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" /> Leads
            </div>
            <p className="text-2xl font-bold">{stats.leadsThisMonth}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="h-4 w-4" /> Commission
            </div>
            <p className="text-2xl font-bold text-primary">
              ${(stats.estimatedMonthlyCommissionCents / 100).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">
              Est. monthly · ${(stats.totalCommissionCents / 100).toFixed(0)} total earned
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invite Clients</CardTitle>
          <CardDescription>
            Share this link with contractors. When they sign up and subscribe, you earn {agency.commissionPercent}% recurring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input readOnly value={agency.inviteLink} className="text-sm" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Code: {agency.inviteCode}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {agency.clients.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No clients yet. Share your invite link to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {agency.clients.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.industry} · {c.plan ?? "Trial"} · Joined {new Date(c.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">${(c.commissionCentsTotal / 100).toFixed(0)} earned</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.status.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
