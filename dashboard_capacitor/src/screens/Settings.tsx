import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, deleteAccount, getSettings, patchSettings } from '../lib/api'
import { SECTION_LABELS } from '../lib/industries'
import { openLegalUrl, PRIVACY_POLICY_URL, SMS_TERMS_URL, TERMS_OF_SERVICE_URL } from '../lib/legal'
import { formatPhoneForDisplay } from '../lib/phone'

interface SettingsProps {
  onSignOut: () => void
}

export default function Settings({ onSignOut }: SettingsProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [allowedSections, setAllowedSections] = useState<string[]>([])
  const [planType, setPlanType] = useState<string | null>(null)
  const [notificationPhone, setNotificationPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [businessPhone, setBusinessPhone] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSettings()
      setAllowedSections(res.allowedSections ?? [])
      setPlanType(res.planType ?? null)
      setNotificationPhone(res.notificationPhone ?? '')
      setSmsConsent(!!res.smsConsent)
      setBusinessPhone(res.businessPhone ?? null)
      setIndustry(res.industry ?? null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const saveContact = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await patchSettings({
        notificationPhone: notificationPhone.trim() || null,
        smsConsent,
      })
      setSuccess('Contact prefs saved — synced with the website.')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete your CallGrabbr account and business data? This cannot be undone.')) return
    if (!confirm('Type confirm mentally: delete everything. Continue?')) return
    setSaving(true)
    setError(null)
    try {
      await deleteAccount()
      onSignOut()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
      setSaving(false)
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Settings</h1>
        <div style={{ width: 32 }} />
      </header>
      <div className="page">
        {loading && (
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
        {!loading && !error && (
          <>
            <div className="card">
              <h2 className="section-title">Your line</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
                Plan: {planType ?? '—'}
                {industry ? ` · ${industry}` : ''}
              </p>
              <p style={{ fontSize: 15 }}>
                Business phone:{' '}
                <strong>{businessPhone ? formatPhoneForDisplay(businessPhone) : 'Not set'}</strong>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                Changes here sync instantly with callgrabbr.com.
              </p>
            </div>

            <div className="card">
              <h2 className="section-title">Lead alerts</h2>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Notification phone</span>
                <input
                  className="input"
                  type="tel"
                  value={notificationPhone}
                  onChange={(e) => setNotificationPhone(e.target.value)}
                />
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, fontSize: 13 }}>
                <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} />
                <span>SMS lead alerts (reply STOP to opt out)</span>
              </label>
              {success && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 8 }}>{success}</p>}
              <button type="button" className="btn" style={{ width: '100%' }} disabled={saving} onClick={() => void saveContact()}>
                {saving ? 'Saving…' : 'Save contact prefs'}
              </button>
            </div>

            <div className="card">
              <h2 className="section-title">Assistant settings</h2>
              {allowedSections.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No sections available for your plan.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {allowedSections.map((section) => (
                    <li key={section}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ width: '100%', marginBottom: 8, textAlign: 'left' }}
                        onClick={() => navigate(`/settings/${section}`)}
                      >
                        {SECTION_LABELS[section] ?? section}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2 className="section-title">More</h2>
              <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={() => navigate('/agency')}>
                Partner / agency
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={() => navigate('/billing')}>
                Billing
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: 8 }} onClick={onSignOut}>
                Sign out
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%', color: 'var(--error)' }} disabled={saving} onClick={() => void handleDelete()}>
                Delete account
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              <button type="button" className="text-link" onClick={() => openLegalUrl(TERMS_OF_SERVICE_URL)}>
                Terms
              </button>
              {' · '}
              <button type="button" className="text-link" onClick={() => openLegalUrl(PRIVACY_POLICY_URL)}>
                Privacy
              </button>
              {' · '}
              <button type="button" className="text-link" onClick={() => openLegalUrl(SMS_TERMS_URL)}>
                SMS terms
              </button>
            </p>
          </>
        )}
      </div>
    </>
  )
}
