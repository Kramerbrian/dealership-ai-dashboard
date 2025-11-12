import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

/**
 * Pre-built scenario templates for common optimizations
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = [
      {
        id: 'quick-wins',
        name: 'Quick Wins (Low Effort, High Impact)',
        description: 'Fast optimizations that deliver immediate results',
        category: 'optimization',
        actions: [
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 15,
            confidence: 0.9,
            cost: 0,
            description: 'Add AutoDealer schema markup',
          },
          {
            type: 'improve_signal',
            target: 'ugc_health',
            delta: 10,
            confidence: 0.85,
            cost: 0,
            description: 'Increase review response rate to 90%',
          },
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 8,
            confidence: 0.8,
            cost: 0,
            description: 'Optimize meta descriptions',
          },
        ],
        estimatedImpact: 33,
        estimatedCost: 0,
        estimatedTime: '4-6 hours',
      },
      {
        id: 'schema-mastery',
        name: 'Schema Mastery',
        description: 'Comprehensive structured data optimization',
        category: 'schema',
        actions: [
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 20,
            confidence: 0.95,
            cost: 0,
            description: 'Add AutoDealer schema',
          },
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 12,
            confidence: 0.9,
            cost: 0,
            description: 'Add FAQ schema',
          },
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 8,
            confidence: 0.85,
            cost: 0,
            description: 'Add LocalBusiness schema',
          },
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 6,
            confidence: 0.8,
            cost: 0,
            description: 'Add Review schema',
          },
        ],
        estimatedImpact: 46,
        estimatedCost: 0,
        estimatedTime: '6-8 hours',
      },
      {
        id: 'content-depth',
        name: 'Content Depth Enhancement',
        description: 'Improve content quality and relevance',
        category: 'content',
        actions: [
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 18,
            confidence: 0.85,
            cost: 200,
            description: 'Add vehicle-specific FAQs',
          },
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 12,
            confidence: 0.8,
            cost: 150,
            description: 'Add location-specific content',
          },
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 8,
            confidence: 0.75,
            cost: 100,
            description: 'Optimize meta descriptions',
          },
        ],
        estimatedImpact: 38,
        estimatedCost: 450,
        estimatedTime: '7-10 hours',
      },
      {
        id: 'review-excellence',
        name: 'Review Excellence',
        description: 'Maximize review impact and trust signals',
        category: 'reviews',
        actions: [
          {
            type: 'improve_signal',
            target: 'ugc_health',
            delta: 15,
            confidence: 0.9,
            cost: 0,
            description: 'Increase review response rate to 95%',
          },
          {
            type: 'improve_signal',
            target: 'ugc_health',
            delta: 10,
            confidence: 0.85,
            cost: 0,
            description: 'Add review schema markup',
          },
          {
            type: 'improve_signal',
            target: 'ugc_health',
            delta: 8,
            confidence: 0.8,
            cost: 100,
            description: 'Implement review request automation',
          },
        ],
        estimatedImpact: 33,
        estimatedCost: 100,
        estimatedTime: '3-5 hours',
      },
      {
        id: 'competitive-advantage',
        name: 'Competitive Advantage',
        description: 'Beat your top competitors with comprehensive optimization',
        category: 'competitive',
        actions: [
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 20,
            confidence: 0.9,
            cost: 0,
            description: 'All schema optimizations',
          },
          {
            type: 'improve_signal',
            target: 'aiv',
            delta: 18,
            confidence: 0.85,
            cost: 350,
            description: 'Content depth enhancement',
          },
          {
            type: 'improve_signal',
            target: 'ugc_health',
            delta: 12,
            confidence: 0.9,
            cost: 0,
            description: 'Review management system',
          },
          {
            type: 'improve_signal',
            target: 'geo_trust',
            delta: 10,
            confidence: 0.85,
            cost: 0,
            description: 'Optimize Google Business Profile',
          },
        ],
        estimatedImpact: 60,
        estimatedCost: 350,
        estimatedTime: '10-15 hours',
      },
      {
        id: 'zero-click-optimization',
        name: 'Zero-Click Optimization',
        description: 'Maximize zero-click presence and answer box appearances',
        category: 'zero-click',
        actions: [
          {
            type: 'improve_signal',
            target: 'zero_click',
            delta: 25,
            confidence: 0.9,
            cost: 0,
            description: 'Enhance FAQ schema with comprehensive Q&A',
          },
          {
            type: 'improve_signal',
            target: 'zero_click',
            delta: 15,
            confidence: 0.85,
            cost: 0,
            description: 'Optimize for featured snippets',
          },
          {
            type: 'improve_signal',
            target: 'sgp_integrity',
            delta: 12,
            confidence: 0.9,
            cost: 0,
            description: 'Add HowTo schema for service processes',
          },
        ],
        estimatedImpact: 52,
        estimatedCost: 0,
        estimatedTime: '5-7 hours',
      },
    ];

    return NextResponse.json({
      templates,
      count: templates.length,
    });
  } catch (error: any) {
    console.error('Get scenario templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

