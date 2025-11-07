import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const evt = await req.json(); // { name, meta }
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
        // Continue execution even if storage fails
      }
    } catch (error) {
      console.error('Telemetry storage error:', error);
    }
  } else {
    // Fallback: log only
    console.log("telemetry", { tenantId, ...evt });
  }

  return NextResponse.json({ ok: true });
}

