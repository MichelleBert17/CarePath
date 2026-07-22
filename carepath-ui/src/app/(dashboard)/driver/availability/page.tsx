'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DriverAvailabilityPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [isAvailableNow, setIsAvailableNow] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { const t = localStorage.getItem('carepath.driver.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const toggleDay = (day: string) =>
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])

  const toggleAvailability = async () => {
    const next = !isAvailableNow
    if (mode === 'demo') { setIsAvailableNow(next); setMsg(`Demo: availability set to ${next ? 'available' : 'unavailable'}.`); return }
    if (!token) { setError('Token required.'); return }
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/drivers/availability`, { method: 'PATCH', headers, body: JSON.stringify({ isAvailableNow: next }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setIsAvailableNow(next); setMsg(`You are now ${next ? 'available' : 'unavailable'}.`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to update.') }
    finally { setSaving(false) }
  }

  const savePreferredDays = async () => {
    if (mode === 'demo') { setMsg(`Demo: preferred days saved — ${selectedDays.join(', ')}.`); return }
    if (!token) { setError('Token required.'); return }
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/drivers/profile`, { method: 'PUT', headers, body: JSON.stringify({ preferredDays: selectedDays.join(',') }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setMsg('Preferred days saved.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout role="driver" title="Availability" subtitle="Set when you are available for ride assignments" userName="Driver">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #0c6bc2, #052b56)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>Availability settings</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Coordinators use your availability to match you to rides before care is missed.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => setMode('demo')}>Demo</Button>
              <Button size="sm" onClick={() => setMode('live')}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Driver JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.driver.token'); if (t) { setToken(t); setMsg('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.driver.token', token); setMsg('Token saved.') }}>Save token</Button>
            </div>
          </div>
        </Card>

        {msg && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{msg}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <Card>
          <CardHeader><CardTitle>Right now</CardTitle></CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{isAvailableNow ? 'Available for rides' : 'Not available'}</p>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Toggle to update your real-time availability for coordinators.</p>
            </div>
            <button onClick={toggleAvailability} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {isAvailableNow ? <ToggleRight size={44} color="#1b9c86" /> : <ToggleLeft size={44} color="#94a3b8" />}
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle><Calendar size={16} style={{ display: 'inline', marginRight: 8 }} />Preferred days</CardTitle></CardHeader>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Select the days you are generally available for ride assignments.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)} style={{
                padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                borderColor: selectedDays.includes(day) ? '#0c6bc2' : '#e2e8f0',
                background: selectedDays.includes(day) ? '#dbeafe' : '#fff',
                color: selectedDays.includes(day) ? '#0c6bc2' : '#64748b',
                minHeight: 44,
              }}>{day}</button>
            ))}
          </div>
          <Button onClick={savePreferredDays} disabled={saving} style={{ marginTop: 16 }}>
            {saving ? 'Saving…' : 'Save preferred days'}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
