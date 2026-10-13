import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, getSettings, patchSettings } from '../lib/api'
import { SECTION_LABELS } from '../lib/industries'

type Dict = Record<string, unknown>

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 14 }}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{label}</span>
      {multiline ? (
        <textarea className="input" rows={4} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

export default function SettingsSection() {
  const { section = '' } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [allowed, setAllowed] = useState(false)
  const [draft, setDraft] = useState<Dict>({})

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getSettings()
      .then((res) => {
        if (!active) return
        const sections: string[] = res.allowedSections ?? []
        if (!sections.includes(section)) {
          setAllowed(false)
          setError('This setting is not on your plan.')
          return
        }
        setAllowed(true)
        const settings = (res.settings ?? {}) as Dict
        const value = settings[section]
        if (Array.isArray(value)) {
          setDraft({ list: value.join(', ') })
        } else if (value && typeof value === 'object') {
          setDraft({ ...(value as Dict) })
        } else {
          setDraft({ value })
        }
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
  }, [section])

  const setField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload =
        section === 'intakeTemplate' || section === 'questionDepth'
          ? { [section]: draft.value ?? null }
          : { [section]: draft }
      await patchSettings(payload)
      setSuccess('Saved — synced with the website.')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const title = SECTION_LABELS[section] ?? section

  const renderEditor = () => {
    switch (section) {
      case 'greeting':
        return (
          <>
            <TextField label="Custom greeting" value={String(draft.customGreeting ?? '')} onChange={(v) => setField('customGreeting', v || null)} multiline />
            <TextField label="Business name pronunciation" value={String(draft.businessNamePronunciation ?? '')} onChange={(v) => setField('businessNamePronunciation', v || null)} />
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Tone</span>
              <select className="input" value={String(draft.tone ?? 'friendly')} onChange={(e) => setField('tone', e.target.value)}>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="direct">Direct</option>
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Voice gender</span>
              <select
                className="input"
                value={draft.voiceGender == null ? '' : String(draft.voiceGender)}
                onChange={(e) => setField('voiceGender', e.target.value || null)}
              >
                <option value="">Default</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
          </>
        )
      case 'notifications':
        return (
          <>
            <Toggle label="SMS alerts" checked={!!draft.smsAlerts} onChange={(v) => setField('smsAlerts', v)} />
            <Toggle label="Email alerts" checked={!!draft.emailAlerts} onChange={(v) => setField('emailAlerts', v)} />
            <Toggle label="Push alerts" checked={!!draft.pushAlerts} onChange={(v) => setField('pushAlerts', v)} />
            <Toggle label="Emergency-only alerts" checked={!!draft.emergencyOnlyAlerts} onChange={(v) => setField('emergencyOnlyAlerts', v)} />
            <Toggle label="Daily digest" checked={!!draft.dailyDigest} onChange={(v) => setField('dailyDigest', v)} />
          </>
        )
      case 'missedCallRecovery':
        return (
          <>
            <Toggle label="Enabled" checked={!!draft.enabled} onChange={(v) => setField('enabled', v)} />
            <TextField
              label="SMS auto-reply"
              value={String(draft.smsAutoReplyText ?? '')}
              onChange={(v) => setField('smsAutoReplyText', v)}
              multiline
            />
          </>
        )
      case 'followUpSms':
        return (
          <>
            <Toggle label="Enabled" checked={!!draft.enabled} onChange={(v) => setField('enabled', v)} />
            <TextField label="Confirmation message" value={String(draft.confirmationMessage ?? '')} onChange={(v) => setField('confirmationMessage', v || null)} multiline />
            <TextField label="Follow-up message" value={String(draft.followUpMessage ?? '')} onChange={(v) => setField('followUpMessage', v || null)} multiline />
            <TextField
              label="Follow-up delay (hours)"
              value={String(draft.followUpDelayHours ?? 24)}
              onChange={(v) => setField('followUpDelayHours', Number(v) || 24)}
            />
          </>
        )
      case 'reputation':
        return (
          <>
            <Toggle label="Request Google reviews" checked={!!draft.reviewRequestEnabled} onChange={(v) => setField('reviewRequestEnabled', v)} />
            <TextField label="Google review URL" value={String(draft.googleReviewUrl ?? '')} onChange={(v) => setField('googleReviewUrl', v || null)} />
            <TextField label="Review request message" value={String(draft.reviewRequestMessage ?? '')} onChange={(v) => setField('reviewRequestMessage', v || null)} multiline />
          </>
        )
      case 'availability': {
        const hours = (draft.businessHours as Dict) || { open: '09:00', close: '17:00', days: [] }
        const days = Array.isArray(hours.days) ? (hours.days as string[]) : []
        const week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        return (
          <>
            <TextField label="Timezone (IANA)" value={String(draft.timezone ?? 'America/Chicago')} onChange={(v) => setField('timezone', v)} />
            <TextField
              label="Open"
              value={String(hours.open ?? '09:00')}
              onChange={(v) => setField('businessHours', { ...hours, open: v })}
            />
            <TextField
              label="Close"
              value={String(hours.close ?? '17:00')}
              onChange={(v) => setField('businessHours', { ...hours, close: v })}
            />
            <div style={{ marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Open days</span>
              {week.map((day) => (
                <Toggle
                  key={day}
                  label={day}
                  checked={days.includes(day)}
                  onChange={(on) => {
                    const next = on ? [...days, day] : days.filter((d) => d !== day)
                    setField('businessHours', { ...hours, days: next })
                  }}
                />
              ))}
            </div>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>After hours</span>
              <select
                className="input"
                value={String(draft.afterHoursBehavior ?? 'take_message')}
                onChange={(e) => setField('afterHoursBehavior', e.target.value)}
              >
                <option value="take_message">Take a message</option>
                <option value="book_future">Book future</option>
                <option value="emergency_redirect">Emergency redirect</option>
              </select>
            </label>
          </>
        )
      }
      case 'intakeFields': {
        const fields = ['name', 'phone', 'address', 'email', 'serviceType', 'urgency', 'budgetRange', 'appointmentPreference']
        return (
          <>
            {fields.map((field) => {
              const cfg = (draft[field] as Dict) || { enabled: false, required: false }
              return (
                <div key={field} className="card" style={{ marginBottom: 8, padding: 12 }}>
                  <strong style={{ textTransform: 'capitalize' }}>{field}</strong>
                  <Toggle label="Enabled" checked={!!cfg.enabled} onChange={(v) => setField(field, { ...cfg, enabled: v })} />
                  <Toggle label="Required" checked={!!cfg.required} onChange={(v) => setField(field, { ...cfg, required: v })} />
                </div>
              )
            })}
          </>
        )
      }
      case 'callRouting':
        return (
          <>
            <TextField
              label="Rings before answer"
              value={String(draft.ringBeforeAnswerRings ?? draft.ringsBeforeAnswer ?? '')}
              onChange={(v) => setField('ringBeforeAnswerRings', Number(v) || 0)}
            />
            <TextField
              label="Seconds before answer"
              value={String(draft.ringBeforeAnswerSeconds ?? '')}
              onChange={(v) => setField('ringBeforeAnswerSeconds', Number(v) || 0)}
            />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Advanced routing profiles stay available on the website if you need fine-tuning.
            </p>
          </>
        )
      case 'questionDepth':
        return (
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Depth</span>
            <select className="input" value={String(draft.value ?? 'standard')} onChange={(e) => setField('value', e.target.value)}>
              <option value="fast">Fast</option>
              <option value="standard">Standard</option>
              <option value="deep">Deep</option>
            </select>
          </label>
        )
      case 'intakeTemplate':
        return (
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Template</span>
            <select
              className="input"
              value={draft.value == null ? '' : String(draft.value)}
              onChange={(e) => setField('value', e.target.value || null)}
            >
              <option value="">Default for industry</option>
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrician">Electrician</option>
              <option value="handyman">Handyman</option>
              <option value="auto_repair">Auto repair</option>
              <option value="childcare">Childcare</option>
              <option value="generic">Generic</option>
            </select>
          </label>
        )
      case 'booking':
        return (
          <>
            <Toggle label="Ask for appointment" checked={!!draft.askForAppointment} onChange={(v) => setField('askForAppointment', v)} />
            <Toggle label="Only offer when asked" checked={!!draft.onlyOfferWhenAsked} onChange={(v) => setField('onlyOfferWhenAsked', v)} />
            <Toggle label="Same-day allowed" checked={!!draft.sameDayAllowed} onChange={(v) => setField('sameDayAllowed', v)} />
            <Toggle label="Emergency override" checked={!!draft.emergencyOverride} onChange={(v) => setField('emergencyOverride', v)} />
            <TextField label="Default minutes" value={String(draft.defaultAppointmentMinutes ?? 60)} onChange={(v) => setField('defaultAppointmentMinutes', Number(v) || 60)} />
            <TextField label="Min notice (hours)" value={String(draft.minNoticeHours ?? 2)} onChange={(v) => setField('minNoticeHours', Number(v) || 0)} />
          </>
        )
      case 'crm':
        return (
          <>
            <TextField label="CRM webhook URL" value={String(draft.crmWebhookUrl ?? '')} onChange={(v) => setField('crmWebhookUrl', v || null)} />
            <TextField label="Zapier webhook URL" value={String(draft.zapierWebhookUrl ?? '')} onChange={(v) => setField('zapierWebhookUrl', v || null)} />
          </>
        )
      case 'capacity':
        return (
          <>
            <Toggle label="Enabled" checked={!!draft.enabled} onChange={(v) => setField('enabled', v)} />
            <TextField label="Max leads / day" value={String(draft.maxLeadsPerDay ?? '')} onChange={(v) => setField('maxLeadsPerDay', v ? Number(v) : null)} />
            <TextField label="Max appointments / day" value={String(draft.maxAppointmentsPerDay ?? '')} onChange={(v) => setField('maxAppointmentsPerDay', v ? Number(v) : null)} />
          </>
        )
      case 'aiBehavior':
        return (
          <>
            <TextField label="Max call length (minutes)" value={String(draft.maxCallLengthMinutes ?? 7)} onChange={(v) => setField('maxCallLengthMinutes', Number(v) || 7)} />
            <TextField label="Question retries" value={String(draft.questionRetryCount ?? 2)} onChange={(v) => setField('questionRetryCount', Number(v) || 0)} />
            <Toggle label="Escalate after retries" checked={!!draft.escalateToHumanAfterRetries} onChange={(v) => setField('escalateToHumanAfterRetries', v)} />
          </>
        )
      case 'reporting':
        return (
          <>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Frequency</span>
              <select className="input" value={String(draft.frequency ?? 'weekly')} onChange={(e) => setField('frequency', e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="off">Off</option>
              </select>
            </label>
            <Toggle label="Include transcripts" checked={!!draft.includeTranscripts} onChange={(v) => setField('includeTranscripts', v)} />
            <Toggle label="Include tags" checked={!!draft.includeTags} onChange={(v) => setField('includeTags', v)} />
          </>
        )
      case 'voiceBrand':
        return (
          <>
            <TextField label="Voice persona" value={String(draft.voicePersona ?? '')} onChange={(v) => setField('voicePersona', v || null)} />
            <TextField label="Speed (0–1)" value={String(draft.speed ?? 0.5)} onChange={(v) => setField('speed', Number(v))} />
            <TextField label="Warmth (0–1)" value={String(draft.warmth ?? 0.75)} onChange={(v) => setField('warmth', Number(v))} />
          </>
      )
      case 'leadTags':
        return (
          <>
            <TextField
              label="Custom tags (comma-separated)"
              value={Array.isArray(draft.customTags) ? (draft.customTags as string[]).join(', ') : ''}
              onChange={(v) =>
                setField(
                  'customTags',
                  v
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Priority keyword rules can be edited on the website.</p>
          </>
        )
      case 'departments':
        return (
          <TextField
            label="Departments (comma-separated)"
            value={Array.isArray(draft.value) ? (draft.value as string[]).join(', ') : Array.isArray(draft) ? '' : ''}
            onChange={() => {}}
          />
        )
      default:
        return (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Edit this section on the website for advanced options, or use the fields above when available.
          </p>
        )
    }
  }

  // Departments is stored as an array at the section root — special-case load/save
  const saveDepartmentsAware = async () => {
    if (section !== 'departments') return save()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const raw = String((draft as Dict).list ?? '')
      const list = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      await patchSettings({ departments: list })
      setSuccess('Saved — synced with the website.')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/settings')}>
          ← Back
        </button>
        <h1>{title}</h1>
        <div style={{ width: 32 }} />
      </header>
      <div className="page">
        {loading && (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="loading-spinner" />
          </div>
        )}
        {error && !allowed && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate('/billing')}>
              See plans
            </button>
          </div>
        )}
        {!loading && allowed && (
          <div className="card">
            {section === 'departments' ? (
              <TextField
                label="Departments (comma-separated)"
                value={Array.isArray(draft) ? (draft as unknown as string[]).join(', ') : String((draft as Dict).list ?? (Array.isArray(draft) ? '' : ''))}
                onChange={(v) => setDraft({ list: v })}
              />
            ) : (
              renderEditor()
            )}
            {error && <p className="error">{error}</p>}
            {success && <p style={{ color: 'var(--success)', fontSize: 13 }}>{success}</p>}
            <button
              type="button"
              className="btn"
              style={{ width: '100%', marginTop: 8 }}
              disabled={saving}
              onClick={() => void (section === 'departments' ? saveDepartmentsAware() : save())}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
