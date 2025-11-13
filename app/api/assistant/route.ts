import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * AI Assistant Endpoint
 * POST /api/assistant
 *
 * Provides conversational AI assistance for dealership analytics and insights
 */
export async function POST(req: Request) {
  try {
    const { message, context, conversationHistory } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Build conversation context
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // System prompt for dealership context
    const systemPrompt = `You are an AI assistant for DealershipAI, a platform that helps automotive dealerships optimize their AI visibility and digital presence.

You have access to the following context:
${context ? JSON.stringify(context, null, 2) : 'No additional context provided'}

Your role is to:
1. Answer questions about dealership performance metrics
2. Provide insights on AI visibility across ChatGPT, Claude, Perplexity, and Gemini
3. Explain revenue impact calculations
4. Suggest optimization strategies
5. Help users understand their analytics dashboard

Be concise, data-driven, and actionable in your responses.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0];
    const text = assistantMessage.type === 'text' ? assistantMessage.text : '';

    return NextResponse.json({
      response: text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
      conversationId: response.id,
    });

  } catch (error: any) {
    console.error('Assistant API error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'AI service authentication failed' },
        { status: 503 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
