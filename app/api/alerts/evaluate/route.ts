import { NextResponse } from "next/server";
import { evaluateAlerts } from "@/app/lib/alerts/rules";
import { sendSlackAlert } from "@/lib/alerts/slack";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";

export async function POST(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const metrics = await req.json();
  const alerts = evaluateAlerts(metrics);
  const tenantId = isolation.tenantId;

  // Send Slack notifications for each alert
  const slackPromises = alerts.map(alert => {
    // Parse channel from notify array (e.g., "#seo-ops@slack" -> "seo-ops")
    const slackChannels = alert.notify
      .filter(n => n.includes('@slack'))
      .map(n => n.replace('@slack', '').replace('#', ''));

    // Determine severity from alert ID
    const severity = alert.id.includes('serve_errors') || alert.id.includes('scs_floor')
      ? 'error'
      : alert.id.includes('ai_visibility_gap')
      ? 'warning'
      : 'info';

    // Send to each Slack channel
    return Promise.all(
      slackChannels.map(channel =>
        sendSlackAlert({
          title: `Alert: ${alert.id}`,
          message: alert.text,
          severity: severity as 'info' | 'warning' | 'error' | 'critical',
          tenantId,
          metadata: { alertId: alert.id, metrics },
          channel: `#${channel}`,
        })
      )
    );
  });

  // Fire and forget Slack notifications
  Promise.all(slackPromises).catch(err => {
    console.error('Failed to send Slack alerts:', err);
  });

  return NextResponse.json({ alerts });
}
