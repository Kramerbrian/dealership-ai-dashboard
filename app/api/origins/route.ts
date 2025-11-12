import { NextRequest, NextResponse } from 'next/server';
import { requireRBAC, rbacHeaders } from '@/lib/rbac';
import { proxyToFleet } from '@/lib/fleet-api';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rbac = await requireRBAC(req, ['admin','ops','viewer']);
    if (rbac instanceof NextResponse) return rbac;

    // If no Fleet API configured, return demo data
    if (!env.FLEET_API_BASE) {
      return NextResponse.json({
        data: [
          {
            id: 'demo-1',
            origin: 'https://demo-dealership.com',
            tenant: env.DEFAULT_TENANT,
            evidence: {
              schemaCount: 12,
              cwvScore: 87,
              robotsOk: true,
              lastProbeTs: new Date().toISOString(),
              verified: false,
            },
          },
          {
            id: 'demo-2',
            origin: 'https://example-dealer.com',
            tenant: env.DEFAULT_TENANT,
            evidence: {
              schemaCount: 8,
              cwvScore: 92,
              robotsOk: true,
              lastProbeTs: new Date().toISOString(),
              verified: true,
            },
          },
        ],
        _demo: true,
      });
    }

    const res = await proxyToFleet('/api/origins', {
      method: 'GET',
      headers: { ...rbacHeaders(rbac) },
      tenant: rbac.tenant,
      role: rbac.role,
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Origins API error:', error);
    // Return demo data on error for demo purposes
    return NextResponse.json({
      data: [
        {
          id: 'demo-1',
          origin: 'https://demo-dealership.com',
          tenant: env.DEFAULT_TENANT,
          evidence: {
            schemaCount: 12,
            cwvScore: 87,
            robotsOk: true,
            lastProbeTs: new Date().toISOString(),
            verified: false,
          },
        },
      ],
      _demo: true,
      _error: error.message,
    });
  }
}

