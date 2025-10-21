export type UserContext = {
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'superadmin' | string;
  tenantId: string;
};

export function createMockUserContext(role: UserContext['role'], tenantId: string): UserContext {
  return { role, tenantId };
}

export function validateTenantAccess(userContext: UserContext, tenantId: string): { allowed: boolean; reason?: string } {
  if (!userContext) {
    return { allowed: false, reason: 'No user context' };
  }
  if (userContext.role === 'superadmin') {
    return { allowed: true };
  }
  if (userContext.tenantId !== tenantId) {
    return { allowed: false, reason: 'Tenant mismatch' };
  }
  // Allow by default for matching tenant; fine-grained checks can be added later
  return { allowed: true };
}
