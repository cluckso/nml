import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../lib/api'
import { ApiError } from '../lib/api'

interface DashboardProps {
  onSignOut: () => void
}

export default function Dashboard({ onSignOut }: DashboardProps) {
  const [data, setData] = useState<{
    business?: { name?: string; phoneNumber?: string }
    recentCalls?: Array<{ callerName?: string; callerPhone?: string; issueDescription?: string; summary?: string; emergencyFlag?: boolean }>
    stats?: { totalCalls?: number; totalMinutes?: number; emergencyInRecent?: number }
    hasAgent?: boolean
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getDashboard()
      setData(res)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <header className="app-bar">
        <h1>CallGrabbr</h1>
        <button type="button" className="btn btn-outline" onClick={onSignOut}>
          Sign out
        </button>
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
        {!loading && !error && data && (
          <>
            {data.business && (
              <div className="card">
                <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Business</h2>
                <p style={{ margin: 0, fontWeight: 600 }}>{data.business.name ?? '—'}</p>
                {data.business.phoneNumber && (
                  <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
                    AI number: {data.business.phoneNumber}
                  </p>
                )}
                {data.hasAgent ? (
                  <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 8px', background: 'var(--primary)', borderRadius: 6, fontSize: 12 }}>
                    Agent connected
                  </span>
                ) : (
                  <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                    Complete setup on the web app to connect your AI agent.
                  </p>
                )}
              </div>
            )}
            {data.stats && (
              <div className="card">
                <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Usage</h2>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.stats.totalCalls ?? 0}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total calls</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Math.ceil(data.stats.totalMinutes ?? 0)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total minutes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>{data.stats.emergencyInRecent ?? 0}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Emergency (recent)</div>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Recent calls</h2>
              {!data.recentCalls?.length && <p style={{ margin: 0, color: 'var(--text-muted)' }}>No calls yet.</p>}
              {data.recentCalls?.slice(0, 5).map((c, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 500 }}>{c.callerName ?? c.callerPhone ?? 'Unknown'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{c.issueDescription ?? c.summary ?? ''}</div>
                  {c.emergencyFlag && <span style={{ color: 'var(--error)', fontSize: 12 }}>Emergency</span>}
                </div>
              ))}
              {data.recentCalls && data.recentCalls.length > 0 && (
                <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate('/calls')}>
                  View all calls
                </button>
              )}
              <button type="button" className="btn btn-outline" style={{ marginTop: 8, marginLeft: 8 }} onClick={() => navigate('/appointments')}>
                Appointments
              </button>
            </div>
            <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => navigate('/settings')}>
              Settings
            </button>
          </>
        )}
      </div>
    </>
  )
}
