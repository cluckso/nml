import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ApiError,
  createBillingPortal,
  createCheckout,
  getBillingSummary,
  getPublicPricing,
  type BillingSummary,
  type PublicPricing,
} from '../lib/api'
import { openStripeCheckoutUrl, preparePlayExternalToken } from '../lib/play-billing'

export default function Billing() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [pricing, setPricing] = useState<PublicPricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyPlan, setBusyPlan] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextSummary, nextPricing] = await Promise.all([getBillingSummary(), getPublicPricing()])
      setSummary(nextSummary)
      setPricing(nextPricing)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const startCheckout = async (planType: string) => {
    setActionError(null)
    setBusyPlan(planType)
    try {
      const playToken = await preparePlayExternalToken()
      const url = await createCheckout(planType, playToken)
      await openStripeCheckoutUrl(url, playToken)
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setBusyPlan(null)
    }
  }

  const openPortal = async () => {
    setActionError(null)
    setBusyPlan('portal')
    try {
      const url = await createBillingPortal()
      await openStripeCheckoutUrl(url)
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setBusyPlan(null)
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Billing</h1>
        <div style={{ width: 32 }} />
      </header>
      <div className="page">
        {loading && !summary && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => void load()}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && summary && (
          <>
            {summary.trial?.isOnTrial && (
              <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)' }}>
                <h2 className="section-title">Free trial</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {Math.ceil(summary.trial.minutesRemaining)} minutes left
                  {summary.trial.daysRemaining ? ` · ${summary.trial.daysRemaining} days left` : ''}
                </p>
              </div>
            )}

            {summary.hasPaidPlan && summary.plan ? (
              <div className="card">
                <h2 className="section-title">{summary.plan.name}</h2>
                <p className="plan-price">
                  ${summary.plan.price}
                  <span>/mo</span>
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Status: {summary.subscriptionStatus ?? 'active'}
                </p>
                {summary.usage && (
                  <p style={{ fontSize: 14 }}>
                    {Math.ceil(summary.usage.minutesUsed)} / {summary.usage.minutesIncluded} minutes this period
                    {summary.usage.overageMinutes > 0
                      ? ` · ${Math.ceil(summary.usage.overageMinutes)} extra at $${summary.usage.overageRatePerMin.toFixed(2)}/min`
                      : ''}
                  </p>
                )}
              </div>
            ) : (
              <div className="card">
                <h2 className="section-title">No paid plan yet</h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  Subscribe on the CallGrabbr website with Stripe. Checkout opens in your browser — Google Play is not
                  charged.
                </p>
              </div>
            )}

            {!summary.businessId && (
              <div className="empty-state">
                <p>Finish setup on the website before you can subscribe.</p>
              </div>
            )}

            {summary.canManage && (
              <button
                type="button"
                className="btn"
                style={{ width: '100%', marginBottom: 12 }}
                disabled={busyPlan !== null}
                onClick={() => void openPortal()}
              >
                {busyPlan === 'portal' ? 'Opening…' : 'Manage billing'}
              </button>
            )}

            {pricing && summary.businessId && (
              <>
                <h2 className="section-title">{summary.hasPaidPlan ? 'Change plan' : 'Choose a plan'}</h2>
                {pricing.plans.map((plan) => (
                  <div key={plan.planType} className="card">
                    <div className="plan-card-header">
                      <strong>{plan.name}</strong>
                      <span>${plan.price}/mo</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 12px' }}>
                      {plan.includedMinutes.toLocaleString()} minutes · {plan.subtitle}
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                      disabled={busyPlan !== null}
                      onClick={() => void startCheckout(plan.planType)}
                    >
                      {busyPlan === plan.planType
                        ? 'Opening Stripe…'
                        : summary.plan?.planType === plan.planType
                          ? 'Current plan'
                          : `Continue with Stripe · ${plan.name}`}
                    </button>
                  </div>
                ))}
                <p className="billing-note">{pricing.billing.playDisclosure}</p>
              </>
            )}

            {actionError && (
              <div className="card">
                <p className="error">{actionError}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
