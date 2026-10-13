import { useEffect, useState, useRef, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { getSupabase } from './lib/supabase'
import { registerPushNotifications } from './lib/notifications'
import { getActivation, sanitizeApiMessage, savePushToken } from './lib/api'
import { AppLogo } from './components/AppLogo'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import Login from './screens/Login'
import SignUp from './screens/SignUp'
import ForgotPassword from './screens/ForgotPassword'
import Welcome from './screens/Welcome'
import Plans from './screens/Plans'
import Billing from './screens/Billing'
import Dashboard from './screens/Dashboard'
import Calls from './screens/Calls'
import CallDetail from './screens/CallDetail'
import Appointments from './screens/Appointments'
import Settings from './screens/Settings'
import SettingsSection from './screens/SettingsSection'
import TrialStart from './screens/TrialStart'
import Onboarding from './screens/Onboarding'
import Agency from './screens/Agency'

type Gate = 'loading' | 'trial' | 'onboarding' | 'ready' | 'error'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  const [gate, setGate] = useState<Gate>('loading')
  const [gateError, setGateError] = useState<string | null>(null)
  const [billingRefreshKey, setBillingRefreshKey] = useState(0)
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  const refreshGate = useCallback(async () => {
    if (!session) {
      setGate('loading')
      return
    }
    setGateError(null)
    try {
      const activation = await getActivation()
      if (activation.needsTrialStart) setGate('trial')
      else if (activation.needsOnboarding) setGate('onboarding')
      else setGate('ready')
    } catch (e) {
      setGate('error')
      const raw = e instanceof Error ? e.message : 'Could not load account status'
      setGateError(sanitizeApiMessage(raw))
    }
  }, [session])

  useEffect(() => {
    let active = true
    let subscription: { unsubscribe: () => void } | null = null

    async function init() {
      try {
        const client = await getSupabase()
        if (!active) return
        setSupabase(client)
        const { data: { session: current } } = await client.auth.getSession()
        if (!active) return
        setSession(current)
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
    if (!session) {
      setGate('loading')
      return
    }
    void refreshGate()
  }, [session, refreshGate])

  useEffect(() => {
    if (!session) return

    void registerPushNotifications(
      (token) => {
        savePushToken(token).catch(console.error)
      },
      () => {},
      (action) => {
        const route = action.notification.data?.route
        if (typeof route === 'string' && route.length > 0) {
          navigateRef.current(route)
        }
      }
    )
  }, [session])

  useEffect(() => {
    let handle: { remove: () => Promise<void> } | undefined
    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive || !session) return
      setBillingRefreshKey((k) => k + 1)
      void refreshGate()
    }).then((h) => {
      handle = h
    })
    return () => {
      void handle?.remove()
    }
  }, [session, refreshGate])

  const handleSignOut = async () => {
    await supabase?.auth.signOut()
    navigate('/welcome', { replace: true })
  }

  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 48, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <AppLogo size={64} />
        </div>
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
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/login" element={<Login supabase={supabase} />} />
        <Route path="/signup" element={<SignUp supabase={supabase} />} />
        <Route path="/forgot-password" element={<ForgotPassword supabase={supabase} />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    )
  }

  if (gate === 'loading') {
    return (
      <div className="page" style={{ paddingTop: 48, textAlign: 'center' }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (gate === 'error') {
    return (
      <div className="page auth-page">
        <div className="card">
          <p className="error" style={{ wordBreak: 'break-word' }}>
            {gateError || 'Something went wrong'}
          </p>
          <button type="button" className="btn" style={{ marginTop: 12, width: '100%' }} onClick={() => void refreshGate()}>
            Retry
          </button>
          <button type="button" className="btn btn-outline" style={{ marginTop: 8, width: '100%' }} onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (gate === 'trial') {
    return (
      <Routes>
        <Route path="/trial/start" element={<TrialStart onComplete={refreshGate} />} />
        <Route path="*" element={<Navigate to="/trial/start" replace />} />
      </Routes>
    )
  }

  if (gate === 'onboarding') {
    return (
      <Routes>
        <Route
          path="/onboarding"
          element={<Onboarding onComplete={refreshGate} onNeedsTrial={() => setGate('trial')} />}
        />
        <Route path="/trial/start" element={<Navigate to="/onboarding" replace />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard onSignOut={handleSignOut} refreshKey={billingRefreshKey} />} />
      <Route path="/calls" element={<Calls />} />
      <Route path="/calls/:id" element={<CallDetail />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/billing" element={<Billing refreshKey={billingRefreshKey} />} />
      <Route path="/settings" element={<Settings onSignOut={handleSignOut} />} />
      <Route path="/settings/:section" element={<SettingsSection />} />
      <Route path="/agency" element={<Agency />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />
      <Route path="/trial/start" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
