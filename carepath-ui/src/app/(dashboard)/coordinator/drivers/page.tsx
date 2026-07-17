'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Heart, ToggleLeft, ToggleRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoDrivers, DriverRow } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3001/api'

export default function CoordinatorDriversPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [drivers, setDrivers] = useState<DriverRow[]>(demoDrivers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setDrivers(demoDrivers); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Coordinator JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/drivers`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setDrivers(await res.json()); setMsg('Drivers loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase()
    return !q || `${d.user.firstName} ${d.user.lastName} ${d.county} ${d.user.phone}`.toLowerCase().includes(q)
  })

  const available = drivers.filter(d => d.isAvailableNow).length
  const fallbackPool = drivers.filter(d => d.isInFallbackPool).length

  return (
    <DashboardLayout role="coordinator" title="Drivers" subtitle="Driver roster and availability status" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Driver network</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Monitor driver availability and fallback pool status across your county.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setDrivers(demoDrivers); setMsg('Demo mode.') }}>Demo</Button>
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

        <div className="cp-grid-3">
          <StatCard label="Total drivers" value={drivers.length} icon={Heart} color="purple" />
          <StatCard label="Available now" value={available} icon={CheckCircle2} color="teal" />
          <StatCard label="Fallback pool" value={fallbackPool} icon={Heart} color="amber" />
        </div>

        <Card>
          <CardHeader><CardTitle>Driver roster</CardTitle></CardHeader>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, county, or phone…" className="cp-input" style={{ marginBottom: 16 }} />
          <div className="cp-space-y-3">
            {filtered.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No drivers found.</p>}
            {filtered.map(d => (
              <div key={d.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{d.user.firstName} {d.user.lastName}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{d.user.phone} · {d.county}, {d.state}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {d.isAvailableNow ? <ToggleRight size={24} color="#1b9c86" /> : <ToggleLeft size={24} color="#94a3b8" />}
                    <Badge variant={d.isAvailableNow ? 'success' : 'neutral'}>{d.isAvailableNow ? 'Available' : 'Unavailable'}</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral">{d.providerType}</Badge>
                  {d.isInFallbackPool && <Badge variant="info">Fallback pool</Badge>}
                  {d.isWheelchairAccessible && <Badge variant="success">Wheelchair accessible</Badge>}
                  <Badge variant="neutral">Cap: {d.vehicleCapacity} · {d.maxMilesOneWay} mi max</Badge>
                </div>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                  Reliability: {d.reliabilityScore.toFixed(1)} · {d.ridesCompleted} rides completed
                </p>
                {d.communityNotes && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{d.communityNotes}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
