'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, CheckCircle2, DollarSign } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

type CostLog = {
  id: string
  costCents: number
  fundingSource: string
  estimatedSavingsCents: number | null
  notes: string | null
  createdAt: string
  rideRequest: { id: string; status: string; patient?: { user: { firstName: string; lastName: string } } }
}

const demoCostLogs: CostLog[] = [
  { id: 'log-1', costCents: 4500, fundingSource: 'MEDICAID_NEMT', estimatedSavingsCents: 85000, notes: 'Avoided ER visit', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), rideRequest: { id: 'ride-1', status: 'COMPLETED', patient: { user: { firstName: 'Churchie', lastName: 'B' } } } },
  { id: 'log-2', costCents: 3200, fundingSource: 'GRANT', estimatedSavingsCents: 42000, notes: 'Dialysis continuity maintained', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), rideRequest: { id: 'ride-2', status: 'COMPLETED', patient: { user: { firstName: 'Alyssa', lastName: 'M' } } } },
]

export default function AdminROIPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [logs, setLogs] = useState<CostLog[]>(demoCostLogs)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.admin.token'); if (t) setToken(t) }, [])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const load = async () => {
    if (mode === 'demo') { setLogs(demoCostLogs); setMsg('Demo data loaded.'); return }
    if (!token) { setError('Admin JWT token required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBase}/ride-cost-logs`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setLogs(await res.json()); setMsg('Cost logs loaded.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load.') }
    finally { setLoading(false) }
  }

  const totalCost = logs.reduce((s, l) => s + l.costCents, 0)
  const totalSavings = logs.reduce((s, l) => s + (l.estimatedSavingsCents ?? 0), 0)
  const roi = totalCost > 0 ? ((totalSavings - totalCost) / totalCost * 100).toFixed(0) : '0'

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`

  return (
    <DashboardLayout role="admin" title="Cost & ROI" subtitle="Ride cost logs and estimated healthcare savings" userName="Admin">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #052b56, #0c6bc2)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>ROI dashboard</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Every completed ride represents avoided downstream healthcare costs.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setLogs(demoCostLogs); setMsg('Demo mode.') }}>Demo</Button>
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

        <div className="cp-grid-3">
          <StatCard label="Total ride cost" value={fmt(totalCost)} icon={DollarSign} color="blue" />
          <StatCard label="Estimated savings" value={fmt(totalSavings)} icon={BarChart3} color="teal" />
          <StatCard label="ROI %" value={`${roi}%`} icon={CheckCircle2} color="purple" />
        </div>

        <Card>
          <CardHeader><CardTitle>Ride cost logs</CardTitle></CardHeader>
          <div className="cp-space-y-3">
            {logs.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No cost logs found.</p>}
            {logs.map(log => (
              <div key={log.id} style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                      {log.rideRequest.patient ? `${log.rideRequest.patient.user.firstName} ${log.rideRequest.patient.user.lastName}` : `Ride ${log.rideRequest.id.slice(0, 8)}`}
                    </p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{log.fundingSource}</p>
                  </div>
                  <Badge variant="info">{log.rideRequest.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Ride cost</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0c6bc2' }}>{fmt(log.costCents)}</p>
                  </div>
                  {log.estimatedSavingsCents != null && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>Est. savings</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#1b9c86' }}>{fmt(log.estimatedSavingsCents)}</p>
                    </div>
                  )}
                </div>
                {log.notes && <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>{log.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
