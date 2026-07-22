'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, MapPin, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoDepotRoutes, DepotRouteRow, toDisplayDate } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

type NewRoute = { depotName: string; depotAddress: string; destinationCity: string; destinationState: string; departureTime: string; returnTime: string; maxPassengers: number; recurrenceNote: string }
const emptyRoute: NewRoute = { depotName: '', depotAddress: '', destinationCity: 'Little Rock', destinationState: 'AR', departureTime: '', returnTime: '', maxPassengers: 6, recurrenceNote: '' }

export default function CoordinatorRoutesPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [routes, setRoutes] = useState<DepotRouteRow[]>(demoDepotRoutes)
  const [form, setForm] = useState<NewRoute>(emptyRoute)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const set = (p: Partial<NewRoute>) => setForm(prev => ({ ...prev, ...p }))
  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setRoutes(demoDepotRoutes); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/coordinators/depot-routes`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setRoutes(await res.json()); setMsg('Routes loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setLoading(false) }
  }

  const createRoute = async (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'demo') {
      const demo: DepotRouteRow = { id: `demo-${Date.now()}`, ...form, county: 'Demo', state: 'AR', isActive: true, coordinator: { user: { firstName: 'You', lastName: '', phone: '' } }, drivers: [] }
      setRoutes(prev => [demo, ...prev]); setMsg('Demo: route created.'); setShowForm(false); setForm(emptyRoute); return
    }
    if (!token) { setError('Token required.'); return }
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/coordinators/depot-routes`, { method: 'POST', headers, body: JSON.stringify({ ...form, departureTime: new Date(form.departureTime).toISOString(), returnTime: form.returnTime ? new Date(form.returnTime).toISOString() : null }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg('Route created.'); setShowForm(false); setForm(emptyRoute)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create.') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout role="coordinator" title="Depot Routes" subtitle="Manage scheduled community transport runs" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Depot routes</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Create and manage scheduled community runs that batch patients to shared destinations.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setRoutes(demoDepotRoutes); setMsg('Demo mode.') }}>Demo</Button>
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
          <StatCard label="Active routes" value={routes.filter(r => r.isActive).length} icon={MapPin} color="purple" />
          <StatCard label="Drivers assigned" value={routes.reduce((s, r) => s + r.drivers.length, 0)} icon={Users} color="teal" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="sm" onClick={() => setShowForm(v => !v)}>{showForm ? 'Cancel' : '+ New route'}</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Create depot route</CardTitle></CardHeader>
            <form className="cp-space-y-4" onSubmit={createRoute}>
              <div className="cp-grid-2">
                <div><label className="cp-label">Depot name</label><input required value={form.depotName} onChange={e => set({ depotName: e.target.value })} className="cp-input" /></div>
                <div><label className="cp-label">Depot address</label><input required value={form.depotAddress} onChange={e => set({ depotAddress: e.target.value })} className="cp-input" /></div>
              </div>
              <div className="cp-grid-2">
                <div><label className="cp-label">Destination city</label><input required value={form.destinationCity} onChange={e => set({ destinationCity: e.target.value })} className="cp-input" /></div>
                <div><label className="cp-label">Destination state</label><input required value={form.destinationState} onChange={e => set({ destinationState: e.target.value })} className="cp-input" /></div>
              </div>
              <div className="cp-grid-2">
                <div><label className="cp-label">Departure time</label><input required type="datetime-local" value={form.departureTime} onChange={e => set({ departureTime: e.target.value })} className="cp-input" /></div>
                <div><label className="cp-label">Return time (optional)</label><input type="datetime-local" value={form.returnTime} onChange={e => set({ returnTime: e.target.value })} className="cp-input" /></div>
              </div>
              <div className="cp-grid-2">
                <div><label className="cp-label">Max passengers</label><input type="number" min={1} value={form.maxPassengers} onChange={e => set({ maxPassengers: Number(e.target.value) })} className="cp-input" /></div>
                <div><label className="cp-label">Recurrence note</label><input value={form.recurrenceNote} onChange={e => set({ recurrenceNote: e.target.value })} placeholder="e.g. Every Tuesday" className="cp-input" /></div>
              </div>
              <Button type="submit" disabled={saving} className="cp-btn-full">{saving ? 'Creating…' : 'Create route'}</Button>
            </form>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Scheduled routes</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {routes.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No routes scheduled.</p>}
            {routes.map(route => (
              <div key={route.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{route.depotName}</p>
                  <Badge variant={route.isActive ? 'success' : 'neutral'}>{route.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{route.depotAddress} → {route.destinationCity}, {route.destinationState}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="info">Departs: {toDisplayDate(route.departureTime)}</Badge>
                  {route.returnTime && <Badge variant="neutral">Returns: {toDisplayDate(route.returnTime)}</Badge>}
                  <Badge variant="neutral">Max {route.maxPassengers} passengers</Badge>
                </div>
                {route.recurrenceNote && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{route.recurrenceNote}</p>}
                {route.drivers.length > 0 && <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>Drivers: {route.drivers.map(d => `${d.driver.user.firstName} ${d.driver.user.lastName}`).join(', ')}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
