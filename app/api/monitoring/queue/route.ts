import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { checkQueueHealth, getQueueMetrics } from "@/lib/monitoring/queue-monitor";

export const revalidate = 60;

export async function GET(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const health = await checkQueueHealth();
    const metrics = await getQueueMetrics();

    return NextResponse.json({
      health,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Queue monitoring error:', error);
    return NextResponse.json(
      { error: "Failed to fetch queue metrics", message: String(error) },
      { status: 500 }
    );
  }
}

