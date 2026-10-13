import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { acceptTerms } from '../lib/api'
import { openLegalUrl, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../lib/legal'
import { AppLogo } from '../components/AppLogo'

type Props = { supabase: SupabaseClient }

export default function SignUp({ supabase }: Props) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes('@')) {
      setError('Enter a valid email.')
      return
    }
    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!agreed) {
      setError('Agree to the Terms of Service and Privacy Policy to continue.')
      return
    }

    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: trimmed,
        password: password.trim(),
        options: {
          data: { terms_accepted_at: new Date().toISOString() },
        },
      })
      if (err) {
        setError(err.message)
        return
      }
      void acceptTerms().catch(() => {})
      if (data.session) {
        navigate('/trial/start', { replace: true })
        return
      }
      setSuccess(
        `Check ${trimmed} for a confirmation link, then sign in to start your trial.`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <AppLogo size={56} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 4, fontSize: '1.35rem' }}>Create account</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Free trial — no card. Same account on web and this app.
      </p>

      {success ? (
        <div className="card card-compact">
          <p style={{ marginBottom: 12 }}>{success}</p>
          <button type="button" className="btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Go to sign in
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
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Password</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, fontSize: 13 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              I agree to the{' '}
              <button type="button" className="text-link" onClick={() => openLegalUrl(TERMS_OF_SERVICE_URL)}>
                Terms
              </button>{' '}
              and{' '}
              <button type="button" className="text-link" onClick={() => openLegalUrl(PRIVACY_POLICY_URL)}>
                Privacy Policy
              </button>
              .
            </span>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
        <button type="button" className="text-link" onClick={() => navigate('/login')}>
          Already have an account? Sign in
        </button>
      </p>
    </div>
  )
}
