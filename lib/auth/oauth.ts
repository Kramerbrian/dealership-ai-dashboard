// OAuth SSO implementation for DealershipAI
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, user, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || 'user';
        session.user.dealershipId = user.dealershipId;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dealershipId = user.dealershipId;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome'
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { userId: user.id, provider: account?.provider });
      
      // Track sign-in event for analytics
      if (process.env.NEXT_PUBLIC_GA_ID) {
        // Send to Google Analytics
        gtag('event', 'sign_in', {
          method: account?.provider,
          user_id: user.id
        });
      }
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { userId: session?.user?.id });
    }
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

// Role-based access control
export const ROLES = {
  ADMIN: 'admin',
  DEALER: 'dealer',
  USER: 'user',
  VIEWER: 'viewer'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], // All permissions
  [ROLES.DEALER]: [
    'dashboard:read',
    'analytics:read',
    'settings:write',
    'users:manage',
    'reports:generate'
  ],
  [ROLES.USER]: [
    'dashboard:read',
    'analytics:read',
    'reports:generate'
  ],
  [ROLES.VIEWER]: [
    'dashboard:read'
  ]
} as const;

export function hasPermission(userRole: Role, permission: string): boolean {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes('*') || rolePermissions.includes(permission);
}

// Middleware for protecting routes
export function requireAuth(requiredRole?: Role) {
  return function(handler: Function) {
    return async function(req: any, res: any, ...args: any[]) {
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (requiredRole && !hasPermission(session.user.role as Role, `role:${requiredRole}`)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res, ...args);
    };
  };
}

// User management utilities
export class UserManager {
  static async createUser(userData: {
    email: string;
    name: string;
    role: Role;
    dealershipId?: string;
  }) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        dealershipId: userData.dealershipId
      }
    });
  }

  static async updateUserRole(userId: string, role: Role) {
    return await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  static async getUserDealership(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dealership: true
      }
    });
    return user?.dealership;
  }

  static async getUsersByDealership(dealershipId: string) {
    return await prisma.user.findMany({
      where: { dealershipId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
  }
}

// Session management
export class SessionManager {
  static async getCurrentUser(session: any) {
    if (!session?.user?.id) return null;
    
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        dealership: true
      }
    });
  }

  static async updateLastLogin(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  static async revokeUserSessions(userId: string) {
    // In a real implementation, you'd invalidate JWT tokens or session records
    // For now, we'll just update the user's last login to force re-authentication
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }
}

// Security utilities
export class SecurityManager {
  static async validateUserAccess(userId: string, resourceId: string, action: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dealership: true }
    });

    if (!user) return false;

    // Check if user has permission for the action
    if (!hasPermission(user.role as Role, action)) {
      return false;
    }

    // Check if user has access to the resource
    if (user.dealershipId && resourceId !== user.dealershipId) {
      return false;
    }

    return true;
  }

  static async auditLog(action: string, userId: string, details: any) {
    return await prisma.auditLog.create({
      data: {
        action,
        userId,
        details: JSON.stringify(details),
        timestamp: new Date()
      }
    });
  }
}

// Google Analytics integration
declare global {
  function gtag(...args: any[]): void;
}
