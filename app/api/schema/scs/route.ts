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
    // Try to fetch real data from schema validation tables
    // Note: This is a placeholder - adjust based on your actual schema validation storage
    // For now, we'll use mock data but structure it for real data integration
    
    // TODO: Replace with actual schema validation query
    // Example structure:
    // const { data: schemaData } = await supabaseAdmin
    //   .from("SchemaValidation")
    //   .select("*")
    //   .eq("tenant_id", tenantId)
    //   .order("lastCrawl", { ascending: false })
    //   .limit(1)
    //   .single();

    // Fallback to mock data (replace with real query when schema validation is implemented)
    return NextResponse.json({
      scsPct: 91,
      errorsDetected: 3,
      authorityWeight: 0.78,
      missingFields: ["offers.availability"],
      malformedFields: ["aggregateRating.ratingValue"],
      lastCrawl: "2025-11-04T13:00:00Z"
    });
  } catch (error) {
    console.error("Error fetching SCS data:", error);
    // Fallback to mock data on error
    return NextResponse.json({
      scsPct: 91,
      errorsDetected: 3,
      authorityWeight: 0.78,
      missingFields: ["offers.availability"],
      malformedFields: ["aggregateRating.ratingValue"],
      lastCrawl: "2025-11-04T13:00:00Z"
    });
  }
}

