import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { CompetitiveWarRoom } from '@/lib/competitive/war-room';

export async function GET(req: Request) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Mock user data for build
    const user = { 
      id: userId, 
      plan: 'PRO',
      dealership: { id: 'demo-dealership' }
    };

    // 3. Get market parameter
    const { searchParams } = new URL(req.url);
    const market = searchParams.get('market') || 'default';

    // 4. Initialize war room
    const warRoom = new CompetitiveWarRoom(redis, prisma);

    // 5. Get competitive data
    const competitiveData = await warRoom.getCompetitiveRankings(
      user.dealership.id,
      market
    );

    return NextResponse.json({
      success: true,
      ...competitiveData
    });

  } catch (error) {
    console.error('Competitive analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to get competitive analysis' },
      { status: 500 }
    );
  }
}

// POST endpoint for setting up monitoring
export async function POST(req: Request) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Mock user data for build
    const user = { 
      id: userId, 
      plan: 'PRO',
      dealership: { id: 'demo-dealership' }
    };

    const { competitors } = await req.json();

    if (!competitors || !Array.isArray(competitors)) {
      return NextResponse.json({ error: 'Competitors list is required' }, { status: 400 });
    }

    // 3. Initialize war room
    const warRoom = new CompetitiveWarRoom(redis, prisma);

    // 4. Setup monitoring
    await warRoom.setupMonitoring(user.dealership.id, competitors);

    return NextResponse.json({
      success: true,
      message: 'Competitive monitoring setup successfully',
      competitors: competitors.length
    });

  } catch (error) {
    console.error('Setup monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to setup competitive monitoring' },
      { status: 500 }
    );
  }
}
