import { NextResponse } from "next/server";
import { withAuth } from "../../_utils/withAuth";
import { getPlan } from "@/lib/billing/plan";

/**
 * Get current user's plan
 */
export const GET = withAuth(async ({ tenantId }) => {
  try {
    const plan = await getPlan(tenantId);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
});

