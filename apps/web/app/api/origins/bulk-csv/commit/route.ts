import { NextRequest, NextResponse } from 'next/server'
import { proxyToFleet } from '@/lib/fleet-api'
import { requireRBAC, rbacHeaders } from '@/lib/rbac'
import { env } from '@/lib/env'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const rbac = await requireRBAC(req, ['admin','ops'])
  if (rbac instanceof NextResponse) return rbac

  const body = await req.json()
  const origins = Array.isArray(body?.rows) ? body.rows : []
  if (!origins.length) return NextResponse.json({ ok:false, error:'no rows' }, { status:400 })

  const idempotencyKey = origins.map((r:any)=>r.checksum).join('|')
  
  // Check for duplicate commit using Redis idempotency
  const commitCacheKey = `bulk:commit:${idempotencyKey}`
  const existingCommit = await cacheGet<{ results: any[]; timestamp: number }>(commitCacheKey)
  
  if (existingCommit) {
    // Return cached result for duplicate commit requests (idempotent)
    return NextResponse.json({
      ok: true,
      results: existingCommit.results,
      idempotency_key: idempotencyKey,
      cached: true,
      committed_at: new Date(existingCommit.timestamp).toISOString()
    })
  }

  // If no Fleet API configured, return demo success
  if (!env.FLEET_API_BASE) {
    return NextResponse.json({
      ok: true,
      results: origins.map((r: any) => ({ id: `demo-${Date.now()}`, origin: r.origin, tenant: r.tenant })),
      idempotency_key: idempotencyKey,
      committed_at: new Date().toISOString(),
      _demo: true
    })
  }

  const res = await proxyToFleet('/api/origins/bulk', {
    method:'POST',
    headers: {
      'content-type':'application/json',
      'x-api-key': env.X_API_KEY,
      ...rbacHeaders(rbac),
      'idempotency-key': idempotencyKey
    },
    body: JSON.stringify({ origins, idempotency_key: idempotencyKey }),
    tenant: rbac.tenant,
    role: rbac.role
  })
  const data = await res.json()
  const results = data?.results || []
  
  // Cache successful commit for idempotency (48 hours)
  // This allows retries without duplicate commits
  await cacheSet(
    commitCacheKey,
    {
      results,
      timestamp: Date.now()
    },
    172800 // 48 hours
  )
  
  return NextResponse.json({
    ok: true,
    results,
    idempotency_key: idempotencyKey,
    committed_at: new Date().toISOString()
  })
}
