// CommunicationLog service: create and list logs
import prisma from '../config/database';
import { CommunicationLog } from '@prisma/client';

export const createCommunicationLog = async (data: Partial<CommunicationLog>) => {
  return prisma.communicationLog.create({ data });
};

export const getCommunicationLogsForUser = async (userId: string) => {
  return prisma.communicationLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
};
