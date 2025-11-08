import { NextRequest, NextResponse } from 'next/server'
import { proxyToFleet } from '@/lib/fleet-api'
import { requireRBAC, rbacHeaders } from '@/lib/rbac'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const rbac = await requireRBAC(req, ['admin','ops'])
  if (rbac instanceof NextResponse) return rbac
  
  const body = await req.json()

  // If no Fleet API configured, return demo success
  if (!env.FLEET_API_BASE) {
    return NextResponse.json({
      ok: true,
      version_id: `v-${Date.now()}`,
      dry_run: body.dry_run || false,
      hosts: body.hosts || [],
      _demo: true
    })
  }

  const res = await proxyToFleet('/api/site-inject', {
    method:'POST',
    headers: { 'content-type':'application/json', 'x-api-key': env.X_API_KEY, ...rbacHeaders(rbac) },
    body: JSON.stringify(body),
    tenant: rbac.tenant,
    role: rbac.role
  })
  
  return NextResponse.json(await res.json())
}

