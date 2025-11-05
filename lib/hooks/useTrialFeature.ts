/**
 * useTrialFeature Hook
 * 
 * React hook for checking and managing trial feature access
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface TrialFeatureStatus {
  is_active: boolean;
  expires_at: string | null;
  hours_remaining: number;
}

/**
 * Check if a trial feature is active
 */
async function checkTrialFeature(featureId: string): Promise<TrialFeatureStatus> {
  try {
    const response = await fetch(`/api/trial/check?feature_id=${featureId}`);
    if (!response.ok) {
      return { is_active: false, expires_at: null, hours_remaining: 0 };
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      const expiresAt = data.data.expires_at;
      if (expiresAt) {
        const hoursRemaining = Math.ceil(
          (new Date(expiresAt).getTime() - Date.now()) / (60 * 60 * 1000)
        );
        return {
          is_active: data.data.is_active,
          expires_at: expiresAt,
          hours_remaining: Math.max(0, hoursRemaining),
        };
      }
    }
    
    return { is_active: false, expires_at: null, hours_remaining: 0 };
  } catch {
    // Also check localStorage as fallback
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`dai:trial:${featureId}`);
      if (stored) {
        try {
          const trialData = JSON.parse(stored);
          const expires = new Date(trialData.expires_at).getTime();
          const now = Date.now();
          
          if (now <= expires) {
            const hoursRemaining = Math.ceil((expires - now) / (60 * 60 * 1000));
            return {
              is_active: true,
              expires_at: trialData.expires_at,
              hours_remaining: hoursRemaining,
            };
          } else {
            // Expired - remove it
            localStorage.removeItem(`dai:trial:${featureId}`);
          }
        } catch {
          // Invalid data
        }
      }
    }
    
    return { is_active: false, expires_at: null, hours_remaining: 0 };
  }
}

/**
 * Grant a trial feature
 */
async function grantTrialFeature(featureId: string): Promise<TrialFeatureStatus> {
  try {
    const response = await fetch('/api/trial/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_id: featureId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to grant trial');
    }
    
    const data = await response.json();
    if (data.success && data.data) {
      return {
        is_active: true,
        expires_at: data.data.expires_at,
        hours_remaining: data.data.hours_remaining || 24,
      };
    }
    
    throw new Error('Invalid response');
  } catch (error) {
    console.error('Error granting trial feature:', error);
    throw error;
  }
}

/**
 * React hook for trial feature management
 */
export function useTrialFeature(featureId: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};
  
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trial-feature', featureId],
    queryFn: () => checkTrialFeature(featureId),
    enabled: enabled && !!featureId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const grantTrial = useCallback(async () => {
    try {
      const newStatus = await grantTrialFeature(featureId);
      // Invalidate query to refetch
      refetch();
      return newStatus;
    } catch (error) {
      console.error('Error granting trial:', error);
      throw error;
    }
  }, [featureId, refetch]);

  return {
    status: status || { is_active: false, expires_at: null, hours_remaining: 0 },
    isLoading,
    error,
    grantTrial,
    refetch,
  };
}

