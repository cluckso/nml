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
    <div className="page auth-page">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <AppLogo size={56} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 4, fontSize: '1.35rem' }}>CallGrabbr</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Sign in to calls, alerts, billing, and settings.
      </p>
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
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
        <button type="button" className="text-link" onClick={() => navigate('/forgot-password')}>
          Forgot password?
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
        <button type="button" className="text-link" onClick={() => navigate('/signup')}>
          Create account
        </button>
        {' · '}
        <button type="button" className="text-link" onClick={() => navigate('/welcome')}>
          Overview
        </button>
        {' · '}
        <button type="button" className="text-link" onClick={() => navigate('/plans')}>
          Plans
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
        By signing in you agree to our{' '}
        <button type="button" className="text-link" onClick={() => openLegalUrl(TERMS_OF_SERVICE_URL)}>
          Terms
        </button>{' '}
        and{' '}
        <button type="button" className="text-link" onClick={() => openLegalUrl(PRIVACY_POLICY_URL)}>
          Privacy Policy
        </button>
        .
      </p>
    </div>
  )
}
