/**
 * Viral Metrics API
 * Returns current viral growth metrics and K-Factor data
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ViralLoopEngine } from '@/lib/viral-growth/viral-loop-engine';

const viralEngine = new ViralLoopEngine();

export async function GET() {
  try {
    const insights = viralEngine.getViralInsights();
    
    return NextResponse.json({
      success: true,
      data: {
        kFactor: insights.kFactor,
        projectedGrowth: insights.projectedGrowth,
        viralVelocity: insights.viralVelocity,
        topPerformingShares: insights.topPerformingShares,
        viralLoop: {
          description: "Dealer A gets audit → Sees they rank #3 → Shares 'We beat 9 competitors!' on LinkedIn → Competitor B sees post → 'Wait, where do I rank?' → Competitor B signs up → Gets audit → Shares their results → Cycle repeats",
          kFactor: 1.4,
          cycleTime: 48, // hours
          conversionRate: 0.32,
          sharesPerUser: 2.1,
          signupsPerShare: 0.67
        }
      }
    });
  } catch (error) {
    console.error('Viral metrics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch viral metrics' },
      { status: 500 }
    );
  }
}
