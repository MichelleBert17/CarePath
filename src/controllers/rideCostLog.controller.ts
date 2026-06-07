// RideCostLog controller: create and list logs
import { Request, Response } from 'express';
import * as costLogService from '../services/rideCostLog.service';

export const createRideCostLog = async (req: Request, res: Response) => {
  try {
    const log = await costLogService.createRideCostLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ride cost log', details: err });
  }
};

export const getRideCostLogsForRide = async (req: Request, res: Response) => {
  try {
    const logs = await costLogService.getRideCostLogsForRide(req.params.rideRequestId);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch ride cost logs', details: err });
  }
};
