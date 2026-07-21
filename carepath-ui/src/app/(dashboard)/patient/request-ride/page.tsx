'use client'


import { FormEvent, useMemo, useState } from 'react'
import { Accessibility, AlertCircle, CheckCircle2, HandHeart, ShieldCheck, Stethoscope, TimerReset } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'


const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'


type SubmitMode = 'demo' | 'live'


type IntakeFormState = {
  appointmentType: string
  clinicName: string
  clinicCity: string
  clinicState: string
  appointmentDate: string
  pickupTime: string
  estimatedMiles: number
  pickupAddress: string
  appointmentNotes: string
  mobilityNeeds: string
  isWheelchairRequired: boolean
  isNonTransferable: boolean
  requestedAdvanceWindowHours: number
  urgencyLevel: 'critical' | 'high' | 'normal'
  needsSameDayFallback: boolean
  allowsCommunityVolunteer: boolean
}


const initialState: IntakeFormState = {
  appointmentType: 'SPECIALIST',
  clinicName: '',
  clinicCity: '',
  clinicState: 'AR',
  appointmentDate: '',
  pickupTime: '',
  estimatedMiles: 20,
  pickupAddress: '',
  appointmentNotes: '',
  mobilityNeeds: '',
  isWheelchairRequired: true,
  isNonTransferable: true,
  requestedAdvanceWindowHours: 72,
  urgencyLevel: 'high',
  needsSameDayFallback: true,
  allowsCommunityVolunteer: true,
}


export default function PatientIntakePage() {
  const [mode, setMode] = useState<SubmitMode>('demo')
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [state, setState] = useState<IntakeFormState>(initialState)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)


  const set = (patch: Partial<IntakeFormState>) => setState((prev) => ({ ...prev, ...patch }))


  const intakeSummary = useMemo(() => [
    state.isWheelchairRequired ? 'Wheelchair required' : 'No wheelchair flag',
    state.isNonTransferable ? 'Non-transferable rider' : 'Transferable rider',
    `Booking window: ${state.requestedAdvanceWindowHours}h`,
    state.needsSameDayFallback ? 'Same-day fallback enabled' : 'No same-day fallback',
    state.allowsCommunityVolunteer ? 'Community volunteer matching on' : 'Volunteer matching off',
  ], [state])


  const submitIntake = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null); setResult(null)


    if (mode === 'demo') {
      setResult(`Demo: ride request prepared for ${state.clinicName || 'selected clinic'}.`)
      return
    }
    if (!token.trim()) { setError('Patient JWT token is required for live mode.'); return }


    setIsSubmitting(true)
    try {
      const res = await fetch(`${apiBaseUrl}/rides`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, estimatedMiles: Number(state.estimatedMiles), requestedAdvanceWindowHours: Number(state.requestedAdvanceWindowHours), isRecurring: false, recurrenceNote: null, creditId: null }),
      })
      if (!res.ok) throw new Error(`Ride request failed (${res.status}).`)
      setResult('Ride request submitted successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit intake.')
    } finally { setIsSubmitting(false) }
  }


  return (
    <DashboardLayout role="patient" title="Ride Intake" subtitle="Request medical transportation" userName="Patient">
      <div className="cp-space-y-4">


        {/* Hero */}
        <section style={{
          borderRadius: 16, padding: '20px',
          background: 'linear-gradient(135deg, #136e5e, #094f91)',
          color: '#fff',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#99e6d8', marginBottom: 6 }}>
            Access-first intake
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
            Request rides with the constraints dispatch actually needs.
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
              placeholder="Patient JWT token" className="cp-input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => { const s = window.localStorage.getItem('carepath.patient.token'); if (s) { setToken(s); setResult('Token loaded.') } }}>
                Load token
              </Button>
              <Button size="sm" onClick={() => { window.localStorage.setItem('carepath.patient.token', token); setResult('Token saved.') }}>
                Save token
              </Button>
            </div>
          </div>
        </Card>


        {result && <div className="cp-alert cp-alert-success"><CheckCircle2 size={16} /> {result}</div>}
        {error  && <div className="cp-alert cp-alert-error"><AlertCircle size={16} /> {error}</div>}


        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Transportation intake form</CardTitle>
          </CardHeader>
          <form className="cp-space-y-4" onSubmit={submitIntake}>


            <div className="cp-grid-2">
              <div>
                <label className="cp-label">Appointment type</label>
                <select value={state.appointmentType} onChange={(e) => set({ appointmentType: e.target.value })} className="cp-select">
                  <option value="SPECIALIST">Specialist</option>
                  <option value="DIALYSIS">Dialysis</option>
                  <option value="CARDIOLOGY">Cardiology</option>
                  <option value="ONCOLOGY">Oncology</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="cp-label">Urgency level</label>
                <select value={state.urgencyLevel} onChange={(e) => set({ urgencyLevel: e.target.value as IntakeFormState['urgencyLevel'] })} className="cp-select">
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
            </div>


            <div className="cp-grid-2">
              <div>
                <label className="cp-label">Clinic name</label>
                <input required value={state.clinicName} onChange={(e) => set({ clinicName: e.target.value })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Clinic city</label>
                <input required value={state.clinicCity} onChange={(e) => set({ clinicCity: e.target.value })} className="cp-input" />
              </div>
            </div>


            <div className="cp-grid-2">
              <div>
                <label className="cp-label">Appointment date/time</label>
                <input required type="datetime-local" value={state.appointmentDate} onChange={(e) => set({ appointmentDate: e.target.value })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Pickup time</label>
                <input required type="datetime-local" value={state.pickupTime} onChange={(e) => set({ pickupTime: e.target.value })} className="cp-input" />
              </div>
            </div>


            <div>
              <label className="cp-label">Pickup address</label>
              <input required value={state.pickupAddress} onChange={(e) => set({ pickupAddress: e.target.value })} className="cp-input" />
            </div>


            <div>
              <label className="cp-label">Mobility needs</label>
              <textarea rows={2} value={state.mobilityNeeds} onChange={(e) => set({ mobilityNeeds: e.target.value })}
                placeholder="e.g. wheelchair van lift required" className="cp-textarea" />
            </div>


            <div className="cp-grid-2">
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={state.isWheelchairRequired} onChange={(e) => set({ isWheelchairRequired: e.target.checked })} />
                Wheelchair-accessible vehicle required
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={state.isNonTransferable} onChange={(e) => set({ isNonTransferable: e.target.checked })} />
                Rider is non-transferable
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={state.needsSameDayFallback} onChange={(e) => set({ needsSameDayFallback: e.target.checked })} />
                Needs same-day fallback option
              </label>
              <label className="cp-checkbox-row">
                <input type="checkbox" checked={state.allowsCommunityVolunteer} onChange={(e) => set({ allowsCommunityVolunteer: e.target.checked })} />
                Open to vetted community volunteers
              </label>
            </div>


            <div className="cp-grid-2">
              <div>
                <label className="cp-label">Advance booking window (hours)</label>
                <input type="number" min={0} value={state.requestedAdvanceWindowHours} onChange={(e) => set({ requestedAdvanceWindowHours: Number(e.target.value) })} className="cp-input" />
              </div>
              <div>
                <label className="cp-label">Additional notes</label>
                <input value={state.appointmentNotes} onChange={(e) => set({ appointmentNotes: e.target.value })} className="cp-input" />
              </div>
            </div>


            <Button type="submit" disabled={isSubmitting} className="cp-btn-full">
              {isSubmitting ? 'Submitting…' : 'Submit ride request'}
            </Button>
          </form>
        </Card>


        {/* Dispatch readiness summary */}
        <Card>
          <CardHeader>
            <CardTitle>Dispatch readiness summary</CardTitle>
          </CardHeader>
          <div className="cp-space-y-3">
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                <Accessibility size={15} /> Accessibility profile
              </p>
              {intakeSummary.map((item) => (
                <p key={item} style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>— {item}</p>
              ))}
            </div>


            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                <Stethoscope size={15} /> Clinical context
              </p>
              <p style={{ fontSize: 13, color: '#475569' }}>
                {state.appointmentType} at {state.clinicName || 'selected clinic'} in {state.clinicCity || 'city pending'}.
              </p>
            </div>


            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
                <TimerReset size={15} /> Fallback routing
              </p>
              <p style={{ fontSize: 13, color: '#475569' }}>
                {state.needsSameDayFallback ? 'Same-day fallback enabled to reduce missed appointment risk.' : 'Same-day fallback not requested.'}
              </p>
            </div>


            <div style={{ background: '#d0f4ee', borderRadius: 12, padding: 14, border: '1px solid #99e6d8' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#136e5e', marginBottom: 6 }}>
                <HandHeart size={15} /> Community matching
              </p>
              <p style={{ fontSize: 13, color: '#136e5e' }}>
                {state.allowsCommunityVolunteer ? 'Vetted volunteer matching enabled if primary transport fails.' : 'Volunteer matching disabled.'}
              </p>
            </div>


            <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 6 }}>
                <ShieldCheck size={13} /> Intake protection
              </p>
              <p style={{ fontSize: 13, color: '#475569' }}>
                Structured intake fields are attached to appointment notes so dispatch teams can prioritize accessibility and fallback workflows consistently.
              </p>
            </div>
          </div>
        </Card>


      </div>
    </DashboardLayout>
  )
}



