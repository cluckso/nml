import { useEffect, useState } from 'react'
import { ApiError, completeOnboarding, getActivation } from '../lib/api'
import { DEFAULT_ONBOARDING_HOURS, INDUSTRIES } from '../lib/industries'
import { AppLogo } from '../components/AppLogo'

type Props = {
  onComplete: () => Promise<void>
  onNeedsTrial: () => void
}

export default function Onboarding({ onComplete, onNeedsTrial }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [industry, setIndustry] = useState('HVAC')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [serviceAreaInput, setServiceAreaInput] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [smsConsent, setSmsConsent] = useState(false)

  useEffect(() => {
    let active = true
    getActivation()
      .then((data) => {
        if (!active) return
        if (data.needsTrialStart) {
          onNeedsTrial()
          return
        }
        if (data.onboardingComplete) {
          void onComplete()
          return
        }
        const p = data.prefill
        if (p?.industry) setIndustry(p.industry)
        if (p?.name) setName(p.name)
        if (p?.phoneNumber) setPhoneNumber(p.phoneNumber)
        if (p?.ownerPhone) setOwnerPhone(p.ownerPhone)
        if (p?.serviceAreas?.length) setServiceAreas(p.serviceAreas)
      })
      .catch((e) => {
        if (active) setError(e instanceof ApiError ? e.message : String(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [onComplete, onNeedsTrial])

  const addAreas = () => {
    const parts = serviceAreaInput
      .split(',')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    if (!parts.length) return
    setServiceAreas((prev) => {
      const lower = new Set(prev.map((a) => a.toLowerCase()))
      return [...prev, ...parts.filter((p) => !lower.has(p.toLowerCase()))]
    })
    setServiceAreaInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Business name is required.')
      return
    }
    if (!serviceAreas.length) {
      setError('Add at least one service area.')
      return
    }
    if (!phoneNumber.trim()) {
      setError('Business phone is required.')
      return
    }
    setSaving(true)
    try {
      await completeOnboarding({
        industry,
        businessInfo: {
          name: name.trim(),
          serviceAreas,
          phoneNumber: phoneNumber.trim(),
          ownerPhone: (ownerPhone.trim() || phoneNumber.trim()),
          smsConsent,
          businessHours: { ...DEFAULT_ONBOARDING_HOURS, days: [...DEFAULT_ONBOARDING_HOURS.days] },
        },
      })
      await onComplete()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 48 }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingTop: 24, maxWidth: 440, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <AppLogo size={56} />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 4 }}>Set up your assistant</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Trade, shop name, and where you serve — under a minute.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Business type</span>
          <select className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Shop name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Business phone (customers call)</span>
          <input
            type="tel"
            className="input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Your mobile (lead texts)</span>
          <input
            type="tel"
            className="input"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="Same as business phone if blank"
          />
        </label>

        <div style={{ marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Service areas</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={serviceAreaInput}
              onChange={(e) => setServiceAreaInput(e.target.value)}
              placeholder="City or town"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAreas()
                }
              }}
            />
            <button type="button" className="btn btn-outline" onClick={addAreas}>
              Add
            </button>
          </div>
          {serviceAreas.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>No areas yet.</p>
          ) : (
            <ul className="feature-list" style={{ marginTop: 8 }}>
              {serviceAreas.map((area) => (
                <li key={area} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{area}</span>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setServiceAreas((prev) => prev.filter((a) => a !== area))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16, fontSize: 13 }}>
          <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Text me lead alerts at my mobile number (optional).</span>
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn" style={{ width: '100%' }} disabled={saving}>
          {saving ? 'Provisioning…' : 'Finish setup'}
        </button>
      </form>
    </div>
  )
}
