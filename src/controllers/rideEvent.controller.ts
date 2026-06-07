// RideEvent controller: create and list events
import { Request, Response } from 'express';
import * as rideEventService from '../services/rideEvent.service';

export const createRideEvent = async (req: Request, res: Response) => {
  try {
    const event = await rideEventService.createRideEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create ride event', details: err });
  }
};

export const getRideEventsForRide = async (req: Request, res: Response) => {
  try {
    const events = await rideEventService.getRideEventsForRide(req.params.rideRequestId);
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch ride events', details: err });
  }
};
