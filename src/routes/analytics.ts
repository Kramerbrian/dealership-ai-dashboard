import { Router } from 'express';
import { requireRoles, UserRole } from '../middleware/rbac';
import { z } from 'zod';
import { getDealershipAnalytics } from '../services/analyticsService';

export const analyticsRouter = Router();

const querySchema = z.object({
  dealership: z.string().min(1),
  location: z.string().min(1).optional(),
  range: z.enum(['7d', '30d', '90d', '180d', '365d']).default('30d'),
});

const ALLOWED_ROLES: UserRole[] = ['admin', 'manager', 'analyst'];

analyticsRouter.get('/', requireRoles(ALLOWED_ROLES), async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query params', details: parsed.error.flatten() });
  }

  try {
    const data = await getDealershipAnalytics({
      dealership: parsed.data.dealership,
      location: parsed.data.location,
      range: parsed.data.range,
      requester: req.user!,
    });
    return res.json({ data });
  } catch (error: any) {
    const status = error?.statusCode || 500;
    return res.status(status).json({ error: error?.message || 'Failed to fetch analytics' });
  }
});
