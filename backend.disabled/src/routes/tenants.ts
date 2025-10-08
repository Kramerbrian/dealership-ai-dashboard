import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  extractUserContext, 
  requireSuperAdmin,
  requireEnterpriseAdmin,
  requirePermission,
  enforceTenantAccess 
} from '../middleware/rbac';
import { TenantType } from '../types/user';
import { tenantService } from '../services/tenantService';

const router = Router();

// Apply user context extraction to all routes
router.use(extractUserContext);

// Get all tenants (SuperAdmin only)
router.get('/',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search, type } = req.query;
    
    const tenants = await tenantService.getAllTenants({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      type: type as TenantType
    });
    
    res.json({ tenants });
  })
);

// Get accessible tenants (Enterprise Admin and below)
router.get('/accessible',
  requirePermission('can_view_all_tenants'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    
    const tenants = await tenantService.getAccessibleTenants(
      userContext.accessible_tenants
    );
    
    res.json({ tenants });
  })
);

// Get specific tenant
router.get('/:tenantId',
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const userContext = req.userContext!;
    
    const tenant = await tenantService.getTenant(
      tenantId, 
      userContext.accessible_tenants
    );
    
    res.json({ tenant });
  })
);

// Create new tenant (SuperAdmin only)
router.post('/',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { name, type, parentId, settings } = req.body;
    
    const tenant = await tenantService.createTenant({
      name,
      type: type as TenantType,
      parentId,
      settings: settings || {}
    });
    
    res.status(201).json({ tenant });
  })
);

// Update tenant
router.put('/:tenantId',
  requirePermission('can_manage_tenants'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const userContext = req.userContext!;
    const { name, settings } = req.body;
    
    const tenant = await tenantService.updateTenant(tenantId, {
      name,
      settings,
      accessibleTenants: userContext.accessible_tenants
    });
    
    res.json({ tenant });
  })
);

// Delete tenant (SuperAdmin only)
router.delete('/:tenantId',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    
    await tenantService.deleteTenant(tenantId);
    
    res.status(204).send();
  })
);

// Get tenant hierarchy
router.get('/:tenantId/hierarchy',
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const userContext = req.userContext!;
    
    const hierarchy = await tenantService.getTenantHierarchy(
      tenantId,
      userContext.accessible_tenants
    );
    
    res.json({ hierarchy });
  })
);

// Get tenant statistics
router.get('/:tenantId/stats',
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const userContext = req.userContext!;
    
    const stats = await tenantService.getTenantStats(
      tenantId,
      userContext.accessible_tenants
    );
    
    res.json({ stats });
  })
);

// Get tenant users
router.get('/:tenantId/users',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { page = 1, limit = 50, search } = req.query;
    
    const users = await tenantService.getTenantUsers({
      tenantId,
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });
    
    res.json({ users });
  })
);

// Get tenant dealership data
router.get('/:tenantId/dealerships',
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { page = 1, limit = 50, search } = req.query;
    
    const dealerships = await tenantService.getTenantDealerships({
      tenantId,
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });
    
    res.json({ dealerships });
  })
);

// Get tenant analytics
router.get('/:tenantId/analytics',
  requirePermission('can_view_analytics'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { startDate, endDate, metric } = req.query;
    
    const analytics = await tenantService.getTenantAnalytics({
      tenantId,
      startDate: startDate as string,
      endDate: endDate as string,
      metric: metric as string
    });
    
    res.json({ analytics });
  })
);

// Update tenant settings
router.put('/:tenantId/settings',
  requirePermission('can_manage_settings'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const userContext = req.userContext!;
    const { settings } = req.body;
    
    const updatedSettings = await tenantService.updateTenantSettings(
      tenantId,
      settings,
      userContext.accessible_tenants
    );
    
    res.json({ settings: updatedSettings });
  })
);

// Get tenant billing information
router.get('/:tenantId/billing',
  requirePermission('can_view_billing'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    
    const billing = await tenantService.getTenantBilling(tenantId);
    
    res.json({ billing });
  })
);

// Update tenant billing
router.put('/:tenantId/billing',
  requirePermission('can_manage_billing'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { billingInfo } = req.body;
    
    const billing = await tenantService.updateTenantBilling(
      tenantId,
      billingInfo
    );
    
    res.json({ billing });
  })
);

// Get tenant audit log
router.get('/:tenantId/audit',
  requirePermission('can_view_analytics'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const { page = 1, limit = 50, action, userId } = req.query;
    
    const auditLog = await tenantService.getTenantAuditLog({
      tenantId,
      page: Number(page),
      limit: Number(limit),
      action: action as string,
      userId: userId as string
    });
    
    res.json({ auditLog });
  })
);

export default router;
