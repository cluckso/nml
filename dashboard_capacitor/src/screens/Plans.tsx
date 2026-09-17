import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicPricing, type PublicPricing } from '../lib/api'
import { openExternalUrl, TRIAL_START_URL } from '../lib/site'

export default function Plans() {
  const navigate = useNavigate()
  const [data, setData] = useState<PublicPricing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getPublicPricing()
      .then((pricing) => {
        if (!active) return
        setData(pricing)
        setError(null)
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Could not load plans')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Plans</h1>
        <div style={{ width: 32 }} />
      </header>
      <div className="page">
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && data && (
          <>
            <p className="marketing-sub" style={{ marginTop: 0 }}>
              {data.marketing.trialSummary}
            </p>
            {data.plans.length === 0 && (
              <div className="empty-state">
                <p>Plans are not available right now.</p>
              </div>
            )}
            {data.plans.map((plan) => (
              <div key={plan.planType} className={`card plan-card${plan.popular ? ' plan-card-popular' : ''}`}>
                <div className="plan-card-header">
                  <h2 className="section-title" style={{ margin: 0 }}>
                    {plan.name}
                  </h2>
                  {plan.badge && <span className="badge default">{plan.badge}</span>}
                </div>
                <p className="plan-price">
                  ${plan.price}
                  <span>/mo</span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{plan.subtitle}</p>
                <p style={{ fontSize: 14, marginBottom: 12 }}>{plan.includedMinutes.toLocaleString()} included minutes</p>
                <ul className="feature-list">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="billing-note">{data.billing.playDisclosure}</p>
            <button type="button" className="btn" style={{ width: '100%', marginTop: 8 }} onClick={() => openExternalUrl(TRIAL_START_URL)}>
              {data.marketing.primaryCta}
            </button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={() => navigate('/login')}>
              Sign in to subscribe
            </button>
          </>
        )}
      </div>
    </>
  )
}
