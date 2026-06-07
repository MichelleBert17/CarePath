import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { purchaseCredits, myCredits, listAllCredits, verifyPartner } from '../controllers/credit.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(Role.PARTNER), purchaseCredits);
router.get('/my', requireRole(Role.PARTNER), myCredits);
router.get('/', requireRole(Role.ADMIN), listAllCredits);
router.patch('/partners/:partnerId/verify', requireRole(Role.ADMIN), verifyPartner);

export default router;
