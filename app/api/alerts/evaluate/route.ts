import { NextResponse } from "next/server";
import { evaluateAlerts } from "@/app/lib/alerts/rules";
import { sendSlackAlert } from "@/lib/alerts/slack";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";

export async function POST(req: Request) {
  try {
    // Enforce tenant isolation
    const isolation = await enforceTenantIsolation(req as any);
    if (!isolation.allowed || !isolation.tenantId) {
      return isolation.response || NextResponse.json(
        { error: "Unauthorized", message: "Tenant isolation check failed" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let metrics: any;
    try {
      metrics = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // Validate metrics structure
    if (!metrics || typeof metrics !== 'object') {
      return NextResponse.json(
        { error: "Invalid metrics", message: "Metrics must be an object" },
        { status: 400 }
      );
    }

    const tenantId = isolation.tenantId;

    // Evaluate alerts
    let alerts;
    try {
      alerts = evaluateAlerts(metrics);
    } catch (error) {
      console.error('Alert evaluation error:', error);
      return NextResponse.json(
        { 
          error: "Alert evaluation failed", 
          message: error instanceof Error ? error.message : "Unknown error during evaluation" 
        },
        { status: 500 }
      );
    }

    // Send Slack notifications for each alert (fire and forget)
    const slackPromises = alerts.map(alert => {
      try {
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
            }).catch(err => {
              // Log but don't fail the request
              console.error(`Failed to send Slack alert to ${channel}:`, err);
              return false;
            })
          )
        );
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
        return Promise.resolve([]);
      }
    });

    // Fire and forget Slack notifications (non-blocking)
    Promise.all(slackPromises).catch(err => {
      console.error('Failed to send Slack alerts:', err);
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alert evaluation endpoint error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}
