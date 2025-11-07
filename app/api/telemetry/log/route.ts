import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    let evt: { name?: string; meta?: Record<string, any> };
    try {
      evt = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const tenantId = isolation.tenantId;

    // Write to Supabase if configured
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error } = await supabase
          .from('telemetry_events')
          .insert({
            tenant_id: tenantId,
            event_name: evt.name || 'unknown',
            event_metadata: evt.meta || {},
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Failed to store telemetry:', error);
          // Continue execution even if storage fails (non-critical)
          // Log for monitoring but don't fail the request
        }
      } catch (error) {
        console.error('Telemetry storage error:', error);
        // Fallback: continue without storage
      }
    } else {
      // Fallback: log only (development mode)
      console.log("telemetry", { tenantId, ...evt });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telemetry endpoint error:', error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

