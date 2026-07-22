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

export default function DriverRidesPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [rides, setRides] = useState<RideRow[]>(demoRides.filter(r => r.driver !== null))
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.driver.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setRides(demoRides.filter(r => r.driver !== null)); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Driver JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/rides/my-driver-rides`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setRides(await res.json()); setMsg('Rides loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const updateStatus = async (rideId: string, status: string) => {
    if (mode === 'demo') {
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, status } : r))
      setMsg(`Demo: ride status updated to ${status}.`); return
    }
    if (!token) { setError('Token required.'); return }
    setActionLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/rides/${rideId}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg(`Ride status updated to ${status}.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to update status.') }
    finally { setActionLoading(false) }
  }

  const confirmRide = async (rideId: string) => {
    if (mode === 'demo') { setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'CONFIRMED' } : r)); setMsg('Demo: ride confirmed.'); return }
    if (!token) { setError('Token required.'); return }
    setActionLoading(true)
    try {
      const res = await fetch(`${apiBase}/rides/${rideId}/confirm`, { method: 'PATCH', headers })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      await load(); setMsg('Ride confirmed.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to confirm.') }
    finally { setActionLoading(false) }
  }

  const active = rides.filter(r => ['MATCHED', 'CONFIRMED', 'IN_PROGRESS'].includes(r.status))
  const completed = rides.filter(r => r.status === 'COMPLETED').length

  return (
    <DashboardLayout role="driver" title="My Rides" subtitle="Assigned rides and status management" userName="Driver">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #0c6bc2, #052b56)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>Driver rides</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Confirm, start, and complete your assigned medical transport rides.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setRides(demoRides.filter(r => r.driver !== null)); setMsg('Demo mode.') }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); load() }} disabled={loading}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Driver JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.driver.token'); if (t) { setToken(t); setMsg('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.driver.token', token); setMsg('Token saved.') }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button>
            </div>
          </div>
        </Card>

        {msg && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{msg}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <div className="cp-grid-2">
          <StatCard label="Active rides" value={active.length} icon={Car} color="blue" />
          <StatCard label="Completed" value={completed} icon={CheckCircle2} color="teal" />
        </div>

        <Card>
          <CardHeader><CardTitle>Assigned rides</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {rides.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No rides assigned.</p>}
            {rides.map(ride => (
              <div key={ride.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ride.appointment.clinicName}</p>
                  <Badge variant={statusVariant(ride.status)}>{ride.status}</Badge>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{ride.appointment.appointmentType} · {ride.appointment.clinicCity}, {ride.appointment.clinicState}</p>
                {ride.patient && <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Patient: {ride.patient.user.firstName} {ride.patient.user.lastName} · {ride.patient.user.phone}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral"><Clock3 size={11} style={{ marginRight: 3 }} />Pickup: {toDisplayDate(ride.pickupTime)}</Badge>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{ride.pickupAddress}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {ride.status === 'MATCHED' && <Button size="sm" onClick={() => confirmRide(ride.id)} disabled={actionLoading}>Confirm ride</Button>}
                  {ride.status === 'CONFIRMED' && <Button size="sm" onClick={() => updateStatus(ride.id, 'IN_PROGRESS')} disabled={actionLoading}>Start ride</Button>}
                  {ride.status === 'IN_PROGRESS' && <Button size="sm" onClick={() => updateStatus(ride.id, 'COMPLETED')} disabled={actionLoading}>Complete ride</Button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
