const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * User login
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Get user from database (mock implementation)
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        dealerships: user.dealerships || []
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Update user's last login
    await updateUserLastLogin(user._id);

    // Return user data and tokens
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      dealerships: user.dealerships || [],
      permissions: getRolePermissions(user.role),
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      user: userResponse,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * User logout (client-side token removal)
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // You could implement token blacklisting here if needed

    res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGOUT_ERROR'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      dealerships: user.dealerships || [],
      permissions: getRolePermissions(user.role),
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'PROFILE_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    // The refresh token is validated in the middleware
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is still active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        dealerships: user.dealerships || []
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(200).json({
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'TOKEN_REFRESH_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Helper functions

/**
 * Get user by email (mock implementation)
 */
const getUserByEmail = async (email) => {
  // In a real implementation, this would query a database
  // For demo purposes, return a mock user
  const mockUsers = {
    'admin@dealership.com': {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@dealership.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      dealerships: [],
      status: 'active',
      lastLogin: new Date()
    },
    'manager@dealership.com': {
      _id: '507f1f77bcf86cd799439012',
      email: 'manager@dealership.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      dealerships: ['dealer1', 'dealer2'],
      status: 'active',
      lastLogin: new Date()
    },
    'analyst@dealership.com': {
      _id: '507f1f77bcf86cd799439013',
      email: 'analyst@dealership.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      firstName: 'Analyst',
      lastName: 'User',
      role: 'analyst',
      dealerships: ['dealer1'],
      status: 'active',
      lastLogin: new Date()
    }
  };

  return mockUsers[email] || null;
};

/**
 * Get user by ID (mock implementation)
 */
const getUserById = async (id) => {
  // In a real implementation, this would query a database
  const mockUsers = {
    '507f1f77bcf86cd799439011': {
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@dealership.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      dealerships: [],
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    },
    '507f1f77bcf86cd799439012': {
      _id: '507f1f77bcf86cd799439012',
      email: 'manager@dealership.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      dealerships: ['dealer1', 'dealer2'],
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    },
    '507f1f77bcf86cd799439013': {
      _id: '507f1f77bcf86cd799439013',
      email: 'analyst@dealership.com',
      firstName: 'Analyst',
      lastName: 'User',
      role: 'analyst',
      dealerships: ['dealer1'],
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    }
  };

  return mockUsers[id] || null;
};

/**
 * Update user's last login timestamp
 */
const updateUserLastLogin = async (userId) => {
  // In a real implementation, this would update the database
  console.log(`Updated last login for user ${userId}`);
};

/**
 * Get permissions for a role
 */
const getRolePermissions = (role) => {
  const permissions = {
    admin: [
      'analytics:read:all',
      'analytics:write:all',
      'users:read:all',
      'users:write:all',
      'dealerships:read:all',
      'dealerships:write:all',
      'reports:generate:all'
    ],
    manager: [
      'analytics:read:assigned',
      'analytics:write:assigned',
      'users:read:assigned',
      'dealerships:read:assigned',
      'reports:generate:assigned'
    ],
    analyst: [
      'analytics:read:assigned',
      'dealerships:read:assigned'
    ]
  };

  return permissions[role] || [];
};

module.exports = {
  login,
  logout,
  getProfile,
  refreshToken
};