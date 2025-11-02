import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

/**
 * POST /api/trust/explain
 * 
 * AI Explanation Layer: Interactive Q&A about trust scores
 * Example: "Why is my Freshness Score low?"
 */
export async function POST(req: NextRequest) {
  try {
    const { question, dealerId, metric } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: 'question is required' },
        { status: 400 }
      );
    }

    // Get dealer context
    let context = {};
    if (dealerId) {
      const dealership = await prisma.dealership.findUnique({
        where: { id: dealerId },
        include: {
          scores: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          audits: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (dealership) {
        context = {
          dealerName: dealership.name,
          currentScores: {
            aiVisibility: dealership.scores[0]?.aiVisibility,
            zeroClick: dealership.scores[0]?.zeroClick,
            ugcHealth: dealership.scores[0]?.ugcHealth,
          },
          recentAudits: dealership.audits.map((a) => ({
            status: a.status,
            createdAt: a.createdAt,
          })),
        };
      }
    }

    // Get metric-specific data if requested
    if (metric === 'freshness') {
      // In production, analyze content age
      const freshnessData = {
        totalPages: 267,
        stalePages: 187, // Haven't been modified in 180+ days
        avgDaysSinceUpdate: 145,
        recommendedUpdates: 7,
        estimatedGain: 12,
      };

      context = { ...context, freshnessData };
    }

    // Use OpenAI to generate explanation
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are a helpful AI assistant explaining dealership Trust Score metrics.
Provide clear, actionable explanations with specific numbers and recommendations.
Always include estimated impact (e.g., "could recover +12 pts").`;

    const userPrompt = `Question: ${question}\n\nContext: ${JSON.stringify(context, null, 2)}\n\nProvide a concise explanation with actionable steps.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const explanation = completion.choices[0]?.message?.content || 'Unable to generate explanation.';

    // Extract actionable items from explanation
    const actionItems = extractActionItems(explanation);

    return NextResponse.json({
      question,
      explanation,
      actionItems,
      context: dealerId ? context : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Explain error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}

function extractActionItems(explanation: string): string[] {
  // Simple extraction - in production, use NLP
  const items: string[] = [];
  const lines = explanation.split('\n');

  for (const line of lines) {
    if (line.match(/^[-•]\s+|^\d+\.\s+|^•\s+/)) {
      items.push(line.replace(/^[-•\d.\s]+/, '').trim());
    } else if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('should')) {
      items.push(line.trim());
    }
  }

  return items.slice(0, 5); // Max 5 items
}

