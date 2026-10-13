import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, createAgency, getAgency, startAgencyConnect } from '../lib/api'
import { openExternalUrl } from '../lib/site'

export default function Agency() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [agency, setAgency] = useState<Record<string, unknown> | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAgency()
      setAgency(res.agency ?? null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const create = async () => {
    if (!name.trim()) {
      setError('Enter a partner / agency name.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createAgency(name.trim())
      await load()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const connect = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await startAgencyConnect()
      if (res.url) openExternalUrl(res.url)
      else setError('Could not start Stripe Connect.')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const clients = Array.isArray(agency?.clients) ? (agency.clients as Array<Record<string, unknown>>) : []
  const stats = (agency?.stats as Record<string, unknown>) || {}

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/settings')}>
          ← Back
        </button>
        <h1>Partner</h1>
        <div style={{ width: 32 }} />
      </header>
      <div className="page">
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {!loading && !agency && (
          <div className="card">
            <h2 className="section-title">Become a partner</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
              Invite shops, earn commissions when they subscribe.
            </p>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Agency name</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <button type="button" className="btn" style={{ width: '100%' }} disabled={saving} onClick={() => void create()}>
              {saving ? 'Creating…' : 'Create partner profile'}
            </button>
          </div>
        )}
        {!loading && agency && (
          <>
            <div className="card">
              <h2 className="section-title">{String(agency.name)}</h2>
              <p style={{ fontSize: 14 }}>Invite code: <strong>{String(agency.inviteCode)}</strong></p>
              {typeof agency.inviteLink === 'string' && (
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 12 }} onClick={() => openExternalUrl(String(agency.inviteLink))}>
                  Open invite link
                </button>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                Commission: {String(agency.commissionPercent ?? '')}%
                {agency.payoutsEnabled ? ' · Payouts enabled' : ' · Connect Stripe to get paid'}
              </p>
              {!agency.payoutsEnabled && (
                <button type="button" className="btn" style={{ width: '100%', marginTop: 12 }} disabled={saving} onClick={() => void connect()}>
                  {saving ? 'Opening…' : 'Connect Stripe payouts'}
                </button>
              )}
            </div>

            <div className="card">
              <h2 className="section-title">Stats</h2>
              <p style={{ fontSize: 14 }}>
                Clients: {String(stats.clientCount ?? clients.length)} · Earned:{' '}
                {typeof stats.earnedCents === 'number' ? `$${(stats.earnedCents / 100).toFixed(2)}` : '—'}
              </p>
            </div>

            <div className="card">
              <h2 className="section-title">Clients</h2>
              {clients.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No clients yet. Share your invite link.</p>
              ) : (
                <ul className="feature-list">
                  {clients.map((c) => (
                    <li key={String(c.id)}>
                      {String(c.name)} · {String(c.plan ?? '—')} · {String(c.status)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
