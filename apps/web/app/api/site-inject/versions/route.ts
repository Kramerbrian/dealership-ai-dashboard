import { NextRequest, NextResponse } from 'next/server'
import { proxyToFleet } from '@/lib/api'
import { requireRBAC, rbacHeaders } from '@/lib/rbac'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest){
  const rbac = await requireRBAC(req, ['admin','ops','viewer'])
  if (rbac instanceof NextResponse) return rbac
  
  const origin = new URL(req.url).searchParams.get('origin') || ''
  if (!origin) return NextResponse.json({ ok:false, error:'origin required' }, { status:400 })
  
  try {
    const res = await proxyToFleet(`/api/site-inject/versions?origin=${encodeURIComponent(origin)}`, {
      headers: { 'x-api-key': env.X_API_KEY, ...rbacHeaders(rbac) },
      tenant: rbac.tenant
    })
    return NextResponse.json(await res.json())
  } catch (e: any) {
    // Fallback if backend doesn't support versions endpoint
    return NextResponse.json({ ok: true, versions: [] })
  }
}
