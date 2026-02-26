import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'
import type { Session } from '@supabase/supabase-js'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Calls from './screens/Calls'
import Appointments from './screens/Appointments'
import Settings from './screens/Settings'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase?.auth.signOut()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 48, textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  if (!supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <div className="page" style={{ paddingTop: 48 }}>
        <div className="card">
          <p>Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or build args.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard onSignOut={signOut} />} />
      <Route path="/calls" element={<Calls onBack={() => navigate('/')} />} />
      <Route path="/appointments" element={<Appointments onBack={() => navigate('/')} />} />
      <Route path="/settings" element={<Settings onBack={() => navigate('/')} />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
