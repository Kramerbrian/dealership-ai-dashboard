/**
 * POST /api/geo/test
 * 
 * Run GEO tests for local search visibility
 */

import { NextRequest, NextResponse } from "next/server";
import { createApiRoute } from "@/lib/api-wrapper";
import { z } from "zod";
import { GEOPromptGenerator } from "@/lib/geo/prompt-generator";
import { GEOFixGenerator } from "@/lib/geo/fix-generator";

const geoTestSchema = z.object({
  prompts: z.array(z.object({
    id: z.string(),
    prompt: z.string(),
    city: z.string(),
    intent: z.enum(['service', 'sales', 'parts', 'finance']),
  })).optional(),
  city: z.string(),
});

export const POST = createApiRoute(
  {
    endpoint: '/api/geo/test',
    requireAuth: true,
    validateBody: geoTestSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const body = await req.json();
      const { prompts, city } = body;

      // Generate prompts if not provided
      const testPrompts = prompts || GEOPromptGenerator.generateWeeklyPrompts(city);

      // Simulate test results (in production, this would query AI search APIs)
      const results = testPrompts.map((prompt: any, idx: number) => {
        // Simulate: 60% chance of being named
        const named = Math.random() > 0.4;
        const competitor = named ? null : ['Naples Toyota', 'Sutherland Honda', 'Miller Honda'][Math.floor(Math.random() * 3)];
        const surfaceTypes: Array<'ai_overview' | 'maps_3pack' | 'perplexity' | 'chatgpt'> = [
          'ai_overview', 'maps_3pack', 'perplexity', 'chatgpt'
        ];
        const surfaceType = surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)];

        return {
          id: `result_${Date.now()}_${idx}`,
          prompt_id: prompt.id,
          prompt: prompt.prompt,
          dealership_named: named,
          competitor_named: competitor,
          surface_type: surfaceType,
          tested_at: new Date().toISOString(),
        };
      });

      // Calculate GEO score
      const namedCount = results.filter((r: any) => r.dealership_named).length;
      const geoScore = (namedCount / results.length) * 100;

      // Calculate citation mix (simulated)
      const citationMix = Math.floor(Math.random() * 5) + 3; // 3-7 citations
      const answerSurfaceMix = Math.floor(Math.random() * 30) + 60; // 60-90%

      const score = {
        dealership_id: auth?.user?.dealershipId || 'current',
        period: '7d',
        prompts_tested: results.length,
        named_count: namedCount,
        geo_score: Math.round(geoScore),
        citation_mix: citationMix,
        answer_surface_mix: answerSurfaceMix,
        time_to_update_days: 2,
      };

      // Generate fixes
      const winningPhrases = GEOFixGenerator.extractWinningPhrases(results);
      const fixes = GEOFixGenerator.generateFixes(results, winningPhrases);

      return NextResponse.json({
        success: true,
        results,
        score,
        fixes,
        winning_phrases: winningPhrases,
      });
    } catch (error) {
      console.error('GEO test error:', error);
      return NextResponse.json(
        { error: 'Failed to run GEO tests' },
        { status: 500 }
      );
    }
  }
);

