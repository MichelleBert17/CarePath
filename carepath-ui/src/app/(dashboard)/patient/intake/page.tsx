'use client'

import { FormEvent, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, HandHeart, ShieldCheck, Stethoscope, TimerReset, Wheelchair } from 'lucide-react'
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

  const intakeSummary = useMemo(() => {
    return [
      state.isWheelchairRequired ? 'Wheelchair required' : 'No wheelchair flag',
      state.isNonTransferable ? 'Non-transferable rider' : 'Transferable rider',
      `Requested booking window: ${state.requestedAdvanceWindowHours}h`,
      state.needsSameDayFallback ? 'Needs same-day fallback support' : 'No same-day fallback requested',
      state.allowsCommunityVolunteer ? 'Opted into community volunteer matching' : 'Opted out of volunteer matching',
    ]
  }, [state])

  const saveToken = (): void => {
    window.localStorage.setItem('carepath.patient.token', token)
    setResult('Patient token saved in browser storage.')
  }

  const loadToken = (): void => {
    const saved = window.localStorage.getItem('carepath.patient.token')
    if (saved) {
      setToken(saved)
      setResult('Loaded patient token from browser storage.')
    }
  }

  const submitIntake = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setResult(null)

    const payload = {
      appointmentType: state.appointmentType,
      clinicName: state.clinicName,
      clinicCity: state.clinicCity,
      clinicState: state.clinicState,
      appointmentDate: state.appointmentDate,
      estimatedMiles: Number(state.estimatedMiles),
      isRecurring: false,
      recurrenceNote: null,
      appointmentNotes: state.appointmentNotes,
      pickupAddress: state.pickupAddress,
      pickupTime: state.pickupTime,
      creditId: null,
      mobilityNeeds: state.mobilityNeeds,
      isWheelchairRequired: state.isWheelchairRequired,
      isNonTransferable: state.isNonTransferable,
      requestedAdvanceWindowHours: Number(state.requestedAdvanceWindowHours),
      urgencyLevel: state.urgencyLevel,
      needsSameDayFallback: state.needsSameDayFallback,
      allowsCommunityVolunteer: state.allowsCommunityVolunteer,
    }

    if (mode === 'demo') {
      setResult(`Demo mode: ride request prepared for ${state.clinicName || 'selected clinic'} with accessibility constraints included.`)
      return
    }

    if (!token.trim()) {
      setError('Patient JWT token is required for live mode.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${apiBaseUrl}/rides`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Ride request failed (${res.status}).`)
      }

      setResult('Ride request submitted successfully with accessibility and fallback intake data.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit intake.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      role="patient"
      title="Ride Intake"
      subtitle="Capture accessibility and urgency constraints before submitting a medical transportation request"
      userName="Patient"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-teal-100 bg-linear-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Access-first intake</p>
          <h2 className="mt-2 text-3xl font-bold">Request rides with the constraints dispatch actually needs.</h2>
          <p className="mt-2 max-w-3xl text-sm text-cyan-50/95">
            This intake captures wheelchair requirements, scheduling window conflicts, and same-day fallback preference so
            coordinators can pool Medicaid, community, and backup options proactively.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <input
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
            placeholder="http://localhost:3000/api"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Patient JWT token"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button size="sm" variant="secondary" onClick={loadToken}>Load token</Button>
          <Button size="sm" onClick={saveToken}>Save token</Button>
        </section>

        <section className="flex flex-wrap gap-2">
          <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live mode' : 'Demo mode'}</Badge>
          <Button size="sm" variant="secondary" onClick={() => setMode('demo')}>Use demo</Button>
          <Button size="sm" onClick={() => setMode('live')}>Use live</Button>
        </section>

        {result && (
          <Card className="border-emerald-200 bg-emerald-50">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} /> {result}
            </p>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <p className="flex items-center gap-2 text-sm font-medium text-red-700">
              <AlertCircle size={16} /> {error}
            </p>
          </Card>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Transportation intake form</CardTitle>
              <p className="text-sm text-slate-500">Required fields map directly to backend ride request + pooled dispatch logic.</p>
            </CardHeader>

            <form className="space-y-5" onSubmit={submitIntake}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Appointment type</span>
                  <select
                    value={state.appointmentType}
                    onChange={(event) => setState((prev) => ({ ...prev, appointmentType: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="SPECIALIST">Specialist</option>
                    <option value="DIALYSIS">Dialysis</option>
                    <option value="CARDIOLOGY">Cardiology</option>
                    <option value="ONCOLOGY">Oncology</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Urgency level</span>
                  <select
                    value={state.urgencyLevel}
                    onChange={(event) => setState((prev) => ({ ...prev, urgencyLevel: event.target.value as IntakeFormState['urgencyLevel'] }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Clinic name</span>
                  <input
                    required
                    value={state.clinicName}
                    onChange={(event) => setState((prev) => ({ ...prev, clinicName: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Clinic city</span>
                  <input
                    required
                    value={state.clinicCity}
                    onChange={(event) => setState((prev) => ({ ...prev, clinicCity: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Appointment date/time</span>
                  <input
                    required
                    type="datetime-local"
                    value={state.appointmentDate}
                    onChange={(event) => setState((prev) => ({ ...prev, appointmentDate: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Pickup time</span>
                  <input
                    required
                    type="datetime-local"
                    value={state.pickupTime}
                    onChange={(event) => setState((prev) => ({ ...prev, pickupTime: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Estimated miles</span>
                  <input
                    type="number"
                    min={1}
                    value={state.estimatedMiles}
                    onChange={(event) => setState((prev) => ({ ...prev, estimatedMiles: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm block">
                <span className="font-medium text-slate-700">Pickup address</span>
                <input
                  required
                  value={state.pickupAddress}
                  onChange={(event) => setState((prev) => ({ ...prev, pickupAddress: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="space-y-1 text-sm block">
                <span className="font-medium text-slate-700">Mobility needs</span>
                <textarea
                  rows={2}
                  value={state.mobilityNeeds}
                  onChange={(event) => setState((prev) => ({ ...prev, mobilityNeeds: event.target.value }))}
                  placeholder="Example: wheelchair van lift required"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={state.isWheelchairRequired}
                    onChange={(event) => setState((prev) => ({ ...prev, isWheelchairRequired: event.target.checked }))}
                  />
                  Wheelchair-accessible vehicle required
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={state.isNonTransferable}
                    onChange={(event) => setState((prev) => ({ ...prev, isNonTransferable: event.target.checked }))}
                  />
                  Rider is non-transferable
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={state.needsSameDayFallback}
                    onChange={(event) => setState((prev) => ({ ...prev, needsSameDayFallback: event.target.checked }))}
                  />
                  Needs same-day fallback option
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={state.allowsCommunityVolunteer}
                    onChange={(event) => setState((prev) => ({ ...prev, allowsCommunityVolunteer: event.target.checked }))}
                  />
                  Open to vetted community volunteers
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Current scheduling requirement (hours)</span>
                  <input
                    type="number"
                    min={0}
                    value={state.requestedAdvanceWindowHours}
                    onChange={(event) => setState((prev) => ({ ...prev, requestedAdvanceWindowHours: Number(event.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Additional notes</span>
                  <input
                    value={state.appointmentNotes}
                    onChange={(event) => setState((prev) => ({ ...prev, appointmentNotes: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit ride request'}
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispatch readiness summary</CardTitle>
              <p className="text-sm text-slate-500">What coordinators will use to prioritize and match your request.</p>
            </CardHeader>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Wheelchair size={16} /> Accessibility profile
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {intakeSummary.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Stethoscope size={16} /> Clinical context
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {state.appointmentType} at {state.clinicName || 'selected clinic'} in {state.clinicCity || 'city pending'}.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <TimerReset size={16} /> Fallback routing
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {state.needsSameDayFallback
                    ? 'Same-day fallback is enabled to reduce missed appointment risk.'
                    : 'Same-day fallback not requested.'}
                </p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-teal-800">
                  <HandHeart size={16} /> Community matching consent
                </p>
                <p className="mt-2 text-sm text-teal-700">
                  {state.allowsCommunityVolunteer
                    ? 'Vetted volunteer matching can be used if primary transportation fails.'
                    : 'Volunteer matching is disabled for this request.'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <ShieldCheck size={14} /> Intake protection
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Structured intake fields are attached to appointment notes in the backend so dispatch teams can prioritize
                  accessibility and fallback workflows consistently.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
