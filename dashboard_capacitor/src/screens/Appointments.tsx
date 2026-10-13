import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointments, cancelAppointment, createAppointment, ApiError } from '../lib/api'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

type Appt = {
  id: string
  callerName?: string | null
  callerPhone?: string | null
  scheduledAt?: string
  status?: string
  notes?: string | null
  issueDescription?: string | null
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appt[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [callerName, setCallerName] = useState('')
  const [callerPhone, setCallerPhone] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()

  const load = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
      try {
        await Haptics.impact({ style: ImpactStyle.Light })
      } catch {
        // ignore
      }
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const res = await getAppointments()
      setAppointments(res.appointments ?? [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
      await cancelAppointment(id)
      await load(true)
    } catch (e) {
      alert(e instanceof ApiError ? e.message : String(e))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt) {
      setError('Pick a date and time.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createAppointment({
        callerName: callerName.trim() || undefined,
        callerPhone: callerPhone.trim() || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes.trim() || undefined,
      })
      setShowCreate(false)
      setCallerName('')
      setCallerPhone('')
      setScheduledAt('')
      setNotes('')
      await load(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'warning'
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Appointments</h1>
        {refreshing ? (
          <div className="loading-spinner" />
        ) : (
          <button type="button" className="text-link" onClick={() => setShowCreate((v) => !v)} style={{ padding: 8 }}>
            {showCreate ? 'Close' : 'New'}
          </button>
        )}
      </header>
      <div className="page">
        {showCreate && (
          <form className="card" onSubmit={handleCreate}>
            <h2 className="section-title">New appointment</h2>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Caller name</span>
              <input className="input" value={callerName} onChange={(e) => setCallerName(e.target.value)} />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Phone</span>
              <input className="input" type="tel" value={callerPhone} onChange={(e) => setCallerPhone(e.target.value)} />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>When</span>
              <input
                className="input"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Notes</span>
              <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button type="submit" className="btn" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving…' : 'Create'}
            </button>
          </form>
        )}

        {loading && !appointments && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" onClick={() => void load()} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && appointments && (
          <>
            {appointments.length === 0 && !showCreate && (
              <div className="empty-state">
                <p>No appointments scheduled</p>
                <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}>
                  Create one
                </button>
              </div>
            )}
            {appointments.map((appt) => (
              <div key={appt.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {appt.callerName ?? appt.callerPhone ?? 'Unknown'}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                      {formatDateTime(appt.scheduledAt)}
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(appt.status)}`}>{appt.status ?? 'PENDING'}</span>
                </div>
                {appt.notes && <div style={{ fontSize: 14, marginTop: 8 }}>{appt.notes}</div>}
                {appt.status?.toUpperCase() !== 'COMPLETED' && appt.status?.toUpperCase() !== 'CANCELLED' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => void handleCancel(appt.id)}
                    style={{ marginTop: 12, width: '100%', color: 'var(--error)' }}
                  >
                    Cancel appointment
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}
