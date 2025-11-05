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
  feature_id: z.string(),
  user_id: z.string().optional(),
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
      const { feature_id, user_id } = body;
      
      const userId = user_id || auth?.userId || 'anonymous';
      const now = new Date();
      const expiresAt = new Date(now.getTime() + TRIAL_DURATION_MS);

      // Store trial in Supabase if configured
      if (supabase) {
        try {
          const { error } = await supabase
            .from('trial_features')
            .insert({
              user_id: userId,
              feature_id,
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
        feature_id,
        userId,
        expires_at: expiresAt.toISOString(),
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
            metadata: { feature_id },
          }),
        });
      } catch {}

      const response = NextResponse.json({
        success: true,
        data: {
          feature_id,
          expires_at: expiresAt.toISOString(),
          hours_remaining: 24,
        },
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });

      // Set cookie for server-side checks
      response.cookies.set(`dai_trial_${feature_id}`, JSON.stringify({
        feature_id,
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
      });

      return errorResponse('Failed to grant trial feature', 500);
    }
  }
);
