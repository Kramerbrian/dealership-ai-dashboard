import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { adminService } from '../services/adminService';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get dashboard stats
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json({ stats });
}));

// Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  
  const users = await adminService.getUsers({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
  });
  
  res.json({ users });
}));

// Get user details
router.get('/users/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await adminService.getUserDetails(userId);
  res.json({ user });
}));

// Get all subscriptions
router.get('/subscriptions', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  
  const subscriptions = await adminService.getSubscriptions({
    page: Number(page),
    limit: Number(limit),
    status: status as string,
  });
  
  res.json({ subscriptions });
}));

// Get analytics data
router.get('/analytics', asyncHandler(async (req, res) => {
  const { startDate, endDate, metric } = req.query;
  
  const analytics = await adminService.getAnalytics({
    startDate: startDate as string,
    endDate: endDate as string,
    metric: metric as string,
  });
  
  res.json({ analytics });
}));

// System health check
router.get('/health', asyncHandler(async (req, res) => {
  const health = await adminService.getSystemHealth();
  res.json({ health });
}));

export default router;
