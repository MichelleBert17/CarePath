// SurveyResponse routes
import { Router } from 'express';
import * as surveyController from '../controllers/surveyResponse.controller';

const router = Router();

router.post('/', surveyController.createSurveyResponse);
router.get('/', surveyController.getSurveyResponses);

export default router;
