import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicPricing, type PublicPricing } from '../lib/api'

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
        <div style={{ width: 64 }} />
      </header>
      <div className="page page-fit">
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="card card-compact">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" style={{ marginTop: 10, width: '100%' }} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && data && (
          <>
            <div className="page-fit-body">
              <p className="plans-intro">{data.marketing.trialSummary}</p>
              {data.plans.length === 0 && (
                <div className="empty-state">
                  <p>Plans are not available right now.</p>
                </div>
              )}
              {data.plans.map((plan) => (
                <div key={plan.planType} className={`card card-compact plan-card${plan.popular ? ' plan-card-popular' : ''}`}>
                  <div className="plan-card-header">
                    <strong style={{ fontSize: 15 }}>{plan.name}</strong>
                    <span className="plan-price" style={{ margin: 0, fontSize: '1.15rem' }}>
                      ${plan.price}
                      <span>/mo</span>
                    </span>
                  </div>
                  <p className="plan-meta">
                    {plan.includedMinutes.toLocaleString()} min
                    {plan.badge ? ` · ${plan.badge}` : ''}
                    {plan.popular ? ' · Most popular' : ''}
                  </p>
                  <ul className="feature-list-tight">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="billing-note">{data.billing.playDisclosure}</p>
            </div>
            <div className="page-fit-footer">
              <button type="button" className="btn" style={{ width: '100%' }} onClick={() => navigate('/signup')}>
                {data.marketing.primaryCta}
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Sign in to subscribe
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
