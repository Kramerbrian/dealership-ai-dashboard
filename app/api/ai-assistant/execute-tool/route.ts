/**
 * Tool Execution Endpoint
 *
 * Executes tool calls from the AI Assistant (e.g., get_ai_scores)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { toolCall } = await request.json() as { toolCall: ToolCall };

    if (!toolCall || !toolCall.function) {
      return NextResponse.json(
        { error: 'Invalid tool call' },
        { status: 400 }
      );
    }

    const result = await executeToolCall(toolCall);

    return NextResponse.json({
      success: true,
      result,
      toolCallId: toolCall.id
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute tool',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Execute a tool call
 */
async function executeToolCall(toolCall: ToolCall): Promise<string> {
  const { function: func } = toolCall;

  if (func.name === 'get_ai_scores') {
    try {
      const args = JSON.parse(func.arguments);
      const { origin } = args;

      if (!origin) {
        return JSON.stringify({
          error: 'Missing origin parameter',
          message: 'Please provide a dealership URL'
        });
      }

      // Call the scores API
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const scoresUrl = new URL('/api/scores', baseUrl);
      scoresUrl.searchParams.set('domain', origin);

      console.log('Fetching scores from:', scoresUrl.toString());

      const response = await fetch(scoresUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Scores API returned ${response.status}`);
      }

      const data = await response.json();

      // Calculate risk
      const visibility = data.aiVisibility || 0;
      const baseRevenue = 500000;
      const riskFactor = (100 - visibility) / 100;
      const riskPerMonth = Math.round(baseRevenue * riskFactor);

      // Format response similar to test harness
      return JSON.stringify({
        origin,
        visibility: visibility / 100, // Convert to decimal (0.35 instead of 35)
        aiVisibility: visibility,
        overallScore: data.overallScore || 0,
        zeroClickScore: data.zeroClickScore || 0,
        risk_per_month: riskPerMonth,
        top_fixes: [
          'Improve on-page SEO to raise visibility in Google search',
          'Add structured data (Schema.org) for better AI understanding',
          'Optimize for featured snippets and answer boxes',
          'Enhance Google Business Profile with complete information',
          'Build high-quality backlinks from automotive directories'
        ],
        evidence: [
          {
            source: 'ai_visibility_analysis',
            note: `Current AI visibility score is ${visibility}%. Analysis shows opportunities for improvement in structured data and local SEO.`
          }
        ],
        scores: data
      }, null, 2);

    } catch (error) {
      console.error('get_ai_scores error:', error);
      return JSON.stringify({
        error: 'Failed to fetch AI scores',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Unable to retrieve scores for the specified URL. Please verify the URL is valid and try again.'
      });
    }
  }

  return JSON.stringify({
    error: 'Unknown tool',
    tool: func.name,
    message: `Tool "${func.name}" is not supported`
  });
}
