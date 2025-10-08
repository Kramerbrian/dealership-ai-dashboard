import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { healthService } from '../services/healthService';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  const health = await healthService.getHealthStatus();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req, res) => {
  const health = await healthService.getDetailedHealthStatus();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

// Readiness check
router.get('/ready', asyncHandler(async (req, res) => {
  const ready = await healthService.isReady();
  
  const statusCode = ready ? 200 : 503;
  res.status(statusCode).json({ ready });
}));

// Liveness check
router.get('/live', asyncHandler(async (req, res) => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
}));

export default router;
