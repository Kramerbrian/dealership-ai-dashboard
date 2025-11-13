/**
 * Viral Loop Trigger - Audit Complete
 * Triggers viral sharing when audit completes
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { ViralLoopEngine } from '@/lib/viral-growth/viral-loop-engine';

const viralEngine = new ViralLoopEngine();

export async function POST() {
  try {
    const { auditData, userId, dealershipId } = await req.json();

    if (!auditData || !userId || !dealershipId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate shareable result
    const shareableResult = await viralEngine.generateShareableResult({
      dealershipName: auditData.dealershipName,
      rank: auditData.rank,
      totalCompetitors: auditData.totalCompetitors,
      aiVisibility: auditData.aiVisibility,
      quickWins: auditData.quickWins,
      competitors: auditData.competitors
    });

    // Generate personalized share messages for each platform
    const shareMessages = {
      linkedin: viralEngine.generatePersonalizedShare(shareableResult, 'linkedin'),
      twitter: viralEngine.generatePersonalizedShare(shareableResult, 'twitter'),
      facebook: viralEngine.generatePersonalizedShare(shareableResult, 'facebook'),
      email: viralEngine.generatePersonalizedShare(shareableResult, 'email')
    };

    // Track the viral trigger
    const viralMetrics = await viralEngine.trackViralSharing(
      shareableResult.id,
      'linkedin',
      1
    );

    return NextResponse.json({
      success: true,
      data: {
        shareableResult,
        shareMessages,
        viralMetrics,
        shareUrls: {
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://dealershipai.com/audit/${shareableResult.id}`)}`,
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessages.twitter)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://dealershipai.com/audit/${shareableResult.id}`)}`,
          email: `mailto:?subject=${encodeURIComponent('AI Visibility Audit Results')}&body=${encodeURIComponent(shareMessages.email)}`
        }
      }
    });
  } catch (error) {
    console.error('Viral loop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate viral content' },
      { status: 500 }
    );
  }
}
