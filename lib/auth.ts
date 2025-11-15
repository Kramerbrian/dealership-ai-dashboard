// @ts-ignore
import { auth, currentUser } from '@clerk/nextjs';

export async function requireAdmin(): Promise<{ ok: boolean; reason?: string; email?: string }> {
  try {
    const { userId } = auth();
    if (!userId) return { ok: false, reason: 'unauthenticated' };
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
    const allow = (process.env.ADMIN_ALLOWLIST || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (allow.length && allow.includes(email)) return { ok: true, email };
    // optionally honor Clerk org roles here
    return { ok: false, reason: 'forbidden', email };
  } catch (e) {
    return { ok: false, reason: 'error' };
  }
}
