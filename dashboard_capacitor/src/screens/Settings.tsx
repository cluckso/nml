import { useEffect, useState } from 'react'
import { getSettings, patchSettings } from '../lib/api'
import { ApiError } from '../lib/api'

interface SettingsProps {
  onBack: () => void
}

export default function Settings({ onBack }: SettingsProps) {
  const [data, setData] = useState<{
    planType?: string
    notificationPhone?: string
    smsConsent?: boolean
  } | null>(null)
  const [phone, setPhone] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getSettings()
      setData(res)
      setPhone(res.notificationPhone ?? '')
      setSmsConsent(res.smsConsent ?? false)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function savePhone() {
    setSaving(true)
    try {
      await patchSettings({ notificationPhone: phone.trim() })
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function saveSmsConsent(value: boolean) {
    setSaving(true)
    try {
      await patchSettings({ smsConsent: value })
      setSmsConsent(value)
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Settings</h1>
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
        {!loading && data && (
          <>
            {data.planType && (
              <div className="card">
                <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Plan</h2>
                <p style={{ margin: 0 }}>{data.planType.toUpperCase()}</p>
              </div>
            )}
            <div className="card">
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Notifications</h2>
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Notification phone</span>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1..."
                />
              </label>
              <button type="button" className="btn" onClick={savePhone} disabled={saving}>
                Save phone
              </button>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="sms"
                  checked={smsConsent}
                  onChange={(e) => saveSmsConsent(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="sms">SMS alerts (call summaries)</label>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Full settings available on the web dashboard.</p>
          </>
        )}
      </div>
    </>
  )
}
