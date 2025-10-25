/**
 * Authentication Configuration
 * NextAuth.js configuration for DealershipAI
 */

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In a real implementation, you would verify the password
        // For demo purposes, we'll allow any valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        // Create or find user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: 'user'
            }
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.dealershipId = user.dealershipId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.dealershipId = token.dealershipId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper functions
export async function getCurrentUser(req: any) {
  try {
    // In a real implementation, you would extract the session from the request
    // For demo purposes, return a mock user
    return {
      id: 'demo-user-id',
      email: 'demo@dealership.com',
      name: 'Demo User',
      role: 'dealer',
      dealershipId: 'demo-dealership-id'
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(req: any) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(req: any, allowedRoles: string[]) {
  const user = await requireAuth(req);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}