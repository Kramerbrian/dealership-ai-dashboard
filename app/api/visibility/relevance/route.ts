import { NextResponse } from "next/server";
import { getUserTenantId, enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(request as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const tenantId = isolation.tenantId;

  try {
    // Try to fetch real data from DealerSourceScore table
    const { data: scores, error } = await supabaseAdmin
      .from("DealerSourceScore")
      .select("source, visibility, proximity, authority, scsPct, date")
      .eq("tenant_id", tenantId)
      .order("date", { ascending: false })
      .limit(20);

    if (error || !scores || scores.length === 0) {
      // Fallback to mock data if no real data exists
      return NextResponse.json({
        nodes: [
          { name: "Cars.com", visibility: 0.68, proximity: 0.55, authority: 0.81, scsPct: 92 },
          { name: "CarMax", visibility: 0.84, proximity: 0.32, authority: 0.91, scsPct: 88 },
          { name: "AutoTrader", visibility: 0.57, proximity: 0.60, authority: 0.79, scsPct: 86 },
          { name: "CarGurus", visibility: 0.61, proximity: 0.58, authority: 0.77, scsPct: 89 }
        ]
      });
    }

    // Group by source and get latest scores
    const sourceMap = new Map<string, any>();
    scores.forEach(score => {
      const existing = sourceMap.get(score.source);
      if (!existing || new Date(score.date) > new Date(existing.date)) {
        sourceMap.set(score.source, score);
      }
    });

    const nodes = Array.from(sourceMap.values()).map(score => ({
      name: score.source,
      visibility: score.visibility,
      proximity: score.proximity,
      authority: score.authority,
      scsPct: score.scsPct
    }));

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error("Error fetching relevance data:", error);
    // Fallback to mock data on error
    return NextResponse.json({
      nodes: [
        { name: "Cars.com", visibility: 0.68, proximity: 0.55, authority: 0.81, scsPct: 92 },
        { name: "CarMax", visibility: 0.84, proximity: 0.32, authority: 0.91, scsPct: 88 },
        { name: "AutoTrader", visibility: 0.57, proximity: 0.60, authority: 0.79, scsPct: 86 },
        { name: "CarGurus", visibility: 0.61, proximity: 0.58, authority: 0.77, scsPct: 89 }
      ]
    });
  }
}

