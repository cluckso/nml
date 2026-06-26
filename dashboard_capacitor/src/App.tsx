import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'
import { registerPushNotifications } from './lib/notifications'
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

  useEffect(() => {
    if (session) {
      registerPushNotifications(
        (token) => {
          console.log('[App] Push token registered:', token)
          import('./lib/api').then(({ savePushToken }) => {
            savePushToken(token).catch(console.error)
          })
        },
        (notification) => {
          console.log('[App] Notification received in foreground:', notification)
        },
        (action) => {
          console.log('[App] Notification action:', action)
          if (action.notification.data?.route) {
            navigate(action.notification.data.route)
          }
        }
      )
    }
  }, [session, navigate])

  const handleSignOut = async () => {
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
      <Route path="/" element={<Dashboard onSignOut={handleSignOut} />} />
      <Route path="/calls" element={<Calls />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/settings" element={<Settings onSignOut={handleSignOut} />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
