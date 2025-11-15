import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ViralGrowthEngine } from '@/lib/growth/viral-growth-engine';

const viralEngine = new ViralGrowthEngine();

export async function POST(req: NextRequest) {
  try {
    const { dealershipId } = await req.json();
    
    if (!dealershipId) {
      return NextResponse.json(
        { error: 'Dealership ID is required' },
        { status: 400 }
      );
    }

    // Generate shareable competitive report
    const report = await viralEngine.generateShareableReport(dealershipId);
    
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Viral report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate viral report' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get('token');
    
    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      );
    }

    // Get public report by share token
    const report = await viralEngine.generateShareableReport(shareToken);
    
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Viral report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viral report' },
      { status: 500 }
    );
  }
}