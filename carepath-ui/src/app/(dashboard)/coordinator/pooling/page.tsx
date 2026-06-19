import {
  AlertTriangle,
  Ambulance,
  Bus,
  Car,
  Clock3,
  HandHeart,
  MapPinned,
  Route,
  Users,
  Wallet,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

type PoolCandidate = {
  name: string
  eta: string
  reliability: string
  note: string
}

type PoolChannel = {
  name: string
  icon: React.ElementType
  status: 'ready' | 'limited' | 'empty'
  throughput: string
  candidates: PoolCandidate[]
}

const pooledChannels: PoolChannel[] = [
  {
    name: 'Medicaid NEMT Network',
    icon: Bus,
    status: 'limited',
    throughput: '2 of 6 providers currently available',
    candidates: [
      {
        name: 'Access Transit 14',
        eta: '45 min',
        reliability: '79%',
        note: 'Can only confirm 24h in advance',
      },
    ],
  },
  {
    name: 'Community Volunteer Drivers',
    icon: HandHeart,
    status: 'ready',
    throughput: '5 active volunteers on standby',
    candidates: [
      {
        name: 'Samuel R.',
        eta: '22 min',
        reliability: '96%',
        note: 'Faith network volunteer with pediatric route history',
      },
      {
        name: 'Angela M.',
        eta: '28 min',
        reliability: '94%',
        note: 'Available for same-day fallback requests',
      },
    ],
  },
  {
    name: 'Wheelchair Van Pool',
    icon: Car,
    status: 'limited',
    throughput: '1 wheelchair-capable van available',
    candidates: [
      {
        name: 'Mobility Van 03',
        eta: '35 min',
        reliability: '92%',
        note: 'Can cover Little Rock specialty appointments',
      },
    ],
  },
  {
    name: 'Same-Day Urgent Backup',
    icon: Ambulance,
    status: 'ready',
    throughput: 'Rapid response escalation active',
    candidates: [
      {
        name: 'BridgeCare Escalation Line',
        eta: '<15 min triage',
        reliability: 'Policy-backed',
        note: 'Use before emergency-only escalation',
      },
    ],
  },
]

const statusVariant: Record<PoolChannel['status'], 'success' | 'warning' | 'error'> = {
  ready: 'success',
  limited: 'warning',
  empty: 'error',
}

const statusText: Record<PoolChannel['status'], string> = {
  ready: 'Ready',
  limited: 'Limited',
  empty: 'Unavailable',
}

export default function CoordinatorPoolingPage() {
  return (
    <DashboardLayout
      role="coordinator"
      title="Pooled Transport Hub"
      subtitle="Blend Medicaid, community volunteers, and fallback services before appointments are lost"
      userName="Coordinator"
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-linear-to-r from-teal-700 via-cyan-700 to-blue-700 p-6 text-white shadow-lg">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-amber-200/20 blur-2xl" />
          <div className="relative grid gap-4 md:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">Validation-aligned workflow</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight">Prevent missed care by pooling every transportation path in one dispatch surface.</h2>
              <p className="mt-3 max-w-2xl text-cyan-50/95">
                Built from caregiver evidence: wheelchair constraints, 72-hour scheduling conflicts, night-before failures,
                and emergency-only fallback costs.
              </p>
            </div>
            <Card className="border-0 bg-white/12 p-4 text-white backdrop-blur">
              <CardTitle className="text-white">Live risk pulse</CardTitle>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-100">At-risk rides today</span>
                  <strong>7</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-100">Need wheelchair vans</span>
                  <strong>3</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-100">Volunteer coverage</span>
                  <strong>71%</strong>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open ride risks" value="7" icon={AlertTriangle} color="amber" trend={{ value: '2 high urgency', positive: false }} />
          <StatCard label="Community volunteers live" value="5" icon={Users} color="teal" trend={{ value: 'up from 3 yesterday', positive: true }} />
          <StatCard label="Wheelchair capacity gap" value="2 rides" icon={Car} color="rose" trend={{ value: 'still unresolved', positive: false }} />
          <StatCard label="Avoided emergency fallback" value="$284" icon={Wallet} color="blue" trend={{ value: 'today savings', positive: true }} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Critical Ride Queue</CardTitle>
                <p className="text-sm text-slate-500">Highest-risk transportation requests requiring pooled matching now.</p>
              </div>
              <Badge variant="error">Urgency: Critical</Badge>
            </CardHeader>

            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">Michelle B. - Pediatric Specialty Ride</h3>
                <Badge variant="warning">Wheelchair required</Badge>
                <Badge variant="warning">72-hour conflict</Badge>
                <Badge variant="error">No backup confirmed</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Little Rock specialty destination. Existing provider notified family the night before with no wheelchair-capable
                assignment. Historical fallback required ambulance plus paid rideshare.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Pickup window</p>
                  <p className="mt-1 font-semibold text-slate-800">Today, 3:40 PM</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Estimated distance</p>
                  <p className="mt-1 font-semibold text-slate-800">47 miles one-way</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Escalation timer</p>
                  <p className="mt-1 font-semibold text-red-600">01:12:44 remaining</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm">Assign volunteer + van</Button>
                <Button size="sm" variant="secondary">Trigger same-day backup</Button>
                <Button size="sm" variant="ghost">Message caregiver status</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <p className="text-sm text-slate-500">Evidence-driven playbook for this ride profile.</p>
            </CardHeader>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="rounded-xl border border-slate-200 p-3">1. Reserve wheelchair-capable capacity before non-accessible options.</li>
              <li className="rounded-xl border border-slate-200 p-3">2. Activate community volunteers when provider confirmation misses the 24-hour threshold.</li>
              <li className="rounded-xl border border-slate-200 p-3">3. Use same-day urgent backup to prevent ambulance-only escalation.</li>
              <li className="rounded-xl border border-slate-200 p-3">4. Prioritize medical appointments over day-program transport when capacity is constrained.</li>
            </ul>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Pooled Transportation Channels</CardTitle>
                <p className="text-sm text-slate-500">Unified view across primary networks and community-based fallback capacity.</p>
              </div>
              <Button variant="secondary" size="sm">
                <Route size={16} /> Refresh capacity
              </Button>
            </CardHeader>

            <div className="grid gap-4 xl:grid-cols-2">
              {pooledChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div key={channel.name} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-200">
                          <Icon size={18} className="text-slate-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{channel.name}</p>
                          <p className="text-sm text-slate-500">{channel.throughput}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[channel.status]}>{statusText[channel.status]}</Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      {channel.candidates.map((candidate) => (
                        <div key={candidate.name} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-slate-900">{candidate.name}</p>
                            <Badge variant="info">
                              <Clock3 size={12} className="mr-1" /> {candidate.eta}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Reliability: {candidate.reliability}</p>
                          <p className="mt-1 text-sm text-slate-600">{candidate.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinned size={16} /> Destination coverage
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">Little Rock route demand exceeds weekly wheelchair-capable supply by 38%.</p>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bus size={16} /> Scheduling friction
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">72-hour advance rules conflict with specialty and post-surgical scheduling patterns.</p>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ambulance size={16} /> Cost leakage
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">Without same-day backup, families drift into ambulance and out-of-pocket rideshare costs.</p>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
