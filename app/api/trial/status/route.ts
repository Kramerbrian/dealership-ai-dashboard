/**
 * GET /api/trial/status
 * 
 * Returns active trial features by reading unexpired dai_trial_* cookies
 * Used by client-side components to check if features are unlocked
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { noCacheResponse } from '@/lib/api-response';

export const GET = createApiRoute(
  {
    endpoint: '/api/trial/status',
    requireAuth: false,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req) => {
    try {
      const active: string[] = [];
      const now = new Date();

      // Read all dai_trial_* cookies
      req.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith('dai_trial_')) {
          const featureId = cookie.name.replace('dai_trial_', '');
          
          try {
            // Parse cookie value (JSON object)
            const trialData = JSON.parse(cookie.value);
            const expiresAt = new Date(trialData.expires_at);

            // Check if trial is still active
            if (expiresAt && !isNaN(expiresAt.getTime()) && expiresAt > now) {
              active.push(featureId);
            }
          } catch {
            // Invalid cookie format - skip
          }
        }
      });

      return noCacheResponse({
        success: true,
        data: {
          active,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check trial status',
        },
        { status: 500 }
      );
    }
  }
);
