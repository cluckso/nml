import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SITE_ORIGIN } from '../lib/site'
import { AppLogo } from '../components/AppLogo'

type Props = { supabase: SupabaseClient }

export default function ForgotPassword({ supabase }: Props) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${SITE_ORIGIN}/reset-password`,
      })
      if (err) {
        setError(err.message)
        return
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <AppLogo size={56} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 6, fontSize: '1.35rem' }}>Reset password</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        We&apos;ll email a link to set a new password for web and this app.
      </p>

      {success ? (
        <div className="card card-compact">
          <p style={{ marginBottom: 12 }}>If an account exists for that email, a reset link is on the way.</p>
          <button type="button" className="btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Email</span>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
        <button type="button" className="text-link" onClick={() => navigate('/login')}>
          Back to sign in
        </button>
      </p>
    </div>
  )
}
