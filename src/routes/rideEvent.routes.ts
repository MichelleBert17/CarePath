// RideEvent routes
import { Router } from 'express';
import * as rideEventController from '../controllers/rideEvent.controller';

const router = Router();

router.post('/', rideEventController.createRideEvent);
router.get('/ride/:rideRequestId', rideEventController.getRideEventsForRide);

export default router;
