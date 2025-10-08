import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler';
import { complianceEngine } from '../services/compliance';

/**
 * Compliance Assessment Express Router
 * Handles security and search visibility compliance evaluations
 */

const router = Router();

/**
 * Assess compliance for a given input
 */
router.post('/assess', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  
  // Check permissions - only admins can assess compliance
  if (!userContext.user.role || !['superadmin', 'enterprise_admin', 'dealership_admin'].includes(userContext.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to assess compliance'
    });
  }

  try {
    const result = await complianceEngine.assessCompliance(
      {
        messages: req.body.messages,
        compliant: req.body.compliant,
        explanation: req.body.explanation,
      },
      {
        tenant_id: userContext.tenant?.id,
        dealer_id: req.body.dealer_id,
        question_type: req.body.question_type,
        assessed_by: userContext.user.id,
      }
    );

    res.json({
      success: true,
      assessment: result,
    });
  } catch (error) {
    console.error('Compliance assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess compliance'
    });
  }
}));

/**
 * Get compliance metrics for the tenant
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  
  // Check permissions
  if (!userContext.user.role || !['superadmin', 'enterprise_admin', 'dealership_admin'].includes(userContext.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to view compliance metrics'
    });
  }

  try {
    const metrics = await complianceEngine.getComplianceMetrics(userContext.tenant?.id);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance metrics'
    });
  }
}));

/**
 * Get assessment history for a dealer
 */
router.get('/history', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  const { dealer_id, limit = 20, offset = 0 } = req.query;
  
  // Check permissions
  if (!userContext.user.role || !['superadmin', 'enterprise_admin', 'dealership_admin'].includes(userContext.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to view assessment history'
    });
  }

  try {
    // Mock data for now
    const assessments: any[] = [];

    res.json({
      assessments,
      total: 0,
      hasMore: false,
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment history'
    });
  }
}));

/**
 * Get a specific assessment by ID
 */
router.get('/assessments/:assessment_id', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  const { assessment_id } = req.params;
  
  // Check permissions
  if (!userContext.user.role || !['superadmin', 'enterprise_admin', 'dealership_admin'].includes(userContext.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to view assessment'
    });
  }

  try {
    // Try cache first
    const cached = complianceEngine.getCachedAssessment(assessment_id);
    if (cached && cached.tenant_id === userContext.tenant?.id) {
      return res.json(cached);
    }

    res.status(404).json({
      success: false,
      error: 'Assessment not found'
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment'
    });
  }
}));

/**
 * Bulk assess multiple compliance items
 */
router.post('/bulk-assess', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  
  // Check permissions
  if (!userContext.user.role || !['superadmin', 'enterprise_admin', 'dealership_admin'].includes(userContext.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to assess compliance'
    });
  }

  try {
    const results = await Promise.all(
      req.body.assessments.map((assessment: any) =>
        complianceEngine.assessCompliance(assessment, {
          tenant_id: userContext.tenant?.id,
          dealer_id: assessment.dealer_id,
          question_type: assessment.question_type,
          assessed_by: userContext.user.id,
        })
      )
    );

    res.json({
      success: true,
      assessments: results,
      total: results.length,
    });
  } catch (error) {
    console.error('Bulk compliance assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess compliance'
    });
  }
}));

export default router;