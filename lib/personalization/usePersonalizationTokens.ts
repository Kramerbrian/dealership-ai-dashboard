'use client';

import { useState, useEffect, useMemo } from 'react';
import { TokenGroups, generatePersonalizedMessage, getDefaultTokenGroups } from './token-system';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to get personalization tokens for current user/context
 */
export function usePersonalizationTokens() {
  const { user } = useUser();
  const [tokenGroups, setTokenGroups] = useState<TokenGroups | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTokenGroups() {
      try {
        // In production, fetch from API based on user context
        // For now, use default with user data merged
        const defaultGroups = getDefaultTokenGroups();
        
        // Merge user data if available
        if (user) {
          defaultGroups.user_engagement.user_id = user.id;
          defaultGroups.user_engagement.last_login = new Date().toISOString();
          
          // Extract role from user metadata if available
          const userRole = (user.publicMetadata?.role as string) || 'GM';
          if (['GM', 'GSM', 'Marketing Director', 'BDC Manager', 'Internet Director', 'Service Manager'].includes(userRole)) {
            defaultGroups.role_context.role = userRole as any;
          }
        }

        // Fetch store profile from API
        try {
          const storeRes = await fetch('/api/store-profile');
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            if (storeData.success) {
              Object.assign(defaultGroups.store_profile, storeData.data);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch store profile, using defaults');
        }

        // Fetch performance context from API
        try {
          const perfRes = await fetch('/api/performance-context');
          if (perfRes.ok) {
            const perfData = await perfRes.json();
            if (perfData.success) {
              Object.assign(defaultGroups.performance_context, perfData.data);
            }
          }
        } catch (err) {
          console.warn('Failed to fetch performance context, using defaults');
        }

        setTokenGroups(defaultGroups);
      } catch (error) {
        console.error('Failed to load personalization tokens:', error);
        setTokenGroups(getDefaultTokenGroups());
      } finally {
        setLoading(false);
      }
    }

    fetchTokenGroups();
  }, [user]);

  const generateMessage = useMemo(() => {
    if (!tokenGroups) return () => '';
    
    return (
      templateType: 'slack_alert' | 'dashboard_hovercard' | 'forecast_snippet',
      additionalData?: Record<string, any>
    ) => generatePersonalizedMessage(templateType, tokenGroups, additionalData);
  }, [tokenGroups]);

  return {
    tokenGroups,
    loading,
    generateMessage,
  };
}

