// Shared types and demo data for the communication portal

export type PortalMessage = {
  id: string
  channel: string
  direction: string
  message: string | null
  status: string | null
  relatedId: string | null
  createdAt: string
  user: { firstName: string; lastName: string; role: string } | null
}

export type RideRow = {
  id: string
  status: string
  pickupTime: string
  pickupAddress: string
  urgencyLevel: string
  isFallbackUsed: boolean
  appointment: {
    appointmentType: string
    clinicName: string
    clinicCity: string
    clinicState: string
    estimatedMiles: number
    appointmentDate: string
  }
  driver: { user: { firstName: string; lastName: string; phone: string } } | null
  coordinator: { user: { firstName: string; lastName: string; phone: string } } | null
  patient?: { user: { firstName: string; lastName: string; phone: string }; county: string; state: string }
}

export type PatientRow = {
  id: string
  county: string
  state: string
  zipCode: string
  primaryLanguage: string
  accessibilityRequirement: string
  schedulingConstraint: string
  defaultFundingSource: string | null
  barriers: string | null
  disability: string | null
  notes: string | null
  user: { firstName: string; lastName: string; email: string; phone: string }
}

export type DriverRow = {
  id: string
  county: string
  state: string
  vehicleCapacity: number
  isAvailableNow: boolean
  isInFallbackPool: boolean
  isWheelchairAccessible: boolean
  maxMilesOneWay: number
  reliabilityScore: number
  ridesCompleted: number
  providerType: string
  communityNotes: string | null
  user: { firstName: string; lastName: string; email: string; phone: string }
}

export type DepotRouteRow = {
  id: string
  depotName: string
  depotAddress: string
  county: string
  state: string
  destinationCity: string
  destinationState: string
  departureTime: string
  returnTime: string | null
  maxPassengers: number
  isActive: boolean
  recurrenceNote: string | null
  coordinator: { user: { firstName: string; lastName: string; phone: string } }
  drivers: { driver: { user: { firstName: string; lastName: string } } }[]
}

// ── Demo data ──────────────────────────────────────────────────────────────

export const demoRides: RideRow[] = [
  {
    id: 'ride-1',
    status: 'CONFIRMED',
    pickupTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '412 Oak St, Newport, AR 72112',
    urgencyLevel: 'HIGH',
    isFallbackUsed: false,
    appointment: {
      appointmentType: 'DIALYSIS',
      clinicName: 'Baptist Health Dialysis',
      clinicCity: 'Little Rock',
      clinicState: 'AR',
      estimatedMiles: 47,
      appointmentDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
    driver: { user: { firstName: 'Samuel', lastName: 'R', phone: '501-555-0133' } },
    coordinator: { user: { firstName: 'Katina', lastName: 'R', phone: '501-555-0200' } },
    patient: { user: { firstName: 'Churchie', lastName: 'B', phone: '501-555-0182' }, county: 'Pulaski', state: 'AR' },
  },
  {
    id: 'ride-2',
    status: 'PENDING',
    pickupTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    pickupAddress: '88 Maple Ave, Springdale, AR 72764',
    urgencyLevel: 'NORMAL',
    isFallbackUsed: false,
    appointment: {
      appointmentType: 'CARDIOLOGY',
      clinicName: 'Arkansas Heart Hospital',
      clinicCity: 'Little Rock',
      clinicState: 'AR',
      estimatedMiles: 35,
      appointmentDate: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
    },
    driver: null,
    coordinator: { user: { firstName: 'Katina', lastName: 'R', phone: '501-555-0200' } },
    patient: { user: { firstName: 'Alyssa', lastName: 'M', phone: '479-555-0144' }, county: 'Washington', state: 'AR' },
  },
]

export const demoPatients: PatientRow[] = [
  {
    id: 'patient-1',
    county: 'Pulaski',
    state: 'AR',
    zipCode: '72112',
    primaryLanguage: 'English',
    accessibilityRequirement: 'NON_TRANSFERABLE_WHEELCHAIR',
    schedulingConstraint: 'ADVANCE_72H',
    defaultFundingSource: 'MEDICAID_NEMT',
    barriers: 'wheelchair, no_backup',
    disability: 'Non-transferable wheelchair user',
    notes: 'Needs wheelchair-accessible van for Little Rock specialist appointments.',
    user: { firstName: 'Churchie', lastName: 'B', email: 'churchie@example.com', phone: '501-555-0182' },
  },
  {
    id: 'patient-2',
    county: 'Washington',
    state: 'AR',
    zipCode: '72764',
    primaryLanguage: 'English',
    accessibilityRequirement: 'STANDARD',
    schedulingConstraint: 'STANDARD',
    defaultFundingSource: 'MEDICAID_NEMT',
    barriers: null,
    disability: null,
    notes: 'Heart and asthma patient. Prefers morning appointments.',
    user: { firstName: 'Alyssa', lastName: 'M', email: 'alyssa@example.com', phone: '479-555-0144' },
  },
]

export const demoDrivers: DriverRow[] = [
  {
    id: 'driver-1',
    county: 'Pulaski',
    state: 'AR',
    vehicleCapacity: 3,
    isAvailableNow: true,
    isInFallbackPool: true,
    isWheelchairAccessible: false,
    maxMilesOneWay: 60,
    reliabilityScore: 4.8,
    ridesCompleted: 46,
    providerType: 'VOLUNTEER_DRIVER',
    communityNotes: 'Church volunteer and wheelchair route support.',
    user: { firstName: 'Samuel', lastName: 'R', email: 'samuel@example.com', phone: '501-555-0133' },
  },
  {
    id: 'driver-2',
    county: 'Pulaski',
    state: 'AR',
    vehicleCapacity: 4,
    isAvailableNow: true,
    isInFallbackPool: false,
    isWheelchairAccessible: true,
    maxMilesOneWay: 50,
    reliabilityScore: 4.1,
    ridesCompleted: 132,
    providerType: 'NEMT_VAN',
    communityNotes: null,
    user: { firstName: 'Access Transit', lastName: '14', email: 'access14@example.com', phone: '501-555-0140' },
  },
]

export const demoDepotRoutes: DepotRouteRow[] = [
  {
    id: 'route-1',
    depotName: 'Newport Community Center',
    depotAddress: '100 Main St, Newport, AR 72112',
    county: 'Jackson',
    state: 'AR',
    destinationCity: 'Little Rock',
    destinationState: 'AR',
    departureTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    returnTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    maxPassengers: 6,
    isActive: true,
    recurrenceNote: 'Every Tuesday and Thursday',
    coordinator: { user: { firstName: 'Katina', lastName: 'R', phone: '501-555-0200' } },
    drivers: [{ driver: { user: { firstName: 'Samuel', lastName: 'R' } } }],
  },
]

export const demoPortalMessages: PortalMessage[] = [
  {
    id: 'msg-1',
    channel: 'portal',
    direction: 'outbound',
    message: 'Ride confirmed for Churchie B — Samuel R assigned. Pickup at 9:00 AM.',
    status: 'sent',
    relatedId: 'ride-1',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: { firstName: 'Katina', lastName: 'R', role: 'COORDINATOR' },
  },
  {
    id: 'msg-2',
    channel: 'sms',
    direction: 'outbound',
    message: 'Your ride is confirmed. Driver Samuel will pick you up at 9:00 AM.',
    status: 'delivered',
    relatedId: 'ride-1',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    user: { firstName: 'Katina', lastName: 'R', role: 'COORDINATOR' },
  },
  {
    id: 'msg-3',
    channel: 'portal',
    direction: 'inbound',
    message: 'On my way to pickup. ETA 15 minutes.',
    status: 'received',
    relatedId: 'ride-1',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    user: { firstName: 'Samuel', lastName: 'R', role: 'DRIVER' },
  },
]

export const toDisplayDate = (value: string): string => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export const statusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  if (status === 'COMPLETED') return 'success'
  if (status === 'CONFIRMED' || status === 'MATCHED') return 'info'
  if (status === 'PENDING') return 'warning'
  if (status === 'CANCELLED') return 'neutral'
  if (status === 'FALLBACK_NEEDED' || status === 'IN_PROGRESS') return 'error'
  return 'neutral'
}
