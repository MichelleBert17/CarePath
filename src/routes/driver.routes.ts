import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { upsertProfile, getProfile, setAvailability, getFallbackPool, listDrivers } from '../controllers/driver.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.put('/profile', requireRole(Role.DRIVER), upsertProfile);
router.get('/profile', requireRole(Role.DRIVER), getProfile);
router.patch('/availability', requireRole(Role.DRIVER), setAvailability);
router.get('/fallback-pool', requireRole(Role.COORDINATOR, Role.ADMIN), getFallbackPool);
router.get('/', requireRole(Role.ADMIN, Role.COORDINATOR), listDrivers);

export default router;
