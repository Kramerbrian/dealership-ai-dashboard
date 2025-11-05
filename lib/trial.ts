/**
 * Client helper for checking trial feature status
 * 
 * Example: call from dashboard to decide if a drawer should unlock
 */
export async function isTrialActive(feature: string): Promise<boolean> {
  try {
    const res = await fetch('/api/trial/status', { cache: 'no-store' });
    const json = (await res.json()) as { active: string[] };
    return json.active.includes(feature);
  } catch {
    return false;
  }
}

/**
 * Get all active trial features
 */
export async function getActiveTrials(): Promise<string[]> {
  try {
    const res = await fetch('/api/trial/status', { cache: 'no-store' });
    const json = (await res.json()) as { active: string[] };
    return json.active || [];
  } catch {
    return [];
  }
}

/**
 * Grant a trial feature (client-side helper)
 */
export async function grantTrialFeature(
  feature: string,
  hours: number = 24,
  userId?: string | null,
  tenantId?: string | null
): Promise<{ ok: boolean; expiresAt?: string; error?: string }> {
  try {
    const res = await fetch('/api/trial/grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        hours,
        userId,
        tenantId,
        source: 'pricing-page',
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to grant trial',
    };
  }
}

