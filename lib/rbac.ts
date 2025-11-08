import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export type Role = 'admin'|'ops'|'viewer'
export type RBAC = { userId:string; role:Role; tenant:string }

export async function requireRBAC(req: NextRequest, roles: Role[] = ['admin','ops']): Promise<RBAC|NextResponse> {
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
