import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { enqueue } from "@/backend/engine/queue";
import { storeTelemetry } from "@/lib/telemetry/storage";

export async function POST(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json(); // { tenantId, url, field, value }
  const { url, field, value } = body;
  const tenantId = isolation.tenantId;

  // Validate input
  if (!url || !field || value === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: url, field, value" },
      { status: 400 }
    );
  }

  try {
    // Enqueue schema fix job
    const { id: jobId } = await enqueue({
      type: "schema-fix",
      data: {
        tenantId,
        url,
        field,
        value,
        timestamp: new Date().toISOString(),
      },
    });

    // Log telemetry
    await storeTelemetry({
      event_type: 'schema_fix_queued',
      tenant_id: tenantId,
      metadata: { url, field, value, jobId },
    });

    return NextResponse.json(
      { 
        accepted: true, 
        jobId,
        message: "Schema fix queued successfully",
        estimatedCompletion: "2-5 minutes"
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Failed to queue schema fix:', error);
    return NextResponse.json(
      { error: "Failed to queue schema fix", message: String(error) },
      { status: 500 }
    );
  }
}

