/**
 * GPT Chat API with Function Calling
 * 
 * Handles conversations with GPT, including function calling for automotive actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { getOpenAIFunctionsSchema, validateFunctionCall } from '@/lib/gpt/functions-schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    retrieval_context?: string[];
    user_location?: string;
    dealership_info?: Record<string, any>;
  };
  interactionId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await req.json();
    const { messages, context, interactionId } = body;

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Prepare messages for OpenAI
    const openaiMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: openaiMessages,
      tools: getOpenAIFunctionsSchema(),
      tool_choice: 'auto', // Let GPT decide when to use functions
      temperature: 0.7,
    });

    const response = completion.choices[0];
    let assistantMessage = response.message;

    // Handle function calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const functionResults = await executeFunctionCalls(assistantMessage.tool_calls);
      
      // Add function results to conversation
      openaiMessages.push(assistantMessage);
      functionResults.forEach(result => {
        openaiMessages.push({
          role: 'function',
          name: result.name,
          content: JSON.stringify(result.result)
        });
      });

      // Get final response from GPT
      const finalCompletion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: openaiMessages,
        tools: getOpenAIFunctionsSchema(),
        temperature: 0.7,
      });

      assistantMessage = finalCompletion.choices[0].message;
    }

    // Log interaction
    await logInteraction({
      interactionId: interactionId || generateInteractionId(),
      userQuery: messages[messages.length - 1]?.content || '',
      botResponse: assistantMessage.content || '',
      functionCalls: assistantMessage.tool_calls?.map(tc => ({
        function: tc.function.name,
        parameters: JSON.parse(tc.function.arguments)
      })) || [],
      userId: session.user?.id,
      context
    });

    return NextResponse.json({
      message: assistantMessage.content,
      functionCalls: assistantMessage.tool_calls?.map(tc => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments)
      })),
      interactionId: interactionId || generateInteractionId()
    });

  } catch (error) {
    console.error('GPT chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(context?: ChatRequest['context']): string {
  let prompt = `You are a helpful AI assistant for an automotive dealership specializing in:
- Vehicle appraisals and trade-in valuations
- Test drive scheduling
- Inventory search and recommendations
- Sales and service inquiries

Always:
- Confirm user details before scheduling
- Validate VINs when provided
- Provide NADA/KBB-aligned guidance
- Be friendly and professional
- Ask clarifying questions when needed`;

  if (context?.retrieval_context && context.retrieval_context.length > 0) {
    prompt += `\n\nRecent market context:\n${context.retrieval_context.join('\n')}`;
  }

  if (context?.dealership_info) {
    prompt += `\n\nDealership information: ${JSON.stringify(context.dealership_info)}`;
  }

  return prompt;
}

async function executeFunctionCalls(toolCalls: any[]): Promise<Array<{ name: string; result: any }>> {
  const results = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const parameters = JSON.parse(toolCall.function.arguments);

    // Validate parameters
    const validation = validateFunctionCall(functionName, parameters);
    if (!validation.valid) {
      results.push({
        name: functionName,
        result: { error: 'Invalid parameters', details: validation.errors }
      });
      continue;
    }

    // Route to appropriate handler
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dash.dealershipai.com';
      const routeMap: Record<string, string> = {
        appraiseVehicle: '/api/gpt/functions/appraise-vehicle',
        scheduleTestDrive: '/api/gpt/functions/schedule-test-drive',
        fetchInventory: '/api/gpt/functions/fetch-inventory',
        submitLead: '/api/gpt/functions/submit-lead',
        getServiceHours: '/api/gpt/functions/get-service-hours',
        checkFinancing: '/api/gpt/functions/check-financing'
      };

      const route = routeMap[functionName];
      if (!route) {
        results.push({
          name: functionName,
          result: { error: 'Function not implemented' }
        });
        continue;
      }

      const response = await fetch(`${baseUrl}${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters)
      });

      const result = await response.json();
      results.push({ name: functionName, result });

    } catch (error) {
      results.push({
        name: functionName,
        result: { error: 'Function execution failed', details: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  return results;
}

function generateInteractionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function logInteraction(data: {
  interactionId: string;
  userQuery: string;
  botResponse: string;
  functionCalls: Array<{ function: string; parameters: any }>;
  userId?: string;
  context?: any;
}) {
  // In production, save to database
  // For now, console log
  console.log('Interaction logged:', data);
}

