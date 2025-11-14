import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/pulse-tasks/result
 * Fetches completed PulseTask results for a dealer
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');
    const agent = searchParams.get('agent'); // 'aim_gpt' | 'pulse_engine' | 'schema_engine'

    if (!dealerId) {
      return NextResponse.json({ error: 'dealerId required' }, { status: 400 });
    }

    // Query PulseTask table (created via seed or migration)
    const tasks = await prisma.$queryRawUnsafe<Array<{
      id: string;
      agent: string;
      status: string;
      payload: any;
      result?: any;
      createdAt: Date;
      updatedAt: Date;
    }>>(
      `SELECT * FROM "PulseTask" WHERE "dealerId" = $1 AND status = 'completed' ${agent ? 'AND agent = $2' : ''} ORDER BY "updatedAt" DESC LIMIT 50`,
      dealerId,
      agent || null
    );

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('[pulse-tasks/result] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pulse tasks' },
      { status: 500 }
    );
  }
}

