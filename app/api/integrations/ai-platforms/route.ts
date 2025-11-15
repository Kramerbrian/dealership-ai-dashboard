import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { auth } from '@clerk/nextjs/server';
import { AIPlatformsIntegration } from '@/lib/integrations/ai-platforms';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, query, dealershipName, keywords } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 2. Initialize AI platforms integration
    const aiPlatforms = new AIPlatformsIntegration();

    let result;

    switch (action) {
      case 'query_all':
        if (!query || !dealershipName) {
          return NextResponse.json({ error: 'Query and dealership name are required' }, { status: 400 });
        }
        result = await aiPlatforms.queryAllPlatforms(query, dealershipName);
        break;

      case 'get_scores':
        if (!dealershipName || !keywords) {
          return NextResponse.json({ error: 'Dealership name and keywords are required' }, { status: 400 });
        }
        result = await aiPlatforms.getAIPlatformScores(dealershipName, keywords);
        break;

      case 'monitor_mentions':
        if (!dealershipName || !keywords) {
          return NextResponse.json({ error: 'Dealership name and keywords are required' }, { status: 400 });
        }
        result = await aiPlatforms.monitorAIMentions(dealershipName, keywords);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('AI platforms integration error:', error);
    return NextResponse.json(
      { error: 'Failed to query AI platforms' },
      { status: 500 }
    );
  }
}
