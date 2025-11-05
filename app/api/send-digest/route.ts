import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { summary, channel } = await req.json();

    if (!summary || !channel) {
      return NextResponse.json(
        { error: "Missing summary or channel" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ status: "sent", channel });
  } catch (error: any) {
    console.error("Send digest error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send digest" },
      { status: 500 }
    );
  }
}

