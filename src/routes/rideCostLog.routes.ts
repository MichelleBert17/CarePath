// RideCostLog routes
import { Router } from 'express';
import * as costLogController from '../controllers/rideCostLog.controller';

const router = Router();

router.post('/', costLogController.createRideCostLog);
router.get('/ride/:rideRequestId', costLogController.getRideCostLogsForRide);

export default router;
