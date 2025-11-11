import { NextRequest, NextResponse } from 'next/server'
import { proxyToFleet } from '@/lib/api'
import { requireRoleSimple } from '@/lib/authz-unified'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const gate = requireRoleSimple(req, ['admin','ops'])
  if (gate instanceof NextResponse) return gate

  const { origins = [] } = await req.json()
  if (!Array.isArray(origins) || origins.length === 0) {
    return NextResponse.json({ ok:false, error:'origins[] required' }, { status:400 })
  }

  // Try backend bulk endpoint first; fallback to per-origin fanout
  try {
    const res = await proxyToFleet('/api/probe/verify-bulk', {
      method:'POST',
      headers: { 'content-type':'application/json', 'x-api-key': env.X_API_KEY, 'x-tenant': gate.tenantId },
      body: JSON.stringify({ origins, verify: true }),
      tenant: gate.tenantId
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    const results = []
    for (const origin of origins) {
      const r = await proxyToFleet('/api/probe/verify', {
        method:'POST',
        headers: { 'content-type':'application/json', 'x-api-key': env.X_API_KEY, 'x-tenant': gate.tenantId },
        body: JSON.stringify({ origin, verify: true }),
        tenant: gate.tenantId
      })
      results.push(await r.json())
    }
    return NextResponse.json({ ok:true, results })
  }
}

