"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Plus, Loader2, Lock } from "lucide-react"
import { PLAN_GROWTH } from "@/lib/plan-labels"

interface Appointment {
  id: string
  callerName: string | null
  callerPhone: string | null
  scheduledAt: string
  durationMinutes: number
  status: string
  issueDescription: string | null
  notes: string | null
}

type BookingAccess = "loading" | "allowed" | "upgrade" | "error"

export default function AppointmentsPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [bookingAccess, setBookingAccess] = useState<BookingAccess>("loading")

  const from = weekStart
  const to = addDays(weekStart, 13)

  useEffect(() => {
    let cancelled = false
    async function checkPlan() {
      try {
        const res = await fetch("/api/billing/summary")
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setBookingAccess("error")
          return
        }
        const plan = data?.plan?.planType ?? null
        const allowed =
          plan === "PRO" || plan === "ELITE" || plan === "LOCAL_PLUS"
        setBookingAccess(allowed ? "allowed" : "upgrade")
      } catch {
        if (!cancelled) setBookingAccess("error")
      }
    }
    void checkPlan()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/appointments?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      const data = await res.json()
      if (res.ok) {
        setAppointments(data.appointments ?? [])
      } else {
        setError(data.error ?? "Failed to load")
      }
    } catch {
      setError("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }, [from.toISOString(), to.toISOString()])

  useEffect(() => {
    if (bookingAccess === "allowed" || bookingAccess === "upgrade") {
      fetchAppointments()
    }
  }, [fetchAppointments, bookingAccess])

  const prevWeek = () => setWeekStart((d) => addDays(d, -7))
  const nextWeek = () => setWeekStart((d) => addDays(d, 7))
  const today = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i))
  const appointmentsByDay = days.reduce((acc, d) => {
    acc[d.toISOString().slice(0, 10)] = appointments.filter((a) =>
      isSameDay(parseISO(a.scheduledAt), d)
    )
    return acc
  }, {} as Record<string, Appointment[]>)

  if (bookingAccess === "loading") {
    return (
      <div className="container mx-auto max-w-7xl py-6 px-4 flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (bookingAccess === "error") {
    return (
      <div className="container mx-auto max-w-lg py-12 px-4">
        <Card className="border-destructive/50">
          <CardContent className="pt-6 space-y-3">
            <p className="text-destructive">Could not load appointment access. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingAccess === "upgrade") {
    return (
      <div className="container mx-auto max-w-lg py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Appointment booking on {PLAN_GROWTH}+</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your AI can offer times and book jobs when you&apos;re on {PLAN_GROWTH} or higher.
              Upgrade to unlock the calendar and booking controls.
            </p>
            {appointments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                You have {appointments.length} appointment{appointments.length === 1 ? "" : "s"} on file
                from past calls — upgrade to manage them here.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/billing">Upgrade on Billing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <span className="text-sm font-medium min-w-[180px] text-center">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 13), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button size="sm" onClick={() => setShowNewForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 mb-6">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchAppointments}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {showNewForm && (
        <NewAppointmentForm
          onCreated={() => {
            setShowNewForm(false)
            fetchAppointments()
          }}
          onCancel={() => setShowNewForm(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : appointments.length === 0 && !showNewForm ? (
        <Card className="mb-6">
          <CardContent className="py-12 text-center space-y-3">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No appointments yet</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Booked jobs from calls and manual entries will show up here. Create one, or wait for
              your assistant to schedule a caller.
            </p>
            <Button size="sm" onClick={() => setShowNewForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-7 lg:grid-cols-14 gap-2">
          {days.map((day) => (
            <Card key={day.toISOString()} className="min-h-[140px]">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {format(day, "EEE M/d")}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-1 px-3 space-y-2">
                {(appointmentsByDay[day.toISOString().slice(0, 10)] ?? []).map((a) => (
                  <AppointmentCard key={a.id} appointment={a} onUpdate={fetchAppointments} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  appointment,
  onUpdate,
}: {
  appointment: Appointment
  onUpdate: () => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const time = format(parseISO(appointment.scheduledAt), "h:mm a")
  const isCancelled = appointment.status === "CANCELLED"

  const handleCancel = async () => {
    if (!confirm("Cancel this appointment?")) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, { method: "DELETE" })
      if (res.ok) onUpdate()
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div
      className={`rounded-lg border p-2 text-xs ${
        isCancelled ? "opacity-50 line-through bg-muted/50" : "bg-card"
      }`}
    >
      <p className="font-medium truncate">{time}</p>
      <p className="truncate text-muted-foreground">
        {appointment.callerName ?? appointment.callerPhone ?? "—"}
      </p>
      {!isCancelled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-xs mt-1"
          onClick={handleCancel}
          disabled={cancelling}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}

function NewAppointmentForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([])
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({
    callerName: "",
    callerPhone: "",
    scheduledAt: "",
    durationMinutes: 60,
  })

  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    fetch(`/api/appointments/available-slots?date=${date}&duration=60`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots ?? [])
      })
      .finally(() => setLoadingSlots(false))
  }, [date])

  const [formError, setFormError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.scheduledAt) return
    setSaving(true)
    setFormError(null)
    setUpgradeRequired(false)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerName: form.callerName.trim() || null,
          callerPhone: form.callerPhone.trim() || null,
          scheduledAt: form.scheduledAt,
          durationMinutes: form.durationMinutes,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        onCreated()
      } else {
        setUpgradeRequired(!!data.upgradeRequired)
        setFormError(data.error ?? "Failed to create appointment. Please try again.")
      }
    } catch {
      setFormError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">New appointment</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Close
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-sm font-medium block mb-1">Name</span>
              <input
                type="text"
                value={form.callerName}
                onChange={(e) => setForm((f) => ({ ...f, callerName: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Caller name"
              />
            </label>
            <label>
              <span className="text-sm font-medium block mb-1">Phone</span>
              <input
                type="tel"
                value={form.callerPhone}
                onChange={(e) => setForm((f) => ({ ...f, callerPhone: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="+1..."
              />
            </label>
          </div>
          <div>
            <span className="text-sm font-medium block mb-1">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <span className="text-sm font-medium block mb-1">Time slot</span>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Loading slots…</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No slots available</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.slice(0, 12).map((s) => {
                  const label = format(parseISO(s.start), "h:mm a")
                  return (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, scheduledAt: s.start }))}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${
                        form.scheduledAt === s.start
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {formError && (
            <div className="space-y-2" role="alert">
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {formError}
              </p>
              {upgradeRequired && (
                <Button asChild size="sm">
                  <Link href="/billing">Upgrade to {PLAN_GROWTH}</Link>
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !form.scheduledAt}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Create
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
