/**
 * Slack milestone notifications
 * Posts to webhook when key events occur
 */

const WEBHOOK_URL = process.env.TELEMETRY_WEBHOOK || process.env.SLACK_WEBHOOK_URL;

export interface MilestoneEvent {
  type: "aiv_spike" | "revenue_recovered" | "engine_drop" | "integration_connected";
  tenantId: string;
  value: number;
  metadata?: Record<string, any>;
}

export async function sendMilestone(event: MilestoneEvent): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.log("Slack webhook not configured, milestone:", event);
    return false;
  }

  try {
    const message = formatMilestone(event);
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message.title,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: message.body
            }
          }
        ]
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Slack milestone error:", error);
    return false;
  }
}

function formatMilestone(event: MilestoneEvent): { title: string; body: string } {
  switch (event.type) {
    case "aiv_spike":
      return {
        title: `🚀 AIV Spike: +${event.value} points`,
        body: `Tenant ${event.tenantId} gained +${event.value} AIV points. This is a significant improvement!`
      };
    case "revenue_recovered":
      return {
        title: `💰 Revenue Recovered: $${event.value.toLocaleString()}/mo`,
        body: `Tenant ${event.tenantId} recovered $${event.value.toLocaleString()}/month through fixes.`
      };
    case "engine_drop":
      return {
        title: `⚠️ Engine Drop: ${event.value} points`,
        body: `Tenant ${event.tenantId} experienced a ${event.value} point drop in engine presence. Investigate urgently.`
      };
    case "integration_connected":
      return {
        title: `🔌 Integration Connected: ${event.metadata?.kind || "unknown"}`,
        body: `Tenant ${event.tenantId} connected ${event.metadata?.kind || "integration"}.`
      };
    default:
      return {
        title: "Milestone",
        body: JSON.stringify(event)
      };
  }
}

