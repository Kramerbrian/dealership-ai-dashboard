import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { getPlan } from "@/lib/billing/plan";

/**
 * GET /api/billing/plan?tenantId=xxx
 * 
 * Returns the current billing plan for a tenant.
 * Used by TierGate component to check access.
 */
export const GET = withAuth(async ({ req, tenantId }) => {
  try {
    const url = new URL(req.url);
    const requestedTenantId = url.searchParams.get("tenantId") || tenantId;

    // In production, you might want to verify the requesting user
    // has permission to check this tenant's plan
    const plan = await getPlan(requestedTenantId);

    return NextResponse.json({
      plan,
      tenantId: requestedTenantId,
    });
  } catch (error) {
    console.error("Failed to get plan:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch plan",
        plan: "free", // Default to free on error
      },
      { status: 500 }
    );
  }
});
