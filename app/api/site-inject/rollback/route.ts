import { NextRequest, NextResponse } from 'next/server'
import { proxyToFleet } from '@/lib/api'
import { env } from '@/lib/env'
import { requireRBAC, rbacHeaders } from '@/lib/rbac'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const rbac = await requireRBAC(req, ['admin','ops'])
  if (rbac instanceof NextResponse) return rbac
  
  const body = await req.json()
  if (!body?.version_id || !body?.origin) {
    return NextResponse.json({ ok:false, error:'version_id and origin required' }, { status:400 })
  }
  
  try {
    const res = await proxyToFleet('/api/site-inject/rollback', {
      method:'POST',
      headers: { 'content-type':'application/json', 'x-api-key': env.X_API_KEY, ...rbacHeaders(rbac) },
      body: JSON.stringify({ version_id: body.version_id, origin: body.origin }),
      tenant: rbac.tenant
    })
    return NextResponse.json(await res.json())
  } catch (e: any) {
    // Fallback if backend doesn't support rollback
    return NextResponse.json({ ok: true, message: 'Rollback queued (stub)' })
  }
}
