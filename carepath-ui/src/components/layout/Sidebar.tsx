"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Car,
  User,
  CreditCard,
  MessageSquare,
  BarChart3,
  LogOut,
  Heart,
  MapPin,
  Route,
} from "lucide-react";

type Role = "patient" | "driver" | "coordinator" | "admin";

const navItems: Record<
  Role,
  { label: string; href: string; icon: React.ElementType }[]
> = {
  patient: [
    {
      label: "Dashboard",
      href: "/patient/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Request Ride",
      href: "/patient/request-ride",
      icon: Route,
    },
    {
      label: "My Rides",
      href: "/patient/rides",
      icon: Car,
    },
    {
      label: "Appointments",
      href: "/patient/appointments",
      icon: Calendar,
    },
    {
      label: "Messages",
      href: "/patient/messages",
      icon: MessageSquare,
    },
    
    {
      label: "My Profile",
      href: "/patient/profile",
      icon: User,
    },
  ],
  driver: [
    { label: "Dashboard", href: "/driver", icon: LayoutDashboard },
    { label: "My Rides", href: "/driver/rides", icon: Car },
    { label: "Depot Routes", href: "/driver/routes", icon: MapPin },
    { label: "Availability", href: "/driver/availability", icon: Calendar },
  ],
  coordinator: [
    { label: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
    { label: "Pooling Hub", href: "/coordinator/pooling", icon: Route },
    { label: "Ride Requests", href: "/coordinator/rides", icon: Car },
    { label: "Patients", href: "/coordinator/patients", icon: User },
    { label: "Drivers", href: "/coordinator/drivers", icon: Heart },
    { label: "Depot Routes", href: "/coordinator/routes", icon: MapPin },
    { label: "Messages", href: "/coordinator/messages", icon: MessageSquare },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Credits", href: "/admin/credits", icon: CreditCard },
    { label: "Cost & ROI", href: "/admin/roi", icon: BarChart3 },
    { label: "Partners", href: "/admin/partners", icon: User },
  ],
};

const roleLabels: Record<Role, string> = {
  patient: "Patient Portal",
  driver: "Driver Portal",
  coordinator: "Coordinator Portal",
  admin: "Partner Portal",
};

const roleAccent: Record<Role, string> = {
  patient: "#1b9c86",
  driver: "#0c6bc2",
  coordinator: "#5540a1",
  admin: "#052b56",
};

interface SidebarProps {
  role: Role;
  userName?: string;
}

export function Sidebar({ role, userName = "User" }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role];
  const accent = roleAccent[role];

  return (
    <aside className="cp-sidebar">
      {/* Logo */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/carepath-logo.png"
            alt="CarePath"
            width={38}
            height={38}
            style={{ borderRadius: 10, objectFit: "contain" }}
          />
          <div>
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#0f172a",
                lineHeight: 1,
              }}
            >
              CarePath
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
              {roleLabels[role]}
            </p>
          </div>
        </div>
      </div>

      {/* Role pill */}
      <div style={{ padding: "12px 16px 4px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            background: accent + "18",
            color: accent,
          }}
        >
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "8px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`cp-nav-item${active ? " active" : ""}`}
              style={active ? { background: accent + "15", color: accent } : {}}
            >
              <Icon size={17} style={active ? { color: accent } : {}} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px", borderTop: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: accent + "20",
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#94a3b8",
                textTransform: "capitalize",
              }}
            >
              {role}
            </p>
          </div>
          <LogOut size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
