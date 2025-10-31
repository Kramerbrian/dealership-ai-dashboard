import { NextRequest, NextResponse } from 'next/server';
import { realAIAnalysisService } from '@/lib/services/real-ai-analysis-service';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const analysis = await realAIAnalysisService.analyzeVisibility({ domain, type: 'visibility' });

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        domain,
        timestamp: new Date().toISOString(),
        analysisType: 'real-ai-analysis',
        totalCost: 0.05, // Mock cost
        totalTokens: 1500 // Mock tokens
      }
    });

  } catch (error) {
    console.error('Real AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to perform real AI analysis' },
      { status: 500 }
    );
  }
}
