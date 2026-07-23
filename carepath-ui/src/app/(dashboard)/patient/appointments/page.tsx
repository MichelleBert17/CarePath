'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoRides, RideRow, statusVariant, toDisplayDate } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

export default function PatientAppointmentsPage() {
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
      setRides(await res.json()); setMsg('Appointments loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const upcoming = rides.filter(r => ['PENDING', 'MATCHED', 'CONFIRMED', 'IN_PROGRESS'].includes(r.status))
  const past = rides.filter(r => ['COMPLETED', 'CANCELLED'].includes(r.status))

  return (
    <DashboardLayout role="patient" title="Appointments" subtitle="Upcoming and past medical appointments" userName="Patient">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #136e5e, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#99e6d8', marginBottom: 6 }}>Appointment tracker</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Every appointment tied to a confirmed ride reduces missed care.</h2>
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
          <StatCard label="Upcoming" value={upcoming.length} icon={Calendar} color="teal" />
          <StatCard label="Past appointments" value={past.length} icon={CheckCircle2} color="blue" />
        </div>

        {upcoming.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Upcoming appointments</CardTitle></CardHeader>
            <div className="cp-space-y-3">
              {upcoming.map(ride => (
                <div key={ride.id} style={{ border: '1.5px solid #99e6d8', borderRadius: 12, padding: 16, background: '#f0fdf9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ride.appointment.clinicName}</p>
                    <Badge variant={statusVariant(ride.status)}>{ride.status}</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{ride.appointment.appointmentType} · {ride.appointment.clinicCity}, {ride.appointment.clinicState}</p>
                  <p style={{ fontSize: 13, color: '#136e5e', marginTop: 6, fontWeight: 600 }}>Appt: {toDisplayDate(ride.appointment.appointmentDate)}</p>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>Pickup: {toDisplayDate(ride.pickupTime)}</p>
                  {ride.driver && <p style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>Driver: {ride.driver.user.firstName} {ride.driver.user.lastName} · {ride.driver.user.phone}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {past.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Past appointments</CardTitle></CardHeader>
            <div className="cp-space-y-3">
              {past.map(ride => (
                <div key={ride.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{ride.appointment.clinicName}</p>
                    <Badge variant={statusVariant(ride.status)}>{ride.status}</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{ride.appointment.appointmentType} · {toDisplayDate(ride.appointment.appointmentDate)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
