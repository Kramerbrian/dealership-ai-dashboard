/**
 * Authentication Context Hook
 * Gets user information from Clerk and provides dealerId/tenantId
 */

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface AuthContext {
  userId: string | null;
  dealerId: string | null;
  tenantId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UserDealerInfo {
  dealerId: string;
  tenantId: string;
  dealerName?: string;
  domain?: string;
}

/**
 * Fetch dealer information for a user
 */
async function fetchUserDealerInfo(userId: string): Promise<UserDealerInfo | null> {
  try {
    const response = await fetch(`/api/user/profile?userId=${userId}`);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Extract dealerId from user profile or metadata
    const dealerId = data.dealerId || data.metadata?.dealerId || data.tenantId;
    const tenantId = data.tenantId || data.orgId || dealerId;
    
    if (!dealerId && !tenantId) {
      return null;
    }
    
    return {
      dealerId: dealerId || tenantId,
      tenantId: tenantId || dealerId,
      dealerName: data.dealerName || data.metadata?.dealerName,
      domain: data.domain || data.metadata?.domain
    };
  } catch (error) {
    console.error('Failed to fetch user dealer info:', error);
    return null;
  }
}

/**
 * Hook to get authentication context with dealerId
 */
export function useAuthContext(): AuthContext {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [dealerInfo, setDealerInfo] = useState<UserDealerInfo | null>(null);
  const [isLoadingDealer, setIsLoadingDealer] = useState(false);

  // Fetch dealer info when user is available
  const { data: fetchedDealerInfo, isLoading: isLoadingQuery } = useQuery({
    queryKey: ['user-dealer-info', user?.id],
    queryFn: () => user?.id ? fetchUserDealerInfo(user.id) : null,
    enabled: !!user?.id && clerkLoaded,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (fetchedDealerInfo) {
      setDealerInfo(fetchedDealerInfo);
    }
  }, [fetchedDealerInfo]);

  // Fallback: Try to get dealerId from user metadata
  useEffect(() => {
    if (user && !dealerInfo && !isLoadingDealer && clerkLoaded) {
      setIsLoadingDealer(true);
      
      // Check user metadata
      const metadata = user.publicMetadata || user.privateMetadata || {};
      const dealerIdFromMeta = metadata.dealerId || metadata.tenantId;
      
      if (dealerIdFromMeta) {
        setDealerInfo({
          dealerId: dealerIdFromMeta,
          tenantId: dealerIdFromMeta,
          dealerName: metadata.dealerName,
          domain: metadata.domain
        });
      }
      
      setIsLoadingDealer(false);
    }
  }, [user, dealerInfo, isLoadingDealer, clerkLoaded]);

  const isLoading = !clerkLoaded || isLoadingQuery || isLoadingDealer;
  const isAuthenticated = !!user && clerkLoaded;

  return {
    userId: user?.id || null,
    dealerId: dealerInfo?.dealerId || user?.publicMetadata?.dealerId as string || null,
    tenantId: dealerInfo?.tenantId || user?.publicMetadata?.tenantId as string || null,
    email: user?.emailAddresses?.[0]?.emailAddress || null,
    isAuthenticated,
    isLoading
  };
}

/**
 * Hook specifically for dealerId (simplified)
 */
export function useDealerId(): string | null {
  const { dealerId } = useAuthContext();
  return dealerId;
}

