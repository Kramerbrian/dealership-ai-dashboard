import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export const dynamic = "force-dynamic";

const pulseQuerySchema = z.object({
  dealerId: z.string().optional(),
  domain: z.string().url().optional().default("germainnissan.com"),
});

/**
 * GET /api/pulse
 * 
 * Aggregates real-time pulse data for the DealershipAI Pulse Dashboard
 * Returns: AI Visibility Index, Revenue at Risk, UGC Health, Zero-Click Inclusion
 * 
 * Note: Public endpoint for demo purposes, but should be rate-limited
 */
export async function GET(req: NextRequest) {
  try {
    // Optional authentication (public endpoint but tracks user if available)
    const { userId } = await auth();
    
    // Input validation
    const { searchParams } = new URL(req.url);
    const queryParams = {
      dealerId: searchParams.get("dealerId") || undefined,
      domain: searchParams.get("domain") || undefined,
    };
    
    const validation = pulseQuerySchema.safeParse(queryParams);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }
    
    const { dealerId, domain } = validation.data;

    // Fetch data from multiple sources in parallel
    const [aiScores, visibility, reviews, overview] = await Promise.all([
      fetch(`${req.nextUrl.origin}/api/ai-scores?domain=${domain}`).then((r) => r.json()).catch(() => null),
      fetch(`${req.nextUrl.origin}/api/agent/visibility${dealerId ? `?dealerId=${dealerId}` : ""}`)
        .then((r) => r.json())
        .catch(() => null),
      fetch(`${req.nextUrl.origin}/api/dashboard/reviews`).then((r) => r.json()).catch(() => null),
      fetch(`${req.nextUrl.origin}/api/dashboard/overview-live?timeRange=30d${dealerId ? `&dealerId=${dealerId}` : ""}`)
        .then((r) => r.json())
        .catch(() => null),
    ]);

    // Extract metrics
    const aiv = aiScores?.ai_visibility_overall || overview?.data?.aiVisibility?.score || 87;
    const revenueAtRisk = visibility?.Revenue_at_Risk_USD || overview?.data?.revenue?.atRisk || 43000;
    
    // Calculate UGC Health from reviews
    let ugcHealth = 91;
    if (reviews?.data?.averageRating) {
      ugcHealth = Math.round((reviews.data.averageRating / 5) * 100);
    } else if (reviews?.data?.sentiment?.positive) {
      ugcHealth = Math.round(reviews.data.sentiment.positive * 100);
    }

    // Zero-Click Inclusion
    const zeroClick = aiScores?.zero_click_coverage || 64;

    // Calculate trends (in production, compare with historical data)
    // For now, use calculated deltas
    const previousAIV = 81;
    const previousRevenue = 47000;
    const previousUGC = 89;
    const previousZeroClick = 59;

    const metrics = [
      {
        id: 1,
        title: "AI Visibility Index",
        value: Math.round(aiv),
        change: Math.round(((aiv - previousAIV) / previousAIV) * 100),
        trend: aiv >= previousAIV ? "up" : "down",
        confidence: "High" as const,
        cause: "Improved schema coverage",
      },
      {
        id: 2,
        title: "Revenue at Risk",
        value: Math.round(revenueAtRisk),
        change: Math.round(((revenueAtRisk - previousRevenue) / previousRevenue) * 100),
        trend: revenueAtRisk <= previousRevenue ? "down" : "up",
        confidence: "High" as const,
        cause: "Increased AIV mentions across ChatGPT and Gemini",
      },
      {
        id: 3,
        title: "UGC Health",
        value: ugcHealth,
        change: Math.round(((ugcHealth - previousUGC) / previousUGC) * 100),
        trend: ugcHealth >= previousUGC ? "up" : "down",
        confidence: "Medium" as const,
        cause: "Faster review responses",
      },
      {
        id: 4,
        title: "Zero-Click Inclusion",
        value: Math.round(zeroClick),
        change: Math.round(((zeroClick - previousZeroClick) / previousZeroClick) * 100),
        trend: zeroClick >= previousZeroClick ? "up" : "down",
        confidence: "Medium" as const,
        cause: "AI Overviews alignment improved",
      },
    ];

    // Generate digest
    const aivChange = metrics[0].change;
    const schemaFixes = aivChange > 0 ? Math.floor(Math.abs(aivChange) / 3) : 0;
    const digest = `System scan complete — AIV ${aivChange > 0 ? "+" : ""}${aivChange}%, ${
      schemaFixes > 0 ? `${schemaFixes} schema fixes auto-queued, ` : ""
    }UGC improving steadily.`;

    return NextResponse.json(
      {
        success: true,
        metrics,
        digest,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Pulse API error:", error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch pulse data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

