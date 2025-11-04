import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDealerMetrics } from '@/lib/slack/prometheus';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';

/**
 * Verify Slack request signature
 */
function verifySlackRequest(
  signature: string | null,
  timestamp: string | null,
  rawBody: string
): boolean {
  if (!signature || !timestamp || !SLACK_SIGNING_SECRET) {
    return false;
  }

  // Check timestamp to prevent replay attacks (5 minute window)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - requestTime) > 300) {
    return false;
  }

  // Create signature
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto
    .createHmac('sha256', SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest('hex');
  const computedSignature = `v0=${hmac}`;

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

/**
 * POST /api/slack/command
 * Handle Slack slash commands
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');

    // Verify Slack signature
    if (!verifySlackRequest(signature, timestamp, rawBody)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse URL-encoded form data
    const params = new URLSearchParams(rawBody);
    const text = params.get('text')?.trim() || '';
    const [subcommand, dealer] = text.split(' ');

    // Handle status command
    if (subcommand === 'status' && dealer) {
      const metrics = await getDealerMetrics(dealer);

      const precisionText = metrics.precision
        ? `${(metrics.precision * 100).toFixed(1)}%`
        : 'N/A';
      const arrGainText = metrics.arrGain
        ? `$${metrics.arrGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'N/A';

      return NextResponse.json({
        response_type: 'in_channel',
        text: `*Dealer:* ${dealer}\n*GNN Precision:* ${precisionText}`,
        attachments: [
          {
            color: 'good',
            fields: [
              {
                title: 'GNN Precision',
                value: precisionText,
                short: true,
              },
              {
                title: 'ARR Gain (1h)',
                value: arrGainText,
                short: true,
              },
            ],
            footer: 'View full metrics → Grafana › GNN Analytics',
          },
          {
            text: 'Actions',
            fallback: 'Orchestrator actions',
            callback_id: 'dealer_actions',
            color: '#3AA3E3',
            attachment_type: 'default',
            actions: [
              {
                name: 'schema_fix',
                text: 'Run Schema Fix',
                type: 'button',
                style: 'primary',
                value: JSON.stringify({ dealer, action: 'schema_fix' }),
              },
              {
                name: 'ugc_audit',
                text: 'Run UGC Audit',
                type: 'button',
                style: 'default',
                value: JSON.stringify({ dealer, action: 'ugc_audit' }),
              },
              {
                name: 'forecast',
                text: 'Forecast ARR',
                type: 'button',
                style: 'default',
                value: JSON.stringify({ dealer, action: 'forecast' }),
              },
            ],
          },
        ],
      });
    }

    // Handle ARR command
    if (subcommand === 'arr' && dealer) {
      const metrics = await getDealerMetrics(dealer);
      const arrGain = metrics.arrGain
        ? `$${metrics.arrGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'N/A';

      return NextResponse.json({
        response_type: 'in_channel',
        text: `*Dealer:* ${dealer}\n*ARR Gain (1h):* ${arrGain}`,
      });
    }

    // Default help message
    return NextResponse.json({
      response_type: 'ephemeral',
      text:
        'Usage:\n' +
        '`/dealershipai status <dealer>` → Show precision & KPI with action buttons\n' +
        '`/dealershipai arr <dealer>` → Show hourly ARR gain\n\n' +
        'Example: `/dealershipai status naples-honda`',
    });
  } catch (error) {
    console.error('Slack command error:', error);
    return NextResponse.json(
      {
        response_type: 'ephemeral',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
