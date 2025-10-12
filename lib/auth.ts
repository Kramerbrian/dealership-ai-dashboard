/**
 * DealershipAI v2.0 - Authentication Manager
 * 
 * Handles JWT token verification and user authentication
 */

import { jwtVerify } from 'jose';
import { prisma } from './prisma';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key');

export interface User {
  userId: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  email: string;
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthManager {
  /**
   * Verify JWT token and extract user information
   */
  static async getUserFromToken(token: string): Promise<AuthResult> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      const userId = payload.sub as string;
      const email = payload.email as string;
      const name = payload.name as string;
      
      if (!userId || !email) {
        return {
          success: false,
          error: 'Invalid token payload'
        };
      }

      // Get user from database to verify they exist and get current plan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        user: {
          userId: user.id,
          plan: user.plan as 'FREE' | 'PRO' | 'ENTERPRISE',
          email: user.email,
          name: user.name || undefined
        }
      };

    } catch (error) {
      console.error('JWT verification failed:', error);
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }
  }

  /**
   * Create a new user (for registration)
   */
  static async createUser(userData: {
    email: string;
    name?: string;
    plan?: 'FREE' | 'PRO' | 'ENTERPRISE';
  }): Promise<AuthResult> {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          plan: userData.plan || 'FREE'
        }
      });

      return {
        success: true,
        user: {
          userId: user.id,
          plan: user.plan as 'FREE' | 'PRO' | 'ENTERPRISE',
          email: user.email,
          name: user.name || undefined
        }
      };

    } catch (error) {
      console.error('User creation failed:', error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  /**
   * Update user plan (for upgrades)
   */
  static async updateUserPlan(userId: string, newPlan: 'FREE' | 'PRO' | 'ENTERPRISE'): Promise<AuthResult> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { plan: newPlan }
      });

      return {
        success: true,
        user: {
          userId: user.id,
          plan: user.plan as 'FREE' | 'PRO' | 'ENTERPRISE',
          email: user.email,
          name: user.name || undefined
        }
      };

    } catch (error) {
      console.error('Plan update failed:', error);
      return {
        success: false,
        error: 'Failed to update user plan'
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        user: {
          userId: user.id,
          plan: user.plan as 'FREE' | 'PRO' | 'ENTERPRISE',
          email: user.email,
          name: user.name || undefined
        }
      };

    } catch (error) {
      console.error('Get user failed:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }
}

export default AuthManager;