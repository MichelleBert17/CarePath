'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/services/auth'

export default function RegisterPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('The password must contain at least 8 characters.')
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        firstName,
        lastName,
        phone,
        email,
        password,
        role: 'PATIENT',
      })

      console.log('Registration result:', result)

      if (result.token) {
        localStorage.setItem('carepathToken', result.token)
      }

      /*
        After registration, send the patient to the longer
        profile form for address, insurance, ride needs, etc.
      */
      router.push('/patient/intake')
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Something went wrong while creating your account.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const labelStyle = {
    display: 'block',
    color: '#334155',
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 7,
  }

  const inputStyle = {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    padding: '10px 13px',
    color: '#0f172a',
    background: '#ffffff',
    fontSize: 15,
    outline: 'none',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #e5dbea 0%, #ede9f7 50%, #d2b9d8 100%)',
        padding: 24,
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 750,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 18px 50px rgba(69, 4, 102, 0.14)',
          padding: 32,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          <p
            style={{
              color: '#1b9c86',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            CarePath
          </p>

          <h1
            style={{
              color: '#0f172a',
              fontSize: 30,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            Welcome to CarePath!
          </h1>

          <p
            style={{
              color: '#a589b1',
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            We just need a few details to create your account.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* First and last name */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            <div>
              <label htmlFor="firstName" style={labelStyle}>
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="lastName" style={labelStyle}>
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" style={labelStyle}>
              Phone number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(555) 555-5555"
              autoComplete="tel"
              required
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" style={labelStyle}>
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              style={inputStyle}
            />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter the password again"
              autoComplete="new-password"
              minLength={8}
              required
              style={inputStyle}
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                borderRadius: 10,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '11px 13px',
                fontSize: 14,
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              minHeight: 50,
              border: 'none',
              borderRadius: 11,
              background: isLoading ? '#94a3b8' : '#ae5a8b',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 800,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(174, 90, 139, 0.28)',
            }}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
            marginTop: 22,
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#0c6bc2',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign in here
          </Link>
        </p>

        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          <Link
            href="/"
            style={{
              color: '#64748b',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Return to the CarePath home page
          </Link>
        </div>
      </section>
    </main>
  )
}