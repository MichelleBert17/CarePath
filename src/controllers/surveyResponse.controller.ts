// SurveyResponse controller: create and list responses
import { Request, Response } from 'express';
import * as surveyService from '../services/surveyResponse.service';

export const createSurveyResponse = async (req: Request, res: Response) => {
  try {
    const response = await surveyService.createSurveyResponse(req.body);
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create survey response', details: err });
  }
};

export const getSurveyResponses = async (req: Request, res: Response) => {
  try {
    const responses = await surveyService.getSurveyResponses(req.query);
    res.json(responses);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch survey responses', details: err });
  }
};
