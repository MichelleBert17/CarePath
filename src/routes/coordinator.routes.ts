import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  upsertProfile, getProfile, listCoordinators,
  verifyCoordinator, createDepotRoute, listDepotRoutes,
} from '../controllers/coordinator.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.put('/profile', requireRole(Role.COORDINATOR), upsertProfile);
router.get('/profile', requireRole(Role.COORDINATOR), getProfile);
router.get('/', requireRole(Role.ADMIN), listCoordinators);
router.patch('/:coordinatorId/verify', requireRole(Role.ADMIN), verifyCoordinator);

router.post('/depot-routes', requireRole(Role.COORDINATOR), createDepotRoute);
router.get('/depot-routes', authenticate, listDepotRoutes);

export default router;
