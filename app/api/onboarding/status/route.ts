import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { createClient } from '@supabase/supabase-js';
import { errorResponse, cachedResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Onboarding Status API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/onboarding/status',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    
    try {
      await logger.info('Checking onboarding status', {
        requestId,
        userId: auth.userId,
      });

      const supabase = getSupabase();

      if (!supabase) {
        // If Supabase not configured, assume not completed
        await logger.warn('Supabase not configured, returning default onboarding status', {
          requestId,
          userId: auth.userId,
        });
        
        return cachedResponse(
          {
            success: true,
            completed: false,
            progress: 0,
            currentStep: 0
          },
          60, // 1 min cache
          300, // 5 min stale
          [CACHE_TAGS.ONBOARDING_STATUS, CACHE_TAGS.USER]
        );
      }

      // Check if onboarding_progress table exists and query it
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', auth.userId)
        .single();

      if (error) {
        // If table doesn't exist or no record found, return not completed
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          await logger.info('No onboarding progress found, returning default', {
            requestId,
            userId: auth.userId,
          });
          
          return cachedResponse(
            {
              success: true,
              completed: false,
              progress: 0,
              currentStep: 0
            },
            60,
            300,
            [CACHE_TAGS.ONBOARDING_STATUS, CACHE_TAGS.USER]
          );
        }

        throw error;
      }

      const result = {
        success: true,
        completed: data?.completion_percentage === 100,
        progress: data?.completion_percentage || 0,
        currentStep: data?.current_step || 0,
        data: data || null
      };

      await logger.info('Onboarding status retrieved', {
        requestId,
        userId: auth.userId,
        completed: result.completed,
        progress: result.progress,
      });

      return cachedResponse(
        result,
        60,
        300,
        [CACHE_TAGS.ONBOARDING_STATUS, CACHE_TAGS.USER]
      );

    } catch (error) {
      await logger.error('Error checking onboarding status', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return safe defaults on error
      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/onboarding/status',
        userId: auth.userId,
      });
    }
  }
);
