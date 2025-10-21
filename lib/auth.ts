// Clerk-based auth utilities
// This file replaces the old NextAuth implementation

import { auth } from '@clerk/nextjs/server';

export { auth };

// For compatibility with existing imports
export const getServerSession = auth;

// Placeholder for NextAuth compatibility
// These are not used with Clerk but prevent import errors
export const authOptions = {
  providers: [],
  callbacks: {},
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
    error: '/error',
  },
};
