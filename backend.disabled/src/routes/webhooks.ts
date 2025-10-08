import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { webhookService } from '../services/webhookService';

const router = Router();

// Stripe webhook
router.post('/stripe', asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  const payload = req.body;
  
  const event = await webhookService.handleStripeWebhook(payload, signature);
  
  res.json({ received: true, eventType: event.type });
}));

// Clerk webhook
router.post('/clerk', asyncHandler(async (req, res) => {
  const payload = req.body;
  const signature = req.headers['svix-signature'] as string;
  const timestamp = req.headers['svix-timestamp'] as string;
  
  await webhookService.handleClerkWebhook(payload, signature, timestamp);
  
  res.json({ received: true });
}));

// Vercel webhook (for deployment notifications)
router.post('/vercel', asyncHandler(async (req, res) => {
  const payload = req.body;
  
  await webhookService.handleVercelWebhook(payload);
  
  res.json({ received: true });
}));

export default router;
