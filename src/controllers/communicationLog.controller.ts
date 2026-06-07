// CommunicationLog controller: create and list logs
import { Request, Response } from 'express';
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
