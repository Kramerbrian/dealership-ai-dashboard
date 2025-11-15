import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealershipId = searchParams.get('dealershipId') || undefined;
    const type = searchParams.get('type') || undefined || 'executive';
    
    if (!dealershipId) {
      return NextResponse.json(
        { error: 'Dealership ID is required' },
        { status: 400 }
      );
    }

    // Mock data for now
    const mockData = {
      executive: {
        revenueAtRisk: 7500,
        aiVisibility: 87.3,
        rank: 2,
        total: 12,
        quickWins: 5,
        scoreChange: 8,
        trend: 'up' as const
      },
      viral: {
        kFactor: 1.4,
        sharesPerUser: 0.8,
        conversionRate: 0.25
      },
      competitive: {
        dealership: 'Demo Dealership',
        aiVisibility: 87.3,
        rank: 2,
        marketShare: 15.2
      },
      roi: {
        currentROI: 2.4,
        projectedROI: 4.8,
        paybackPeriod: 2.1
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData[type as keyof typeof mockData] || mockData.executive,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Growth analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth analytics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, dealershipId, data } = await req.json();
    
    if (!action || !dealershipId) {
      return NextResponse.json(
        { error: 'Action and dealership ID are required' },
        { status: 400 }
      );
    }

    // Mock responses for now
    const mockResults = {
      generate_report: { reportId: 'report_123', status: 'generated' },
      schedule_report: { scheduleId: 'schedule_456', status: 'scheduled' },
      unlock_achievement: { achievementId: data?.achievementId, unlocked: true },
      update_quest: { questId: data?.questId, progress: 50 },
      trigger_email: { emailId: 'email_789', sent: true },
      create_segment: { segmentId: 'segment_101', created: true }
    };

    return NextResponse.json({
      success: true,
      result: mockResults[action as keyof typeof mockResults] || { status: 'completed' }
    });
  } catch (error) {
    console.error('Growth analytics action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute growth analytics action' },
      { status: 500 }
    );
  }
}
