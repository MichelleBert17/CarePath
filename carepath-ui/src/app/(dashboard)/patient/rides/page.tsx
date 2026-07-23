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

export default function PatientRidesPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [rides, setRides] = useState<RideRow[]>(demoRides)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.patient.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setRides(demoRides); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Patient JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/patients/rides`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setRides(await res.json()); setMsg('Rides loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load rides.') }
    finally { setLoading(false) }
  }

  const completed = rides.filter(r => r.status === 'COMPLETED').length
  const upcoming = rides.filter(r => ['PENDING', 'MATCHED', 'CONFIRMED'].includes(r.status)).length

  return (
    <DashboardLayout role="patient" title="My Rides" subtitle="Your ride history and upcoming trips" userName="Patient">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #136e5e, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#99e6d8', marginBottom: 6 }}>Ride history</p>
          <h2  style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Track all your medical transportation requests in one place.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setRides(demoRides); setMsg('Demo mode.') }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); load() }} disabled={loading}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Patient JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.patient.token'); if (t) { setToken(t); setMsg('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.patient.token', token); setMsg('Token saved.') }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button>
            </div>
          </div>
        </Card>

        {msg && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{msg}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <div className="cp-grid-2">
          <StatCard label="Upcoming rides" value={upcoming} icon={Clock3} color="teal" />
          <StatCard label="Completed rides" value={completed} icon={Car} color="blue" />
        </div>

        <Card>
          <CardHeader><CardTitle>All rides</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {rides.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No rides found.</p>}
            {rides.map(ride => (
              <div key={ride.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ride.appointment.clinicName}</p>
                  <Badge variant={statusVariant(ride.status)}>{ride.status}</Badge>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{ride.appointment.clinicCity}, {ride.appointment.clinicState} · {ride.appointment.appointmentType}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral"><Clock3 size={11} style={{ marginRight: 3 }} />Pickup: {toDisplayDate(ride.pickupTime)}</Badge>
                  {ride.urgencyLevel !== 'NORMAL' && <Badge variant={ride.urgencyLevel === 'CRITICAL' ? 'error' : 'warning'}>{ride.urgencyLevel}</Badge>}
                </div>
                {ride.driver && (
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>Driver: {ride.driver.user.firstName} {ride.driver.user.lastName} · {ride.driver.user.phone}</p>
                )}
                {!ride.driver && ride.status === 'PENDING' && (
                  <p style={{ fontSize: 13, color: '#d97706', marginTop: 8 }}>Awaiting driver assignment</p>
                )}
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Pickup: {ride.pickupAddress}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
