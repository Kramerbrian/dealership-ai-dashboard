import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVisibilityThresholds } from "@/lib/formulas/registry";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache for 5 minutes

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot";

/**
 * GET /api/visibility/presence?domain=example.com
 * Returns engine presence percentages for a given domain
 * Respects tenant engine preferences (filters disabled engines)
 * Loads thresholds from registry.yaml
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "domain parameter is required" },
        { status: 400 }
      );
    }

    // Load thresholds from registry
    const registryThresholds = await getVisibilityThresholds();

    // TODO: Fetch tenant engine preferences from database
    // For now, all engines enabled by default
    const tenantEnginePrefs: Record<EngineName, boolean> = {
      ChatGPT: true,
      Perplexity: true,
      Gemini: true,
      Copilot: true,
    };

    // TODO: Fetch actual presence data from orchestrator/visibility service
    // This is synthetic data - replace with real API calls
    const syntheticPresence: Record<EngineName, number> = {
      ChatGPT: Math.floor(Math.random() * 30) + 70, // 70-100%
      Perplexity: Math.floor(Math.random() * 25) + 60, // 60-85%
      Gemini: Math.floor(Math.random() * 20) + 65, // 65-85%
      Copilot: Math.floor(Math.random() * 15) + 55, // 55-70%
    };

    // Build engines array based on tenant preferences
    const engines = (["ChatGPT", "Perplexity", "Gemini", "Copilot"] as EngineName[])
      .filter((name) => tenantEnginePrefs[name])
      .map((name) => ({
        name,
        presencePct: Math.round(syntheticPresence[name]),
      }));

    return NextResponse.json(
      {
        domain,
        engines,
        lastCheckedISO: new Date().toISOString(),
        connected: true,
        thresholds: registryThresholds, // Include for client-side use
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("[visibility/presence] Error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        domain: "unknown",
        engines: [],
        lastCheckedISO: new Date().toISOString(),
        connected: false,
      },
      { status: 500 }
    );
  }
}
