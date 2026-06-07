import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { RideStatus } from '@prisma/client';

// Patient creates a ride request
export const createRideRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      appointmentType, clinicName, clinicCity, clinicState, appointmentDate,
      estimatedMiles, isRecurring, recurrenceNote, appointmentNotes,
      pickupAddress, pickupTime, creditId,
    } = req.body;

    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
    if (!patient) return next(new AppError('Patient profile required before requesting a ride', 400));

    // Find an active coordinator in the patient's county
    const coordinator = await prisma.coordinator.findFirst({
      where: { county: patient.county, state: patient.state, isVerified: true },
    });

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
        notes: appointmentNotes,
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

    const ride = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { driverId, status: RideStatus.MATCHED },
      include: { appointment: true, driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
    });

    res.json(ride);
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
