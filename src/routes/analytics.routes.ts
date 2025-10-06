import { Router, Response } from 'express';
import { body, query, param } from 'express-validator';
import { 
  authenticate, 
  requirePermissions, 
  requireAnyPermission,
  requireDealershipAccess 
} from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { exportRateLimiter } from '../middleware/rateLimiter';
import { analyticsService } from '../services/analytics.service';
import { AuthRequest } from '../types/auth.types';
import { Permission } from '../types/auth.types';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/analytics/dealership/:dealershipId
 * @desc    Get comprehensive analytics for a dealership
 * @access  Protected - Requires VIEW_ANALYTICS permission and dealership access
 */
router.get(
  '/dealership/:dealershipId',
  authenticate,
  requirePermissions(Permission.VIEW_ANALYTICS),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty().withMessage('Valid dealership ID required'),
    query('startDate').optional().isISO8601().toDate().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().toDate().withMessage('Invalid end date'),
    query('metrics').optional().isString().withMessage('Metrics must be comma-separated string'),
    query('groupBy').optional().isIn(['day', 'week', 'month', 'quarter', 'year']),
    query('compareWithPrevious').optional().isBoolean()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      const { startDate, endDate, metrics, groupBy, compareWithPrevious } = req.query;

      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        startDate: startDate as string,
        endDate: endDate as string,
        metrics: metrics ? (metrics as string).split(',') : undefined,
        groupBy: groupBy as any,
        compareWithPrevious: compareWithPrevious === 'true'
      });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to fetch analytics',
        500
      );
    }
  }
);

/**
 * @route   GET /api/analytics/dealership/:dealershipId/ai-visibility
 * @desc    Get AI visibility metrics for a dealership
 * @access  Protected - Requires VIEW_ANALYTICS permission
 */
router.get(
  '/dealership/:dealershipId/ai-visibility',
  authenticate,
  requirePermissions(Permission.VIEW_ANALYTICS),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      
      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        metrics: ['aiVisibility']
      });

      res.json({
        success: true,
        data: analytics.metrics.aiVisibility
      });
    } catch (error) {
      throw new AppError('Failed to fetch AI visibility metrics', 500);
    }
  }
);

/**
 * @route   GET /api/analytics/dealership/:dealershipId/sales
 * @desc    Get sales analytics for a dealership
 * @access  Protected - Requires VIEW_SALES_DATA permission
 */
router.get(
  '/dealership/:dealershipId/sales',
  authenticate,
  requirePermissions(Permission.VIEW_SALES_DATA),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty(),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      const { startDate, endDate } = req.query;
      
      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        startDate: startDate as string,
        endDate: endDate as string,
        metrics: ['sales']
      });

      res.json({
        success: true,
        data: analytics.metrics.sales
      });
    } catch (error) {
      throw new AppError('Failed to fetch sales analytics', 500);
    }
  }
);

/**
 * @route   GET /api/analytics/dealership/:dealershipId/marketing
 * @desc    Get marketing analytics for a dealership
 * @access  Protected - Requires VIEW_MARKETING_DATA permission
 */
router.get(
  '/dealership/:dealershipId/marketing',
  authenticate,
  requirePermissions(Permission.VIEW_MARKETING_DATA),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty(),
    query('startDate').optional().isISO8601().toDate(),
    query('endDate').optional().isISO8601().toDate()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      const { startDate, endDate } = req.query;
      
      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        startDate: startDate as string,
        endDate: endDate as string,
        metrics: ['marketing']
      });

      res.json({
        success: true,
        data: analytics.metrics.marketing
      });
    } catch (error) {
      throw new AppError('Failed to fetch marketing analytics', 500);
    }
  }
);

/**
 * @route   GET /api/analytics/dealership/:dealershipId/competitors
 * @desc    Get competitor analysis for a dealership
 * @access  Protected - Requires VIEW_DETAILED_ANALYTICS permission
 */
router.get(
  '/dealership/:dealershipId/competitors',
  authenticate,
  requirePermissions(Permission.VIEW_DETAILED_ANALYTICS),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      
      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        metrics: ['competitors']
      });

      res.json({
        success: true,
        data: analytics.metrics.competitors
      });
    } catch (error) {
      throw new AppError('Failed to fetch competitor analysis', 500);
    }
  }
);

/**
 * @route   GET /api/analytics/dealership/:dealershipId/threats
 * @desc    Get threat analysis for a dealership
 * @access  Protected - Requires VIEW_DETAILED_ANALYTICS permission
 */
router.get(
  '/dealership/:dealershipId/threats',
  authenticate,
  requirePermissions(Permission.VIEW_DETAILED_ANALYTICS),
  requireDealershipAccess,
  validate([
    param('dealershipId').isString().notEmpty()
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      
      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId,
        metrics: ['threats']
      });

      res.json({
        success: true,
        data: analytics.metrics.threats
      });
    } catch (error) {
      throw new AppError('Failed to fetch threat analysis', 500);
    }
  }
);

/**
 * @route   POST /api/analytics/dealership/:dealershipId/export
 * @desc    Export analytics data in various formats
 * @access  Protected - Requires EXPORT_ANALYTICS permission
 */
router.post(
  '/dealership/:dealershipId/export',
  authenticate,
  requirePermissions(Permission.EXPORT_ANALYTICS),
  requireDealershipAccess,
  exportRateLimiter,
  validate([
    param('dealershipId').isString().notEmpty(),
    body('format').isIn(['csv', 'pdf', 'excel']).withMessage('Format must be csv, pdf, or excel'),
    body('metrics').isArray().notEmpty().withMessage('Metrics array required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date required'),
    body('email').optional().isEmail().withMessage('Valid email required')
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dealershipId } = req.params;
      const { format, metrics, startDate, endDate, email } = req.body;

      const exportResult = await analyticsService.exportAnalytics(
        dealershipId,
        format,
        metrics,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          downloadUrl: exportResult.url,
          expiresAt: exportResult.expiresAt,
          message: email ? `Export will be sent to ${email}` : 'Export ready for download'
        }
      });
    } catch (error) {
      throw new AppError('Failed to export analytics', 500);
    }
  }
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard summary for logged-in user's dealership
 * @access  Protected - Requires VIEW_ANALYTICS permission
 */
router.get(
  '/dashboard',
  authenticate,
  requirePermissions(Permission.VIEW_ANALYTICS),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const dealershipId = req.user?.dealershipId;
      
      if (!dealershipId) {
        throw new AppError('No dealership associated with user', 400);
      }

      const analytics = await analyticsService.getDealershipAnalytics({
        dealershipId
      });

      // Return summarized dashboard data
      const dashboard = {
        aiVisibility: {
          score: analytics.metrics.aiVisibility.overallScore,
          trend: analytics.metrics.aiVisibility.overallScore > 70 ? 'good' : 'needs-improvement'
        },
        sales: {
          total: analytics.metrics.sales.totalSales,
          revenue: analytics.metrics.sales.totalRevenue,
          trend: analytics.metrics.sales.trend
        },
        threats: {
          riskScore: analytics.metrics.threats.riskScore,
          criticalCount: analytics.metrics.threats.threats.filter(t => t.severity === 'Critical').length
        },
        competitors: {
          position: analytics.metrics.competitors.marketPosition,
          total: analytics.metrics.competitors.totalCompetitors
        }
      };

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  }
);

export default router;