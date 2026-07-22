'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoPatients, PatientRow } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

const accessibilityLabel: Record<string, string> = {
  STANDARD: 'Standard', WHEELCHAIR_ACCESSIBLE: 'Wheelchair', NON_TRANSFERABLE_WHEELCHAIR: 'Non-transferable WC', STRETCHER: 'Stretcher',
}

export default function CoordinatorPatientsPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [patients, setPatients] = useState<PatientRow[]>(demoPatients)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setPatients(demoPatients); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Coordinator JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/patients`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setPatients(await res.json()); setMsg('Patients loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    return !q || `${p.user.firstName} ${p.user.lastName} ${p.county} ${p.user.phone}`.toLowerCase().includes(q)
  })

  const wheelchairCount = patients.filter(p => p.accessibilityRequirement !== 'STANDARD').length

  return (
    <DashboardLayout role="coordinator" title="Patients" subtitle="Patient roster for your county" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Patient roster</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Know your patients' accessibility needs and funding sources before dispatch.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setPatients(demoPatients); setMsg('Demo mode.') }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); load() }} disabled={loading}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Coordinator JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) { setToken(t); setMsg('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.coordinator.token', token); setMsg('Token saved.') }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button>
            </div>
          </div>
        </Card>

        {msg && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{msg}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <div className="cp-grid-2">
          <StatCard label="Total patients" value={patients.length} icon={Users} color="purple" />
          <StatCard label="Accessibility needs" value={wheelchairCount} icon={CheckCircle2} color="amber" />
        </div>

        <Card>
          <CardHeader><CardTitle>Patient roster</CardTitle></CardHeader>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, county, or phone…" className="cp-input" style={{ marginBottom: 16 }} />
          <div className="cp-space-y-3">
            {filtered.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No patients found.</p>}
            {filtered.map(p => (
              <div key={p.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{p.user.firstName} {p.user.lastName}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p.user.phone} · {p.user.email}</p>
                  </div>
                  <Badge variant={p.accessibilityRequirement !== 'STANDARD' ? 'warning' : 'neutral'}>
                    {accessibilityLabel[p.accessibilityRequirement] ?? p.accessibilityRequirement}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral">{p.county}, {p.state}</Badge>
                  {p.defaultFundingSource && <Badge variant="info">{p.defaultFundingSource}</Badge>}
                  <Badge variant="neutral">{p.primaryLanguage}</Badge>
                </div>
                {p.barriers && <p style={{ fontSize: 13, color: '#d97706', marginTop: 6 }}>Barriers: {p.barriers}</p>}
                {p.notes && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{p.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
