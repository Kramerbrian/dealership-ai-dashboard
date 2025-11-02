import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';
const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || process.env.NEXT_PUBLIC_APP_URL || '';

/**
 * POST /api/slack/command
 * 
 * Slack slash command handler for /dealershipai
 * Supports: status <dealer>, arr <dealer>, fix <intent>
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const formData = new URLSearchParams(rawBody);

    // Verify Slack signature
    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');

    if (!verifySlackSignature(signature, timestamp, rawBody)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse Slack payload
    const text = formData.get('text')?.trim() || '';
    const [subcommand, ...args] = text.split(' ');
    const dealer = args[0];

    // Handle status command
    if (subcommand === 'status' && dealer) {
      try {
        // Query Prometheus for GNN precision
        const query = encodeURIComponent(`gnn_precision_by_dealer{dealer="${dealer}"}`);
        const promRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${query}`);
        
        let precision = 'n/a';
        if (promRes.ok) {
          const promData = await promRes.json();
          precision = promData.data?.result?.[0]?.value?.[1] || 'n/a';
        }

        // Query orchestrator for dealer info
        let dealerInfo = '';
        try {
          const orchRes = await fetch(`${ORCHESTRATOR_URL}/api/origins?domain=${dealer}`);
          if (orchRes.ok) {
            const data = await orchRes.json();
            dealerInfo = `*Name:* ${data.name || dealer}\n*Status:* ${data.status || 'Active'}\n`;
          }
        } catch {}

        return NextResponse.json({
          response_type: 'in_channel',
          text: `${dealerInfo}*Dealer:* ${dealer}\n*GNN Precision:* ${typeof precision === 'string' ? precision : (parseFloat(precision) * 100).toFixed(1) + '%'}\n_View full metrics → Grafana › GNN Analytics_`,
        });
      } catch (error: any) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `Error: ${error.message}`,
        });
      }
    }

    // Handle ARR command
    if (subcommand === 'arr' && dealer) {
      try {
        const query = encodeURIComponent(`gnn_arr_gain_by_dealer{dealer="${dealer}"}`);
        const promRes = await fetch(`${PROMETHEUS_URL}/api/v1/query?query=${query}`);
        
        let arrGain = 'n/a';
        if (promRes.ok) {
          const promData = await promRes.json();
          const value = promData.data?.result?.[0]?.value?.[1];
          arrGain = value ? `$${parseFloat(value).toFixed(2)}` : 'n/a';
        }

        return NextResponse.json({
          response_type: 'in_channel',
          text: `*Dealer:* ${dealer}\n*ARR Gain (1h):* ${arrGain}`,
        });
      } catch (error: any) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `Error: ${error.message}`,
        });
      }
    }

    // Handle fix command
    if (subcommand === 'fix' && dealer && args[1]) {
      const intent = args[1];
      try {
        const fixRes = await fetch(`${ORCHESTRATOR_URL}/api/orchestrate/agentic-fix-pack`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DTRI_API_KEY}`,
          },
          body: JSON.stringify({
            dealerId: dealer,
            fixType: intent,
          }),
        });

        if (fixRes.ok) {
          const data = await fixRes.json();
          return NextResponse.json({
            response_type: 'in_channel',
            text: `✅ *Fix initiated for ${dealer}*\n*Type:* ${intent}\n*Status:* ${data.status || 'queued'}\n_Check dashboard for progress_`,
          });
        } else {
          return NextResponse.json({
            response_type: 'ephemeral',
            text: `Failed to trigger fix: ${await fixRes.text()}`,
          });
        }
      } catch (error: any) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `Error: ${error.message}`,
        });
      }
    }

    // Default help message
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `Usage:\n\`/dealershipai status <dealer>\` → Show precision & KPI\n\`/dealershipai arr <dealer>\` → Show hourly ARR gain\n\`/dealershipai fix <dealer> <intent>\` → Trigger auto-fix (e.g., schema, faq, gbp)`,
    });
  } catch (error: any) {
    console.error('Slack command error:', error);
    return NextResponse.json(
      { error: error.message || 'Command failed' },
      { status: 500 }
    );
  }
}

function verifySlackSignature(
  signature: string | null,
  timestamp: string | null,
  rawBody: string
): boolean {
  if (!signature || !timestamp || !SLACK_SIGNING_SECRET) {
    return false;
  }

  // Check timestamp (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false; // More than 5 minutes old
  }

  // Verify signature
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto
    .createHmac('sha256', SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest('hex');

  return signature === `v0=${hmac}`;
}

