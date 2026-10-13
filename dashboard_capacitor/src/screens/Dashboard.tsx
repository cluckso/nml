import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { acknowledgeForwarding, getDashboard, getReferrals, ApiError } from '../lib/api'
import { formatPhoneForDisplay, resolveCallbackPhone } from '../lib/phone'
import { CallBackButton } from '../components/CallBackButton'
import { CallRecordingButton } from '../components/CallRecordingButton'
import { AppLogo } from '../components/AppLogo'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface DashboardProps {
  onSignOut: () => void
  refreshKey?: number
}

export default function Dashboard({ onSignOut, refreshKey = 0 }: DashboardProps) {
  const [data, setData] = useState<{
    business?: {
      id?: string
      name?: string
      phoneNumber?: string
      retellPhoneNumber?: string | null
      forwardingSetupComplete?: boolean
    }
    recentCalls?: Array<{
      id?: string
      callerName?: string
      callerPhone?: string
      structuredIntake?: unknown
      issueDescription?: string
      summary?: string
      recordingUrl?: string | null
      emergencyFlag?: boolean
      createdAt?: string
    }>
    stats?: { totalCalls?: number; totalMinutes?: number; emergencyInRecent?: number; monthlyLeads?: number }
    hasAgent?: boolean
    trial?: { isOnTrial?: boolean; minutesRemaining?: number; daysRemaining?: number }
  } | null>(null)
  const [referralLink, setReferralLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ackBusy, setAckBusy] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async (isRefresh = false) => {
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
      const res = await getDashboard()
      setData(res)
      try {
        const refs = await getReferrals()
        setReferralLink(refs.referralLink ?? null)
      } catch {
        setReferralLink(null)
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const markForwardingDone = async () => {
    setAckBusy(true)
    try {
      await acknowledgeForwarding()
      await load(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setAckBusy(false)
    }
  }

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
        <h1>
          <AppLogo size={28} />
          CallGrabbr
        </h1>
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
            <button type="button" className="btn btn-outline" onClick={() => void load()} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && data && (
          <>
            {data.trial?.isOnTrial && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Free trial — forward your line</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 12px' }}>
                  {Math.ceil(data.trial.minutesRemaining || 0)} min left
                  {data.trial.daysRemaining ? ` · ${data.trial.daysRemaining} days left` : ''}
                </p>
                {data.business?.retellPhoneNumber && (
                  <p style={{ fontSize: 14, marginBottom: 8 }}>
                    Forward to: <strong>{formatPhoneForDisplay(data.business.retellPhoneNumber)}</strong>
                  </p>
                )}
                {!data.business?.forwardingSetupComplete && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', marginBottom: 8 }}
                    disabled={ackBusy}
                    onClick={() => void markForwardingDone()}
                  >
                    {ackBusy ? 'Saving…' : 'I set up forwarding'}
                  </button>
                )}
                <button type="button" className="btn" style={{ width: '100%' }} onClick={() => navigate('/billing')}>
                  See plans &amp; billing
                </button>
              </div>
            )}

            {data.business && (
              <div className="card">
                <h2 className="section-title">{data.business.name ?? 'Your Business'}</h2>
                {data.business.phoneNumber && (
                  <p style={{ margin: '8px 0', fontSize: 14, color: 'var(--text-muted)' }}>
                    📞 {formatPhoneForDisplay(data.business.phoneNumber)}
                  </p>
                )}
                {data.hasAgent ? (
                  <span className="badge success" style={{ marginTop: 8 }}>
                    ✓ Agent connected
                  </span>
                ) : (
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)' }}>
                    Forward your business line to your CallGrabbr number to start catching leads.
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
                  {data.stats.monthlyLeads !== undefined && (
                    <div className="stat-card">
                      <div className="stat-value" style={{ color: 'var(--success)' }}>{data.stats.monthlyLeads}</div>
                      <div className="stat-label">This month</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {referralLink && (
              <div className="card">
                <h2 className="section-title">Refer a shop</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{referralLink}</p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => void navigator.clipboard?.writeText(referralLink)}
                >
                  Copy referral link
                </button>
              </div>
            )}

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Recent calls</h2>
                {refreshing ? (
                  <div className="loading-spinner" />
                ) : (
                  <button type="button" className="text-link" onClick={() => void load(true)}>
                    Refresh
                  </button>
                )}
              </div>
              {!data.recentCalls?.length && (
                <div className="empty-state">
                  <p>No calls yet</p>
                </div>
              )}
              {data.recentCalls?.slice(0, 5).map((c, i) => {
                const callbackPhone = resolveCallbackPhone(c)
                const phoneLabel = formatPhoneForDisplay(callbackPhone) || callbackPhone
                return (
                  <div
                    key={c.id ?? i}
                    className="call-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => c.id && navigate(`/calls/${c.id}`)}
                    onKeyDown={(e) => {
                      if (c.id && (e.key === 'Enter' || e.key === ' ')) navigate(`/calls/${c.id}`)
                    }}
                    style={{ cursor: c.id ? 'pointer' : undefined }}
                  >
                    <div className="call-header">
                      <div className="call-name">{c.callerName ?? phoneLabel ?? 'Unknown'}</div>
                      <div className="call-time">{formatTime(c.createdAt)}</div>
                    </div>
                    {(c.issueDescription || c.summary) && (
                      <div className="call-description">
                        {(c.issueDescription || c.summary || '').slice(0, 100)}
                        {(c.issueDescription || c.summary || '').length > 100 && '...'}
                      </div>
                    )}
                    <div className="call-actions" onClick={(e) => e.stopPropagation()}>
                      {c.emergencyFlag && <span className="badge error">🚨 Emergency</span>}
                      <CallBackButton phone={callbackPhone} />
                      {c.recordingUrl && <CallRecordingButton url={c.recordingUrl} />}
                    </div>
                  </div>
                )
              })}
              {!!data.recentCalls?.length && (
                <button type="button" className="btn btn-outline" style={{ marginTop: 12, width: '100%' }} onClick={() => navigate('/calls')}>
                  View all calls
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/appointments')}>
                Appointments
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/billing')}>
                Billing
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/settings')}>
                Settings
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/agency')}>
                Partner
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
