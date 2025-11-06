// Clerk-based auth utilities
// This file replaces the old NextAuth implementation

import { auth } from '@clerk/nextjs/server';

export { auth };

// For compatibility with existing imports
export const getServerSession = auth;

// For compatibility with routes that still expect authOptions
// Note: This is a placeholder - Clerk doesn't use authOptions
export const authOptions = {
  // Clerk handles auth differently, so this is just for compatibility
  // Actual auth should use `auth()` from '@clerk/nextjs/server'
} as const;
