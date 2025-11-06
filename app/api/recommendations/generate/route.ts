import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { calculateDLOC, DLOCInputs } from "@/lib/analytics/d-loc-calculator";

export const dynamic = "force-dynamic";

const recommendationsSchema = z.object({
  inputs: z.object({
    avgLeadResponseTimeMinutes: z.number().min(0),
    websiteLoadSpeedLossRate: z.number().min(0).max(1),
    totalMonthlyAdSpend: z.number().min(0),
    // Add other DLOCInputs fields as needed
  }),
  dealerName: z.string().min(1, 'Dealer name is required'),
  context: z.string().optional(),
});

/**
 * POST /api/recommendations/generate
 * 
 * Generates GPT-powered actionable recommendations based on D-LOC analysis
 * Requires authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Input validation
    const body = await req.json();
    const validation = recommendationsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { inputs, dealerName, context } = validation.data;

    // Calculate D-LOC first
    const dlocResults = calculateDLOC(inputs as DLOCInputs);

    // Build recommendation prompt for GPT
    const prompt = buildRecommendationPrompt(dealerName, dlocResults, inputs, context);

    // Call GPT API (or use OpenAI client)
    const gptResponse = await generateRecommendations(prompt);

    return NextResponse.json({
      success: true,
      dlocResults: {
        totalDLOC: dlocResults.summary.totalDLOC,
        byCategory: dlocResults.summary.byCategory,
      },
      recommendations: {
        automated: dlocResults.summary.recommendations,
        gpt: gptResponse,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Build GPT prompt for recommendation generation
 */
function buildRecommendationPrompt(
  dealerName: string,
  results: ReturnType<typeof calculateDLOC>,
  inputs: DLOCInputs,
  context?: string
): string {
  return `You are an expert automotive digital marketing consultant analyzing ${dealerName}'s lost opportunity cost.

CURRENT SITUATION:
- Total Monthly Lost Opportunity: $${results.summary.totalDLOC.toLocaleString()}
- Average Response Time: ${inputs.avgLeadResponseTimeMinutes} minutes (industry standard: 5 minutes)
- Website Performance Loss Rate: ${(inputs.websiteLoadSpeedLossRate * 100).toFixed(0)}%
- Search Lost Impression Share: ${(results.pillar3.totalLostIS).toFixed(0)}%
- Total Monthly Ad Spend: $${inputs.totalMonthlyAdSpend.toLocaleString()}

BREAKDOWN BY CATEGORY:
${results.summary.byCategory.map(c => `- ${c.category}: $${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`).join('\n')}

PILLAR DETAILS:
1. AD SPILLAGE (Website Failure): $${results.pillar1.unrealizedProfit.toLocaleString()}
   - Wasted Ad Spend: $${results.pillar1.adSpendWasted.toLocaleString()}
   - Lost Leads: ${results.pillar1.lostLeads.toFixed(0)}
   - Lost Sales: ${results.pillar1.lostSales.toFixed(1)}

2. PROCESS FAILURE (Lead Handling): $${results.pillar2.unrealizedProfit.toLocaleString()}
   - Lost Leads: ${results.pillar2.lostLeads.toFixed(0)}
   - Lost Sales: ${results.pillar2.totalLostSales.toFixed(1)}
   - LTV Loss: $${results.pillar2.ltvLoss.toLocaleString()}

3. MARKET FAILURE (Budget/Rank): $${results.pillar3.unrealizedProfit.toLocaleString()}
   - Missed Leads: ${results.pillar3.missedLeads.toFixed(0)}
   - Lost Sales: ${results.pillar3.lostSales.toFixed(1)}

${context ? `\nADDITIONAL CONTEXT:\n${context}` : ''}

TASK:
Generate 3-5 specific, actionable recommendations prioritized by ROI and ease of implementation. Each recommendation should:
1. Address a specific pillar/loss category
2. Include concrete steps the dealership can take
3. Reference Google Ads best practices where applicable
4. Estimate potential recovery amount
5. Be written in clear, executive-friendly language

Format as JSON array with:
{
  "priority": "CRITICAL" | "HIGH" | "MEDIUM",
  "category": "Ad Spillage" | "Process Failure" | "Market Failure" | "LTV",
  "title": "Short action title",
  "description": "Detailed explanation",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "estimatedRecovery": "$X,XXX per month",
  "googleBestPractice": "Reference to Google Ads metric or feature",
  "roi": "XXX%"
}`;
}

/**
 * Generate recommendations using GPT
 */
async function generateRecommendations(prompt: string): Promise<any> {
  try {
    // Use OpenAI API if configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Fallback to structured recommendations without GPT
      return {
        message: "OpenAI API key not configured. Using algorithmic recommendations.",
        recommendations: [],
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert automotive digital marketing consultant. Provide specific, actionable recommendations based on D-LOC analysis. Always format responses as valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in GPT response");
    }

    // Parse JSON from GPT response
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, return raw content
      return {
        raw: content,
        note: "Failed to parse as JSON, returning raw GPT response",
      };
    }
  } catch (error) {
    console.error("GPT recommendation generation error:", error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Failed to generate GPT recommendations",
    };
  }
}

