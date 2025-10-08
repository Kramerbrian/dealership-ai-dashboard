import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authService } from '../services/authService';

const router = Router();

// Get current user info
router.get('/me', asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.auth?.userId);
  res.json({ user });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const updatedUser = await authService.updateProfile(userId, {
    firstName,
    lastName,
    email,
  });
  
  res.json({ user: updatedUser });
}));

// Get user's subscription status
router.get('/subscription', asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const subscription = await authService.getUserSubscription(userId);
  res.json({ subscription });
}));

export default router;
