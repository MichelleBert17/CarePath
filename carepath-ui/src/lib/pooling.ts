export type PendingRide = {
  id: string;
  status: string;
  pickupTime: string;
  isFallbackUsed: boolean;
  patient: {
    id: string;
    county: string;
    state: string;
    barriers: string | null;
    disability: string | null;
    notes: string | null;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  appointment: {
    appointmentType: string;
    clinicName: string;
    clinicCity: string;
    clinicState: string;
    estimatedMiles: number;
  };
};

export type PoolCandidate = {
  id: string;
  poolType: 'primary' | 'community';
  name: string;
  phone: string;
  county: string;
  state: string;
  isAvailableNow: boolean;
  isInFallbackPool: boolean;
  capacity: number;
  maxMilesOneWay: number;
  reliabilityScore: number;
  ridesCompleted: number;
  communityNotes: string | null;
  canServeDistance: boolean;
  matchScore: number;
};

export type PoolingOptionsResponse = {
  rideId: string;
  status: string;
  urgencyLevel: 'critical' | 'high' | 'normal';
  pickupTime: string;
  appointment: {
    type: string;
    clinicName: string;
    clinicCity: string;
    clinicState: string;
    estimatedMiles: number;
  };
  constraints: {
    needsWheelchairAccessible: boolean;
    noBackupRisk: boolean;
  };
  pools: {
    primary: {
      count: number;
      candidates: PoolCandidate[];
    };
    community: {
      count: number;
      candidates: PoolCandidate[];
    };
  };
  recommendedActions: string[];
};

export const demoPendingRides: PendingRide[] = [
  {
    id: 'demo-ride-1',
    status: 'FALLBACK_NEEDED',
    pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    isFallbackUsed: true,
    patient: {
      id: 'demo-patient-1',
      county: 'Pulaski',
      state: 'AR',
      barriers: 'wheelchair, no_backup',
      disability: 'non-transferable wheelchair user',
      notes: 'Needs wheelchair-accessible van for Little Rock specialist appointments.',
      user: {
        firstName: 'Michelle',
        lastName: 'B',
        phone: '501-555-0182',
      },
    },
    appointment: {
      appointmentType: 'SPECIALIST',
      clinicName: 'Arkansas Specialty Center',
      clinicCity: 'Little Rock',
      clinicState: 'AR',
      estimatedMiles: 47,
    },
  },
];

export const demoPoolingOptions: PoolingOptionsResponse = {
  rideId: 'demo-ride-1',
  status: 'FALLBACK_NEEDED',
  urgencyLevel: 'critical',
  pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  appointment: {
    type: 'SPECIALIST',
    clinicName: 'Arkansas Specialty Center',
    clinicCity: 'Little Rock',
    clinicState: 'AR',
    estimatedMiles: 47,
  },
  constraints: {
    needsWheelchairAccessible: true,
    noBackupRisk: true,
  },
  pools: {
    primary: {
      count: 1,
      candidates: [
        {
          id: 'demo-primary-1',
          poolType: 'primary',
          name: 'Access Transit 14',
          phone: '501-555-0140',
          county: 'Pulaski',
          state: 'AR',
          isAvailableNow: true,
          isInFallbackPool: false,
          capacity: 4,
          maxMilesOneWay: 50,
          reliabilityScore: 4.1,
          ridesCompleted: 132,
          communityNotes: null,
          canServeDistance: true,
          matchScore: 71.2,
        },
      ],
    },
    community: {
      count: 2,
      candidates: [
        {
          id: 'demo-community-1',
          poolType: 'community',
          name: 'Samuel R',
          phone: '501-555-0133',
          county: 'Pulaski',
          state: 'AR',
          isAvailableNow: true,
          isInFallbackPool: true,
          capacity: 3,
          maxMilesOneWay: 60,
          reliabilityScore: 4.8,
          ridesCompleted: 46,
          communityNotes: 'Church volunteer and wheelchair route support.',
          canServeDistance: true,
          matchScore: 89.6,
        },
        {
          id: 'demo-community-2',
          poolType: 'community',
          name: 'Angela M',
          phone: '501-555-0111',
          county: 'Pulaski',
          state: 'AR',
          isAvailableNow: true,
          isInFallbackPool: true,
          capacity: 2,
          maxMilesOneWay: 45,
          reliabilityScore: 4.6,
          ridesCompleted: 28,
          communityNotes: 'Same-day fallback volunteer.',
          canServeDistance: false,
          matchScore: 73.2,
        },
      ],
    },
  },
  recommendedActions: [
    'Prioritize candidates who have wheelchair-capable vehicles.',
    'Activate same-day fallback escalation before appointment risk increases.',
    'Message caregiver with confirmed route and ETA once assigned.',
  ],
};
