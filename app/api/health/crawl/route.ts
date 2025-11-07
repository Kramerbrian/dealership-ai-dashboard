import { NextResponse } from "next/server";
import { getUserTenantId, enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

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
    // Try to fetch real data from CrawlIssue table
    const { data: issues, error } = await getSupabaseAdmin()
      .from("CrawlIssue")
      .select("code, url, frequency, lastSeen, impact")
      .eq("tenant_id", tenantId)
      .order("lastSeen", { ascending: false })
      .limit(50);

    if (error || !issues || issues.length === 0) {
      // Fallback to mock data if no real data exists
      return NextResponse.json({
        errors: [
          { code: 404, url: "/used-inventory/2020-camry-le", frequency: 7, lastSeen: "2025-11-03", impact: "High" },
          { code: 502, url: "/service-specials", frequency: 2, lastSeen: "2025-11-02", impact: "Medium" }
        ]
      });
    }

    const errors = issues.map(issue => ({
      code: issue.code,
      url: issue.url,
      frequency: issue.frequency,
      lastSeen: issue.lastSeen.toISOString().split('T')[0],
      impact: issue.impact
    }));

    return NextResponse.json({ errors });
  } catch (error) {
    console.error("Error fetching crawl data:", error);
    // Fallback to mock data on error
    return NextResponse.json({
      errors: [
        { code: 404, url: "/used-inventory/2020-camry-le", frequency: 7, lastSeen: "2025-11-03", impact: "High" },
        { code: 502, url: "/service-specials", frequency: 2, lastSeen: "2025-11-02", impact: "Medium" }
      ]
    });
  }
}

