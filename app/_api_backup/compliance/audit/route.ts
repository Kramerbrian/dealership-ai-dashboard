import { NextRequest, NextResponse } from 'next/server';
import { PricingAuditEngine } from '@/lib/compliance/pricing-audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { listings } = await req.json();
    
    if (!listings || !Array.isArray(listings)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected listings array.' },
        { status: 400 }
      );
    }

    const auditEngine = new PricingAuditEngine();
    const results = await auditEngine.auditBatch(listings);
    const report = auditEngine.generateComplianceReport(results);

    return NextResponse.json({
      success: true,
      results,
      report,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Compliance audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error during audit' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return mock audit results for demo
    const mockResults = [
      {
        listingId: 'vehicle_001',
        overallScore: 85,
        complianceStatus: 'warning',
        issues: [
          {
            type: 'missing_disclosure',
            severity: 'medium',
            description: 'Dealer fees not prominently displayed',
            location: 'ad_landing',
            suggestedFix: 'Add clear fee breakdown to ad and landing page',
          }
        ],
        recommendations: [
          'Add clear fee breakdown to ad and landing page',
          'Ensure price consistency across all touchpoints'
        ],
        riskLevel: 'medium',
        lastAudited: new Date().toISOString(),
      },
      {
        listingId: 'vehicle_002',
        overallScore: 92,
        complianceStatus: 'compliant',
        issues: [],
        recommendations: [],
        riskLevel: 'low',
        lastAudited: new Date().toISOString(),
      },
      {
        listingId: 'vehicle_003',
        overallScore: 45,
        complianceStatus: 'critical',
        issues: [
          {
            type: 'hidden_fee',
            severity: 'critical',
            description: 'Hidden documentation fee of $599',
            location: 'hidden',
            suggestedFix: 'Disclose documentation fee prominently in ad and landing page',
            deadline: '2025-10-28',
          },
          {
            type: 'price_mismatch',
            severity: 'high',
            description: 'Ad shows $25,000 but total with fees is $26,199',
            location: 'ad_vs_checkout',
            suggestedFix: 'Update ad price to reflect total cost including all fees',
          }
        ],
        recommendations: [
          'Disclose documentation fee prominently in ad and landing page',
          'Update ad price to reflect total cost including all fees'
        ],
        riskLevel: 'critical',
        lastAudited: new Date().toISOString(),
      }
    ];

    const mockReport = {
      summary: {
        totalListings: 3,
        compliantListings: 1,
        warningListings: 1,
        violationListings: 0,
        criticalListings: 1,
        complianceRate: 33.3,
        averageScore: 74.0,
        lastAudited: new Date().toISOString(),
      },
      issueBreakdown: {
        'hidden_fee': 1,
        'price_mismatch': 1,
        'missing_disclosure': 1,
      },
      topRecommendations: [
        'Disclose documentation fee prominently in ad and landing page',
        'Update ad price to reflect total cost including all fees',
        'Add clear fee breakdown to ad and landing page',
      ],
      criticalActions: [
        'Fix 1 critical pricing violations immediately',
        'Disclose 1 hidden fees across all listings',
      ],
      nextAuditDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      results: mockResults,
      report: mockReport,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Compliance audit GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
