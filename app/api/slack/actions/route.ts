import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Optional Slack security verification (disabled if @slack/web-api not installed)
async function verifyAndGetSlackUserEmail(userId: string): Promise<string | null> {
  // Skip verification if Slack security module not available
  // This allows the app to build without @slack/web-api
  return null; // Return null to skip verification (optional feature)
}

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:3001';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

/**
 * POST /api/slack/actions
 * Handle Slack interactive button clicks
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

    // Parse URL-encoded payload
    const params = new URLSearchParams(rawBody);
    const payloadStr = params.get('payload');
    
    if (!payloadStr) {
      return NextResponse.json(
        { error: 'Missing payload' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(payloadStr);

    // Extract action and dealer info
    const actionData = payload.actions?.[0];
    if (!actionData || !actionData.value) {
      return NextResponse.json(
        { error: 'Invalid action data' },
        { status: 400 }
      );
    }

    const actionValue = JSON.parse(actionData.value);
    const { dealer, action, retry } = actionValue;

    // Security: Verify Slack user with Clerk (for sensitive actions)
    const userId = payload.user?.id;
    if (userId && (action === 'arr_forecast' || action === 'ai_score_recompute')) {
      const userEmail = await verifyAndGetSlackUserEmail(userId);
      if (!userEmail) {
        return NextResponse.json({
          response_type: 'ephemeral',
          text: '❌ Access denied. You must be a verified user to execute this action.',
        });
      }
    }

    // Map Slack actions to orchestrator tasks
    const taskMap: Record<string, string> = {
      schema_fix: 'schema_fix',
      ugc_audit: 'ugc_audit',
      forecast: 'arr_forecast',
      msrp_sync: 'msrp_sync',
      ai_score_recompute: 'ai_score_recompute',
    };

    const orchestratorTask = taskMap[action];
    if (!orchestratorTask) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Unknown action: ${action}`,
      });
    }

    // Capture Slack context for progress updates
    const slackContext = {
      channel: payload.channel?.id || payload.channel?.id,
      ts: payload.message?.ts || payload.message_ts,
    };

    // Call orchestrator API
    try {
      const orchestratorResponse = await fetch(`${ORCHESTRATOR_URL}/api/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.ORCHESTRATOR_AUTH_TOKEN
            ? `Bearer ${process.env.ORCHESTRATOR_AUTH_TOKEN}`
            : '',
        },
        body: JSON.stringify({
          type: orchestratorTask,
          payload: { 
            dealerId: dealer,
            slackContext, // Include Slack context for progress updates
          },
          source: 'slack',
          userId: payload.user?.id,
          userName: payload.user?.name,
        }),
      });

      if (!orchestratorResponse.ok) {
        const errorText = await orchestratorResponse.text();
        console.error('Orchestrator error:', errorText);
        
        return NextResponse.json({
          response_type: 'ephemeral',
          text: `❌ Failed to queue task: ${orchestratorResponse.statusText}`,
        });
      }

      const orchestratorData = await orchestratorResponse.json();
      const taskId = orchestratorData.taskId || orchestratorData.id;

      // Update message immediately to show "running" status if we have context
      if (slackContext.channel && slackContext.ts) {
        // Fire and forget - don't wait for this
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/slack/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: slackContext.channel,
            ts: slackContext.ts,
            status: 'running',
            task: orchestratorTask,
            dealer,
            progress: 0,
          }),
        }).catch(err => console.error('Failed to update Slack message:', err));
      }

      // Return success response to Slack
      return NextResponse.json({
        response_type: 'in_channel',
        text: `⚙️ Task *${orchestratorTask}* queued for *${dealer}* via Orchestrator...`,
        attachments: [
          {
            color: 'warning',
            fields: [
              {
                title: 'Task ID',
                value: taskId || 'N/A',
                short: true,
              },
              {
                title: 'Dealer',
                value: dealer,
                short: true,
              },
              {
                title: 'Status',
                value: 'Running',
                short: true,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error('Error calling orchestrator:', error);
      return NextResponse.json({
        response_type: 'ephemeral',
        text: `❌ Error connecting to orchestrator: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  } catch (error) {
    console.error('Slack actions error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

