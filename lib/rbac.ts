import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// This file must only be imported in server components/API routes

export type Role = 'viewer' | 'dealer_user' | 'ops' | 'manager' | 'marketing_director' | 'admin' | 'superadmin'
export type RBAC = { userId:string; role:Role; tenant:string }

// Role hierarchy for access control
export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  dealer_user: 1,
  ops: 1,
  manager: 2,
  marketing_director: 3,
  admin: 4,
  superadmin: 5,
}

export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export async function requireRBAC(req: NextRequest, roles: Role[] = ['admin']): Promise<RBAC|NextResponse> {
  const { userId, orgId } = await auth()
  if (!userId) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 })

  // Role + tenant from org membership or public metadata
  const user = await clerkClient.users.getUser(userId)
  const role = ((user.publicMetadata?.role as string) || 'viewer') as Role
  const tenant = (orgId || (user.publicMetadata?.tenant as string) || 'default-tenant')

  if (!roles.includes(role)) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 })

  return { userId, role, tenant }
}

// Attach to outbound fleet calls
export function rbacHeaders(rbac: RBAC) {
  return { 'x-role': rbac.role, 'x-tenant': rbac.tenant }
}

/**
 * Check if role has access to APIs & Exports or dAI Agents
 * Requires marketing_director or higher
 */
export function canAccessAPIsAndAgents(role: Role): boolean {
  return hasRoleAccess(role, 'marketing_director');
}
