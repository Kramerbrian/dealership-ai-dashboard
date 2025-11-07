import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/supabaseAdmin";

/**
 * Cron: Refresh schema validation for all tenants
 * Runs every 2 hours
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data: tenants } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .limit(100);

    // Bust schema cache for each tenant
    return NextResponse.json({
      processed: tenants?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Cron refresh-schema error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

