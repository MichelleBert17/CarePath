'use client'

import { FormEvent, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Users } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3001/api'

type Form = { county: string; state: string; organization: string; stipendActive: boolean }
const initial: Form = { county: '', state: 'AR', organization: '', stipendActive: false }

export default function CoordinatorProfilePage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [form, setForm] = useState<Form>(initial)
  const [isVerified, setIsVerified] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (p: Partial<Form>) => setForm(prev => ({ ...prev, ...p }))
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])

  const load = async () => {
    if (mode === 'demo') { setForm({ county: 'Pulaski', state: 'AR', organization: 'Arkansas Baptist Hospital', stipendActive: true }); setIsVerified(true); setResult('Demo profile loaded.'); return }
    if (!token) { setError('Coordinator JWT token required.'); return }
    try {
      const res = await fetch(`${apiBase}/coordinators/profile`, { headers })
      if (!res.ok) throw new Error(`Load failed (${res.status})`)
      const d = await res.json()
      setForm({ county: d.county ?? '', state: d.state ?? 'AR', organization: d.organization ?? '', stipendActive: d.stipendActive ?? false })
      setIsVerified(d.isVerified ?? false)
      setResult('Profile loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
  }

  const save = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setResult(null)
    if (mode === 'demo') { setResult('Demo: profile saved.'); return }
    if (!token) { setError('Token required.'); return }
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/coordinators/profile`, { method: 'PUT', headers, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      setResult('Profile saved successfully.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout role="coordinator" title="My Profile" subtitle="Coordinator setup and organization details" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Coordinator profile</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Your county and organization determine which patients and rides you manage.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => setMode('demo')}>Demo</Button>
              <Button size="sm" onClick={() => setMode('live')}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Coordinator JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) { setToken(t); setResult('Token loaded.') } }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.coordinator.token', token); setResult('Token saved.') }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={load}>Load profile</Button>
            </div>
          </div>
        </Card>

        {result && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} />{result}</div>}
        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <CardTitle><Users size={16} style={{ display: 'inline', marginRight: 8 }} />Profile setup</CardTitle>
              <Badge variant={isVerified ? 'success' : 'warning'}>{isVerified ? 'Verified coordinator' : 'Pending verification'}</Badge>
            </div>
          </CardHeader>
          <form className="cp-space-y-4" onSubmit={save}>
            <div className="cp-grid-2">
              <div><label className="cp-label">County</label><input value={form.county} onChange={e => set({ county: e.target.value })} className="cp-input" /></div>
              <div><label className="cp-label">State</label><input value={form.state} onChange={e => set({ state: e.target.value })} className="cp-input" /></div>
            </div>
            <div><label className="cp-label">Organization</label><input value={form.organization} onChange={e => set({ organization: e.target.value })} placeholder="e.g. Arkansas Baptist Hospital" className="cp-input" /></div>
            <label className="cp-checkbox-row">
              <input type="checkbox" checked={form.stipendActive} onChange={e => set({ stipendActive: e.target.checked })} />
              Stipend active
            </label>
            <Button type="submit" disabled={saving} className="cp-btn-full">{saving ? 'Saving…' : 'Save profile'}</Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
