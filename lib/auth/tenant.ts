// lib/auth/tenant.ts
import { auth } from "@clerk/nextjs";

export function requireTenant() {
  const { userId, orgId, sessionClaims } = auth();
  const tenantId =
    (sessionClaims as any)?.tenantId ||
    orgId ||
    userId; // last resort; change to strict org-based if needed

  if (!tenantId) {
    const err: any = new Error("Unauthorized: tenant not found");
    err.status = 401;
    throw err;
  }
  return { tenantId, userId, orgId };
}
