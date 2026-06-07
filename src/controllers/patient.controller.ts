import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// Create or update patient profile (called after registration)
export const upsertProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { county, state, zipCode, hasSmartphone, prefersSms, prefersVoice, primaryLanguage, notes } = req.body;
    const userId = req.user!.userId;

    const patient = await prisma.patient.upsert({
      where: { userId },
      create: { userId, county, state, zipCode, hasSmartphone, prefersSms, prefersVoice, primaryLanguage, notes },
      update: { county, state, zipCode, hasSmartphone, prefersSms, prefersVoice, primaryLanguage, notes },
    });

    res.json(patient);
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });
    if (!patient) return next(new AppError('Patient profile not found', 404));
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

export const getMyRides = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
    if (!patient) return next(new AppError('Patient profile not found', 404));

    const rides = await prisma.rideRequest.findMany({
      where: { patientId: patient.id },
      include: {
        appointment: true,
        driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        coordinator: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rides);
  } catch (err) {
    next(err);
  }
};

// Admin: list all patients
export const listPatients = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patients = await prisma.patient.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(patients);
  } catch (err) {
    next(err);
  }
};
