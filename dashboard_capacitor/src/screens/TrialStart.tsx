import { useState } from 'react'
import { ApiError, startTrial } from '../lib/api'
import { AppLogo } from '../components/AppLogo'

type Props = { onComplete: () => Promise<void> }

export default function TrialStart({ onComplete }: Props) {
  const [businessPhone, setBusinessPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const phone = businessPhone.trim()
    if (!phone) {
      setError('Enter your business phone number.')
      return
    }
    setLoading(true)
    try {
      await startTrial({ businessPhone: phone })
      await onComplete()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ paddingTop: 32, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <AppLogo size={64} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Start your free trial</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Enter the number customers already call. No card required.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Business phone</span>
          <input
            type="tel"
            className="input"
            value={businessPhone}
            onChange={(e) => setBusinessPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            required
            autoComplete="tel"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Starting…' : 'Continue to setup'}
        </button>
      </form>
    </div>
  )
}
