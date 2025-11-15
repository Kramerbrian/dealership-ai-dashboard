import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id') || undefined || 'demo_tenant';
    
    // Mock compliance summary data
    const mockSummary = {
      tenant_id: tenantId,
      total_audits: 15,
      compliant_audits: 12,
      non_compliant_audits: 3,
      compliance_rate: 80.0,
      avg_risk_score: 35.5,
      avg_jaccard_score: 0.85,
      avg_disclosure_clarity: 78.2,
      price_mismatch_count: 2,
      hidden_fees_count: 1,
      total_consistency_penalty: 15.5,
      total_precision_penalty: 8.2,
      critical_violations: 1,
      warning_violations: 4,
      recent_trends: [
        { day: '2025-10-14', compliance_rate: 82.0, avg_risk_score: 38.1 },
        { day: '2025-10-15', compliance_rate: 85.5, avg_risk_score: 32.9 },
        { day: '2025-10-16', compliance_rate: 80.0, avg_risk_score: 35.5 }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: mockSummary
    });
    
  } catch (error) {
    console.error('Error fetching compliance summary:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch compliance summary' 
      },
      { status: 500 }
    );
  }
}