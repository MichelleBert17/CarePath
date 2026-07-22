'use client'

import Link from 'next/link'
import {
  Calendar,
  Car,
  MessageSquare,
  User,
  ClipboardList,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function PatientDashboardPage() {
  return (
    <DashboardLayout
      role="patient"
      title="Patient Dashboard"
      subtitle="Manage rides, appointments, messages, and profile information"
      userName="Patient"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Welcome banner */}
        <section
          style={{
            borderRadius: '16px',
            padding: '30px',
            background:
            'linear-gradient(135deg, #a10e97 0%, #36717d 100%)',
            boxShadow: '0 10px 24px rgba(9, 79, 145, 0.18)',
          }}
        >
          <p
            style={{
              margin: 0,
              marginBottom: '8px',
              color: '#c8f7ee',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            Welcome to CarePath
          </p>

          <h2
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: 800,
              lineHeight: 1.35,
            }}
          >
            What would you like to do today?
          </h2>

          <p
            style={{
              maxWidth: '700px',
              marginTop: '10px',
              marginBottom: 0,
              color: '#e0f2fe',
              fontSize: '15px',
              lineHeight: 1.6,
            }}
          >
            Request transportation, review upcoming rides, check messages,
            or update your patient profile.
          </p>
        </section>

        {/* Main action cards */}
        <section
          style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(230px, 1fr))',
          }}
        >
          <Link href="/patient/request-ride" style={cardStyle}>
            <div style={iconWrapperStyle}>
              <Car size={26} />
            </div>

            <h2 style={cardTitleStyle}>Request a Ride</h2>

            <p style={cardTextStyle}>
              Schedule transportation for an upcoming medical appointment.
            </p>
          </Link>

          <Link href="/patient/rides" style={cardStyle}>
            <div style={iconWrapperStyle}>
              <Calendar size={26} />
            </div>

            <h2 style={cardTitleStyle}>My Rides</h2>

            <p style={cardTextStyle}>
              Review upcoming, completed, and previous ride requests.
            </p>
          </Link>

          <Link href="/patient/messages" style={cardStyle}>
            <div style={iconWrapperStyle}>
              <MessageSquare size={26} />
            </div>

            <h2 style={cardTitleStyle}>Messages</h2>

            <p style={cardTextStyle}>
              View updates from coordinators and transportation providers.
            </p>
          </Link>

          <Link href="/patient/profile" style={cardStyle}>
            <div style={iconWrapperStyle}>
              <User size={26} />
            </div>

            <h2 style={cardTitleStyle}>My Profile</h2>

            <p style={cardTextStyle}>
              Update contact, accessibility, insurance, and ride preferences.
            </p>
          </Link>
        </section>

        {/* Intake reminder */}
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '18px',
            padding: '24px 28px',
            borderRadius: '14px',
            border: '1px solid #ded5eb',
            background:
              'linear-gradient(135deg, #e6d0b4 0%, #c394c8 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                flexShrink: 0,
                borderRadius: '10px',
                backgroundColor: '#f5eae3',
                color: '#703c91',
              }}
            >
              <ClipboardList size={22} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  marginBottom: '6px',
                  color: '#052b56',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Patient Intake Profile
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#6d8b64',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}
              >
                Complete or update your detailed transportation and care
                information.
              </p>
            </div>
          </div>

          <Link
            href="/patient/intake"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '46px',
              padding: '0 22px',
              borderRadius: '10px',
              backgroundColor: '#703c91',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 5px 14px rgba(112, 60, 145, 0.22)',
            }}
          >
            Open Intake Form
          </Link>
        </section>
      </div>
    </DashboardLayout>
  )
}

const cardStyle = {
  display: 'block',
  minHeight: '210px',
  padding: '26px',
  borderRadius: '14px',
  border: '1px solid #dbe7ee',
  backgroundColor: '#ffffff',
  color: '#136e5e',
  textDecoration: 'none',
  boxShadow: '0 6px 18px rgba(5, 43, 86, 0.06)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
}

const iconWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: '#e5f5f2',
  color: '#137d6b',
}

const cardTitleStyle = {
  marginTop: '18px',
  marginBottom: '8px',
  color: '#052b56',
  fontSize: '19px',
  fontWeight: 800,
}

const cardTextStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.55,
}