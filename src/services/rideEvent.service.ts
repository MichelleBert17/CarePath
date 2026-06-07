// RideEvent service: create, list, and log events
import prisma from '../config/database';
import { RideEvent } from '@prisma/client';

export const createRideEvent = async (data: Partial<RideEvent>) => {
  return prisma.rideEvent.create({ data });
};

export const getRideEventsForRide = async (rideRequestId: string) => {
  return prisma.rideEvent.findMany({ where: { rideRequestId }, orderBy: { createdAt: 'asc' } });
};
