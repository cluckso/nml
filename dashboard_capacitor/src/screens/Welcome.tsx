import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicPricing, type PublicPricing } from '../lib/api'
import { AppLogo } from '../components/AppLogo'
import { openExternalUrl, SIGN_UP_URL, TRIAL_START_URL } from '../lib/site'
import { openLegalUrl, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../lib/legal'

const FALLBACK: PublicPricing = {
  marketing: {
    headline: 'Stop Losing Jobs to Missed Calls',
    categoryLine: 'AI answering service for HVAC, plumbing, electrical, and auto shops',
    sub: 'Missed-call lead capture — we grab the job and text it to you in seconds.',
    primaryCta: 'Start free trial',
    trialSummary: '14-day free trial · 40 call minutes · No card required',
  },
  trial: { days: 14, minutes: 40, noCardRequired: true },
  overageRatePerMin: 0.22,
  billing: {
    processor: 'stripe',
    merchantOfRecord: 'CallGrabbr',
    playDisclosure:
      'CallGrabbr is billed by CallGrabbr through Stripe. Google Play is not the merchant of record for website checkout.',
  },
  plans: [],
}

export default function Welcome() {
  const navigate = useNavigate()
  const [data, setData] = useState<PublicPricing>(FALLBACK)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getPublicPricing()
      .then((pricing) => {
        if (active) setData(pricing)
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Could not load marketing copy')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page marketing-page">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <AppLogo size={80} />
      </div>
      <p className="eyebrow">{data.marketing.categoryLine}</p>
      <h1 className="marketing-headline">{data.marketing.headline}</h1>
      <p className="marketing-sub">{data.marketing.sub}</p>
      <p className="trial-chip">{data.marketing.trialSummary}</p>

      {error && (
        <p className="error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      <button type="button" className="btn" style={{ width: '100%', marginBottom: 10 }} onClick={() => openExternalUrl(TRIAL_START_URL)}>
        {data.marketing.primaryCta}
      </button>
      <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: 10 }} onClick={() => navigate('/plans')}>
        See plans
      </button>
      <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/login')}>
        I already have an account
      </button>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title">What you get</h2>
        <ul className="feature-list">
          <li>Missed and after-hours calls answered</li>
          <li>Name, phone, job, and urgency texted to you</li>
          <li>Push alerts on this Android app</li>
          <li>Tap-to-call-back from the lead</li>
        </ul>
      </div>

      <p className="billing-note">{data.billing.playDisclosure}</p>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
        New accounts are created on the website.{' '}
        <button type="button" className="text-link" onClick={() => openExternalUrl(SIGN_UP_URL)}>
          Create an account
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        <button type="button" className="text-link" onClick={() => openLegalUrl(TERMS_OF_SERVICE_URL)}>
          Terms
        </button>
        {' · '}
        <button type="button" className="text-link" onClick={() => openLegalUrl(PRIVACY_POLICY_URL)}>
          Privacy
        </button>
      </p>
    </div>
  )
}
