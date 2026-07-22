'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ShieldCheck, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

type Partner = {
  id: string
  organization: string
  county: string
  state: string
  isVerified: boolean
  user: { firstName: string; lastName: string; email: string; phone: string }
}

type Coordinator = {
  id: string
  county: string
  state: string
  organization: string | null
  isVerified: boolean
  stipendActive: boolean
  user: { firstName: string; lastName: string; email: string; phone: string }
}

const demoPartners: Partner[] = [
  { id: 'partner-1', organization: 'Arkansas Baptist Hospital', county: 'Pulaski', state: 'AR', isVerified: true, user: { firstName: 'Katina', lastName: 'R', email: 'katina@arbaptist.org', phone: '501-555-0200' } },
  { id: 'partner-2', organization: 'Southern Caregivers AR', county: 'Craighead', state: 'AR', isVerified: false, user: { firstName: 'Kimberly', lastName: 'S', email: 'kshipley@southerncaregiversar.com', phone: '870-790-1850' } },
]

const demoCoordinators: Coordinator[] = [
  { id: 'coord-1', county: 'Pulaski', state: 'AR', organization: 'Arkansas Baptist Hospital', isVerified: true, stipendActive: true, user: { firstName: 'Katina', lastName: 'R', email: 'katina@arbaptist.org', phone: '501-555-0200' } },
]

export default function AdminPartnersPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [partners, setPartners] = useState<Partner[]>(demoPartners)
  const [coordinators, setCoordinators] = useState<Coordinator[]>(demoCoordinators)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.admin.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setPartners(demoPartners); setCoordinators(demoCoordinators); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Admin JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const [coordRes] = await Promise.all([
        fetch(`${apiBase}/coordinators`, { headers, cache: 'no-store' }),
      ])
      if (!coordRes.ok) throw new Error(`Failed (${coordRes.status})`)
      setCoordinators(await coordRes.json())
      setMsg('Partners loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const verifyCoordinator = async (coordinatorId: string, name: string) => {
    if (mode === 'demo') { setCoordinators(prev => prev.map(c => c.id === coordinatorId ? { ...c, isVerified: true } : c)); setMsg(`Demo: ${name} verified.`); return }
    if (!token) { setError('Token required.'); return }
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBase}/coordinators/${coordinatorId}/verify`, { method: 'PATCH', headers })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg(`${name} verified.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setActionLoading(false) }
  }

  const verifyPartner = async (partnerId: string, name: string) => {
    if (mode === 'demo') { setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, isVerified: true } : p)); setMsg(`Demo: ${name} verified.`); return }
    if (!token) { setError('Token required.'); return }
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBase}/credits/partners/${partnerId}/verify`, { method: 'PATCH', headers })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg(`${name} verified.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setActionLoading(false) }
  }

  const unverifiedCoords = coordinators.filter(c => !c.isVerified).length
  const unverifiedPartners = partners.filter(p => !p.isVerified).length

  return (
    <DashboardLayout role="admin" title="Partners" subtitle="Institutional partners and coordinator verification" userName="Admin">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #052b56, #0c6bc2)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>Partner management</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Verify coordinators and institutional partners to activate their access.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setPartners(demoPartners); setCoordinators(demoCoordinators); setMsg('Demo mode.') }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); load() }} disabled={loading}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Admin JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.admin.token'); if (t) { setToken(t); setMsg('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.admin.token', token); setMsg('Token saved.') }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button>
            </div>
          </div>
        </Card>

        {msg && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{msg}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <div className="cp-grid-2">
          <StatCard label="Unverified coordinators" value={unverifiedCoords} icon={Users} color="amber" />
          <StatCard label="Unverified partners" value={unverifiedPartners} icon={ShieldCheck} color="rose" />
        </div>

        <Card>
          <CardHeader><CardTitle>Coordinators</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {coordinators.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No coordinators found.</p>}
            {coordinators.map(c => (
              <div key={c.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{c.user.firstName} {c.user.lastName}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{c.organization ?? 'No organization'} · {c.county}, {c.state}</p>
                    <p style={{ fontSize: 13, color: '#64748b' }}>{c.user.email} · {c.user.phone}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge variant={c.isVerified ? 'success' : 'warning'}>{c.isVerified ? 'Verified' : 'Unverified'}</Badge>
                    {c.stipendActive && <Badge variant="info">Stipend active</Badge>}
                  </div>
                </div>
                {!c.isVerified && (
                  <div style={{ marginTop: 12 }}>
                    <Button size="sm" onClick={() => verifyCoordinator(c.id, `${c.user.firstName} ${c.user.lastName}`)} disabled={actionLoading}>
                      <ShieldCheck size={14} style={{ marginRight: 4 }} />Verify coordinator
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Institutional partners</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {partners.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No partners found.</p>}
            {partners.map(p => (
              <div key={p.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{p.organization}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{p.user.firstName} {p.user.lastName} · {p.user.email}</p>
                    <p style={{ fontSize: 13, color: '#64748b' }}>{p.county}, {p.state} · {p.user.phone}</p>
                  </div>
                  <Badge variant={p.isVerified ? 'success' : 'warning'}>{p.isVerified ? 'Verified' : 'Unverified'}</Badge>
                </div>
                {!p.isVerified && (
                  <div style={{ marginTop: 12 }}>
                    <Button size="sm" onClick={() => verifyPartner(p.id, p.organization)} disabled={actionLoading}>
                      <ShieldCheck size={14} style={{ marginRight: 4 }} />Verify partner
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
