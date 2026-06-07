// SurveyResponse service: create and list survey responses
import prisma from '../config/database';
import { SurveyResponse } from '@prisma/client';

export const createSurveyResponse = async (data: Partial<SurveyResponse>) => {
  return prisma.surveyResponse.create({ data });
};

export const getSurveyResponses = async (filter: any = {}) => {
  return prisma.surveyResponse.findMany({ where: filter, orderBy: { submittedAt: 'desc' } });
};
