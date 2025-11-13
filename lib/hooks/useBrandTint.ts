'use client';

import { useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { generateBrandHue } from '@/lib/utils/brandHue';

/**
 * Hook to get brand tint color based on Clerk user/organization
 */
export function useBrandTint(): string {
  const { user } = useUser();

  return useMemo(() => {
    // Use organization ID if available, otherwise user ID
    const seed =
      (user?.publicMetadata as any)?.organizationId ||
      user?.organizationMemberships?.[0]?.organization?.id ||
      user?.id ||
      'default';

    return generateBrandHue(seed);
  }, [user]);
}

