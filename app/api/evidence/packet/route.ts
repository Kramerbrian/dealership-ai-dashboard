import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { createClient } from "@supabase/supabase-js";

// Builds a compact, shareable evidence packet (JSON) — swap to HTML/PDF later
export async function POST(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const input = await req.json(); // { tenantId, sources, scores, issues, cwv, notes }
  const tenantId = isolation.tenantId;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Fetch real data if available, otherwise use provided input
    const [relevanceData, crawlData, cwvData] = await Promise.all([
      input.sources && input.sources.length > 0
        ? supabase
            .from("DealerSourceScore")
            .select("*")
            .eq("tenant_id", tenantId)
            .in("source", input.sources)
        : Promise.resolve({ data: null, error: null }),
      supabase
        .from("CrawlIssue")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("lastSeen", { ascending: false })
        .limit(50),
      supabase
        .from("CoreWebVitals")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("capturedAt", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const packet = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      tenantId,
      sources: relevanceData.data || input.sources || [],
      scores: input.scores || {},
      issues: crawlData.data || input.issues || [],
      cwv: cwvData.data || input.cwv || {},
      notes: input.notes || {},
      explainers: {
        cwv: {
          speed: "Loads in ≈ 2½ seconds",
          stability: "Page stays steady",
          response: "Reacts in 0.18 seconds"
        },
        tagline: "dealershipAI doesn't just show where you stand — it shows you what to fix next to win the click (or zero-click) before your competitors even realize what's happening."
      },
      compliance: {
        gdpr_compliant: true,
        data_retention_days: 90,
        generated_by: "dealershipAI Evidence Packet Generator",
      }
    };

    return NextResponse.json({ packet });
  } catch (error) {
    console.error("Error generating evidence packet:", error);
    // Fallback to input data if database query fails
    const packet = {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      tenantId,
      ...input,
      explainers: {
        cwv: {
          speed: "Loads in ≈ 2½ seconds",
          stability: "Page stays steady",
          response: "Reacts in 0.18 seconds"
        },
        tagline: "dealershipAI doesn't just show where you stand — it shows you what to fix next to win the click (or zero-click) before your competitors even realize what's happening."
      }
    };
    return NextResponse.json({ packet });
  }
}

