/**
 * Delta Brief API Route
 * 
 * Nightly report showing daily changes: scores, pulses closed, integrations
 * Used for GPT Actions and learning loop
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface DeltaBrief {
  date: string;
  dealership?: string;
  scores: {
    AIV?: number;
    ATI?: number;
    CVI?: number;
  };
  pulses_closed: Array<{
    id: string;
    deltaUSD: number;
    timeToResolveMin: number;
  }>;
  integrations: string[];
  metadata?: {
    totalRevenueRecovered?: number;
    totalPulsesResolved?: number;
    averageResolutionTime?: number;
  };
}

export async function GET(req: NextRequest) {
  try {
    // Auth check (optional for cron, required for user requests)
    const session = await getServerSession(authOptions);
    const isCron = req.headers.get('x-vercel-cron') === '1';
    
    if (!session && !isCron) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tenant/dealer ID
    const dealerId = session?.user?.id || req.headers.get('x-tenant-id') || 'default';
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch today's snapshot
    const snapshot = await fetchSnapshot(dealerId, date);
    
    // Calculate deltas from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    const yesterdaySnapshot = await fetchSnapshot(dealerId, yesterdayDate);

    // Calculate score deltas
    const scores = {
      AIV: calculateDelta(snapshot.scores?.AIV, yesterdaySnapshot.scores?.AIV),
      ATI: calculateDelta(snapshot.scores?.ATI, yesterdaySnapshot.scores?.ATI),
      CVI: calculateDelta(snapshot.scores?.CVI, yesterdaySnapshot.scores?.CVI),
    };

    // Get pulses closed today
    const pulses_closed = snapshot.pulses_closed || [];

    // Get active integrations
    const integrations = await getActiveIntegrations(dealerId);

    // Calculate metadata
    const totalRevenueRecovered = pulses_closed.reduce((sum, p) => sum + p.deltaUSD, 0);
    const totalPulsesResolved = pulses_closed.length;
    const averageResolutionTime = totalPulsesResolved > 0
      ? Math.round(pulses_closed.reduce((sum, p) => sum + p.timeToResolveMin, 0) / totalPulsesResolved)
      : 0;

    const brief: DeltaBrief = {
      date,
      dealership: snapshot.dealership,
      scores,
      pulses_closed,
      integrations,
      metadata: {
        totalRevenueRecovered,
        totalPulsesResolved,
        averageResolutionTime
      }
    };

    // Send to Slack if significant changes
    if (totalRevenueRecovered > 5000 || Math.abs(scores.AIV || 0) > 5) {
      await sendSlackAlert(brief);
    }

    return NextResponse.json(brief, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Delta Brief error:', error);
    return NextResponse.json(
      { error: 'Failed to generate delta brief' },
      { status: 500 }
    );
  }
}

// Helper functions
async function fetchSnapshot(dealerId: string, date: string) {
  // In production, fetch from your database/cache
  // For now, return mock structure
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dash.dealershipai.com';
  
  try {
    const response = await fetch(`${baseUrl}/api/orchestrator/snapshot?date=${date}&dealerId=${dealerId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch snapshot:', error);
  }

  // Fallback to empty structure
  return {
    date,
    dealership: null,
    pulses_closed: [],
    scores: {}
  };
}

function calculateDelta(current: number | undefined, previous: number | undefined): number | undefined {
  if (current === undefined || previous === undefined) return undefined;
  return current - previous;
}

async function getActiveIntegrations(dealerId: string): Promise<string[]> {
  // In production, check your integration status
  // For now, return common integrations
  const integrations: string[] = [];
  
  // Check GA4
  // Check Reviews API
  // Check Schema status
  // etc.

  return integrations.length > 0 ? integrations : ['ga4', 'reviews_api'];
}

async function sendSlackAlert(brief: DeltaBrief) {
  const webhookUrl = process.env.TELEMETRY_WEBHOOK;
  if (!webhookUrl) return;

  try {
    const message = {
      text: `📊 Daily Delta Brief - ${brief.date}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 Daily Delta Brief - ${brief.date}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*AIV:* ${brief.scores.AIV ? `+${brief.scores.AIV}` : 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*ATI:* ${brief.scores.ATI ? `+${brief.scores.ATI}` : 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*CVI:* ${brief.scores.CVI ? `+${brief.scores.CVI}` : 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Revenue Recovered:* $${brief.metadata?.totalRevenueRecovered?.toLocaleString() || 0}`
            }
          ]
        }
      ]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}
