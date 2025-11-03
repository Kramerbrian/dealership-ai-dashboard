/**
 * WorkOS Vault Objects API
 * Manage vault objects (secrets)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createVaultObject,
  listVaultObjects,
} from '@/lib/workos-vault';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/vault/objects
 * List all vault objects
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const objects = await listVaultObjects();

    return NextResponse.json({
      success: true,
      data: objects,
    });
  } catch (error: any) {
    console.error('[WorkOS Vault API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list vault objects',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/vault/objects
 * Create a vault object
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, value, context } = body;

    if (!name || !value) {
      return NextResponse.json(
        { error: 'name and value are required' },
        { status: 400 }
      );
    }

    const object = await createVaultObject({ name, value, context });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error: any) {
    console.error('[WorkOS Vault API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create vault object',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

