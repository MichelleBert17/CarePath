import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { RideStatus } from '@prisma/client';

const WHEELCHAIR_KEYWORDS = ['wheelchair', 'mobility', 'nontransferable', 'non-transferable'];

const textHasKeyword = (value: string | null | undefined, keywords: string[]): boolean => {
  if (!value) return false;
  const lowered = value.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword));
};

const buildCandidateScore = (reliabilityScore: number, ridesCompleted: number, maxMilesOneWay: number, estimatedMiles: number): number => {
  const reliabilityWeight = reliabilityScore * 12;
  const experienceWeight = Math.min(ridesCompleted, 40) * 0.5;
  const rangeWeight = maxMilesOneWay >= estimatedMiles ? 10 : 0;
  return Math.round((reliabilityWeight + experienceWeight + rangeWeight) * 10) / 10;
};

// Patient creates a ride request
export const createRideRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      appointmentType, clinicName, clinicCity, clinicState, appointmentDate,
      estimatedMiles, isRecurring, recurrenceNote, appointmentNotes,
      pickupAddress, pickupTime, creditId,
      mobilityNeeds, isWheelchairRequired, isNonTransferable,
      requestedAdvanceWindowHours, urgencyLevel,
      needsSameDayFallback, allowsCommunityVolunteer,
    } = req.body;

    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
    if (!patient) return next(new AppError('Patient profile required before requesting a ride', 400));

    // Find an active coordinator in the patient's county
    const coordinator = await prisma.coordinator.findFirst({
      where: { county: patient.county, state: patient.state, isVerified: true },
    });

    const intakeNotes: string[] = [];
    if (mobilityNeeds) intakeNotes.push(`mobility_needs: ${String(mobilityNeeds)}`);
    if (typeof isWheelchairRequired === 'boolean') intakeNotes.push(`wheelchair_required: ${isWheelchairRequired ? 'yes' : 'no'}`);
    if (typeof isNonTransferable === 'boolean') intakeNotes.push(`non_transferable: ${isNonTransferable ? 'yes' : 'no'}`);
    if (typeof requestedAdvanceWindowHours === 'number') intakeNotes.push(`advance_window_hours: ${requestedAdvanceWindowHours}`);
    if (urgencyLevel) intakeNotes.push(`urgency_level: ${String(urgencyLevel)}`);
    if (typeof needsSameDayFallback === 'boolean') intakeNotes.push(`same_day_fallback_needed: ${needsSameDayFallback ? 'yes' : 'no'}`);
    if (typeof allowsCommunityVolunteer === 'boolean') intakeNotes.push(`community_volunteer_opt_in: ${allowsCommunityVolunteer ? 'yes' : 'no'}`);

    const compiledNotes = [appointmentNotes, intakeNotes.length ? `[intake] ${intakeNotes.join('; ')}` : null]
      .filter(Boolean)
      .join(' | ');

    const appointment = await prisma.appointment.create({
      data: {
        appointmentType,
        clinicName,
        clinicCity,
        clinicState,
        appointmentDate: new Date(appointmentDate),
        estimatedMiles,
        isRecurring: isRecurring || false,
        recurrenceNote,
        notes: compiledNotes || null,
      },
    });

    const ride = await prisma.rideRequest.create({
      data: {
        patientId: patient.id,
        appointmentId: appointment.id,
        coordinatorId: coordinator?.id ?? null,
        pickupAddress,
        pickupTime: new Date(pickupTime),
        creditId: creditId ?? null,
        status: RideStatus.PENDING,
      },
      include: { appointment: true, coordinator: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
    });

    res.status(201).json(ride);
  } catch (err) {
    next(err);
  }
};

// Coordinator: list all pending rides in their county
export const getPendingRides = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coordinator = await prisma.coordinator.findUnique({ where: { userId: req.user!.userId } });
    if (!coordinator) return next(new AppError('Coordinator profile not found', 404));

    const rides = await prisma.rideRequest.findMany({
      where: { coordinatorId: coordinator.id, status: { in: [RideStatus.PENDING, RideStatus.FALLBACK_NEEDED] } },
      include: {
        appointment: true,
        patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
      },
      orderBy: { pickupTime: 'asc' },
    });

    res.json(rides);
  } catch (err) {
    next(err);
  }
};

// Coordinator: assign a driver to a ride
export const assignDriver = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    });
    if (!driver) return next(new AppError('Driver not found', 404));

    const ride = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { driverId, status: RideStatus.MATCHED },
      include: { appointment: true, driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
    });

    if (driver.isInFallbackPool) {
      await prisma.rideEvent.create({
        data: {
          rideRequestId: ride.id,
          eventType: 'ASSIGNED_FROM_COMMUNITY_POOL',
          oldStatus: RideStatus.PENDING,
          newStatus: RideStatus.MATCHED,
          reason: 'Coordinator assigned a fallback/community driver',
          actorRole: req.user?.role,
          actorId: req.user?.userId,
        },
      });
    } else {
      await prisma.rideEvent.create({
        data: {
          rideRequestId: ride.id,
          eventType: 'ASSIGNED_FROM_PRIMARY_POOL',
          oldStatus: RideStatus.PENDING,
          newStatus: RideStatus.MATCHED,
          reason: 'Coordinator assigned a primary network driver',
          actorRole: req.user?.role,
          actorId: req.user?.userId,
        },
      });
    }

    res.json(ride);
  } catch (err) {
    next(err);
  }
};

// Coordinator: get pooled transportation candidates for a specific ride
export const getPoolingOptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rideId } = req.params;
    const coordinator = await prisma.coordinator.findUnique({ where: { userId: req.user!.userId } });
    if (!coordinator) return next(new AppError('Coordinator profile not found', 404));

    const ride = await prisma.rideRequest.findFirst({
      where: { id: rideId, coordinatorId: coordinator.id },
      include: { appointment: true, patient: true },
    });
    if (!ride) return next(new AppError('Ride not found for this coordinator', 404));

    const needsWheelchairAccessible =
      textHasKeyword(ride.patient.disability, WHEELCHAIR_KEYWORDS) ||
      textHasKeyword(ride.patient.barriers, WHEELCHAIR_KEYWORDS) ||
      textHasKeyword(ride.patient.notes, WHEELCHAIR_KEYWORDS);

    const hoursUntilPickup = (new Date(ride.pickupTime).getTime() - Date.now()) / (1000 * 60 * 60);
    const urgencyLevel = hoursUntilPickup <= 12 ? 'critical' : hoursUntilPickup <= 24 ? 'high' : 'normal';

    const drivers = await prisma.driver.findMany({
      where: {
        county: ride.patient.county,
        state: ride.patient.state,
        isAvailableNow: true,
      },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    });

    const estimatedMiles = ride.appointment.estimatedMiles ?? 0;
    const mapped = drivers.map((driver) => {
      const isCommunityVolunteer = driver.isInFallbackPool || Boolean(driver.communityNotes);
      const score = buildCandidateScore(driver.reliabilityScore, driver.ridesCompleted, driver.maxMilesOneWay, estimatedMiles);
      return {
        id: driver.id,
        poolType: isCommunityVolunteer ? 'community' : 'primary',
        name: `${driver.user.firstName} ${driver.user.lastName}`.trim(),
        phone: driver.user.phone,
        county: driver.county,
        state: driver.state,
        isAvailableNow: driver.isAvailableNow,
        isInFallbackPool: driver.isInFallbackPool,
        capacity: driver.vehicleCapacity,
        maxMilesOneWay: driver.maxMilesOneWay,
        reliabilityScore: driver.reliabilityScore,
        ridesCompleted: driver.ridesCompleted,
        communityNotes: driver.communityNotes,
        canServeDistance: driver.maxMilesOneWay >= estimatedMiles,
        matchScore: score,
      };
    });

    const primaryPool = mapped
      .filter((candidate) => candidate.poolType === 'primary')
      .sort((a, b) => b.matchScore - a.matchScore);

    const communityPool = mapped
      .filter((candidate) => candidate.poolType === 'community')
      .sort((a, b) => b.matchScore - a.matchScore);

    const recommendedActions: string[] = [];
    if (needsWheelchairAccessible) {
      recommendedActions.push('Prioritize candidates who have wheelchair-capable vehicles.');
    }
    if (urgencyLevel !== 'normal') {
      recommendedActions.push('Activate same-day fallback escalation before appointment risk increases.');
    }
    if (communityPool.length === 0) {
      recommendedActions.push('No community volunteers currently available. Trigger broader county outreach.');
    }

    res.json({
      rideId: ride.id,
      status: ride.status,
      urgencyLevel,
      pickupTime: ride.pickupTime,
      appointment: {
        type: ride.appointment.appointmentType,
        clinicName: ride.appointment.clinicName,
        clinicCity: ride.appointment.clinicCity,
        clinicState: ride.appointment.clinicState,
        estimatedMiles,
      },
      constraints: {
        needsWheelchairAccessible,
        noBackupRisk: true,
      },
      pools: {
        primary: {
          count: primaryPool.length,
          candidates: primaryPool,
        },
        community: {
          count: communityPool.length,
          candidates: communityPool,
        },
      },
      recommendedActions,
    });
  } catch (err) {
    next(err);
  }
};

// Coordinator: mark a ride as needing fallback
export const triggerFallback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rideId } = req.params;

    const ride = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { status: RideStatus.FALLBACK_NEEDED, isFallbackUsed: true },
    });

    res.json(ride);
  } catch (err) {
    next(err);
  }
};

// Driver: confirm a ride
export const confirmRide = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rideId } = req.params;
    const driver = await prisma.driver.findUnique({ where: { userId: req.user!.userId } });
    if (!driver) return next(new AppError('Driver profile not found', 404));

    const ride = await prisma.rideRequest.findFirst({ where: { id: rideId, driverId: driver.id } });
    if (!ride) return next(new AppError('Ride not found or not assigned to you', 404));

    const updated = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { status: RideStatus.CONFIRMED, confirmedAt: new Date() },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Driver or Coordinator: complete a ride
export const completeRide = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rideId } = req.params;

    const ride = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { status: RideStatus.COMPLETED, completedAt: new Date() },
    });

    // Increment driver's completed rides count
    if (ride.driverId) {
      await prisma.driver.update({
        where: { id: ride.driverId },
        data: { ridesCompleted: { increment: 1 } },
      });
    }

    // Deduct credit if used
    if (ride.creditId) {
      await prisma.rideCredit.update({
        where: { id: ride.creditId },
        data: {
          usedCredits: { increment: 1 },
          remainingCredits: { decrement: 1 },
        },
      });
    }

    res.json(ride);
  } catch (err) {
    next(err);
  }
};

// Admin: all rides
export const listAllRides = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rides = await prisma.rideRequest.findMany({
      include: {
        appointment: true,
        patient: { include: { user: { select: { firstName: true, lastName: true } } } },
        driver: { include: { user: { select: { firstName: true, lastName: true } } } },
        coordinator: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rides);
  } catch (err) {
    next(err);
  }
};
