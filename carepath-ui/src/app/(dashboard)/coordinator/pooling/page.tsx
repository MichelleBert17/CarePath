'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Car, Clock3, HandHeart, Route, ShieldCheck, UserRoundCheck, WifiOff } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { demoPendingRides, demoPoolingOptions, PendingRide, PoolCandidate, PoolingOptionsResponse } from '@/lib/pooling'

type DataMode = 'demo' | 'live'

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_CAREPATH_API_URL ?? 'http://localhost:3000/api'

const urgencyVariant: Record<PoolingOptionsResponse['urgencyLevel'], 'error' | 'warning' | 'info'> = {
  critical: 'error',
  high: 'warning',
  normal: 'info',
}

const toDisplayDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const fullName = (ride: PendingRide): string => `${ride.patient.user.firstName} ${ride.patient.user.lastName}`

const flattenCandidates = (poolingData: PoolingOptionsResponse | null): PoolCandidate[] => {
  if (!poolingData) return []
  return [...poolingData.pools.community.candidates, ...poolingData.pools.primary.candidates]
}

export default function CoordinatorPoolingPage() {
  const [mode, setMode] = useState<DataMode>('demo')
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE)
  const [token, setToken] = useState('')
  const [pendingRides, setPendingRides] = useState<PendingRide[]>(demoPendingRides)
  const [selectedRideId, setSelectedRideId] = useState<string>(demoPendingRides[0]?.id ?? '')
  const [poolingOptions, setPoolingOptions] = useState<PoolingOptionsResponse | null>(demoPoolingOptions)
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = window.localStorage.getItem('carepath.coordinator.token')
    if (savedToken) setToken(savedToken)
  }, [])

  const selectedRide = useMemo(
    () => pendingRides.find((ride) => ride.id === selectedRideId) ?? null,
    [pendingRides, selectedRideId]
  )

  const allCandidates = useMemo(() => flattenCandidates(poolingOptions), [poolingOptions])

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token.trim()) headers.Authorization = `Bearer ${token.trim()}`
    return headers
  }, [token])

  const runLiveLoad = async (): Promise<void> => {
    if (!token.trim()) {
      setErrorMessage('A coordinator JWT token is required for live mode.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setActionMessage(null)

    try {
      const pendingRes = await fetch(`${apiBaseUrl}/rides/pending`, {
        method: 'GET',
        headers: authHeaders,
        cache: 'no-store',
      })

      if (!pendingRes.ok) {
        throw new Error(`Unable to load pending rides (${pendingRes.status}).`)
      }

      const rides = (await pendingRes.json()) as PendingRide[]
      setPendingRides(rides)

      const targetRideId = rides[0]?.id ?? ''
      setSelectedRideId(targetRideId)

      if (!targetRideId) {
        setPoolingOptions(null)
        setActionMessage('No pending rides available right now.')
        return
      }

      const optionsRes = await fetch(`${apiBaseUrl}/rides/${targetRideId}/pooling-options`, {
        method: 'GET',
        headers: authHeaders,
        cache: 'no-store',
      })

      if (!optionsRes.ok) {
        throw new Error(`Unable to load pooling options (${optionsRes.status}).`)
      }

      const options = (await optionsRes.json()) as PoolingOptionsResponse
      setPoolingOptions(options)
      setActionMessage('Live data loaded successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load live data.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRideOptions = async (rideId: string): Promise<void> => {
    setSelectedRideId(rideId)
    if (mode === 'demo') {
      setPoolingOptions({ ...demoPoolingOptions, rideId })
      return
    }

    try {
      const optionsRes = await fetch(`${apiBaseUrl}/rides/${rideId}/pooling-options`, {
        method: 'GET',
        headers: authHeaders,
        cache: 'no-store',
      })

      if (!optionsRes.ok) {
        throw new Error(`Unable to load pooling options (${optionsRes.status}).`)
      }

      const options = (await optionsRes.json()) as PoolingOptionsResponse
      setPoolingOptions(options)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load pooling options.'
      setErrorMessage(message)
    }
  }

  const handleAssign = async (driverId: string): Promise<void> => {
    if (!selectedRideId) return

    if (mode === 'demo') {
      setActionMessage(`Demo: assigned ${driverId} to ${selectedRideId}.`)
      return
    }

    setActionLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`${apiBaseUrl}/rides/${selectedRideId}/assign`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ driverId }),
      })

      if (!res.ok) throw new Error(`Assign failed (${res.status}).`)

      await runLiveLoad()
      setActionMessage('Driver assigned successfully.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign driver.'
      setErrorMessage(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleFallback = async (): Promise<void> => {
    if (!selectedRideId) return

    if (mode === 'demo') {
      setActionMessage(`Demo: fallback triggered for ${selectedRideId}.`)
      return
    }

    setActionLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch(`${apiBaseUrl}/rides/${selectedRideId}/fallback`, {
        method: 'PATCH',
        headers: authHeaders,
      })

      if (!res.ok) throw new Error(`Fallback trigger failed (${res.status}).`)

      await runLiveLoad()
      setActionMessage('Fallback mode triggered for this ride.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger fallback.'
      setErrorMessage(message)
    } finally {
      setActionLoading(false)
    }
  }

  const switchToDemo = (): void => {
    setMode('demo')
    setErrorMessage(null)
    setActionMessage('Demo mode active.')
    setPendingRides(demoPendingRides)
    setSelectedRideId(demoPendingRides[0]?.id ?? '')
    setPoolingOptions(demoPoolingOptions)
  }

  const switchToLive = async (): Promise<void> => {
    setMode('live')
    await runLiveLoad()
  }

  const saveToken = (): void => {
    window.localStorage.setItem('carepath.coordinator.token', token)
    setActionMessage('Coordinator token saved in browser storage.')
  }

  const totalPrimary = poolingOptions?.pools.primary.count ?? 0
  const totalCommunity = poolingOptions?.pools.community.count ?? 0

  return (
    <DashboardLayout
      role="coordinator"
      title="Pooled Transport Hub"
      subtitle="Dispatch from primary networks and community volunteers before care is missed"
      userName="Coordinator"
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-teal-100 bg-linear-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 text-white shadow-lg">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Operational mode</p>
              <h2 className="mt-2 text-3xl font-bold">Unified dispatch for medical transportation continuity</h2>
              <p className="mt-2 max-w-3xl text-sm text-cyan-50/95">
                Use live mode with a coordinator token to work real ride queues, assign from pooled options, and trigger same-day
                fallback before appointments fail.
              </p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Data mode</p>
                <Badge variant={mode === 'live' ? 'success' : 'warning'}>{mode === 'live' ? 'Live API' : 'Demo'}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={switchToDemo}>Use demo</Button>
                <Button size="sm" onClick={switchToLive} disabled={isLoading}>Load live</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live coordinator setup</CardTitle>
              <p className="text-sm text-slate-500">Point the hub to your API and provide a coordinator JWT token.</p>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={apiBaseUrl}
                onChange={(event) => setApiBaseUrl(event.target.value)}
                placeholder="http://localhost:3000/api"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Coordinator JWT token"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <Button size="sm" onClick={saveToken}>Save token</Button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} />
              Token is stored locally in your browser for this environment only.
            </div>
          </Card>

          <StatCard label="Pending rides" value={pendingRides.length} icon={AlertTriangle} color="amber" />
        </section>

        {errorMessage && (
          <Card className="border-red-200 bg-red-50">
            <p className="flex items-center gap-2 text-sm font-medium text-red-700">
              <WifiOff size={16} /> {errorMessage}
            </p>
          </Card>
        )}

        {actionMessage && (
          <Card className="border-teal-200 bg-teal-50">
            <p className="text-sm font-medium text-teal-700">{actionMessage}</p>
          </Card>
        )}

        <section className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
          <Card>
            <CardHeader>
              <CardTitle>Ride queue</CardTitle>
              <p className="text-sm text-slate-500">Select a ride to view pooled candidates and recommended actions.</p>
            </CardHeader>
            <div className="space-y-3">
              {pendingRides.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No pending rides.</div>
              )}

              {pendingRides.map((ride) => {
                const isSelected = ride.id === selectedRideId
                const isWheelchair = [ride.patient.disability, ride.patient.barriers, ride.patient.notes]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes('wheelchair')

                return (
                  <button
                    key={ride.id}
                    onClick={() => loadRideOptions(ride.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${isSelected ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{fullName(ride)}</p>
                      <Badge variant={ride.status === 'FALLBACK_NEEDED' ? 'error' : 'info'}>{ride.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{ride.appointment.clinicName}, {ride.appointment.clinicCity}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="neutral"><Clock3 size={12} className="mr-1" />{toDisplayDate(ride.pickupTime)}</Badge>
                      {isWheelchair && <Badge variant="warning"><Car size={12} className="mr-1" />Wheelchair constraint</Badge>}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Pooled matching options</CardTitle>
                <p className="text-sm text-slate-500">Primary and community candidates are ranked by reliability and fit.</p>
              </div>
              {poolingOptions && <Badge variant={urgencyVariant[poolingOptions.urgencyLevel]}>Urgency: {poolingOptions.urgencyLevel}</Badge>}
            </CardHeader>

            {!selectedRide || !poolingOptions ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Select a ride to view matching options.</div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Primary pool" value={totalPrimary} icon={Route} color="blue" />
                  <StatCard label="Community pool" value={totalCommunity} icon={HandHeart} color="teal" />
                  <StatCard label="Total candidates" value={allCandidates.length} icon={UserRoundCheck} color="amber" />
                </div>

                <div className="mt-4 space-y-3">
                  {allCandidates.map((candidate) => (
                    <div key={candidate.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{candidate.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={candidate.poolType === 'community' ? 'success' : 'info'}>
                            {candidate.poolType === 'community' ? 'Community' : 'Primary'}
                          </Badge>
                          <Badge variant={candidate.canServeDistance ? 'success' : 'warning'}>
                            score {candidate.matchScore}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{candidate.phone} - {candidate.maxMilesOneWay} miles max - reliability {candidate.reliabilityScore.toFixed(1)}</p>
                      {candidate.communityNotes && <p className="mt-1 text-sm text-slate-500">{candidate.communityNotes}</p>}
                      <div className="mt-2">
                        <Button size="sm" onClick={() => handleAssign(candidate.id)} disabled={actionLoading || isLoading}>
                          Assign driver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Recommended actions</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {poolingOptions.recommendedActions.map((action) => (
                      <li key={action}>- {action}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button size="sm" variant="danger" onClick={handleFallback} disabled={actionLoading || isLoading}>
                      Trigger fallback escalation
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
