import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  extractUserContext, 
  requireRole, 
  requirePermission,
  enforceTenantAccess 
} from '../middleware/rbac';
import { UserRole } from '../types/user';
import { userService } from '../services/userService';

const router = Router();

// Apply user context extraction to all routes
router.use(extractUserContext);

// Get current user profile
router.get('/me', asyncHandler(async (req, res) => {
  const userContext = req.userContext!;
  
  const user = await userService.getUserProfile(userContext.user.id);
  res.json({ user });
}));

// Get users in current tenant
router.get('/', 
  requirePermission('can_manage_users'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    const { page = 1, limit = 50, search } = req.query;
    
    const users = await userService.getTenantUsers({
      tenantId: userContext.user.tenant_id,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      accessibleTenants: userContext.accessible_tenants
    });
    
    res.json({ users });
  })
);

// Get specific user
router.get('/:userId',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    
    const user = await userService.getUser(userId, userContext.accessible_tenants);
    res.json({ user });
  })
);

// Create new user
router.post('/',
  requirePermission('can_manage_users'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    const { clerkId, role, permissions } = req.body;
    
    // Validate role assignment permissions
    if (!userService.canAssignRole(userContext.user.role, role as UserRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to assign this role',
        currentRole: userContext.user.role,
        requestedRole: role
      });
    }
    
    const user = await userService.createUser({
      clerkId,
      tenantId: userContext.user.tenant_id,
      role: role as UserRole,
      permissions: permissions || {}
    });
    
    res.status(201).json({ user });
  })
);

// Update user
router.put('/:userId',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    const { role, permissions } = req.body;
    
    // Validate role assignment permissions
    if (role && !userService.canAssignRole(userContext.user.role, role as UserRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to assign this role',
        currentRole: userContext.user.role,
        requestedRole: role
      });
    }
    
    const user = await userService.updateUser(userId, {
      role: role as UserRole,
      permissions,
      accessibleTenants: userContext.accessible_tenants
    });
    
    res.json({ user });
  })
);

// Delete user
router.delete('/:userId',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    
    // Prevent self-deletion
    if (userId === userContext.user.id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }
    
    await userService.deleteUser(userId, userContext.accessible_tenants);
    
    res.status(204).send();
  })
);

// Get user permissions
router.get('/:userId/permissions',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    
    const permissions = await userService.getUserPermissions(
      userId, 
      userContext.accessible_tenants
    );
    
    res.json({ permissions });
  })
);

// Update user permissions
router.put('/:userId/permissions',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    const { permissions } = req.body;
    
    const updatedPermissions = await userService.updateUserPermissions(
      userId,
      permissions,
      userContext.accessible_tenants
    );
    
    res.json({ permissions: updatedPermissions });
  })
);

// Get user activity/audit log
router.get('/:userId/activity',
  requirePermission('can_manage_users'),
  enforceTenantAccess,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const userContext = req.userContext!;
    const { page = 1, limit = 50 } = req.query;
    
    const activity = await userService.getUserActivity({
      userId,
      tenantId: userContext.user.tenant_id,
      page: Number(page),
      limit: Number(limit),
      accessibleTenants: userContext.accessible_tenants
    });
    
    res.json({ activity });
  })
);

// Invite user (for enterprise/dealership admins)
router.post('/invite',
  requirePermission('can_manage_users'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    const { email, role, message } = req.body;
    
    // Validate role assignment permissions
    if (!userService.canAssignRole(userContext.user.role, role as UserRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to assign this role',
        currentRole: userContext.user.role,
        requestedRole: role
      });
    }
    
    const invitation = await userService.inviteUser({
      email,
      role: role as UserRole,
      tenantId: userContext.user.tenant_id,
      invitedBy: userContext.user.id,
      message
    });
    
    res.status(201).json({ invitation });
  })
);

export default router;
