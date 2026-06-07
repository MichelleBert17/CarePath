import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const upsertProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { county, state, organization } = req.body;
    const userId = req.user!.userId;

    const coordinator = await prisma.coordinator.upsert({
      where: { userId },
      create: { userId, county, state, organization },
      update: { county, state, organization },
    });

    res.json(coordinator);
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: req.user!.userId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    });
    if (!coordinator) return next(new AppError('Coordinator profile not found', 404));
    res.json(coordinator);
  } catch (err) {
    next(err);
  }
};

export const listCoordinators = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coordinators = await prisma.coordinator.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(coordinators);
  } catch (err) {
    next(err);
  }
};

export const verifyCoordinator = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { coordinatorId } = req.params;
    const coordinator = await prisma.coordinator.update({
      where: { id: coordinatorId },
      data: { isVerified: true },
    });
    res.json(coordinator);
  } catch (err) {
    next(err);
  }
};

// Depot routes managed by coordinator
export const createDepotRoute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coordinator = await prisma.coordinator.findUnique({ where: { userId: req.user!.userId } });
    if (!coordinator) return next(new AppError('Coordinator profile not found', 404));

    const {
      depotName, depotAddress, county, state,
      destinationCity, destinationState,
      departureTime, returnTime, maxPassengers, recurrenceNote,
    } = req.body;

    const route = await prisma.depotRoute.create({
      data: {
        coordinatorId: coordinator.id,
        depotName, depotAddress,
        county: county || coordinator.county,
        state: state || coordinator.state,
        destinationCity, destinationState,
        departureTime: new Date(departureTime),
        returnTime: returnTime ? new Date(returnTime) : null,
        maxPassengers,
        recurrenceNote,
      },
    });

    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

export const listDepotRoutes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { county, state } = req.query;
    const routes = await prisma.depotRoute.findMany({
      where: {
        isActive: true,
        ...(county ? { county: String(county) } : {}),
        ...(state ? { state: String(state) } : {}),
      },
      include: {
        coordinator: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        drivers: { include: { driver: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
      orderBy: { departureTime: 'asc' },
    });
    res.json(routes);
  } catch (err) {
    next(err);
  }
};
