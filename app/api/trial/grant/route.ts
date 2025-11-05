/**
 * POST /api/trial/grant
 * 
 * Grant a 24-hour trial feature unlock for Tier 1 users
 * Creates a trial record and sets a cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { z } from 'zod';
import { noCacheResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';

const grantTrialSchema = z.object({
  feature: z.string().optional(), // Alias for feature_id
  feature_id: z.string().optional(), // Original parameter name
  hours: z.number().optional().default(24), // Trial duration in hours
  user_id: z.string().optional(),
}).refine(data => data.feature || data.feature_id, {
  message: "Either 'feature' or 'feature_id' must be provided",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const POST = createApiRoute(
  {
    endpoint: '/api/trial/grant',
    requireAuth: false,
    validateBody: grantTrialSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { feature, feature_id, hours, user_id } = body;
      
      // Use feature or feature_id (feature takes precedence)
      const finalFeatureId = feature || feature_id;
      if (!finalFeatureId) {
        return errorResponse('feature or feature_id is required', 400);
      }
      
      const userId = user_id || auth?.userId || 'anonymous';
      const now = new Date();
      // Use hours parameter or default to 24
      const trialDurationMs = (hours || 24) * 60 * 60 * 1000;
      const expiresAt = new Date(now.getTime() + trialDurationMs);

      // Store trial in Supabase if configured
      if (supabase) {
        try {
          const { error } = await supabase
            .from('trial_features')
            .insert({
              user_id: userId,
              feature_id: finalFeatureId,
              granted_at: now.toISOString(),
              expires_at: expiresAt.toISOString(),
            });

          if (error && error.code !== '23505') { // Ignore duplicate key errors
            await logger.error('Supabase trial insert error', {
              error: error.message,
              feature_id,
              userId,
            });
          }
        } catch (supabaseError) {
          await logger.error('Supabase trial error', {
            error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
          });
        }
      }

      // Log telemetry
      await logger.info('Trial feature granted', {
        feature_id: finalFeatureId,
        userId,
        expires_at: expiresAt.toISOString(),
        hours: hours || 24,
      });

      // Track telemetry event
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'trial_feature_granted',
            tier: 'tier1',
            surface: 'api',
            metadata: { feature_id: finalFeatureId, hours: hours || 24 },
          }),
        });
      } catch {}

      const response = NextResponse.json({
        success: true,
        data: {
          feature_id: finalFeatureId,
          expires_at: expiresAt.toISOString(),
          hours_remaining: hours || 24,
        },
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });

      // Set cookie for server-side checks
      response.cookies.set(`dai_trial_${finalFeatureId}`, JSON.stringify({
        feature_id: finalFeatureId,
        unlocked_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }), {
        expires: expiresAt,
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return response;
    } catch (error) {
      await logger.error('Trial grant error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        feature: feature || feature_id,
      });

      return errorResponse('Failed to grant trial feature', 500);
    }
  }
);
