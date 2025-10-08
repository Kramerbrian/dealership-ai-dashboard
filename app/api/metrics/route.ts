import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { bootstrapCI, conversionRateCI, formatBootstrapResult } from '@/lib/bootstrap-ci';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const includeCI = searchParams.get('includeCI') === 'true';

    // Calculate date range
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch leads data
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Supabase leads error:', leadsError);
      return NextResponse.json(
        { error: 'Failed to fetch leads data' },
        { status: 500 }
      );
    }

    // Calculate basic metrics
    const totalLeads = leads?.length || 0;
    const uniqueBusinesses = new Set(leads?.map(lead => lead.website) || []).size;
    const uniqueEmails = new Set(leads?.map(lead => lead.email) || []).size;

    // Role distribution
    const roleDistribution = leads?.reduce((acc, lead) => {
      acc[lead.role] = (acc[lead.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Location distribution
    const locationDistribution = leads?.reduce((acc, lead) => {
      acc[lead.location] = (acc[lead.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Challenge analysis
    const challenges = leads?.filter(lead => lead.challenge).map(lead => lead.challenge) || [];
    const challengeKeywords = challenges.join(' ').toLowerCase().split(/\s+/)
      .filter(word => word.length > 3)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Top challenges
    const topChallenges = Object.entries(challengeKeywords)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    // Daily lead counts for trend analysis
    const dailyLeads = leads?.reduce((acc, lead) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const dailyLeadCounts = Object.values(dailyLeads) as number[];

    // Calculate confidence intervals if requested
    let confidenceIntervals = {};
    if (includeCI && dailyLeadCounts.length > 0) {
      try {
        const dailyCI = bootstrapCI(dailyLeadCounts);
        confidenceIntervals = {
          dailyLeads: {
            mean: dailyCI.mean,
            lower: dailyCI.lower,
            upper: dailyCI.upper,
            formatted: formatBootstrapResult(dailyCI, 1)
          }
        };
      } catch (error) {
        console.warn('Failed to calculate confidence intervals:', error);
      }
    }

    // Conversion rate calculation (if we had visitor data)
    // This is a placeholder - in reality you'd track page views separately
    const estimatedVisitors = totalLeads * 20; // Assume 5% conversion rate
    let conversionRateCIResult = null;
    if (includeCI && estimatedVisitors > 0) {
      try {
        const conversionCI = conversionRateCI(totalLeads, estimatedVisitors);
        conversionRateCIResult = {
          rate: conversionCI.mean,
          lower: conversionCI.lower,
          upper: conversionCI.upper,
          formatted: formatBootstrapResult(conversionCI, 3)
        };
      } catch (error) {
        console.warn('Failed to calculate conversion rate CI:', error);
      }
    }

    // Response data
    const metrics = {
      timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        days
      },
      summary: {
        totalLeads,
        uniqueBusinesses,
        uniqueEmails,
        averageLeadsPerDay: totalLeads / days,
        estimatedConversionRate: totalLeads / estimatedVisitors
      },
      distribution: {
        roles: roleDistribution,
        locations: locationDistribution
      },
      insights: {
        topChallenges,
        mostCommonRole: Object.entries(roleDistribution).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A',
        mostCommonLocation: Object.entries(locationDistribution).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'
      },
      trends: {
        dailyLeads: dailyLeads,
        dailyLeadCounts
      },
      confidenceIntervals,
      conversionRateCI: conversionRateCIResult
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Metrics calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate conversion rate
function calculateConversionRate(leads: any[]): number {
  // This is a simplified calculation
  // In reality, you'd track page views and calculate actual conversion rate
  return leads.length > 0 ? (leads.length / (leads.length * 20)) * 100 : 0;
}

// Helper function to get most common role
function getMostCommonRole(leads: any[]): string {
  const roleCounts = leads.reduce((acc, lead) => {
    acc[lead.role] = (acc[lead.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(roleCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
}

// Helper function to get most common challenge
function getMostCommonChallenge(leads: any[]): string {
  const challenges = leads
    .filter(lead => lead.challenge)
    .map(lead => lead.challenge);

  if (challenges.length === 0) return 'N/A';

  const challengeCounts = challenges.reduce((acc, challenge) => {
    acc[challenge] = (acc[challenge] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(challengeCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';
}
