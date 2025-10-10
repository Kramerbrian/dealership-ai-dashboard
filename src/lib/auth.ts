/**
 * NextAuth Configuration with BoxyHQ SAML Provider
 * Replaces Clerk authentication system
 */

import { NextAuthOptions } from 'next-auth';
import { getJacksonInstance } from '@/lib/jackson';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    {
      id: 'boxyhq-saml',
      name: 'DealershipAI SSO',
      type: 'oauth',
      authorization: {
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/saml/authorize`,
        params: {
          scope: 'openid email profile',
          response_type: 'code',
        },
      },
      token: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/saml/token`,
      userinfo: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oauth/saml/userinfo`,
      clientId: 'default',
      clientSecret: 'default',
      profile(profile: any) {
        return {
          id: profile.id || profile.sub,
          email: profile.email,
          name: profile.name || profile.displayName,
          image: profile.picture,
          tenant: profile.tenant || 'default',
          role: profile.role || 'user',
          onboarded: profile.onboarded || false,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.tenant = user.tenant;
        token.role = user.role;
        token.onboarded = user.onboarded;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.tenant = token.tenant as string;
        session.user.role = token.role as string;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // For now, just allow sign in without database operations
        // In a real implementation, you would create/update user in your database here
        console.log('User signing in:', user.email);
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get server session
export async function getServerSession() {
  const { getServerSession: nextAuthGetServerSession } = await import('next-auth');
  return nextAuthGetServerSession(authOptions);
}

// Helper function to get current user (alias for getServerSession)
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}