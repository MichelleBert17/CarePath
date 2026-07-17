// CommunicationLog routes
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import * as commLogController from '../controllers/communicationLog.controller';

const router = Router();

router.post('/', commLogController.createCommunicationLog);
router.get('/user/:userId', commLogController.getCommunicationLogsForUser);

// Portal endpoints (authenticated)
router.get('/ride/:rideId', authenticate, commLogController.getLogsForRide);
router.post('/portal', authenticate, commLogController.postPortalMessage);
router.get('/portal/recent', authenticate, requireRole(Role.COORDINATOR, Role.ADMIN), commLogController.getRecentPortalLogs);

export default router;
