/**
 * WorkOS Vault Object API
 * Read, update, describe, and delete individual vault objects
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readVaultObject,
  updateVaultObject,
  describeVaultObject,
  deleteVaultObject,
  listVaultObjectVersions,
} from '@/lib/workos-vault';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/vault/objects/[id]?action=read|describe|versions
 * Read, describe, or list versions of a vault object
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'read';

    let result;
    switch (action) {
      case 'describe':
        result = await describeVaultObject(id);
        break;
      case 'versions':
        result = await listVaultObjectVersions(id);
        break;
      case 'read':
      default:
        result = await readVaultObject(id);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS Vault API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get vault object',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workos/vault/objects/[id]
 * Update a vault object
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { value, versionCheck } = body;

    const object = await updateVaultObject({ id, value, versionCheck });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error: any) {
    console.error('[WorkOS Vault API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update vault object',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workos/vault/objects/[id]
 * Delete a vault object
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const result = await deleteVaultObject(id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[WorkOS Vault API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete vault object',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

