/**
 * POST /api/referral/credit
 * 
 * Grant referral credit when new user signs up
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { errorResponse, noCacheResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const referralCreditSchema = z.object({
  referrer_id: z.string(),
  new_account_id: z.string(),
  timestamp: z.string().optional(),
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const REFERRAL_BONUS_DAYS = 14;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return errorResponse('Authentication required', 401);
  }

  try {
    const body = await req.json();
    const validated = referralCreditSchema.parse(body);

    await logger.info('Referral credit request', {
      referrer_id: validated.referrer_id,
      new_account_id: validated.new_account_id,
      timestamp: validated.timestamp,
    });

    // Store referral credit in database
    if (supabase) {
      const { error } = await supabase
        .from('referral_credits')
        .insert({
          referrer_id: validated.referrer_id,
          new_account_id: validated.new_account_id,
          bonus_days: REFERRAL_BONUS_DAYS,
          status: 'credited',
          credited_at: validated.timestamp || new Date().toISOString(),
        });

      if (error) {
        await logger.error('Referral credit insert error', {
          error: error.message,
          referrer_id: validated.referrer_id,
        });
      }
    }

    // Extend trial for referrer (if applicable)
    // This would integrate with your trial system

    // Track analytics
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'referral_converted',
          surface: 'api',
          metadata: {
            referrer_id: validated.referrer_id,
            new_account_id: validated.new_account_id,
            bonus_days: REFERRAL_BONUS_DAYS,
          },
        }),
      });
    } catch {}

    return noCacheResponse({
      success: true,
      data: {
        referrer_id: validated.referrer_id,
        bonus_days: REFERRAL_BONUS_DAYS,
        status: 'credited',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      await logger.error('Referral credit validation error', {
        errors: error.errors,
      });

      return errorResponse(
        'Invalid request. Please check your input.',
        400,
        { errors: error.errors }
      );
    }

    await logger.error('Referral credit error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return errorResponse(
      'Failed to process referral credit.',
      500
    );
  }
}

