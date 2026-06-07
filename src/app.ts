import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import driverRoutes from './routes/driver.routes';
import coordinatorRoutes from './routes/coordinator.routes';
import rideRoutes from './routes/ride.routes';
import creditRoutes from './routes/credit.routes';
import rideEventRoutes from './routes/rideEvent.routes';
import surveyResponseRoutes from './routes/surveyResponse.routes';
import rideCostLogRoutes from './routes/rideCostLog.routes';
import communicationLogRoutes from './routes/communicationLog.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CarePath API', timestamp: new Date().toISOString() });
});

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/ride-events', rideEventRoutes);
app.use('/api/survey-responses', surveyResponseRoutes);
app.use('/api/ride-cost-logs', rideCostLogRoutes);
app.use('/api/communication-logs', communicationLogRoutes);

// 404 & error handling
app.use(notFound);
app.use(errorHandler);

export default app;
