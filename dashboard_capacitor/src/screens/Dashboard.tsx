import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../lib/api'
import { ApiError } from '../lib/api'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface DashboardProps {
  onSignOut: () => void
}

export default function Dashboard({ onSignOut }: DashboardProps) {
  const [data, setData] = useState<{
    business?: { name?: string; phoneNumber?: string }
    recentCalls?: Array<{
      callerName?: string
      callerPhone?: string
      issueDescription?: string
      summary?: string
      emergencyFlag?: boolean
      createdAt?: string
    }>
    stats?: { totalCalls?: number; totalMinutes?: number; emergencyInRecent?: number; monthlyLeads?: number }
    hasAgent?: boolean
    trial?: { isOnTrial?: boolean; minutesRemaining?: number; daysRemaining?: number }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async (isRefresh = false) => {
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
      const res = await getDashboard()
      setData(res)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

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

  return (
    <>
      <header className="app-bar">
        <h1>CallGrabbr</h1>
        <button type="button" className="btn btn-outline" onClick={onSignOut} style={{ padding: '6px 12px' }}>
          Sign out
        </button>
      </header>
      <div className="page">
        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
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
        {!loading && !error && data && (
          <>
            {data.trial?.isOnTrial && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <h2 className="section-title" style={{ margin: 0 }}>Free Trial Active</h2>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                      {Math.ceil(data.trial.minutesRemaining || 0)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>min left</div>
                  </div>
                  {data.trial.daysRemaining !== undefined && data.trial.daysRemaining > 0 && (
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                        {data.trial.daysRemaining}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>days left</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.business && (
              <div className="card">
                <h2 className="section-title">{data.business.name ?? 'Your Business'}</h2>
                {data.business.phoneNumber && (
                  <p style={{ margin: '8px 0', fontSize: 14, color: 'var(--text-muted)' }}>
                    📞 {data.business.phoneNumber}
                  </p>
                )}
                {data.hasAgent ? (
                  <span className="badge success" style={{ marginTop: 8 }}>
                    ✓ Agent connected
                  </span>
                ) : (
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                    Complete setup on the web app to connect your AI agent.
                  </p>
                )}
              </div>
            )}

            {data.stats && (
              <div className="card">
                <h2 className="section-title">Usage</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 16 }}>
                  <div className="stat-card">
                    <div className="stat-value">{data.stats.totalCalls ?? 0}</div>
                    <div className="stat-label">Total calls</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.ceil(data.stats.totalMinutes ?? 0)}</div>
                    <div className="stat-label">Minutes</div>
                  </div>
                  {data.stats.emergencyInRecent !== undefined && data.stats.emergencyInRecent > 0 && (
                    <div className="stat-card">
                      <div className="stat-value" style={{ color: 'var(--error)' }}>
                        {data.stats.emergencyInRecent}
                      </div>
                      <div className="stat-label">Urgent</div>
                    </div>
                  )}
                  {data.stats.monthlyLeads !== undefined && (
                    <div className="stat-card">
                      <div className="stat-value" style={{ color: 'var(--success)' }}>{data.stats.monthlyLeads}</div>
                      <div className="stat-label">This month</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Recent calls</h2>
                {refreshing && <div className="loading-spinner" />}
                {!refreshing && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => load(true)}
                    style={{
                      padding: '4px 8px',
                      fontSize: 12,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--primary)',
                    }}
                  >
                    Refresh
                  </button>
                )}
              </div>
              {!data.recentCalls?.length && (
                <div className="empty-state">
                  <div className="empty-state-icon">📞</div>
                  <p>No calls yet</p>
                </div>
              )}
              {data.recentCalls?.slice(0, 5).map((c, i) => (
                <div key={i} className="call-item">
                  <div className="call-header">
                    <div className="call-name">{c.callerName ?? c.callerPhone ?? 'Unknown'}</div>
                    <div className="call-time">{formatTime(c.createdAt)}</div>
                  </div>
                  {(c.issueDescription || c.summary) && (
                    <div className="call-description">
                      {(c.issueDescription || c.summary || '').slice(0, 100)}
                      {(c.issueDescription || c.summary || '').length > 100 && '...'}
                    </div>
                  )}
                  {c.emergencyFlag && (
                    <span className="badge error" style={{ marginTop: 6 }}>
                      🚨 Emergency
                    </span>
                  )}
                </div>
              ))}
              {data.recentCalls && data.recentCalls.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={() => navigate('/calls')}
                >
                  View all calls
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/appointments')}>
                📅 Appointments
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/settings')}>
                ⚙️ Settings
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
