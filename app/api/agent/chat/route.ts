import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST /api/agent/chat
 * Agent Assistant Chat Endpoint
 * Powered by Claude Sonnet 4.5
 */
export async function POST(req: NextRequest) {
  try {
    const { query, origin, context } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Build system prompt with dashboard context
    const systemPrompt = `You are the DealershipAI Agent, an expert automotive digital intelligence assistant.

PERSONALITY:
- Helpful, concise, data-driven
- Use dry humor sparingly (Ryan Reynolds style)
- Never patronizing
- IYKYK sci-fi references (Interstellar, Matrix, BTTF, Hitchhiker's)

KNOWLEDGE BASE:
- Trust Score formula: (QAI × 0.6) + (E-E-A-T × 0.4)
- SEO = 0.4(CWV) + 0.3(Crawl_Index) + 0.3(Content_Quality)
- AEO = 0.35(PAA_Share) + 0.35(FAQ_Schema) + 0.3(Local_Citations)
- GEO = CSGV - λ_HRP(Hallucination_Risk)
- QAI = λ_PIQR × (SEO + AEO + GEO) × VDP_Quality
- All 40 Hacks definitions and formulas
- SEO, AEO, GEO best practices
- Automotive industry context
- Competitive analysis methods

RESPONSE STYLE:
- Lead with the answer, then supporting context
- Use bullet points for action items
- Cite data sources when available
- Suggest 1-2 next steps
- Ask clarifying questions if needed

CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No dashboard context provided'}

${origin ? `Dealership: ${origin}` : ''}`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Unable to generate response';

    // Extract suggestions if any
    const suggestions = extractQuickActions(responseText);

    return NextResponse.json({
      success: true,
      message: responseText,
      answer: responseText, // Alias for compatibility
      suggestions,
      model: 'claude-sonnet-4-20250514',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Agent chat error:', error);
    
    // Handle rate limits and API errors gracefully
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process query. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Extract quick action suggestions from agent response
 */
function extractQuickActions(response: string): string[] {
  const actions: string[] = [];
  
  // Look for numbered action items
  const actionRegex = /(?:^|\n)\s*\d+\.\s*(.+?)(?=\n|$)/g;
  let match;
  
  while ((match = actionRegex.exec(response)) !== null) {
    actions.push(match[1].trim());
  }

  // If no numbered actions, try bullet points
  if (actions.length === 0) {
    const bulletRegex = /[-•]\s*(.+?)(?=\n|$)/g;
    while ((match = bulletRegex.exec(response)) !== null && actions.length < 3) {
      actions.push(match[1].trim());
    }
  }

  return actions.slice(0, 3); // Max 3 suggestions
}

