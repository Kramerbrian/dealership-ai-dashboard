import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

interface ComplianceSummary {
  tenant_id: string;
  total_audits: number;
  compliant_audits: number;
  non_compliant_audits: number;
  compliance_rate: number;
  avg_risk_score: number;
  avg_jaccard_score: number;
  avg_disclosure_clarity: number;
  price_mismatch_count: number;
  hidden_fees_count: number;
  total_consistency_penalty: number;
  total_precision_penalty: number;
  critical_violations: number;
  warning_violations: number;
  recent_trends: {
    day: string;
    compliance_rate: number;
    avg_risk_score: number;
  }[];
}

async function getComplianceSummary(tenantId?: string): Promise<ComplianceSummary> {
  // Try Redis cache first
  const cacheKey = `compliance_summary:${tenantId || 'all'}`;
  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }
  } catch (error) {
    console.warn('Redis cache miss or error:', error);
  }
  
  // Build query
  let query = supabase
    .from('google_policy_compliance_summary')
    .select('*')
    .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }
  
  const { data: summaryData, error } = await query;
  
  if (error) {
    console.error('Error fetching compliance summary:', error);
    throw error;
  }
  
  // Calculate overall metrics
  const totalAudits = summaryData?.reduce((sum, row) => sum + row.total_audits, 0) || 0;
  const compliantAudits = summaryData?.reduce((sum, row) => sum + row.compliant_audits, 0) || 0;
  const nonCompliantAudits = summaryData?.reduce((sum, row) => sum + row.non_compliant_audits, 0) || 0;
  const complianceRate = totalAudits > 0 ? (compliantAudits / totalAudits) * 100 : 0;
  
  const avgRiskScore = summaryData?.length > 0 ? 
    summaryData.reduce((sum, row) => sum + (row.avg_risk_score || 0), 0) / summaryData.length : 0;
  
  const avgJaccardScore = summaryData?.length > 0 ?
    summaryData.reduce((sum, row) => sum + (row.avg_jaccard || 0), 0) / summaryData.length : 0;
  
  const avgDisclosureClarity = summaryData?.length > 0 ?
    summaryData.reduce((sum, row) => sum + (row.avg_disclosure || 0), 0) / summaryData.length : 0;
  
  const priceMismatchCount = summaryData?.reduce((sum, row) => sum + (row.price_mismatch_count || 0), 0) || 0;
  const hiddenFeesCount = summaryData?.reduce((sum, row) => sum + (row.hidden_fees_count || 0), 0) || 0;
  const totalConsistencyPenalty = summaryData?.reduce((sum, row) => sum + (row.total_consistency_penalty || 0), 0) || 0;
  const totalPrecisionPenalty = summaryData?.reduce((sum, row) => sum + (row.total_precision_penalty || 0), 0) || 0;
  const criticalViolations = summaryData?.reduce((sum, row) => sum + (row.critical_violations || 0), 0) || 0;
  const warningViolations = summaryData?.reduce((sum, row) => sum + (row.warning_violations || 0), 0) || 0;
  
  // Get recent trends (last 7 days)
  const recentTrends = summaryData?.slice(-7).map(row => ({
    day: row.day,
    compliance_rate: row.total_audits > 0 ? (row.compliant_audits / row.total_audits) * 100 : 0,
    avg_risk_score: row.avg_risk_score || 0
  })) || [];
  
  const summary: ComplianceSummary = {
    tenant_id: tenantId || 'all',
    total_audits: totalAudits,
    compliant_audits: compliantAudits,
    non_compliant_audits: nonCompliantAudits,
    compliance_rate: complianceRate,
    avg_risk_score: avgRiskScore,
    avg_jaccard_score: avgJaccardScore,
    avg_disclosure_clarity: avgDisclosureClarity,
    price_mismatch_count: priceMismatchCount,
    hidden_fees_count: hiddenFeesCount,
    total_consistency_penalty: totalConsistencyPenalty,
    total_precision_penalty: totalPrecisionPenalty,
    critical_violations: criticalViolations,
    warning_violations: warningViolations,
    recent_trends: recentTrends
  };
  
  // Cache for 5 minutes
  try {
    await redis.setex(cacheKey, 300, JSON.stringify(summary));
  } catch (error) {
    console.warn('Failed to cache compliance summary:', error);
  }
  
  return summary;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    
    const summary = await getComplianceSummary(tenantId || undefined);
    
    return NextResponse.json({
      success: true,
      data: summary,
      cached: false,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching compliance summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance summary' },
      { status: 500 }
    );
  }
}