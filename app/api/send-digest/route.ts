import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const sendDigestSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  channel: z.enum(['slack', 'email'], {
    errorMap: () => ({ message: 'Channel must be "slack" or "email"' })
  }),
});

/**
 * POST /api/send-digest
 * 
 * Send executive digest via Slack or Email
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = sendDigestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { summary, channel } = validation.data;

    if (channel === "slack") {
      // Check if this is a drift alert
      const isDriftAlert = summary.includes("Downward KPI Drift Detected");
      const slackWebhookUrl = isDriftAlert 
        ? process.env.SLACK_ALERT_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL
        : process.env.SLACK_WEBHOOK_URL;

      if (!slackWebhookUrl) {
        console.warn("SLACK_WEBHOOK_URL not configured, skipping Slack send");
        return NextResponse.json({
          status: "skipped",
          message: "Slack webhook not configured",
        });
      }

      const res = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: isDriftAlert 
            ? summary 
            : `📊 *Dealership AI Executive Digest*\n\n${summary}`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Slack API error: ${res.statusText}`);
      }
    }

    if (channel === "email") {
      // Using Resend or similar mailer service
      const resendApiKey = process.env.RESEND_API_KEY;
      const emailTo = process.env.EXECUTIVE_EMAIL || "executives@dealershipgroup.com";

      if (!resendApiKey) {
        console.warn("RESEND_API_KEY not configured, skipping email send");
        return NextResponse.json({
          status: "skipped",
          message: "Email service not configured",
        });
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "DealershipAI Reports <reports@dealershipai.com>",
          to: emailTo,
          subject: "📊 DealershipAI Executive Summary",
          text: summary,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Email API error: ${error}`);
      }
    }

    return NextResponse.json({ 
      success: true,
      status: "sent", 
      channel 
    });
  } catch (error) {
    console.error("Send digest error:", error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send digest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

