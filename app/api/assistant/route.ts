import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createPublicRoute } from '@/lib/api/enhanced-route';
import { buildDAISystemPrompt, type dAIPersonaConfig, type dAIContext } from '@/lib/dai/persona';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Validation schema
const assistantSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.record(z.string(), z.any()).optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional(),
  // dAI persona configuration
  personalityLevel: z.enum(['formal', 'dry-wit', 'full-dai']).optional(),
  enableTruthBombs: z.boolean().optional(),
  daiContext: z.object({
    role: z.enum(['gm', 'dealer_principal', 'dp', 'marketing', 'marketing_director', 'internet', 'used_car_manager', 'sales_manager', 'general']).optional(),
    market: z.string().optional(),
    store_name: z.string().optional(),
    domain: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    oem_brand: z.enum(['hyundai', 'ford', 'toyota', 'used', 'general']).optional(),
  }).optional(),
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
    const {
      message,
      context,
      conversationHistory,
      personalityLevel,
      enableTruthBombs,
      daiContext,
    } = assistantSchema.parse(body);

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

    // Build dAI persona configuration
    const personaConfig: dAIPersonaConfig = {
      personalityLevel: personalityLevel || 'dry-wit',
      enableTruthBombs: enableTruthBombs !== undefined ? enableTruthBombs : true,
      context: daiContext,
    };

    // Generate system prompt with dAI persona
    let systemPrompt = buildDAISystemPrompt(personaConfig);

    // Append context data if provided
    if (context && Object.keys(context).length > 0) {
      systemPrompt += `\n\nYou have access to the following data context:\n${JSON.stringify(context, null, 2)}`;
    }

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
