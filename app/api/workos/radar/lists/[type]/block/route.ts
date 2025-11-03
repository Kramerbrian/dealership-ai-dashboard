/**
 * WorkOS Radar Block Lists API
 * Manage IP, email, and domain block lists
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  addRadarBlockListEntry,
  removeRadarBlockListEntry,
} from '@/lib/workos-radar';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workos/radar/lists/[type]/block
 * Add entry to block list
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    if (!['ip_address', 'email', 'domain'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be: ip_address, email, or domain' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { entry } = body;

    if (!entry) {
      return NextResponse.json(
        { error: 'entry is required' },
        { status: 400 }
      );
    }

    const result = await addRadarBlockListEntry(
      type as 'ip_address' | 'email' | 'domain',
      entry
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS Radar API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add block list entry',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/radar/lists/[type]/block
 * Remove entry from block list
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = params;
    if (!['ip_address', 'email', 'domain'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be: ip_address, email, or domain' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { entry } = body;

    if (!entry) {
      return NextResponse.json(
        { error: 'entry is required' },
        { status: 400 }
      );
    }

    const result = await removeRadarBlockListEntry(
      type as 'ip_address' | 'email' | 'domain',
      entry
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS Radar API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove block list entry',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

