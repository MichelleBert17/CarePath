'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, Car, CheckCircle2, MapPin, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

type SubmitMode = 'demo' | 'live'

type DriverProfileForm = {
  county: string
  state: string
  vehicleCapacity: number
  isWheelchairAccessible: boolean
  isInFallbackPool: boolean
  maxMilesOneWay: number
  preferredDays: string
  communityNotes: string
  providerType: string
  acceptsCreditCard: boolean
  acceptsMedicaid: boolean
  acceptsGrantPay: boolean
}

const initialForm: DriverProfileForm = {
  county: 'Washington',
  state: 'AR',
  vehicleCapacity: 4,
  isWheelchairAccessible: false,
  isInFallbackPool: true,
  maxMilesOneWay: 50,
  preferredDays: 'Mon,Tue,Wed,Thu,Fri',
  communityNotes: '',
  providerType: 'VOLUNTEER_DRIVER',
  acceptsCreditCard: false,
  acceptsMedicaid: false,
  acceptsGrantPay: true,
}

export default function DriverDashboardPage() {
  const [mode, setMode] = useState<SubmitMode>('demo')
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [form, setForm] = useState<DriverProfileForm>(initialForm)
  const [isAvailableNow, setIsAvailableNow] = useState(false)
  const [ridesCompleted, setRidesCompleted] = useState(0)
  const [reliabilityScore, setReliabilityScore] = useState(5.0)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const set = (patch: Partial<DriverProfileForm>) => setForm((prev) => ({ ...prev, ...patch }))

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
  }

  useEffect(() => {
    const saved = window.localStorage.getItem('carepath.driver.token')
    if (saved) setToken(saved)
  }, [])

  const loadProfile = async (): Promise<void> => {
    if (mode === 'demo') { setResult('Demo mode: showing default profile.'); return }
    if (!token.trim()) { setError('Driver JWT token required.'); return }
    try {
      const res = await fetch(`${apiBaseUrl}/drivers/profile`, { headers: authHeaders })
      if (!res.ok) throw new Error(`Failed to load profile (${res.status}).`)
      const data = await res.json()
      setForm({
        county: data.county ?? '',
        state: data.state ?? '',
        vehicleCapacity: data.vehicleCapacity ?? 4,
        isWheelchairAccessible: data.isWheelchairAccessible ?? false,
        isInFallbackPool: data.isInFallbackPool ?? false,
        maxMilesOneWay: data.maxMilesOneWay ?? 50,
        preferredDays: data.preferredDays ?? '',
        communityNotes: data.communityNotes ?? '',
        providerType: data.providerType ?? 'VOLUNTEER_DRIVER',
        acceptsCreditCard: data.acceptsCreditCard ?? false,
        acceptsMedicaid: data.acceptsMedicaid ?? false,
        acceptsGrantPay: data.acceptsGrantPay ?? true,
      })
      setIsAvailableNow(data.isAvailableNow ?? false)
      setRidesCompleted(data.ridesCompleted ?? 0)
      setReliabilityScore(data.reliabilityScore ?? 5.0)
      setResult('Profile loaded.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.')
    }
  }

  const saveProfile = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null); setResult(null)
    if (mode === 'demo') { setResult('Demo: profile saved locally.'); return }
    if (!token.trim()) { setError('Driver JWT token required.'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${apiBaseUrl}/drivers/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ ...form, isAvailableNow }),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status}).`)
      setResult('Profile saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.')
    } finally { setIsSubmitting(false) }
  }

  const toggleAvailability = async (): Promise<void> => {
    const next = !isAvailableNow
    if (mode === 'demo') { setIsAvailableNow(next); setResult(`Demo: availability set to ${next ? 'available' : 'unavailable'}.`); return }
    if (!token.trim()) { setError('Driver JWT token required.'); return }
    try {
      const res = await fetch(`${apiBaseUrl}/drivers/availability`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isAvailableNow: next }),
      })
      if (!res.ok) throw new Error(`Availability update failed (${res.status}).`)
      setIsAvailableNow(next)
      setResult(`You are now ${next ? 'available' : 'unavailable'} for rides.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability.')
    }
  }

  return (
    <DashboardLayout role="driver" title="Driver Dashboard" subtitle="Manage your profile and availability" userName="Driver">
      <div className="cp-space-y-4">

        {/* Hero */}
        <section style={{
          borderRadius: 16, padding: '20px',
          background: 'linear-gradient(135deg, #0c6bc2, #052b56)',
          color: '#fff',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>
            Driver portal
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
            Set your availability and vehicle profile for dispatch matching.
          </h2>
        </section>

        {/* Mode + token */}
        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => setMode('demo')}>Demo</Button>
              <Button size="sm" onClick={() => setMode('live')}>Live</Button>
            </div>
            <input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={(e) => setToken(e.target.value)}
              placeholder="Driver JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => {
                const s = window.localStorage.getItem('carepath.driver.token')
                if (s) { setToken(s); setResult('Token loaded.') }
              }}>Load token</Button>
              <Button size="sm" onClick={() => { window.localStorage.setItem('carepath.driver.token', token); setResult('Token saved.') }}>
                Save token
              </Button>
              <Button size="sm" variant="secondary" onClick={loadProfile}>Load profile</Button>
            </div>
          </div>
        </Card>

        {result && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} /> {result}</div>}
        {error  && <div className="cp-alert cp-alert-error"><AlertCircle size={16} /> {error}</div>}

        {/* Stats */}
        <div className="cp-grid-3">
          <StatCard label="Rides completed" value={ridesCompleted} icon={Car} color="blue" />
          <StatCard label="Reliability score" value={reliabilityScore.toFixed(1)} icon={ShieldCheck} color="teal" />
          <StatCard label="Max miles (one way)" value={form.maxMilesOneWay} icon={MapPin} color="purple" />
        </div>

        {/* Availability toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                {isAvailableNow ? 'You are available for rides' : 'You are not available'}
              </p>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                Toggle to let coordinators know you can take a ride now.
              </p>
            </div>
            <button onClick={toggleAvailability} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {isAvailableNow
                ? <ToggleRight size={40} color="#1b9c86" />
                : <ToggleLeft size={40} color="#94a3b8" />}
            </button>
          </div>
        </Card>

        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle &amp; driver profile</CardTitle>
          </CardHeader>
          <form className="cp-space-y-4" onSubmit={saveProfile}>

            <div className="cp-grid-2">
              <div>
                <label className="cp-label">County</label>
                <input value={form.county} onChange={(e) => set({ county: e.target.value })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">State</label>
                <input value={form.state} onChange={(e) => set({ state: e.target.value })} className="cp-input" />
              </div>
            </div>

            <div className="cp-grid-2">
              <div>
                <label className="cp-label">Vehicle capacity (passengers)</label>
                <input type="number" min={1} value={form.vehicleCapacity}
                  onChange={(e) => set({ vehicleCapacity: Number(e.target.value) })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Max miles one way</label>
                <input type="number" min={1} value={form.maxMilesOneWay}
                  onChange={(e) => set({ maxMilesOneWay: Number(e.target.value) })} className="cp-input" />
              </div>
            </div>

            <div>
              <label className="cp-label">Provider type</label>
              <select value={form.providerType} onChange={(e) => set({ providerType: e.target.value })} className="cp-select">
                <option value="VOLUNTEER_DRIVER">Volunteer Driver</option>
                <option value="NEMT_VAN">NEMT Van</option>
                <option value="RIDESHARE">Rideshare</option>
                <option value="TAXI">Taxi</option>
                <option value="COMMUNITY_SHUTTLE">Community Shuttle</option>
                <option value="WHEELCHAIR_VAN">Wheelchair Van</option>
                <option value="AMBULETTE">Ambulette</option>
                <option value="PUBLIC_TRANSIT">Public Transit</option>
              </select>
            </div>

            <div>
              <label className="cp-label">Preferred days (e.g. Mon,Wed,Fri)</label>
              <input value={form.preferredDays} onChange={(e) => set({ preferredDays: e.target.value })} className="cp-input" />
            </div>

            <div>
              <label className="cp-label">Community notes</label>
              <textarea rows={2} value={form.communityNotes}
                onChange={(e) => set({ communityNotes: e.target.value })}
                placeholder="e.g. Church volunteer, wheelchair route support"
                className="cp-textarea" />
            </div>

            <div className="cp-grid-2">
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={form.isWheelchairAccessible}
                  onChange={(e) => set({ isWheelchairAccessible: e.target.checked })} />
                Wheelchair-accessible vehicle
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={form.isInFallbackPool}
                  onChange={(e) => set({ isInFallbackPool: e.target.checked })} />
                Available for fallback pool
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={form.acceptsMedicaid}
                  onChange={(e) => set({ acceptsMedicaid: e.target.checked })} />
                Accepts Medicaid NEMT
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={form.acceptsCreditCard}
                  onChange={(e) => set({ acceptsCreditCard: e.target.checked })} />
                Accepts credit card
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={form.acceptsGrantPay}
                  onChange={(e) => set({ acceptsGrantPay: e.target.checked })} />
                Accepts grant/partner pay
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="cp-btn-full">
              {isSubmitting ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </Card>

      </div>
    </DashboardLayout>
  )
}
