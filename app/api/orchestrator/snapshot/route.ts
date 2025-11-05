/**
 * GET /api/orchestrator/snapshot
 * 
 * Unified snapshot endpoint for GPT Actions
 * Aggregates Pulse, MSRP sync, diagnostics, and AI score summaries
 * 
 * Supports ETag caching for efficient polling
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";
import { buildDiagnosticsPayload, getMsrpState, fetchPulse } from "@/lib/orchestrator/snapshot-helpers";

/**
 * Generate ETag from content
 */
async function generateETag(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `"${hashHex}"`;
}

export const GET = createApiRoute(
  {
    endpoint: '/api/orchestrator/snapshot',
    requireAuth: false, // Public endpoint for GPT Actions (auth via x-pulse-key header)
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req) => {
    try {
      // Verify API key if provided
      const apiKey = req.headers.get('x-pulse-key');
      const expectedKey = process.env.PULSE_API_KEY;
      
      if (expectedKey && apiKey !== expectedKey) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Build snapshot data
      const [diagnostics, msrpSync, pulse] = await Promise.all([
        buildDiagnosticsPayload(),
        getMsrpState(),
        fetchPulse({ window: '7d' }),
      ]);

      // Build graph summary (mock for now)
      const graph = {
        dealers: 0,
        intents: 0,
        fixes: 0,
        edges: 0,
        updateTs: new Date().toISOString(),
      };

      // Build response body
      const body = {
        freshnessScore: diagnostics.freshnessScore,
        businessIdentityMatch: diagnostics.businessIdentityMatch,
        pulse,
        msrpSync,
        graph,
        diagnostics,
        meta: {
          version: process.env.SNAPSHOT_VERSION || new Date().toISOString(),
          source: 'AppraiseYourVehicleOrchestrator',
          sdkCompatible: true,
          generatedAt: new Date().toISOString(),
        },
      };

      const json = JSON.stringify(body);
      const etag = await generateETag(json);

      // Check If-None-Match header for 304 response
      const ifNoneMatch = req.headers.get('If-None-Match');
      if (ifNoneMatch && ifNoneMatch === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            'Cache-Control': 'public, max-age=60, s-maxage=120',
          },
        });
      }

      // Return snapshot with ETag
      return new NextResponse(json, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=120',
          ETag: etag,
        },
      });
    } catch (error) {
      console.error('[snapshot] Error:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate snapshot',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
);

