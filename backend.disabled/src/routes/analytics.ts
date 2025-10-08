import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { analyticsService } from '../services/analytics';
import { 
  extractUserContext, 
  requirePermission, 
  enforceTenantAccess,
  requireDealershipAdmin 
} from '../middleware/rbac';
import { UserRole } from '../types/user';

const router = Router();

// Apply RBAC middleware to all routes
router.use(extractUserContext);
router.use(enforceTenantAccess);

// Analyze dealership website
router.post('/analyze', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { dealershipUrl } = req.body;
    const userContext = req.userContext!;
    
    if (!dealershipUrl) {
      return res.status(400).json({ error: 'Dealership URL is required' });
    }
    
    const analysis = await analyticsService.analyzeDealership(
      dealershipUrl, 
      userContext.user.id
    );
    res.json({ analysis });
  })
);

// Get analysis history
router.get('/history', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    
    // Superadmin: Can see all analyses
    if (userContext.user.role === UserRole.SUPERADMIN) {
      const analyses = await analyticsService.getAnalysis(userContext.user.id);
      return res.json({ analyses });
    }

    // Enterprise admin: Can see analyses from their group
    if (userContext.user.role === UserRole.ENTERPRISE_ADMIN) {
      const analyses = await analyticsService.getAnalysis(userContext.user.id);
      return res.json({ analyses });
    }

    // Dealership admin/user: Only their own analyses
    const analyses = await analyticsService.getAnalysis(userContext.user.id);
    res.json({ analyses });
  })
);

// Get specific analysis
router.get('/:analysisId', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { analysisId } = req.params;
    const userContext = req.userContext!;
    
    // Superadmin: Can see any analysis
    if (userContext.user.role === UserRole.SUPERADMIN) {
      const analysis = await analyticsService.getAnalysisById(analysisId);
      return res.json({ analysis });
    }
    
    // Enterprise admin: Can see analyses from their group
    if (userContext.user.role === UserRole.ENTERPRISE_ADMIN) {
      const analysis = await analyticsService.getAnalysisById(analysisId, userContext.tenant?.id);
      if (!analysis) {
        return res.status(403).json({ error: 'Analysis not found or access denied' });
      }
      return res.json({ analysis });
    }
    
    // Dealership admin/user: Only their own analyses
    const analysis = await analyticsService.getAnalysisById(analysisId, userContext.tenant?.id);
    if (!analysis) {
      return res.status(403).json({ error: 'Analysis not found or access denied' });
    }
    res.json({ analysis });
  })
);

// Get monthly scan results
router.get('/monthly-scan/:scanId', asyncHandler(async (req, res) => {
  const { scanId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const scan = await analyticsService.getMonthlyScan(scanId, userId);
  res.json({ scan });
}));

// Trigger monthly scan
router.post('/monthly-scan', asyncHandler(async (req, res) => {
  const { dealershipUrl } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const scan = await analyticsService.triggerMonthlyScan(dealershipUrl, userId);
  res.json({ scan });
}));

export default router;
