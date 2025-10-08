import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { subscriptionService } from '../services/subscriptionService';

const router = Router();

// Create checkout session
router.post('/checkout', asyncHandler(async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const session = await subscriptionService.createCheckoutSession({
    userId,
    priceId,
    successUrl,
    cancelUrl,
  });
  
  res.json({ session });
}));

// Get subscription details
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const subscription = await subscriptionService.getSubscription(userId);
  res.json({ subscription });
}));

// Cancel subscription
router.post('/cancel', asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const subscription = await subscriptionService.cancelSubscription(userId);
  res.json({ subscription });
}));

// Reactivate subscription
router.post('/reactivate', asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const subscription = await subscriptionService.reactivateSubscription(userId);
  res.json({ subscription });
}));

// Get billing portal URL
router.post('/portal', asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const portalUrl = await subscriptionService.createBillingPortalSession(userId);
  res.json({ url: portalUrl });
}));

export default router;
