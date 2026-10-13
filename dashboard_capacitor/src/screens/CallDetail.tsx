import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, getCall } from '../lib/api'
import { formatPhoneForDisplay, resolveCallbackPhone } from '../lib/phone'
import { CallBackButton } from '../components/CallBackButton'
import { CallRecordingButton } from '../components/CallRecordingButton'

export default function CallDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [call, setCall] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getCall(id)
      .then((res) => {
        if (active) setCall(res.call)
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
  }, [id])

  const intake = (call?.structuredIntake as Record<string, unknown> | null) ?? null
  const callback = resolveCallbackPhone({
    callerPhone: call?.callerPhone as string | undefined,
    structuredIntake: intake,
  })

  return (
    <>
      <header className="app-bar">
        <button type="button" className="back-btn" onClick={() => navigate('/calls')}>
          ← Back
        </button>
        <h1>Call detail</h1>
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
            <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => navigate('/calls')}>
              Back to calls
            </button>
          </div>
        )}
        {!loading && !error && call && (
          <>
            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 4 }}>
                {(call.callerName as string) || 'Unknown caller'}
                {call.emergencyFlag ? ' 🚨' : ''}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {call.callerPhone ? formatPhoneForDisplay(String(call.callerPhone)) : 'No phone'}
                {call.createdAt ? ` · ${new Date(String(call.createdAt)).toLocaleString()}` : ''}
              </p>
              {callback && (
                <div style={{ marginTop: 12 }}>
                  <CallBackButton phone={callback} />
                </div>
              )}
              {typeof call.recordingUrl === 'string' && call.recordingUrl && (
                <div style={{ marginTop: 12 }}>
                  <CallRecordingButton url={call.recordingUrl} />
                </div>
              )}
            </div>

            {(call.summary || call.issueDescription) && (
              <div className="card">
                <h2 className="section-title">Summary</h2>
                <p style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                  {String(call.summary || call.issueDescription)}
                </p>
              </div>
            )}

            {intake && Object.keys(intake).length > 0 && (
              <div className="card">
                <h2 className="section-title">Intake</h2>
                <ul className="feature-list">
                  {Object.entries(intake).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {typeof call.transcript === 'string' && call.transcript && (
              <div className="card">
                <h2 className="section-title">Transcript</h2>
                <p style={{ fontSize: 13, whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{call.transcript}</p>
              </div>
            )}

            {!call.summary && !call.issueDescription && !call.transcript && !intake && (
              <div className="empty-state">
                <p>No extra details for this call yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
