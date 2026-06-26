import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppointments, cancelAppointment, ApiError } from '../lib/api'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Array<{
    id: string
    callerName?: string
    callerPhone?: string
    scheduledFor?: string
    status?: string
    notes?: string
    address?: string
  }> | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
      try {
        await Haptics.impact({ style: ImpactStyle.Light })
      } catch {}
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
    load()
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

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'error'
      case 'pending':
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
        {refreshing && <div className="loading-spinner" />}
        {!refreshing && (
          <button
            type="button"
            onClick={() => load(true)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              padding: 8,
              cursor: 'pointer',
            }}
          >
            🔄
          </button>
        )}
      </header>
      <div className="page">
        {loading && !appointments && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" onClick={() => load()} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && appointments && (
          <>
            {appointments.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <p>No appointments scheduled</p>
              </div>
            )}
            {appointments.length > 0 && (
              <>
                {appointments.map((appt) => (
                  <div key={appt.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {appt.callerName ?? appt.callerPhone ?? 'Unknown'}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                          📅 {formatDateTime(appt.scheduledFor)}
                        </div>
                      </div>
                      <span className={`badge ${getStatusColor(appt.status)}`}>
                        {appt.status ?? 'pending'}
                      </span>
                    </div>
                    {appt.address && (
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
                        📍 {appt.address}
                      </div>
                    )}
                    {appt.notes && (
                      <div style={{ fontSize: 14, marginTop: 8, lineHeight: 1.4 }}>
                        {appt.notes.slice(0, 100)}
                        {appt.notes.length > 100 && '...'}
                      </div>
                    )}
                    {appt.status?.toLowerCase() !== 'completed' && appt.status?.toLowerCase() !== 'cancelled' && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleCancel(appt.id)}
                        style={{ marginTop: 12, width: '100%', color: 'var(--error)' }}
                      >
                        Cancel appointment
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
