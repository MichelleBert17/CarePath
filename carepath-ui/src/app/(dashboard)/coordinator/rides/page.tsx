'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Car, CheckCircle2, Clock3 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoRides, RideRow, statusVariant, toDisplayDate } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

export default function CoordinatorRidesPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [rides, setRides] = useState<RideRow[]>(demoRides)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setRides(demoRides); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Coordinator JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/coordinators/rides`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setRides(await res.json()); setMsg('Rides loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const updateStatus = async (rideId: string, status: string) => {
    if (mode === 'demo') { setRides(prev => prev.map(r => r.id === rideId ? { ...r, status } : r)); setMsg(`Demo: status → ${status}.`); return }
    if (!token) { setError('Token required.'); return }
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBase}/rides/${rideId}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg(`Status updated to ${status}.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') }
    finally { setActionLoading(false) }
  }

  const pending = rides.filter(r => r.status === 'PENDING').length
  const fallback = rides.filter(r => r.status === 'FALLBACK_NEEDED').length

  return (
    <DashboardLayout role="coordinator" title="Ride Requests" subtitle="All rides in your county" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Ride management</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Full ride list for your county — update statuses and escalate fallbacks.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setRides(demoRides); setMsg('Demo mode.') }}>Demo</Button>
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
          <StatCard label="Total rides" value={rides.length} icon={Car} color="purple" />
          <StatCard label="Pending" value={pending} icon={Clock3} color="amber" />
          <StatCard label="Fallback needed" value={fallback} icon={AlertCircle} color="rose" />
        </div>

        <Card>
          <CardHeader><CardTitle>All rides</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {rides.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No rides found.</p>}
            {rides.map(ride => (
              <div key={ride.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ride.patient?.user.firstName} {ride.patient?.user.lastName}</p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{ride.appointment.clinicName} · {ride.appointment.appointmentType}</p>
                  </div>
                  <Badge variant={statusVariant(ride.status)}>{ride.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral"><Clock3 size={11} style={{ marginRight: 3 }} />{toDisplayDate(ride.pickupTime)}</Badge>
                  {ride.urgencyLevel !== 'NORMAL' && <Badge variant={ride.urgencyLevel === 'CRITICAL' ? 'error' : 'warning'}>{ride.urgencyLevel}</Badge>}
                </div>
                {ride.driver
                  ? <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>Driver: {ride.driver.user.firstName} {ride.driver.user.lastName}</p>
                  : <p style={{ fontSize: 13, color: '#d97706', marginTop: 6 }}>No driver assigned</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {ride.status === 'PENDING' && <Button size="sm" variant="secondary" onClick={() => updateStatus(ride.id, 'FALLBACK_NEEDED')} disabled={actionLoading}>Escalate fallback</Button>}
                  {ride.status === 'IN_PROGRESS' && <Button size="sm" onClick={() => updateStatus(ride.id, 'COMPLETED')} disabled={actionLoading}>Mark complete</Button>}
                  {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                    <Button size="sm" variant="danger" onClick={() => updateStatus(ride.id, 'CANCELLED')} disabled={actionLoading}>Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
