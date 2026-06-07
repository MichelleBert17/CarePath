import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const upsertProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { county, state, vehicleCapacity, isInFallbackPool, maxMilesOneWay, preferredDays, communityNotes } = req.body;
    const userId = req.user!.userId;

    const driver = await prisma.driver.upsert({
      where: { userId },
      create: { userId, county, state, vehicleCapacity, isInFallbackPool, maxMilesOneWay, preferredDays, communityNotes },
      update: { county, state, vehicleCapacity, isInFallbackPool, maxMilesOneWay, preferredDays, communityNotes },
    });

    res.json(driver);
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    });
    if (!driver) return next(new AppError('Driver profile not found', 404));
    res.json(driver);
  } catch (err) {
    next(err);
  }
};

export const setAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isAvailableNow } = req.body;
    const driver = await prisma.driver.update({
      where: { userId: req.user!.userId },
      data: { isAvailableNow },
    });
    res.json({ isAvailableNow: driver.isAvailableNow });
  } catch (err) {
    next(err);
  }
};

// Get all drivers in the fallback pool for a county — used by coordinators
export const getFallbackPool = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { county, state } = req.query;
    const drivers = await prisma.driver.findMany({
      where: {
        isInFallbackPool: true,
        isAvailableNow: true,
        ...(county ? { county: String(county) } : {}),
        ...(state ? { state: String(state) } : {}),
      },
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { reliabilityScore: 'desc' },
    });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
};

export const listDrivers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drivers = await prisma.driver.findMany({
      include: { user: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(drivers);
  } catch (err) {
    next(err);
  }
};
