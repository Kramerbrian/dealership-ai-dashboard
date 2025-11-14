/**
 * Executive Digest Cron Job
 *
 * Generates and delivers daily executive report with key metrics.
 * Runs daily at 1pm UTC (8am EST).
 *
 * Phase 5: Meta-Learning Loop
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Needs longer timeout for report generation
export const maxDuration = 60; // 60 seconds

interface ExecutiveDigestData {
  date: string;
  metrics: {
    ai_visibility_index: {
      current: number;
      change: number; // percentage
      trend: 'up' | 'down' | 'stable';
    };
    trust_score: {
      current: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    conversion_rate: {
      current: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    zero_click_coverage: {
      current: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    copilot_engagement: {
      current: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  insights: string[];
  alerts: string[];
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Generate report for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const reportData = await generateExecutiveDigest(yesterday);

    // Send to Slack if webhook configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackDigest(reportData);
    }

    // Store in database for historical reference
    // TODO: Uncomment when Prisma model added
    // await prisma.executiveReport.create({
    //   data: {
    //     date: yesterday,
    //     metrics: reportData.metrics,
    //     insights: reportData.insights,
    //     alerts: reportData.alerts,
    //     sent_at: new Date(),
    //   },
    // });

    return NextResponse.json({
      ok: true,
      report: reportData,
      delivered: !!process.env.SLACK_WEBHOOK_URL,
    });
  } catch (error: any) {
    console.error('[executive-digest] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate executive digest with key metrics
 */
async function generateExecutiveDigest(date: Date): Promise<ExecutiveDigestData> {
  // TODO: Replace with actual data from analytics/executive-reporting.ts
  // For now, return sample data structure

  const metrics = {
    ai_visibility_index: {
      current: 85,
      change: 3.2,
      trend: 'up' as const,
    },
    trust_score: {
      current: 92,
      change: 1.5,
      trend: 'up' as const,
    },
    conversion_rate: {
      current: 4.2,
      change: -0.3,
      trend: 'down' as const,
    },
    zero_click_coverage: {
      current: 32,
      change: 2.1,
      trend: 'up' as const,
    },
    copilot_engagement: {
      current: 67,
      change: 0.8,
      trend: 'stable' as const,
    },
  };

  const insights = generateInsights(metrics);
  const alerts = generateAlerts(metrics);

  return {
    date: date.toISOString().split('T')[0],
    metrics,
    insights,
    alerts,
  };
}

/**
 * Generate insights from metrics
 */
function generateInsights(metrics: any): string[] {
  const insights: string[] = [];

  if (metrics.ai_visibility_index.change > 3) {
    insights.push(`AI Visibility Index surged +${metrics.ai_visibility_index.change}% - strong organic discovery`);
  }

  if (metrics.trust_score.change > 2) {
    insights.push(`Trust Score improving (+${metrics.trust_score.change}%) - review frequency and quality increasing`);
  }

  if (metrics.zero_click_coverage.change > 2) {
    insights.push(`Zero-click coverage expanding to ${metrics.zero_click_coverage.current}% of search presence`);
  }

  if (metrics.copilot_engagement.current > 70) {
    insights.push(`Copilot engagement remains strong at ${metrics.copilot_engagement.current}% - users finding value`);
  }

  if (insights.length === 0) {
    insights.push('Metrics stable - no significant changes detected');
  }

  return insights;
}

/**
 * Generate alerts for declining metrics
 */
function generateAlerts(metrics: any): string[] {
  const alerts: string[] = [];

  if (metrics.conversion_rate.change < -2) {
    alerts.push(`⚠️ Conversion rate declined ${Math.abs(metrics.conversion_rate.change)}% - investigate user journey`);
  }

  if (metrics.trust_score.change < -3) {
    alerts.push(`⚠️ Trust score dropping - check for negative reviews or outdated content`);
  }

  if (metrics.copilot_engagement.change < -10) {
    alerts.push(`⚠️ Copilot engagement declining - review personality tone and relevance`);
  }

  return alerts;
}

/**
 * Send digest to Slack
 */
async function sendSlackDigest(report: ExecutiveDigestData) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const blocks = formatSlackBlocks(report);

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status}`);
  }
}

/**
 * Format report as Slack blocks
 */
function formatSlackBlocks(report: ExecutiveDigestData) {
  const { metrics, insights, alerts } = report;

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 Daily Executive Digest - ${report.date}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*AI Visibility Index*\n${metrics.ai_visibility_index.current} ${getTrendEmoji(metrics.ai_visibility_index.trend)} (${formatChange(metrics.ai_visibility_index.change)})`,
        },
        {
          type: 'mrkdwn',
          text: `*Trust Score*\n${metrics.trust_score.current} ${getTrendEmoji(metrics.trust_score.trend)} (${formatChange(metrics.trust_score.change)})`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Conversion Rate*\n${metrics.conversion_rate.current}% ${getTrendEmoji(metrics.conversion_rate.trend)} (${formatChange(metrics.conversion_rate.change)})`,
        },
        {
          type: 'mrkdwn',
          text: `*Zero-Click Coverage*\n${metrics.zero_click_coverage.current}% ${getTrendEmoji(metrics.zero_click_coverage.trend)} (${formatChange(metrics.zero_click_coverage.change)})`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Copilot Engagement*\n${metrics.copilot_engagement.current}% ${getTrendEmoji(metrics.copilot_engagement.trend)} (${formatChange(metrics.copilot_engagement.change)})`,
        },
      ],
    },
  ];

  if (insights.length > 0) {
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*💡 Key Insights*\n${insights.map(i => `• ${i}`).join('\n')}`,
        },
      }
    );
  }

  if (alerts.length > 0) {
    blocks.push(
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🚨 Alerts*\n${alerts.join('\n')}`,
        },
      }
    );
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Generated by DealershipAI Trust OS • <https://dealershipai.com/analytics|View Full Report>`,
      },
    ],
  });

  return blocks;
}

function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
