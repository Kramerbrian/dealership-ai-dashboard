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

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL", message: "URL must be a valid URL format" },
      { status: 400 }
    );
  }

  // Validate field name (basic sanitization)
  if (typeof field !== 'string' || field.length === 0 || field.length > 200) {
    return NextResponse.json(
      { error: "Invalid field", message: "Field must be a non-empty string (max 200 chars)" },
      { status: 400 }
    );
  }

  try {
    // Enqueue schema fix job
    let jobId: string;
    try {
      const result = await enqueue({
        type: "schema-fix",
        data: {
          tenantId,
          url,
          field,
          value,
          timestamp: new Date().toISOString(),
        },
      });
      jobId = result.id;
    } catch (error) {
      console.error('Failed to enqueue job:', error);
      return NextResponse.json(
        { 
          error: "Queue error", 
          message: "Failed to queue schema fix job. Please try again." 
        },
        { status: 503 }
      );
    }

    // Log telemetry (non-blocking)
    storeTelemetry({
      event_type: 'schema_fix_queued',
      tenant_id: tenantId,
      metadata: { url, field, value, jobId },
    }).catch(err => {
      console.error('Failed to log telemetry:', err);
      // Don't fail the request if telemetry fails
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
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

