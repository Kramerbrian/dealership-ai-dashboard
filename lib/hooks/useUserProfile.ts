/**
 * User Profile Hook
 * Fetches and manages user profile, subscription, and usage data
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from './useAuthContext';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dealerId: string;
  tenantId: string;
  dealerName?: string;
  domain?: string;
  subscription?: {
    tier: 'FREE' | 'PRO' | 'ENTERPRISE';
    status: 'active' | 'canceled' | 'past_due';
    sessionsUsed: number;
    sessionsLimit: number;
    sessionsResetAt: string;
  };
  usage?: {
    monthly: {
      sessions: number;
      apiCalls: number;
      storage: number;
    };
    limits: {
      sessions: number;
      apiCalls: number;
      storage: number;
    };
  };
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`/api/user/profile?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function fetchSubscription(userId: string): Promise<any> {
  try {
    const response = await fetch(`/api/user/subscription?userId=${userId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

async function fetchUsage(userId: string, timeRange: string = '30d'): Promise<any> {
  try {
    const response = await fetch(`/api/user/usage?userId=${userId}&timeRange=${timeRange}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching usage:', error);
    return null;
  }
}

export function useUserProfile() {
  const { userId, isAuthenticated } = useAuthContext();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userId ? fetchUserProfile(userId) : null,
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: () => userId ? fetchSubscription(userId) : null,
    enabled: isAuthenticated && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes (changes more frequently)
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['user-usage', userId],
    queryFn: () => userId ? fetchUsage(userId) : null,
    enabled: isAuthenticated && !!userId,
    staleTime: 60 * 1000, // 1 minute (updates frequently)
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  const isLoading = profileLoading || subscriptionLoading || usageLoading;

  return {
    profile: profile || null,
    subscription: subscription || null,
    usage: usage || null,
    isLoading,
    isAuthenticated
  };
}

