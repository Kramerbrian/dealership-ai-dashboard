import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validate } from '../middleware/validation.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest, UserRole, ROLE_PERMISSIONS } from '../types/auth.types';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Mock user database (in production, this would be a real database)
const mockUsers = [
  {
    id: '1',
    email: 'admin@dealership.com',
    password: '$2b$10$YourHashedPasswordHere', // Use bcrypt.hash('password123', 10) to generate
    name: 'Admin User',
    role: UserRole.SUPER_ADMIN,
    dealershipId: undefined
  },
  {
    id: '2',
    email: 'owner@dealership.com',
    password: '$2b$10$YourHashedPasswordHere',
    name: 'Dealership Owner',
    role: UserRole.DEALERSHIP_OWNER,
    dealershipId: 'dealership-123'
  },
  {
    id: '3',
    email: 'manager@dealership.com',
    password: '$2b$10$YourHashedPasswordHere',
    name: 'Sales Manager',
    role: UserRole.SALES_MANAGER,
    dealershipId: 'dealership-123'
  }
];

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password required')
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user (mock implementation)
      const user = mockUsers.find(u => u.email === email);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Verify password (in production, compare with hashed password)
      // const isValidPassword = await bcrypt.compare(password, user.password);
      const isValidPassword = password === 'password123'; // Mock validation
      
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          dealershipId: user.dealershipId,
          permissions: ROLE_PERMISSIONS[user.role]
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            dealershipId: user.dealershipId,
            permissions: ROLE_PERMISSIONS[user.role]
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new AppError('Authentication failed', 500);
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Protected
 */
router.post(
  '/refresh',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Generate new token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          role: user.role,
          dealershipId: user.dealershipId,
          permissions: user.permissions
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );

      res.json({
        success: true,
        data: { token }
      });
    } catch (error) {
      throw new AppError('Failed to refresh token', 500);
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Protected
 */
router.get(
  '/me',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new AppError('User not found', 401);
      }

      res.json({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          role: user.role,
          dealershipId: user.dealershipId,
          permissions: user.permissions
        }
      });
    } catch (error) {
      throw new AppError('Failed to get user info', 500);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should remove token)
 * @access  Protected
 */
router.post(
  '/logout',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    // In a real implementation, you might want to blacklist the token
    // For now, just return success (client should remove token)
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Protected
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').isString().isLength({ min: 6 }),
    body('newPassword').isString().isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number')
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not found', 401);
      }

      // In production, verify current password and update in database
      // const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      throw new AppError('Failed to change password', 500);
    }
  }
);

export default router;