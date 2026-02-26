import { useEffect, useState } from 'react'
import { getAppointments, cancelAppointment } from '../lib/api'
import { ApiError } from '../lib/api'

interface AppointmentsProps {
  onBack: () => void
}

interface Appt {
  id: string
  callerName?: string
  callerPhone?: string
  scheduledAt?: string
  durationMinutes?: number
  status?: string
  issueDescription?: string
}

export default function Appointments({ onBack }: AppointmentsProps) {
  const [appointments, setAppointments] = useState<Appt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const from = new Date()
      const to = new Date()
      to.setDate(to.getDate() + 14)
      const res = await getAppointments({ from: from.toISOString(), to: to.toISOString() })
      const list = (res.appointments ?? []).filter((a: Appt) => a.status !== 'CANCELLED') as Appt[]
      list.sort((a, b) => (a.scheduledAt && b.scheduledAt ? new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime() : 0))
      setAppointments(list)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(a: Appt) {
    if (!confirm('Cancel this appointment?')) return
    try {
      await cancelAppointment(a.id)
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : String(e))
    }
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Appointments</h1>
        <span />
      </header>
      <div className="page">
        {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" onClick={load}>
              Retry
            </button>
          </div>
        )}
        {!loading && appointments.length === 0 && !error && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming appointments.</p>
        )}
        {appointments.map((a) => (
          <div key={a.id} className="card">
            <div style={{ fontWeight: 600 }}>{a.callerName ?? a.callerPhone ?? '—'}</div>
            {a.scheduledAt && <div style={{ fontSize: 14, marginTop: 4 }}>{formatDate(a.scheduledAt)}</div>}
            {a.issueDescription && <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{a.issueDescription}</div>}
            <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => handleCancel(a)}>
              Cancel
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
