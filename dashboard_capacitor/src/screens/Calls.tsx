import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCalls, ApiError } from '../lib/api'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export default function Calls() {
  const [calls, setCalls] = useState<Array<{
    id?: string
    callerName?: string
    callerPhone?: string
    issueDescription?: string
    summary?: string
    emergencyFlag?: boolean
    createdAt?: string
    duration?: number
  }> | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [emergencyFilter, setEmergencyFilter] = useState(false)
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
      const res = await getCalls({ search, emergency: emergencyFilter })
      setCalls(res.calls ?? [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, emergencyFilter])

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Calls</h1>
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
        <div className="card">
          <input
            type="search"
            className="input"
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={emergencyFilter}
              onChange={(e) => setEmergencyFilter(e.target.checked)}
            />
            Show emergency only
          </label>
        </div>

        {loading && !calls && (
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
        {!loading && !error && calls && (
          <>
            {calls.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📞</div>
                <p>No calls found</p>
              </div>
            )}
            {calls.length > 0 && (
              <div className="card">
                {calls.map((c, i) => (
                  <div key={c.id ?? i} className="call-item">
                    <div className="call-header">
                      <div className="call-name">{c.callerName ?? c.callerPhone ?? 'Unknown'}</div>
                      <div className="call-time">{formatTime(c.createdAt)}</div>
                    </div>
                    {c.duration !== undefined && c.duration > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Duration: {formatDuration(c.duration)}
                      </div>
                    )}
                    {(c.issueDescription || c.summary) && (
                      <div className="call-description">
                        {(c.issueDescription || c.summary || '').slice(0, 150)}
                        {(c.issueDescription || c.summary || '').length > 150 && '...'}
                      </div>
                    )}
                    {c.emergencyFlag && (
                      <span className="badge error" style={{ marginTop: 6 }}>
                        🚨 Emergency
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
