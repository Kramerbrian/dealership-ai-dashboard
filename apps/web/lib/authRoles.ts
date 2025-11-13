import { currentUser } from '@clerk/nextjs/server';

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) return { ok: false, reason: 'not_signed_in' };

  const email = user.emailAddresses?.[0]?.emailAddress || '';
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const hasTag = user.publicMetadata?.role === 'admin' || user.privateMetadata?.role === 'admin';

  const ok = allowed.includes(email.toLowerCase()) || hasTag;
  return ok ? { ok: true, user } : { ok: false, reason: 'not_authorized', user };
}

