import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Clerk authentication middleware
export const authMiddleware = ClerkExpressRequireAuth() as any;

// Custom auth middleware for additional checks
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Admin role middleware
export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin role (implement based on your user system)
  const userRoles = req.auth.sessionClaims?.metadata?.roles || [];
  if (!userRoles.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Subscription middleware
export const requireActiveSubscription = async (req: any, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Check subscription status (implement based on your subscription system)
    const userId = req.auth.userId;
    // const subscription = await getActiveSubscription(userId);
    
    // For now, allow all authenticated users
    // if (!subscription || subscription.status !== 'active') {
    //   return res.status(403).json({ error: 'Active subscription required' });
    // }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
