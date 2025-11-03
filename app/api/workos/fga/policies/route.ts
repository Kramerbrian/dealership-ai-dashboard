/**
 * WorkOS FGA Policies API
 * Create and manage FGA policies
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  listPolicies,
  createPolicy,
} from '@/lib/workos-fga';
import { getAuthenticatedUser } from '@/lib/api-protection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workos/fga/policies
 * List all policies
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policies = await listPolicies();

    return NextResponse.json({
      success: true,
      data: policies,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Policies API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list policies',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workos/fga/policies
 * Create a policy
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(req);

    if (!authResult.isAuthenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, language, parameters, expression } = body;

    if (!name || !language || !expression) {
      return NextResponse.json(
        { error: 'name, language, and expression are required' },
        { status: 400 }
      );
    }

    const policy = await createPolicy({
      name,
      description,
      language,
      parameters,
      expression,
    });

    return NextResponse.json({
      success: true,
      data: policy,
    });
  } catch (error: any) {
    console.error('[WorkOS FGA Policies API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create policy',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

