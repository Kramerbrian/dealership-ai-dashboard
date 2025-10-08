import { NextResponse } from "next/server";

// Mock data for demo - replace with actual Supabase queries
const mockSummaryData = {
  auto_pct: 78.5,
  violations_7d: 3,
  avg_confidence: 0.87,
  human_reviews: 12
};

export async function GET() {
  try {
    // In production, this would query the audit_log table
    // const { data, error } = await supabase.rpc("compliance_summary_metrics");
    
    return NextResponse.json(mockSummaryData);
  } catch (error) {
    console.error('Compliance summary error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
