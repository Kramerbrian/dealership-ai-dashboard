/**
 * GET /api/trial/check?feature_id=xxx
 * 
 * Check if a trial feature is currently active
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const GET = createApiRoute(
  {
    endpoint: '/api/trial/check',
    requireAuth: false,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const { searchParams } = new URL(req.url);
      const featureId = searchParams.get('feature_id');
      const userId = auth?.userId || searchParams.get('user_id') || 'anonymous';

      if (!featureId) {
        return errorResponse('feature_id is required', 400);
      }

      // Check Supabase for active trial
      let isActive = false;
      let expiresAt: string | null = null;

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('trial_features')
            .select('expires_at')
            .eq('user_id', userId)
            .eq('feature_id', featureId)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (!error && data) {
            isActive = true;
            expiresAt = data.expires_at;
          }
        } catch (supabaseError) {
          // Continue - check cookie as fallback
        }
      }

      // Also check cookie as fallback
      const cookie = req.cookies.get(`dai_trial_${featureId}`);
      if (cookie) {
        try {
          const trialData = JSON.parse(cookie.value);
          const expires = new Date(trialData.expires_at).getTime();
          if (Date.now() <= expires) {
            isActive = true;
            expiresAt = trialData.expires_at;
          }
        } catch {
          // Invalid cookie
        }
      }

      return cachedResponse({
        success: true,
        data: {
          feature_id: featureId,
          is_active: isActive,
          expires_at: expiresAt,
        },
      }, 60); // Cache for 1 minute
    } catch (error) {
      return errorResponse('Failed to check trial feature', 500);
    }
  }
);

