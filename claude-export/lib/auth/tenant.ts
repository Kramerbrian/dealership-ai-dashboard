import { auth } from '@clerk/nextjs/server';

export function requireTenant() {
  const { userId, orgId, sessionClaims } = auth();
  const tenantId = (sessionClaims as any)?.tenantId || orgId || userId;
  if (!tenantId) {
    const err: any = new Error('Unauthorized: tenant not found');
    err.status = 401;
    throw err;
  }
  return { tenantId, userId, orgId };
}
