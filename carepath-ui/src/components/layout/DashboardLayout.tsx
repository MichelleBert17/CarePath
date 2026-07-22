'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Car,
  User,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  LogOut,
  Heart,
  MapPin,
  Route,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

type Role = 'patient' | 'driver' | 'coordinator' | 'admin'

const bottomNavItems: Record<Role, { label: string; href: string; icon: React.ElementType }[]> = {
 patient: [
  {
    label: 'Dashboard',
    href: '/patient/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Request Ride',
    href: '/patient/request-ride',
    icon: Route,
  },
  {
    label: 'My Rides',
    href: '/patient/rides',
    icon: Car,
  },
  {
    label: 'Appointments',
    href: '/patient/appointments',
    icon: Calendar,
  },
  {
    label: 'Messages',
    href: '/patient/messages',
    icon: MessageSquare,
  },
  {
    label: 'My Profile',
    href: '/patient/profile',
    icon: Users,
  },
],
  driver: [
    { label: 'Home',    href: '/driver',              icon: LayoutDashboard },
    { label: 'Rides',   href: '/driver/rides',        icon: Car },
    { label: 'Routes',  href: '/driver/routes',       icon: MapPin },
    { label: 'Hours',   href: '/driver/availability', icon: Calendar },
  ],
  coordinator: [
    { label: 'Home',    href: '/coordinator',         icon: LayoutDashboard },
    { label: 'Pooling', href: '/coordinator/pooling', icon: Route },
    { label: 'Rides',   href: '/coordinator/rides',   icon: Car },
    { label: 'Patients',href: '/coordinator/patients',icon: Users },
    { label: 'Messages',href: '/coordinator/messages',icon: MessageSquare },
  ],
  admin: [
    { label: 'Home',    href: '/admin',          icon: LayoutDashboard },
    { label: 'Credits', href: '/admin/credits',  icon: CreditCard },
    { label: 'ROI',     href: '/admin/roi',      icon: BarChart3 },
    { label: 'Partners',href: '/admin/partners', icon: Users },
  ],
}

const roleAccent: Record<Role, string> = {
  patient:     '#1b9c86',
  driver:      '#0c6bc2',
  coordinator: '#5540a1',
  admin:       '#052b56',
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: Role
  title: string
  subtitle?: string
  userName?: string
}

export function DashboardLayout({ children, role, title, subtitle, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const accent = roleAccent[role]
  const tabs = bottomNavItems[role]

  return (
    <div className="cp-shell">
      {/* Desktop sidebar */}
      <Sidebar role={role} userName={userName} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="cp-sidebar-overlay">
          <div className="cp-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
          <div className="cp-sidebar-drawer">
            <Sidebar role={role} userName={userName} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="cp-main">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '16px', paddingBottom: '8px' }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom tab nav */}
      <nav className="cp-bottom-nav">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== `/${role}` && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`cp-bottom-nav-item${active ? ' active' : ''}`}
              style={active ? { color: accent } : {}}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
