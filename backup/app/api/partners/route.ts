import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/database';
import { redis } from '@/lib/redis';
import { WhiteLabelPartnerProgram } from '@/lib/partners/white-label';

export async function POST() {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user and dealership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        dealership: true
      }
    });

    if (!user?.dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    const { action, ...data } = await req.json();

    // 3. Initialize partner program
    const partnerProgram = new WhiteLabelPartnerProgram(redis, prisma);

    let result;

    switch (action) {
      case 'create_partner':
        result = await partnerProgram.createPartner(data);
        break;
      
      case 'add_client':
        result = await partnerProgram.addClient(data.partnerId, data.clientData);
        break;
      
      case 'calculate_commission':
        result = await partnerProgram.calculateCommission(
          data.partnerId,
          data.clientId,
          data.revenue
        );
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Partner program error:', error);
    return NextResponse.json(
      { error: 'Failed to process partner request' },
      { status: 500 }
    );
  }
}

// GET endpoint for partner data
export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get user and dealership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        dealership: true
      }
    });

    if (!user?.dealership) {
      return NextResponse.json({ error: 'Dealership not found' }, { status: 404 });
    }

    // 3. Get query parameters
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const partnerId = searchParams.get('partnerId');

    if (!action || !partnerId) {
      return NextResponse.json({ error: 'Action and partnerId are required' }, { status: 400 });
    }

    // 4. Initialize partner program
    const partnerProgram = new WhiteLabelPartnerProgram(redis, prisma);

    let result;

    switch (action) {
      case 'dashboard':
        result = await partnerProgram.getPartnerDashboard(partnerId);
        break;
      
      case 'clients':
        result = await partnerProgram.getPartnerClients(partnerId);
        break;
      
      case 'commissions':
        const limit = parseInt(searchParams.get('limit') || '50');
        result = await partnerProgram.getPartnerCommissions(partnerId, limit);
        break;
      
      case 'report':
        const startDate = new Date(searchParams.get('startDate') || '');
        const endDate = new Date(searchParams.get('endDate') || '');
        result = await partnerProgram.generatePartnerReport(partnerId, startDate, endDate);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Get partner data error:', error);
    return NextResponse.json(
      { error: 'Failed to get partner data' },
      { status: 500 }
    );
  }
}
