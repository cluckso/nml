import { useEffect, useState } from 'react'
import { getCalls } from '../lib/api'
import { ApiError } from '../lib/api'

interface CallsProps {
  onBack: () => void
}

export default function Calls({ onBack }: CallsProps) {
  const [calls, setCalls] = useState<Array<{
    id?: string
    callerName?: string
    callerPhone?: string
    issueDescription?: string
    summary?: string
    emergencyFlag?: boolean
    createdAt?: string
  }>>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function load(p = 1) {
    if (p === 1) setLoading(true)
    setError(null)
    try {
      const res = await getCalls({ page: p, limit: 20 })
      const list = res.calls ?? []
      setCalls((prev) => (p === 1 ? list : [...prev, ...list]))
      setPage(p)
      setHasMore((res.pagination?.totalPages ?? 0) > p)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [])

  function formatDate(iso: string) {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <>
      <header className="app-bar">
        <button type="button" className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Calls</h1>
        <span />
      </header>
      <div className="page">
        {loading && calls.length === 0 && <p style={{ textAlign: 'center' }}>Loading…</p>}
        {error && (
          <div className="card">
            <p className="error">{error}</p>
            <button type="button" className="btn btn-outline" onClick={() => load(1)}>
              Retry
            </button>
          </div>
        )}
        {!loading && calls.length === 0 && !error && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No calls yet.</p>}
        {calls.map((c) => (
          <div key={c.id ?? c.createdAt ?? Math.random()} className="card">
            <div style={{ fontWeight: 600 }}>{c.callerName ?? c.callerPhone ?? 'Unknown'}</div>
            {c.issueDescription && <div style={{ fontSize: 14, marginTop: 4 }}>{c.issueDescription}</div>}
            {c.createdAt && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(c.createdAt)}</div>}
            {c.emergencyFlag && <span style={{ color: 'var(--error)', fontSize: 12 }}>Emergency</span>}
          </div>
        ))}
        {hasMore && calls.length > 0 && (
          <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => load(page + 1)} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </>
  )
}
