/**
 * TypeScript types for Clerk user metadata
 * Ensures type safety when accessing user.publicMetadata and user.privateMetadata
 */

export interface ClerkPublicMetadata {
  dealerId?: string;
  dealershipName?: string;
  domain?: string;
  dealershipUrl?: string;
  onboarding_complete?: boolean;
  role?: 'admin' | 'user' | 'dealer';
  subscriptionTier?: 'free' | 'tier2' | 'tier3';
  [key: string]: unknown;
}

export interface ClerkPrivateMetadata {
  apiKeys?: Record<string, string>;
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Type guard to check if metadata matches expected structure
 */
export function isClerkPublicMetadata(metadata: unknown): metadata is ClerkPublicMetadata {
  return typeof metadata === 'object' && metadata !== null;
}

/**
 * Helper to safely access Clerk public metadata with type safety
 */
export function getClerkPublicMetadata(user: { publicMetadata?: unknown }): ClerkPublicMetadata {
  if (isClerkPublicMetadata(user.publicMetadata)) {
    return user.publicMetadata;
  }
  return {};
}

/**
 * Helper to safely access Clerk private metadata with type safety
 */
export function getClerkPrivateMetadata(user: { privateMetadata?: unknown }): ClerkPrivateMetadata {
  if (typeof user.privateMetadata === 'object' && user.privateMetadata !== null) {
    return user.privateMetadata as ClerkPrivateMetadata;
  }
  return {};
}

