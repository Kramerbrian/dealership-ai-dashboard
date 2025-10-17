/**
 * DealershipAI - NextAuth Configuration
 * 
 * OAuth SSO setup for Google and Microsoft Azure AD
 */

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AzureADProvider from 'next-auth/providers/azure-ad';
import FacebookProvider from 'next-auth/providers/facebook';
// import { PrismaAdapter } from '@auth/prisma-adapter';
// import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for testing
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
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
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid email profile User.Read'
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,public_profile'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in for business domains
      if (user.email) {
        const domain = user.email.split('@')[1];
        const businessDomains = [
          'gmail.com', 'outlook.com', 'hotmail.com', // Personal domains
          'dealershipai.com', // Our domain
          // Add more business domains as needed
        ];
        
        // Allow personal domains for demo purposes
        if (businessDomains.includes(domain)) {
          return true;
        }
        
        // For other domains, you might want to add additional validation
        return true;
      }
      return false;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // Default redirect to intelligence dashboard
      return `${baseUrl}/intelligence`;
    },
    async session({ session, user, token }) {
      // Add user ID to session
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/signup',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt', // Changed to JWT for testing
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // events: {
  //   async createUser({ user }) {
  //     // Create a free trial subscription for new users
  //     try {
  //       await prisma.subscription.create({
  //         data: {
  //           userId: user.id,
  //           plan: 'FREE',
  //           status: 'ACTIVE',
  //           currentPeriodStart: new Date(),
  //           currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
  //           trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error creating trial subscription:', error);
  //     }
  //   }
  // }
};