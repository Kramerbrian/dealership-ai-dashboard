/**
 * GET /api/trial/status
 * 
 * Returns active trial features with expiration times
 * Used by client-side components to check if features are unlocked
 * Returns: { active: [{ feature, expiresAt }] }
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = cookies();
  const now = Date.now();
  const active = jar.getAll().flatMap((c) => {
    if (!c.name.startsWith("dai_trial_")) return [];
    const feature = c.name.replace("dai_trial_", "");
    try {
      const trialData = JSON.parse(c.value);
      const exp = new Date(trialData.expires_at || trialData.expiresAt);
      return isFinite(exp.getTime()) && exp.getTime() > now
        ? [{ feature, expiresAt: exp.toISOString() }]
        : [];
    } catch {
      return [];
    }
  });
  return NextResponse.json({ active }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
