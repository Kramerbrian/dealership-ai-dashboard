/**
 * Dev-Only Healthcheck API
 *
 * Validates environment variables in development.
 * Returns 404 in production for security.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const REQUIRED_ENV = [
  // Clerk Authentication
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',

  // Clerk URLs (optional but recommended)
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',

  // Database (Prisma)
  'DATABASE_URL',
  'DIRECT_URL',

  // Trust OS Phase 1 (Email & Cron)
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'CRON_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL_ENV = [
  // Supabase (optional - used for legacy features)
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',

  // Redis (optional - used for rate limiting)
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',

  // Analytics (optional)
  'NEXT_PUBLIC_GA_ID',
  'POSTHOG_KEY',
  'POSTHOG_HOST',
];

export async function GET(_req: NextRequest) {
  // Dev-only: hide this endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, error: 'health-dev is disabled in production' },
      { status: 404 }
    );
  }

  const requiredChecks: Record<string, boolean> = {};
  const optionalChecks: Record<string, boolean> = {};
  let allRequiredPresent = true;

  // Check required env vars
  for (const key of REQUIRED_ENV) {
    const present = !!process.env[key];
    requiredChecks[key] = present;
    if (!present) allRequiredPresent = false;
  }

  // Check optional env vars
  for (const key of OPTIONAL_ENV) {
    optionalChecks[key] = !!process.env[key];
  }

  const missingRequired = Object.entries(requiredChecks)
    .filter(([_, present]) => !present)
    .map(([key]) => key);

  const presentOptional = Object.entries(optionalChecks)
    .filter(([_, present]) => present)
    .map(([key]) => key);

  return NextResponse.json(
    {
      ok: allRequiredPresent,
      nodeEnv: process.env.NODE_ENV,
      summary: {
        requiredPresent: Object.values(requiredChecks).filter(Boolean).length,
        requiredTotal: REQUIRED_ENV.length,
        optionalPresent: presentOptional.length,
        optionalTotal: OPTIONAL_ENV.length,
      },
      required: requiredChecks,
      optional: optionalChecks,
      missingRequired,
      presentOptional,
    },
    { status: allRequiredPresent ? 200 : 500 }
  );
}
