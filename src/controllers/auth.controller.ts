import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, phone, password, role, firstName, lastName } = req.body;

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return next(new AppError('Email or phone already registered', 409));

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, phone, passwordHash, role: role as Role, firstName, lastName },
      select: { id: true, email: true, phone: true, role: true, firstName: true, lastName: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return next(new AppError('Invalid credentials', 401));

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return next(new AppError('Invalid credentials', 401));

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request & { user?: { userId: string; role: string } }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, phone: true, role: true, firstName: true, lastName: true, createdAt: true },
    });
    if (!user) return next(new AppError('User not found', 404));
    res.json(user);
  } catch (err) {
    next(err);
  }
};
