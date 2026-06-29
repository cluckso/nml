import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { getSupabase } from './lib/supabase'
import { registerPushNotifications } from './lib/notifications'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Calls from './screens/Calls'
import Appointments from './screens/Appointments'
import Settings from './screens/Settings'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    let active = true
    let subscription: { unsubscribe: () => void } | null = null

    async function init() {
      try {
        const client = await getSupabase()
        if (!active) return
        setSupabase(client)
        const { data: { session } } = await client.auth.getSession()
        if (!active) return
        setSession(session)
        const { data: { subscription: authSub } } = client.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession)
        })
        subscription = authSub
      } catch (error) {
        if (!active) return
        setConfigError(error instanceof Error ? error.message : 'Could not load app configuration')
      } finally {
        if (active) setLoading(false)
      }
    }

    void init()
    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return

    void registerPushNotifications(
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
        const route = action.notification.data?.route
        if (typeof route === 'string' && route.length > 0) {
          navigateRef.current(route)
        }
      }
    )
  }, [session])

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

  if (configError || !supabase) {
    return (
      <div className="page" style={{ paddingTop: 48 }}>
        <div className="card">
          <p>Could not connect to CallGrabbr.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
            {configError || 'Supabase configuration is missing. Check your network connection and try again.'}
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login supabase={supabase} />} />
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
