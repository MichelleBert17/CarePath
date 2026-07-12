import Image from 'next/image'
import Link from 'next/link'
import { Ambulance, ArrowRight, Bus, Car, HandHeart, ShieldCheck, TimerReset } from 'lucide-react'

const CAREPATH_LOGO_URL = 'https://raw.githubusercontent.com/Debalent/CarePath/main/carepath-ui/public/carepath-logo.png'

const pillars = [
  {
    icon: Bus,
    title: 'Pool Every Existing Network',
    description: 'Bring Medicaid transport, clinic shuttles, and local providers into one dispatch decision layer.',
  },
  {
    icon: HandHeart,
    title: 'Activate Community Volunteers',
    description: 'Use vetted volunteers as fallback coverage before missed appointments become a care crisis.',
  },
  {
    icon: TimerReset,
    title: 'Intervene Before Failure',
    description: 'Surface risk signals early so teams can recover rides before the appointment window closes.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100" style={{ background: 'linear-gradient(135deg, #052b56 0%, #0c6bc2 45%, #5540a1 75%, #1b9c86 100%)' }}>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-12 pt-10 md:px-10">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(85,64,161,0.25)' }} />
          <div className="absolute -bottom-20 right-6 h-56 w-56 rounded-full blur-3xl" style={{ background: 'rgba(27,156,134,0.25)' }} />

          <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
            <div>
              {/* Logo + wordmark */}
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src={CAREPATH_LOGO_URL}
                  alt="CarePath"
                  width={52}
                  height={52}
                  className="rounded-xl object-contain"
                />
                <span className="text-2xl font-bold tracking-tight text-white">CarePath</span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: '#a5d8ff' }}>
                Transportation Coordination for Medical Care
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Reliable rides to medical appointments, anywhere in the country.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                CarePath helps patients arrange transportation to medical appointments — reducing no-shows and
                removing the communication and coordination failures that cause missed care. We pool Medicaid
                transport, community volunteers, and local providers into one coordination layer so wheelchair
                needs, same-day urgency, and long-distance specialty appointments are never left behind.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/coordinator/pooling"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: '#1b9c86', color: '#ffffff' }}
                >
                  Open Pooling Hub <ArrowRight size={16} />
                </Link>
                <a
                  href="#validation"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  View evidence signals
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 p-5" style={{ background: 'rgba(5,43,86,0.45)' }}>
              <p className="text-sm font-semibold" style={{ color: '#a5d8ff' }}>Current priority profile</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Wheelchair-dependent family routing</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <Car size={14} className="mt-0.5" style={{ color: '#1b9c86' }} />
                  Limited wheelchair van supply for specialty runs
                </li>
                <li className="flex items-start gap-2">
                  <Ambulance size={14} className="mt-0.5" style={{ color: '#1b9c86' }} />
                  Avoid ambulance-only fallback by escalating same-day backup
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="mt-0.5" style={{ color: '#1b9c86' }} />
                  Prioritize medical visits over non-clinical scheduling conflict
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <article key={pillar.title} className="rounded-2xl border border-white/10 p-5 shadow-lg" style={{ background: 'rgba(5,43,86,0.4)' }}>
                <div className="inline-flex rounded-xl p-2" style={{ background: 'rgba(85,64,161,0.3)', color: '#c4b5fd' }}>
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{pillar.description}</p>
              </article>
            )
          })}
        </section>

        {/* Validation signals */}
        <section id="validation" className="rounded-3xl border p-6 md:p-8" style={{ borderColor: 'rgba(27,156,134,0.3)', background: 'rgba(5,43,86,0.5)' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#6ee7d4' }}>
            Validation-backed direction
          </p>
          <div className="mt-3 grid gap-4 text-sm text-slate-200 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">Night-before no-provider calls repeatedly create no-recovery windows.</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">Rigid 72-hour scheduling fails urgent but non-emergency medical events.</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">Families absorb cost and stress when systems default to ambulance plus paid rideshare.</div>
          </div>
        </section>
      </main>
    </div>
  )
}
