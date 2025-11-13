import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createPublicRoute } from '@/lib/api/enhanced-route';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Validation schema
const assistantSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.record(z.any()).optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
});

/**
 * AI Assistant Endpoint
 * POST /api/assistant
 *
 * Provides conversational AI assistance for dealership analytics and insights
 */
export const POST = createPublicRoute(
  async (req: NextRequest) => {
    const body = await req.json();
    const { message, context, conversationHistory } = assistantSchema.parse(body);

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
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
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
  },
  {
    rateLimit: true,
    validateSchema: assistantSchema,
  }
);
