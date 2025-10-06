const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/rbac');
const { validateAnalyticsRequest } = require('../middleware/validation');
const analyticsController = require('../controllers/analyticsController');

/**
 * @route GET /api/analytics/dealership/:dealershipId
 * @desc Get analytics data for a specific dealership
 * @access Private - Requires authentication and appropriate role
 */
router.get('/dealership/:dealershipId',
  authenticateToken,
  authorizeRoles(['admin', 'manager', 'analyst']),
  validateAnalyticsRequest,
  analyticsController.getDealershipAnalytics
);

/**
 * @route GET /api/analytics/summary
 * @desc Get summary analytics across all dealerships
 * @access Private - Requires authentication and admin/manager role
 */
router.get('/summary',
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  analyticsController.getAnalyticsSummary
);

/**
 * @route GET /api/analytics/competitor/:dealershipId
 * @desc Get competitor analysis for a dealership
 * @access Private - Requires authentication and appropriate role
 */
router.get('/competitor/:dealershipId',
  authenticateToken,
  authorizeRoles(['admin', 'manager', 'analyst']),
  analyticsController.getCompetitorAnalysis
);

/**
 * @route GET /api/analytics/reviews/:dealershipId
 * @desc Get review analytics for a dealership
 * @access Private - Requires authentication and analyst+ role
 */
router.get('/reviews/:dealershipId',
  authenticateToken,
  authorizeRoles(['admin', 'manager', 'analyst']),
  analyticsController.getReviewAnalytics
);

/**
 * @route POST /api/analytics/generate-report
 * @desc Generate a comprehensive analytics report
 * @access Private - Requires authentication and admin/manager role
 */
router.post('/generate-report',
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  analyticsController.generateAnalyticsReport
);

module.exports = router;