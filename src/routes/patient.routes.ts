import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { upsertProfile, getProfile, getMyRides, listPatients } from '../controllers/patient.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.put('/profile', requireRole(Role.PATIENT), upsertProfile);
router.get('/profile', requireRole(Role.PATIENT), getProfile);
router.get('/rides', requireRole(Role.PATIENT), getMyRides);
router.get('/', requireRole(Role.ADMIN, Role.COORDINATOR), listPatients);

export default router;
