'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Car, Users, CreditCard,
  MessageSquare, BarChart3, LogOut, Heart, MapPin, Route
} from 'lucide-react'

type Role = 'patient' | 'driver' | 'coordinator' | 'admin'

const navItems: Record<Role, { label: string; href: string; icon: React.ElementType }[]> = {
  patient: [
    { label: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { label: 'Request Ride', href: '/patient/intake', icon: Route },
    { label: 'My Rides', href: '/patient/rides', icon: Car },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Messages', href: '/patient/messages', icon: MessageSquare },
  ],
  driver: [
    { label: 'Dashboard', href: '/driver', icon: LayoutDashboard },
    { label: 'My Rides', href: '/driver/rides', icon: Car },
    { label: 'Depot Routes', href: '/driver/routes', icon: MapPin },
    { label: 'Availability', href: '/driver/availability', icon: Calendar },
  ],
  coordinator: [
    { label: 'Dashboard', href: '/coordinator', icon: LayoutDashboard },
    { label: 'Pooling Hub', href: '/coordinator/pooling', icon: Route },
    { label: 'Ride Requests', href: '/coordinator/rides', icon: Car },
    { label: 'Patients', href: '/coordinator/patients', icon: Users },
    { label: 'Drivers', href: '/coordinator/drivers', icon: Heart },
    { label: 'Depot Routes', href: '/coordinator/routes', icon: MapPin },
    { label: 'Messages', href: '/coordinator/messages', icon: MessageSquare },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Credits', href: '/admin/credits', icon: CreditCard },
    { label: 'Cost & ROI', href: '/admin/roi', icon: BarChart3 },
    { label: 'Partners', href: '/admin/partners', icon: Users },
  ],
}

const roleLabels: Record<Role, string> = {
  patient: 'Patient Portal',
  driver: 'Driver Portal',
  coordinator: 'Coordinator Portal',
  admin: 'Partner Portal',
}

interface SidebarProps {
  role: Role
  userName?: string
}

export function Sidebar({ role, userName = 'User' }: SidebarProps) {
  const pathname = usePathname()
  const items = navItems[role]

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Heart size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">CarePath</p>
            <p className="text-xs text-slate-400 mt-0.5">{roleLabels[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={18} className={active ? 'text-teal-600' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-400 capitalize">{role}</p>
          </div>
          <LogOut size={16} className="text-slate-400 hover:text-red-500 transition-colors" />
        </div>
      </div>
    </aside>
  )
}
