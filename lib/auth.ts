// Clerk-based auth utilities
// This file replaces the old NextAuth implementation

import { auth } from '@clerk/nextjs/server';

export { auth };

// For compatibility with existing imports
export const getServerSession = auth;
