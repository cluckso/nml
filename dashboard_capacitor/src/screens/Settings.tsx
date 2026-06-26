import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, patchSettings, ApiError } from '../lib/api'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface SettingsProps {
  onSignOut: () => void
}

export default function Settings({ onSignOut }: SettingsProps) {
  const [settings, setSettings] = useState<{ notificationsEnabled?: boolean; emergencyAlertsOnly?: boolean } | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSettings()
      setSettings(res)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggle = async (key: string, value: boolean) => {
    if (!settings) return
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
      setSaving(true)
      const updated = { ...settings, [key]: value }
      await patchSettings({ [key]: value })
      setSettings(updated)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
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
        {loading && !settings && (
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
        {!loading && !error && settings && (
          <>
            <div className="card">
              <h2 className="section-title">Notifications</h2>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 14 }}>Enable push notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled ?? true}
                  onChange={(e) => handleToggle('notificationsEnabled', e.target.checked)}
                  disabled={saving}
                  style={{ width: 20, height: 20 }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <span style={{ fontSize: 14 }}>Emergency alerts only</span>
                <input
                  type="checkbox"
                  checked={settings.emergencyAlertsOnly ?? false}
                  onChange={(e) => handleToggle('emergencyAlertsOnly', e.target.checked)}
                  disabled={saving}
                  style={{ width: 20, height: 20 }}
                />
              </label>
            </div>

            <div className="card">
              <h2 className="section-title">Account</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                For full settings and business configuration, visit the web dashboard.
              </p>
              <button type="button" className="btn" onClick={onSignOut} style={{ width: '100%' }}>
                Sign out
              </button>
            </div>

            <div className="card" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--primary)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                <p>CallGrabbr Mobile v1.0.0</p>
                <p style={{ marginTop: 4 }}>App ID: com.me.adhd</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
