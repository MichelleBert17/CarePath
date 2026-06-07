// CommunicationLog routes
import { Router } from 'express';
import * as commLogController from '../controllers/communicationLog.controller';

const router = Router();

router.post('/', commLogController.createCommunicationLog);
router.get('/user/:userId', commLogController.getCommunicationLogsForUser);

export default router;
