'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, CreditCard, ShieldCheck, Users, WifiOff } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

type DataMode = 'demo' | 'live'

type RideCredit = {
  id: string
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  status: string
  expiresAt: string | null
  notes: string | null
  partner: {
    id: string
    organization: string
    isVerified: boolean
    user: { firstName: string; lastName: string; email: string }
  }
}

const demoCredits: RideCredit[] = [
  {
    id: 'demo-credit-1',
    totalCredits: 100,
    usedCredits: 34,
    remainingCredits: 66,
    status: 'ACTIVE',
    expiresAt: null,
    notes: 'Quarterly grant allocation',
    partner: {
      id: 'demo-partner-1',
      organization: 'Arkansas Baptist Hospital',
      isVerified: true,
      user: { firstName: 'Katina', lastName: 'R', email: 'katina@arbaptist.org' },
    },
  },
  {
    id: 'demo-credit-2',
    totalCredits: 50,
    usedCredits: 50,
    remainingCredits: 0,
    status: 'DEPLETED',
    expiresAt: null,
    notes: null,
    partner: {
      id: 'demo-partner-2',
      organization: 'Southern Caregivers AR',
      isVerified: false,
      user: { firstName: 'Kimberly', lastName: 'S', email: 'kshipley@southerncaregiversar.com' },
    },
  },
]

export default function AdminCreditsPage() {
  const [mode, setMode] = useState<DataMode>('demo')
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [credits, setCredits] = useState<RideCredit[]>(demoCredits)
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('carepath.admin.token')
    if (saved) setToken(saved)
  }, [])

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
  }

  const loadCredits = async (): Promise<void> => {
    if (mode === 'demo') { setCredits(demoCredits); setResult('Demo data loaded.'); return }
    if (!token.trim()) { setError('Admin JWT token required.'); return }
    setIsLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${apiBaseUrl}/credits`, { headers: authHeaders, cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to load credits (${res.status}).`)
      setCredits(await res.json())
      setResult('Credits loaded.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits.')
    } finally { setIsLoading(false) }
  }

  const verifyPartner = async (partnerId: string, orgName: string): Promise<void> => {
    if (mode === 'demo') {
      setCredits((prev) => prev.map((c) =>
        c.partner.id === partnerId ? { ...c, partner: { ...c.partner, isVerified: true } } : c
      ))
      setResult(`Demo: ${orgName} verified.`)
      return
    }
    if (!token.trim()) { setError('Admin JWT token required.'); return }
    setActionLoading(true); setError(null)
    try {
      const res = await fetch(`${apiBaseUrl}/credits/partners/${partnerId}/verify`, {
        method: 'PATCH',
        headers: authHeaders,
      })
      if (!res.ok) throw new Error(`Verify failed (${res.status}).`)
      await loadCredits()
      setResult(`${orgName} verified successfully.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify partner.')
    } finally { setActionLoading(false) }
  }

  const activeCount = credits.filter((c) => c.status === 'ACTIVE').length
  const totalRemaining = credits.reduce((sum, c) => sum + c.remainingCredits, 0)
  const unverifiedCount = credits.filter((c) => !c.partner.isVerified).length

  return (
    <DashboardLayout role="admin" title="Credits & Partners" subtitle="Manage ride credits and partner verification" userName="Admin">
      <div className="cp-space-y-4">

        {/* Hero */}
        <section style={{
          borderRadius: 16, padding: '20px',
          background: 'linear-gradient(135deg, #052b56, #0c6bc2)',
          color: '#fff',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#93c5fd', marginBottom: 6 }}>
            Admin panel
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
            Ride credit balances and institutional partner verification.
          </h2>
        </section>

        {/* Mode + token */}
        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setCredits(demoCredits); setResult('Demo mode active.') }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); loadCredits() }} disabled={isLoading}>Live</Button>
            </div>
            <input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={(e) => setToken(e.target.value)}
              placeholder="Admin JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => {
                const s = window.localStorage.getItem('carepath.admin.token')
                if (s) { setToken(s); setResult('Token loaded.') }
              }}>Load token</Button>
              <Button size="sm" onClick={() => { window.localStorage.setItem('carepath.admin.token', token); setResult('Token saved.') }}>
                Save token
              </Button>
              <Button size="sm" variant="secondary" onClick={loadCredits} disabled={isLoading}>
                {isLoading ? 'Loading…' : 'Refresh'}
              </Button>
            </div>
          </div>
        </Card>

        {error  && <div className="cp-alert cp-alert-error"><WifiOff size={16} /> {error}</div>}
        {result && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} /> {result}</div>}

        {/* Stats */}
        <div className="cp-grid-3">
          <StatCard label="Active credit pools" value={activeCount} icon={CreditCard} color="teal" />
          <StatCard label="Total credits remaining" value={totalRemaining} icon={ShieldCheck} color="blue" />
          <StatCard label="Unverified partners" value={unverifiedCount} icon={Users} color="amber" />
        </div>

        {/* Credits list */}
        <Card>
          <CardHeader>
            <CardTitle>Ride credit pools</CardTitle>
          </CardHeader>
          <div className="cp-space-y-3">
            {credits.length === 0 && (
              <p style={{ fontSize: 14, color: '#64748b', padding: '12px 0' }}>No credit pools found.</p>
            )}
            {credits.map((credit) => (
              <div key={credit.id} style={{
                background: '#f8fafc', borderRadius: 12, padding: 16,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                      {credit.partner.organization}
                    </p>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                      {credit.partner.user.firstName} {credit.partner.user.lastName} · {credit.partner.user.email}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge variant={credit.status === 'ACTIVE' ? 'success' : credit.status === 'DEPLETED' ? 'error' : 'warning'}>
                      {credit.status}
                    </Badge>
                    <Badge variant={credit.partner.isVerified ? 'success' : 'warning'}>
                      {credit.partner.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Total</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{credit.totalCredits}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Used</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>{credit.usedCredits}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Remaining</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#1b9c86' }}>{credit.remainingCredits}</p>
                  </div>
                </div>

                {credit.notes && (
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 8 }}>{credit.notes}</p>
                )}

                {!credit.partner.isVerified && (
                  <div style={{ marginTop: 12 }}>
                    <Button size="sm" onClick={() => verifyPartner(credit.partner.id, credit.partner.organization)}
                      disabled={actionLoading}>
                      <ShieldCheck size={14} style={{ marginRight: 4 }} />
                      Verify partner
                    </Button>
                  </div>
                )}

                {credit.partner.isVerified && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1b9c86', marginTop: 10 }}>
                    <CheckCircle2 size={13} /> Partner verified
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

      </div>
    </DashboardLayout>
  )
}
