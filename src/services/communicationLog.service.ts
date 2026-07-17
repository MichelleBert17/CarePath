// CommunicationLog service: create and list logs
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const createCommunicationLog = async (
  data: Prisma.CommunicationLogCreateInput
) => {
  return prisma.communicationLog.create({ data });
};

export const getCommunicationLogsForUser = async (userId: string) => {
  return prisma.communicationLog.findMany({
    where: { userId },
    include: { user: { select: { firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

// Portal: get all logs related to a ride (visible to all roles on that ride)
export const getLogsForRide = async (relatedId: string) => {
  return prisma.communicationLog.findMany({
    where: { relatedId },
    include: { user: { select: { firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });
};

// Portal: get recent logs for a coordinator's county
export const getRecentPortalLogs = async (limit = 50) => {
  return prisma.communicationLog.findMany({
    include: { user: { select: { firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};