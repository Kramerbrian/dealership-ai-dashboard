/**
 * POST /api/telemetry
 * 
 * Telemetry endpoint for tracking user interactions and events
 * Stores events in Supabase for analytics and user behavior tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createApiRoute } from '@/lib/api-wrapper';
import { z } from 'zod';
import { noCacheResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const telemetryEventSchema = z.object({
  event: z.string(),
  tier: z.enum(['tier1', 'tier2', 'tier3']).optional(),
  at: z.string().optional(),
  surface: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const POST = createApiRoute(
  {
    endpoint: '/api/telemetry',
    requireAuth: false,
    validateBody: telemetryEventSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { event, tier, at, surface, metadata } = body;

      // Extract IP and User Agent from request
      const ua = req.headers.get('user-agent') || null;
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 null;

      // Prepare telemetry payload
      const payload: {
        event: string;
        tier?: string;
        surface?: string;
        at?: string;
        ip?: string;
        ua?: string;
        metadata?: Record<string, unknown>;
        user_id?: string;
      } = {
        event,
        tier,
        surface,
        at: at || new Date().toISOString(),
        ua,
        metadata: metadata || {},
        user_id: auth?.userId,
      };

      // Only include IP if we have it
      if (ip) {
        payload.ip = ip;
      }

      // Log telemetry event
      await logger.info('Telemetry event', {
        event,
        tier,
        surface,
        at: payload.at,
        userId: auth?.userId,
      });

      // Store in Supabase if configured
      if (supabase) {
        try {
          const { error } = await supabase
            .from('telemetry')
            .insert(payload);

          if (error) {
            await logger.error('Supabase telemetry insert error', {
              error: error.message,
              event,
            });
          }
        } catch (supabaseError) {
          await logger.error('Supabase telemetry error', {
            error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
          });
          // Continue - don't fail the request if Supabase is down
        }
      } else {
        await logger.warn('Supabase not configured for telemetry', {
          event,
        });
      }

      const response = {
        success: true,
        data: {
          event,
          tier,
          recorded_at: payload.at,
        },
        meta: {
          message: 'Telemetry event recorded',
        },
      };

      return noCacheResponse(response);
    } catch (error) {
      await logger.error('Telemetry error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return errorResponse('Failed to record telemetry event', 500);
    }
  }
);
