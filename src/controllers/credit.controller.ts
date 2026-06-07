import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CreditStatus } from '@prisma/client';

// Partner purchases a block of ride credits
export const purchaseCredits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partner = await prisma.institutionalPartner.findUnique({ where: { userId: req.user!.userId } });
    if (!partner) return next(new AppError('Partner profile not found', 404));
    if (!partner.isVerified) return next(new AppError('Partner account not yet verified', 403));

    const { totalCredits, expiresAt, notes } = req.body;

    const credit = await prisma.rideCredit.create({
      data: {
        partnerId: partner.id,
        totalCredits,
        remainingCredits: totalCredits,
        usedCredits: 0,
        status: CreditStatus.ACTIVE,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes,
      },
    });

    res.status(201).json(credit);
  } catch (err) {
    next(err);
  }
};

// Partner views their credit balances
export const myCredits = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partner = await prisma.institutionalPartner.findUnique({ where: { userId: req.user!.userId } });
    if (!partner) return next(new AppError('Partner profile not found', 404));

    const credits = await prisma.rideCredit.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(credits);
  } catch (err) {
    next(err);
  }
};

// Admin: all credits across all partners
export const listAllCredits = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const credits = await prisma.rideCredit.findMany({
      include: {
        partner: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(credits);
  } catch (err) {
    next(err);
  }
};

// Admin: verify a partner
export const verifyPartner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { partnerId } = req.params;
    const partner = await prisma.institutionalPartner.update({
      where: { id: partnerId },
      data: { isVerified: true },
    });
    res.json(partner);
  } catch (err) {
    next(err);
  }
};
