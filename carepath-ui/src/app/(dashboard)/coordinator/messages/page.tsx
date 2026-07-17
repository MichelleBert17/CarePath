'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { AlertCircle, MessageSquare, Send } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { demoPortalMessages, demoRides, PortalMessage, toDisplayDate } from '@/lib/portal'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3001/api'

const roleVariant = (role: string): 'info' | 'purple' | 'success' | 'neutral' => {
  if (role === 'COORDINATOR') return 'purple'
  if (role === 'DRIVER') return 'success'
  if (role === 'PATIENT') return 'info'
  return 'neutral'
}

export default function CoordinatorMessagesPage() {
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [messages, setMessages] = useState<PortalMessage[]>(demoPortalMessages)
  const [rideId, setRideId] = useState(demoRides[0]?.id ?? '')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

  const loadMessages = async () => {
    if (mode === 'demo' || !rideId) { setMessages(demoPortalMessages); return }
    if (!token) { setError('Token required.'); return }
    try {
      const res = await fetch(`${apiBase}/communication-logs/ride/${rideId}`, { headers })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setMessages(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load messages.') }
  }

  const loadRecent = async () => {
    if (mode === 'demo') { setMessages(demoPortalMessages); return }
    if (!token) { setError('Token required.'); return }
    try {
      const res = await fetch(`${apiBase}/communication-logs/portal/recent`, { headers })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setMessages(await res.json())
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed.') }
  }

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (mode === 'demo') {
      setMessages(prev => [...prev, { id: `demo-${Date.now()}`, channel: 'portal', direction: 'outbound', message: text, status: 'sent', relatedId: rideId, createdAt: new Date().toISOString(), user: { firstName: 'Coordinator', lastName: '', role: 'COORDINATOR' } }])
      setText(''); return
    }
    if (!token) { setError('Token required.'); return }
    setSending(true)
    try {
      const res = await fetch(`${apiBase}/communication-logs/portal`, { method: 'POST', headers, body: JSON.stringify({ rideId, message: text }) })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setText(''); await loadMessages()
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to send.') }
    finally { setSending(false) }
  }

  return (
    <DashboardLayout role="coordinator" title="Messages" subtitle="Shared communication portal for all roles" userName="Coordinator">
      <div className="cp-space-y-4">
        <section style={{ borderRadius: 16, padding: 20, background: 'linear-gradient(135deg, #5540a1, #094f91)', color: '#fff' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c4b5fd', marginBottom: 6 }}>Communication portal</p>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Coordinate with patients, drivers, and partners — all in one place.</h2>
        </section>

        <Card>
          <div className="cp-space-y-3">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live' : 'Demo'}</Badge>
              <Button size="sm" variant="secondary" onClick={() => { setMode('demo'); setMessages(demoPortalMessages) }}>Demo</Button>
              <Button size="sm" onClick={() => { setMode('live'); loadRecent() }}>Live</Button>
            </div>
            <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="API base URL" className="cp-input" />
            <input value={token} onChange={e => setToken(e.target.value)} placeholder="Coordinator JWT token" className="cp-input" />
            <input value={rideId} onChange={e => setRideId(e.target.value)} placeholder="Ride ID (leave blank for recent activity)" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const t = localStorage.getItem('carepath.coordinator.token'); if (t) setToken(t) }}>Load token</Button>
              <Button size="sm" onClick={() => { localStorage.setItem('carepath.coordinator.token', token) }}>Save token</Button>
              <Button size="sm" variant="secondary" onClick={rideId ? loadMessages : loadRecent}>Load messages</Button>
            </div>
          </div>
        </Card>

        {error && <div className="cp-alert cp-alert-error"><AlertCircle size={16} />{error}</div>}

        <Card>
          <CardHeader><CardTitle><MessageSquare size={16} style={{ display: 'inline', marginRight: 8 }} />Portal activity</CardTitle></CardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', padding: '4px 0' }}>
            {messages.length === 0 && <p style={{ fontSize: 14, color: '#64748b' }}>No messages yet.</p>}
            {messages.map(msg => (
              <div key={msg.id} style={{ padding: '10px 14px', borderRadius: 12, background: msg.direction === 'inbound' ? '#f8fafc' : '#faf9ff', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  {msg.user && <Badge variant={roleVariant(msg.user.role)}>{msg.user.firstName} {msg.user.lastName} · {msg.user.role}</Badge>}
                  <Badge variant="neutral">{msg.channel}</Badge>
                  {msg.relatedId && <Badge variant="info">Ride: {msg.relatedId.slice(0, 8)}</Badge>}
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{toDisplayDate(msg.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: '#0f172a' }}>{msg.message}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" className="cp-input" style={{ flex: 1 }} />
            <Button type="submit" disabled={sending || !text.trim()}><Send size={16} /></Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
