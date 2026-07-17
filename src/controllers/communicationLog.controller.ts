// CommunicationLog controller: create and list logs
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as commLogService from '../services/communicationLog.service';

export const createCommunicationLog = async (req: Request, res: Response) => {
  try {
    const log = await commLogService.createCommunicationLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create communication log', details: err });
  }
};

export const getCommunicationLogsForUser = async (req: Request, res: Response) => {
  try {
    const logs = await commLogService.getCommunicationLogsForUser(req.params.userId);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch communication logs', details: err });
  }
};

// Portal: logs for a specific ride (all roles on that ride)
export const getLogsForRide = async (req: Request, res: Response) => {
  try {
    const logs = await commLogService.getLogsForRide(req.params.rideId);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch ride logs', details: err });
  }
};

// Portal: post a message tied to a ride
export const postPortalMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId, message, channel = 'portal' } = req.body;
    const log = await commLogService.createCommunicationLog({
      user: req.user?.userId ? { connect: { id: req.user.userId } } : undefined,
      channel,
      direction: 'outbound',
      message,
      status: 'sent',
      relatedId: rideId ?? null,
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to post message', details: err });
  }
};

// Portal: recent logs (coordinator/admin)
export const getRecentPortalLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await commLogService.getRecentPortalLogs(50);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch portal logs', details: err });
  }
};
