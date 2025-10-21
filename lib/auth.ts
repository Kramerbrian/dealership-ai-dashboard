// Clerk-based auth utilities
// This file replaces the old NextAuth implementation

import { auth } from '@clerk/nextjs/server';

export { auth };

// For compatibility with existing imports
export const getServerSession = auth;

// Provide a compatibility export for NextAuth-based routes during migration
// This prevents build-time import errors when legacy routes still reference authOptions
export const authOptions = {} as any;
