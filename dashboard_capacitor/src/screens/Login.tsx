import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { openLegalUrl, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../lib/legal'
import { AppLogo } from '../components/AppLogo'

type LoginProps = {
  supabase: SupabaseClient
}

export default function Login({ supabase }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (err) {
        setError(err.message)
        return
      }
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ paddingTop: 48, maxWidth: 400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <AppLogo size={80} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 4 }}>CallGrabbr</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 8 }}>
        Missed calls answered. Leads texted to you.
      </p>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Sign in to view calls, alerts, billing, and your dashboard.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Email</span>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Password</span>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
        <button type="button" className="text-link" onClick={() => navigate('/welcome')}>
          Back to overview
        </button>
        {' · '}
        <button type="button" className="text-link" onClick={() => navigate('/plans')}>
          See plans
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
        By signing in you agree to our{' '}
        <button
          type="button"
          onClick={() => openLegalUrl(TERMS_OF_SERVICE_URL)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--primary)',
            textDecoration: 'underline',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Terms
        </button>{' '}
        and{' '}
        <button
          type="button"
          onClick={() => openLegalUrl(PRIVACY_POLICY_URL)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--primary)',
            textDecoration: 'underline',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Privacy Policy
        </button>
        .
      </p>
    </div>
  )
}
