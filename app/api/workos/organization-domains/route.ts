/**
 * WorkOS Organization Domains API
 * Manage organization domain verification
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganizationDomain,
  verifyOrganizationDomain,
} from '@/lib/workos-organization-domains';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/organization-domains?id=domain_123
 * Get an organization domain by ID
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get('id');

    if (!domainId) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const domain = await getOrganizationDomain(domainId);

    return NextResponse.json({
      success: true,
      data: domain,
    });
  } catch (error: any) {
    console.error('[WorkOS Organization Domains API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get organization domain',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/organization-domains/verify
 * Verify an organization domain
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { domainId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: 'domainId is required' },
        { status: 400 }
      );
    }

    const domain = await verifyOrganizationDomain(domainId);

    return NextResponse.json({
      success: true,
      data: domain,
    });
  } catch (error: any) {
    console.error('[WorkOS Organization Domains API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify organization domain',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

