const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * Extracts user information from JWT and adds it to request object
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // Check if token is expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    if (verified.exp && verified.exp - now < 300) {
      // Token expires in less than 5 minutes
      req.tokenExpiring = true;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(403).json({
        error: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
};

/**
 * Middleware to authorize based on user roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the endpoint
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        error: 'User role not found',
        code: 'ROLE_NOT_FOUND'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or has admin privileges
 * @param {string} resourceUserId - The user ID field in the resource being accessed
 */
const authorizeResourceOwner = (resourceUserId = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params[resourceUserId] || req.body[resourceUserId];
    if (!resourceId) {
      return res.status(400).json({
        error: 'Resource identifier not found',
        code: 'RESOURCE_ID_NOT_FOUND'
      });
    }

    if (req.user.id !== resourceId && req.user.role !== 'manager') {
      return res.status(403).json({
        error: 'Access denied. You can only access your own resources.',
        code: 'RESOURCE_ACCESS_DENIED'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has permission for specific dealership
 * @param {string} dealershipId - The dealership ID field in the resource
 */
const authorizeDealershipAccess = (dealershipId = 'dealershipId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Admin can access any dealership
    if (req.user.role === 'admin') {
      return next();
    }

    // Manager can access dealerships they're assigned to
    if (req.user.role === 'manager' && req.user.dealerships) {
      const resourceDealershipId = req.params[dealershipId] || req.body[dealershipId];
      if (req.user.dealerships.includes(resourceDealershipId)) {
        return next();
      }
    }

    // Analyst can access dealerships they're assigned to
    if (req.user.role === 'analyst' && req.user.dealerships) {
      const resourceDealershipId = req.params[dealershipId] || req.body[dealershipId];
      if (req.user.dealerships.includes(resourceDealershipId)) {
        return next();
      }
    }

    return res.status(403).json({
      error: 'Access denied. You do not have permission to access this dealership.',
      code: 'DEALERSHIP_ACCESS_DENIED'
    });
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for endpoints that work with or without authentication
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
    } catch (error) {
      // Ignore token errors for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeResourceOwner,
  authorizeDealershipAccess,
  optionalAuth
};