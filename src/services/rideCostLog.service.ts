// RideCostLog service: create and list cost logs
import prisma from '../config/database';
import { RideCostLog } from '@prisma/client';

export const createRideCostLog = async (data: Partial<RideCostLog>) => {
  return prisma.rideCostLog.create({ data });
};

export const getRideCostLogsForRide = async (rideRequestId: string) => {
  return prisma.rideCostLog.findMany({ where: { rideRequestId }, orderBy: { createdAt: 'asc' } });
};
