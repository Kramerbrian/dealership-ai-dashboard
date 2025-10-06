import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWTPayload, Permission, ROLE_PERMISSIONS } from '../types/auth.types';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    try {
      const decoded = jwt.verify(token, secret) as JWTPayload;
      
      // Ensure user has the permissions defined for their role
      const rolePermissions = ROLE_PERMISSIONS[decoded.role] || [];
      decoded.permissions = [...new Set([...(decoded.permissions || []), ...rolePermissions])];
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Extract JWT token from request
 */
const extractToken = (req: AuthRequest): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check query parameter (optional, for certain use cases)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }
  
  return null;
};

/**
 * Middleware factory to check for required permissions
 */
export const requirePermissions = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: permissions,
        current: userPermissions
      });
      return;
    }

    next();
  };
};

/**
 * Middleware factory to check for at least one of the required permissions
 */
export const requireAnyPermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAnyPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAnyPermission) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: `At least one of: ${permissions.join(', ')}`,
        current: userPermissions
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check dealership ownership/association
 */
export const requireDealershipAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const requestedDealershipId = req.params.dealershipId || req.query.dealershipId;
  
  // Super admins can access all dealerships
  if (req.user.permissions.includes(Permission.SYSTEM_ADMIN)) {
    next();
    return;
  }

  // Check if user belongs to the requested dealership
  if (requestedDealershipId && req.user.dealershipId !== requestedDealershipId) {
    res.status(403).json({
      success: false,
      message: 'Access denied to this dealership'
    });
    return;
  }

  next();
};